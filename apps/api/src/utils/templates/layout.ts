export const baseLayout = (content: string, title: string = 'KeroCRM') => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <!-- Header -->
      <div style="background-color: #0088FF; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">${title}</h1>
      </div>
      
      <!-- Body -->
      <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
        ${content}
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #64748b; font-size: 13px;">
          This is an automated message, please do not reply.
        </p>
        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
          &copy; ${new Date().getFullYear()} KeroCRM. All rights reserved.
        </p>
      </div>
    </div>
  `;
};
