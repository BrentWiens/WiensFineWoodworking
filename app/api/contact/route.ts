import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  turnstileToken: string;
}

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

// Best-effort only: this lives in the memory of a single serverless instance, so it
// resets on cold start and is not shared across instances. Cloudflare Turnstile is
// the real bot defence; this just blunts rapid repeat submissions from one client.
const requestLog = new Map<string, number[]>();

function pruneExpired(now: number): void {
  // Without this, every IP ever seen stays in the map for the life of the instance.
  for (const [key, timestamps] of requestLog) {
    if (timestamps.every(t => now - t >= RATE_LIMIT_WINDOW_MS)) {
      requestLog.delete(key);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  pruneExpired(now);

  const timestamps = (requestLog.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return false;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const { name, email, phone, city, message, turnstileToken, website }: ContactFormData & { website?: string } = await request.json();

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !phone || !city || !message || !turnstileToken) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const turnstileResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );

    const turnstileData = await turnstileResponse.json();

    if (!turnstileData.success) {
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeCity = escapeHtml(city);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `New Contact Form: ${name}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C1810; border-bottom: 2px solid #78716C; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background-color: #f5f5f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">Name:</strong><br>
              ${safeName}
            </p>

            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">Email:</strong><br>
              <a href="mailto:${safeEmail}" style="color: #2563eb;">${safeEmail}</a>
            </p>

            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">Phone:</strong><br>
              <a href="tel:${safePhone}" style="color: #2563eb;">${safePhone}</a>
            </p>

            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">City:</strong><br>
              ${safeCity}
            </p>

            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">Message:</strong><br>
              ${safeMessage}
            </p>
          </div>

          <p style="color: #78716C; font-size: 14px;">
            You can reply directly to this email to respond to ${safeName}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
