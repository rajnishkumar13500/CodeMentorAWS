const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send OTP verification email
 * @param {string} to - Recipient email
 * @param {string} otp - The OTP code
 */
async function sendOtpEmail(to, otp) {
    const mailOptions = {
        from: `"CodeMentor" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify Your CodeMentor Account',
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 10px; padding: 12px; margin-bottom: 12px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">&lt;/&gt;</span>
          </div>
          <h2 style="margin: 0; color: #1e293b; font-size: 22px;">CodeMentor</h2>
        </div>
        <div style="background: white; border-radius: 10px; padding: 28px; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 8px; color: #1e293b; font-size: 18px;">Email Verification</h3>
          <p style="color: #64748b; margin: 0 0 20px; font-size: 14px; line-height: 1.5;">
            Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #3b82f6;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 16px;">
          &copy; ${new Date().getFullYear()} CodeMentor. All rights reserved.
        </p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
