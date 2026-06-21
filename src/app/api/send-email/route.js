import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { smtpUser, smtpPass, to, subject, body: emailBody, attachmentBase64, attachmentOriginalName } = body;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'SMTP credentials (user and pass) are required' }, { status: 400 });
    }
    if (!to || !subject || !emailBody) {
      return NextResponse.json({ error: 'Recipient email, subject, and body are required' }, { status: 400 });
    }

    // Configure SMTP transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: smtpUser,
      to: to,
      subject: subject,
      html: emailBody.replace(/\n/g, '<br>')
    };

    // Handle resume attachments (Base64)
    if (attachmentBase64) {
      mailOptions.attachments = [
        {
          filename: attachmentOriginalName || 'resume.pdf',
          content: Buffer.from(attachmentBase64, 'base64'),
          contentType: 'application/pdf'
        }
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email sent to ${to}`
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
