import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { smtpUser, smtpPass, to, subject, body: emailBody, attachmentFilename, attachmentOriginalName } = body;

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

    // Handle resume attachments
    if (attachmentFilename) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadsDir, attachmentFilename);
      
      if (fs.existsSync(filePath)) {
        mailOptions.attachments = [
          {
            filename: attachmentOriginalName || attachmentFilename,
            path: filePath
          }
        ];
      } else {
        console.warn(`Attachment file not found: ${filePath}`);
      }
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
