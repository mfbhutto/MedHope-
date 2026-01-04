import nodemailer from 'nodemailer';

// Email configuration from environment variables
// Support multiple variable name formats for flexibility
const getEmailConfig = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
  const secure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true';
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || process.env.EMAIL_USER || process.env.EMAIL || process.env.EMAIL_FROM || 'medhope74@gmail.com';
  const pass = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.APP_PASSWORD || '';

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  };
};

const emailConfig = getEmailConfig();

// Validate email configuration
if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.error('❌ Email configuration error: Missing SMTP credentials');
  console.error('Required environment variables:');
  console.error('  - SMTP_USER, SMTP_EMAIL, EMAIL_USER, EMAIL, or EMAIL_FROM');
  console.error('  - SMTP_APP_PASSWORD, SMTP_PASSWORD, EMAIL_PASSWORD, or EMAIL_PASS');
  console.error('Current values found:');
  console.error(`  - SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
  console.error(`  - EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.error(`  - EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  console.error(`  - SMTP_APP_PASSWORD: ${process.env.SMTP_APP_PASSWORD ? 'SET (hidden)' : 'NOT SET'}`);
  console.error(`  - EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET'}`);
  console.error(`  - EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'SET (hidden)' : 'NOT SET'}`);
  console.error(`\n📝 Note: Make sure to restart your Next.js server after adding environment variables!`);
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
  tls: {
    rejectUnauthorized: false, // For self-signed certificates (if needed)
  },
});

// Verify transporter configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error);
    return false;
  }
}

// Send contact form email
export async function sendContactEmail(data: {
  name: string;
  email: string;
  message: string;
}) {
  // Validate credentials before attempting to send
  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error('Email credentials not configured. Please set SMTP_USER and SMTP_APP_PASSWORD environment variables.');
  }

  try {
    const mailOptions = {
      from: `"MedHope Contact Form" <${emailConfig.auth.user}>`,
      to: 'medhope74@gmail.com',
      replyTo: data.email,
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488; border-bottom: 2px solid #0D9488; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <div style="background-color: #fff; padding: 15px; border-left: 4px solid #0D9488; border-radius: 4px;">
              <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This email was sent from the MedHope contact form.</p>
            <p>You can reply directly to this email to respond to ${data.name}.</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Submitted: ${new Date().toLocaleString()}

Message:
${data.message}

---
This email was sent from the MedHope contact form.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Error sending contact email:', error);
    throw new Error(error.message || 'Failed to send email');
  }
}

