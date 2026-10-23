import { baseLayout } from './layout';

export const authTemplates = {
  
  forgotPassword: (otpCode: string, userName: string = 'User') => {
    const text = `Hi ${userName},\n\nYour password reset OTP is: ${otpCode}.\nIt is valid for 10 minutes.\n\nIf you didn't request this, you can ignore this email.`;

    const contentHtml = `
      <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Password Reset Request</h2>
      <p style="font-size: 16px; margin-bottom: 24px;">Hi ${userName},</p>
      <p style="font-size: 16px;">We received a request to reset your DSS Flow password. Enter the following verification code to complete the process:</p>
      
      <div style="text-align: center; margin: 35px 0;">
        <span style="display: inline-block; padding: 16px 32px; font-size: 28px; font-weight: 700; color: #0088FF; background-color: #f0f9ff; border: 2px dashed #bae6fd; border-radius: 8px; letter-spacing: 8px;">
          ${otpCode}
        </span>
      </div>
      
      <p style="font-size: 15px; color: #475569; background-color: #f8fafc; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <strong>Note:</strong> This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
      </p>
      
      <p style="font-size: 14px; margin-top: 24px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    `;

    return {
      subject: 'Password Reset OTP - DSS Flow',
      text,
      html: baseLayout(contentHtml)
    };
  },

  welcomeUser: (userName: string) => {
    const text = `Welcome to DSS Flow, ${userName}!`;
    const contentHtml = `
      <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Welcome Aboard! 🚀</h2>
      <p style="font-size: 16px;">Hi ${userName},</p>
      <p style="font-size: 16px;">We are thrilled to have you on board. DSS Flow is designed to help you manage your leads and grow your business seamlessly.</p>
    `;

    return {
      subject: 'Welcome to DSS Flow!',
      text,
      html: baseLayout(contentHtml)
    };
  }
};
