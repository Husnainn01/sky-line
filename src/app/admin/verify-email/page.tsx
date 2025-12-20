'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

// Component that uses searchParams
function AdminVerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'input' | 'loading' | 'success' | 'error'>('input');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  
  // Get email from URL if available
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    
    // Check if there's a code in the URL (from WorkOS email verification)
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      // If we have a code, automatically verify it
      verifyCodeFromUrl(codeFromUrl);
    }
  }, [searchParams]);
  
  // Function to verify code from URL
  const verifyCodeFromUrl = async (code: string) => {
    setStatus('loading');
    setMessage('Verifying your email...');
    
    try {
      // Call the backend API to verify the email
      const response = await fetch('http://localhost:5001/api/admin/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }
      
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now log in to your admin account.');
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 5000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to verify your email. Please try again or contact support.');
    }
  };

  // Function to send verification code
  const sendVerificationCode = async () => {
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    
    setIsSendingCode(true);
    setMessage('');
    
    try {
      // Call the API to send verification code
      const response = await fetch('http://localhost:5001/api/admin/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      
      setMessage('Verification code has been sent to your email. Please check your inbox.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to send verification code. Please try again.');
      console.error('Send verification code error:', err);
    } finally {
      setIsSendingCode(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage('Please enter a valid 6-digit verification code.');
      return;
    }
    
    if (!email) {
      setMessage('Please enter your email address.');
      return;
    }
    
    setIsSubmitting(true);
    setStatus('loading');
    setMessage('Verifying your email...');
    
    try {
      // Call the backend API to verify the email
      const response = await fetch('http://localhost:5001/api/admin/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: verificationCode,
          email: email 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Email verification failed');
      }
      
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now log in to your admin account.');
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 5000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to verify your email. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Email Verification</h1>
        </div>
        
        <div className={styles.content}>
          {status === 'input' && (
            <div className={styles.formState}>
              <p className={styles.instructions}>
                Please click the "Send Verification Code" button below to receive a 6-digit code via email.
                <br />
                <strong>Note:</strong> Enter the 6-digit code from your email to verify your account.
              </p>
              
              {message && (
                <div className={message.includes('sent') ? styles.successMessage : styles.errorMessage}>
                  {message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div className={styles.sendCodeSection}>
                  <button 
                    type="button" 
                    className={styles.sendCodeButton}
                    onClick={sendVerificationCode}
                    disabled={isSendingCode || !email}
                  >
                    {isSendingCode ? 'Sending...' : 'Send Verification Code'}
                  </button>
                  <p className={styles.sendCodeHint}>Click to receive a 6-digit verification code via email</p>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="code" className={styles.label}>Verification Code</label>
                  <input
                    type="text"
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className={styles.codeInput}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verifying...' : 'Verify Email'}
                </button>
                
                <div className={styles.backToLogin}>
                  <Link href="/admin/login" className={styles.backLink}>
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          )}
          
          {status === 'loading' && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✓</div>
              <h2>Verification Successful!</h2>
              <p>{message}</p>
              <p className={styles.redirectMessage}>
                You will be redirected to the login page in a few seconds...
              </p>
              <Link href="/admin/login" className={styles.loginButton}>
                Go to Login
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>!</div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <div className={styles.actions}>
                <button 
                  onClick={() => setStatus('input')} 
                  className={styles.submitButton}
                >
                  Try Again
                </button>
                <Link href="/admin/login" className={styles.loginButton}>
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export the main component with Suspense boundary
export default function AdminVerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Loading...</h1>
          </div>
          <div className={styles.content}>
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Please wait while we prepare the verification page...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AdminVerifyEmailContent />
    </Suspense>
  );
}
