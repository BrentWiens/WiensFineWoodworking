import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, turnstileToken }: ContactFormData = await request.json();

    // Validate required fields
    if (!name || !email || !message || !turnstileToken) {
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

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email to you (the business owner)
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
              ${name}
            </p>
            
            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">Email:</strong><br>
              <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
            </p>
            
            <p style="margin: 10px 0;">
              <strong style="color: #44403c;">Message:</strong><br>
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <p style="color: #78716C; font-size: 14px;">
            You can reply directly to this email to respond to ${name}.
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