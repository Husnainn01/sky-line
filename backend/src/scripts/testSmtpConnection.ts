import 'dotenv/config';
import { getEmailTransporter } from '../services/emailService';

async function main() {
  try {
    const transporter = await getEmailTransporter();
    await transporter.verify();
    console.log('SMTP connection verified successfully.');
  } catch (error) {
    console.error('SMTP verification failed:', error);
    process.exitCode = 1;
  }
}

main();
