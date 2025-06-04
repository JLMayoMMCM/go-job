import nodemailer from 'nodemailer';

// Create transporter using environment variables
const createTransporter = () => {
  // Use the configured SMTP settings from environment variables
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || process.env.GOOGLE_EMAIL,
      pass: process.env.SMTP_PASS || process.env.GOOGLE_PASSWORD,
    },
  });
};

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GOOGLE_EMAIL || 'GO JOB <noreply@gojob.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // Only works with Ethereal
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to send verification emails
export const sendVerificationEmail = async (to, verificationCode, userName) => {
  const subject = 'Email Verification - GO JOB';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #5585b5;">Welcome to GO JOB!</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for registering with GO JOB. Please verify your email address to complete your registration.</p>
      <p>Your verification code is:</p>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h1 style="color: #5585b5; font-size: 2em; margin: 0; letter-spacing: 3px;">${verificationCode}</h1>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      <p>Best regards,<br>GO JOB Team</p>
    </div>
  `;

  return await sendEmail(to, subject, htmlContent);
};