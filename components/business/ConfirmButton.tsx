'use client';

import { useTransition } from 'react';

/** A button that runs a Server Action after the user confirms — for deletes. */
export default function ConfirmButton({
  action,
  confirmMessage,
  children,
  className,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (window.confirm(confirmMessage)) startTransition(() => action());
      }}
    >
      {pending ? 'Working…' : children}
    </button>
  );
}
