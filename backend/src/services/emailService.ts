import nodemailer from 'nodemailer';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

function getEmailConfig() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
  const secureValue = process.env.SMTP_SECURE ?? process.env.EMAIL_SECURE;

  if (host && port && user && pass) {
    return {
      host,
      port: parseInt(port, 10),
      secure: secureValue === 'true' || secureValue === '1',
      auth: {
        user,
        pass,
      },
    };
  }
  return null;
}

async function createTransporter() {
  const emailConfig = getEmailConfig();
  if (emailConfig) {
    return nodemailer.createTransport(emailConfig);
  }

  const testAccount = await nodemailer.createTestAccount();
  console.log('Using test email account:', testAccount.user);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function getEmailTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter();
  }
  return transporterPromise;
}

export function getDefaultFromAddress() {
  return process.env.EMAIL_FROM || 'noreply@sky-linetrd.com';
}
