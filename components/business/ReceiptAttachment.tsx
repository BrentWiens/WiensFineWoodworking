'use client';

import { useEffect, useState } from 'react';
import { prepareReceiptFile } from '@/lib/expenses/compressImage';
import { isPdfPath, receiptUrl } from '@/lib/expenses/receiptPath';
import { secondaryButtonClass } from './forms';

type Status = { busy: false } | { busy: true; label: string };

interface ReceiptAttachmentProps {
  /** The stored receipt, or '' for none. */
  path: string;
  /** Whether choosing a photo also reads it and fills in the form. */
  scan: boolean;
  /** Uploads (and reads) the prepared file; resolves with where it went and any messages. */
  upload: (file: File) => Promise<{ ok: true; path: string; notes: string[] } | { ok: false; message: string }>;
  onRemove: () => void;
  error?: string;
}

/**
 * The receipt photo on the expense form: take or choose one (or a PDF), and it's
 * shrunk, stored and, when adding an expense, read to fill in the details. Shows a
 * preview with a link to the full size, and lets it be replaced or removed.
 *
 * The form remounts this (by key) after a save, which clears the preview and messages.
 */
export default function ReceiptAttachment({ path, scan, upload, onRemove, error }: ReceiptAttachmentProps) {
  const [status, setStatus] = useState<Status>({ busy: false });
  const [messages, setMessages] = useState<{ tone: 'note' | 'error'; text: string }[]>([]);
  // A photo just chosen shows from the phone's own copy; a saved one from the server
  const [localPreview, setLocalPreview] = useState<{ path: string; url: string } | null>(null);

  useEffect(
    () => () => {
      if (localPreview) URL.revokeObjectURL(localPreview.url);
    },
    [localPreview],
  );

  const choose = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = event.target.files?.[0];
    event.target.value = ''; // so choosing the same file again still fires
    if (!chosen) return;

    setMessages([]);
    setStatus({ busy: true, label: 'Preparing the photo…' });
    let file: File;
    try {
      file = await prepareReceiptFile(chosen);
    } catch (e) {
      setStatus({ busy: false });
      setMessages([{ tone: 'error', text: e instanceof Error ? e.message : 'This file couldn’t be used.' }]);
      return;
    }

    setStatus({ busy: true, label: scan ? 'Uploading and reading the receipt…' : 'Uploading the receipt…' });
    const outcome = await upload(file);
    setStatus({ busy: false });
    if (!outcome.ok) {
      setMessages([{ tone: 'error', text: outcome.message }]);
      return;
    }
    setLocalPreview(file.type.startsWith('image/') ? { path: outcome.path, url: URL.createObjectURL(file) } : null);
    setMessages(outcome.notes.map(text => ({ tone: 'note' as const, text })));
  };

  const remove = () => {
    setMessages([]);
    onRemove();
  };

  const picker = (label: string, className: string) => (
    <label className={`${className} cursor-pointer`}>
      {label}
      <input type="file" accept="image/*,application/pdf" onChange={choose} className="sr-only" />
    </label>
  );

  const preview = localPreview?.path === path ? localPreview.url : path && !isPdfPath(path) ? receiptUrl(path) : null;

  return (
    <div className="rounded-lg border border-dashed border-stone-300 p-3" aria-live="polite">
      {status.busy ? (
        <p className="flex items-center gap-2 text-sm text-stone-700 py-2">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" aria-hidden />
          {status.label}
        </p>
      ) : path ? (
        <div className="flex items-center gap-3">
          <a href={receiptUrl(path)} target="_blank" rel="noopener" className="shrink-0" title="Open the receipt">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- a private, authenticated file; next/image can't fetch it
              <img src={preview} alt="Receipt" className="h-20 w-16 rounded border border-stone-200 object-cover" />
            ) : (
              <span className="flex h-20 w-16 items-center justify-center rounded border border-stone-200 text-xs font-semibold text-stone-600">
                PDF
              </span>
            )}
          </a>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-800">Receipt attached</p>
            <a href={receiptUrl(path)} target="_blank" rel="noopener" className="text-sm text-stone-600 underline underline-offset-2">
              Open full size
            </a>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            {picker('Replace', 'text-stone-700 underline underline-offset-2')}
            <button type="button" onClick={remove} className="text-red-700 underline underline-offset-2">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          {picker('Add receipt photo', `${secondaryButtonClass} w-full justify-center`)}
          <p className="mt-2 text-xs text-stone-500">
            {scan
              ? 'Take a photo or choose a PDF, and the details are read off it for you to check.'
              : 'Take a photo or choose a PDF to keep with this expense.'}
          </p>
        </>
      )}

      {[...messages, ...(error ? [{ tone: 'error' as const, text: error }] : [])].map(m => (
        <p key={m.text} className={`mt-2 text-sm ${m.tone === 'error' ? 'text-red-700' : 'text-amber-800'}`}>
          {m.text}
        </p>
      ))}
    </div>
  );
}
