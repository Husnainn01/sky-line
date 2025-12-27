import axios from 'axios';

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

export async function verifyTurnstileToken(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error('TURNSTILE_SECRET_KEY is not configured');
  }

  const body = new URLSearchParams();
  body.append('secret', secret);
  body.append('response', token);

  if (remoteIp) {
    body.append('remoteip', remoteIp);
  }

  const { data } = await axios.post<TurnstileVerifyResponse>(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    body.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 5000,
    }
  );

  return data;
}
