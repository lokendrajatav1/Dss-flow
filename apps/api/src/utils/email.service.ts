import nodemailer from 'nodemailer';
import { logger } from './logger';

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"KeroCRM" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    logger.info(`Message sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};
