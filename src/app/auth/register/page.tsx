'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { authApi } from '@/lib/api';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [verificationTurnstileToken, setVerificationTurnstileToken] = useState<string | null>(null);
  
  // Verification state
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'verification', 'success'
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  
  // Define the type for registration data
  interface RegistrationData {
    name: string;
    email: string;
    password: string;
    company: string;
    phone: string;
    tempUserId?: string;
  }
  
  const [tempRegistrationData, setTempRegistrationData] = useState<RegistrationData | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Check password strength when password field changes
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    if (passwordStrength === 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthClass = (): string => {
    if (passwordStrength === 0) return styles.veryWeak;
    if (passwordStrength === 1) return styles.weak;
    if (passwordStrength === 2) return styles.fair;
    if (passwordStrength === 3) return styles.good;
    if (passwordStrength === 4) return styles.strong;
    return styles.veryStrong;
  };

  const validateForm = (): boolean => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check if password is strong enough (at least fair)
    if (passwordStrength < 2) {
      setError('Please use a stronger password');
      return false;
    }

    // Check if terms are agreed
    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service');
      return false;
    }

    return true;
  };

  // Step 1: Request verification email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) return;

    if (!turnstileToken) {
      setError('Please complete the security verification.');
      return;
    }

    setIsLoading(true);

    try {
      // Request verification email from backend
      const data = await authApi.requestVerification(
        {
          email: formData.email
        },
        turnstileToken
      );
      
      // Store registration data temporarily including the tempUserId
      setTempRegistrationData({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        company: '',
        phone: formData.phoneNumber,
        tempUserId: data.tempUserId
      } as RegistrationData);
      
      // Move to verification step
      setRegistrationStep('verification');
      setTurnstileToken(null);
    } catch (err: any) {
      // Handle specific error messages from the backend
      const errorMessage = err.message || 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      
      // If the error indicates the email is already registered, show login link
      if (errorMessage.includes('already registered')) {
        setError(
          <>
            {errorMessage} <Link href="/auth/login" className={styles.errorLink}>Sign in here</Link>
          </>
        );
      }
      
      console.error('Verification request error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Go back to form step
  const handleBackToForm = () => {
    setRegistrationStep('form');
    setVerificationError('');
  };
  
  // Resend verification email
  const handleResendCode = async () => {
    setVerificationError('');
    setIsLoading(true);
    
    try {
      if (tempRegistrationData) {
        await authApi.requestVerification(
          {
            email: tempRegistrationData.email
          },
          turnstileToken
        );
      }
      
      // Show success message
      setVerificationError('Verification email resent successfully!');
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Complete registration after email verification
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    
    if (verificationCode.trim() === '') {
      setVerificationError('Please enter the verification code from your email');
      return;
    }

    if (!verificationTurnstileToken) {
      setVerificationError('Please complete the security verification.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Complete registration with the tempUserId and verification code
      const data = await authApi.register(
        tempRegistrationData ? {
          ...tempRegistrationData,
          verificationCode
        } : {},
        verificationTurnstileToken
      );
      
      // Save token and user data to localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Show success or redirect
      setRegistrationStep('success');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setVerificationError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          {registrationStep === 'form' && (
            <>
              <div className={styles.header}>
                <div className={styles.logoContainer}>
                  <img 
                    src="/images/logo/footer.png" 
                    alt="SkylineTRD Logo" 
                    width={100} 
                    height={100} 
                    className={styles.logo}
                  />
                </div>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join our automotive community</p>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className={styles.input}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your email"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  >
                    <option value="">Select your country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="NZ">New Zealand</option>
                    <option value="JP">Japan</option>
                    <option value="SG">Singapore</option>
                    <option value="AE">United Arab Emirates</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Create a password"
                  />
                  {formData.password && (
                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthBar}>
                        <div 
                          className={`${styles.strengthIndicator} ${getPasswordStrengthClass()}`} 
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={styles.strengthText}>{getPasswordStrengthText()}</span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Confirm your password"
                  />
                </div>

                <div className={styles.formOptions}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                    />
                    I agree to the <Link href="/terms" className={styles.termsLink}>Terms of Service</Link> and <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>
                  </label>
                </div>

                <TurnstileWidget
                  action="user_register_request"
                  className={styles.turnstileWrapper}
                  onTokenChange={setTurnstileToken}
                />

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading || !turnstileToken}
                >
                  {isLoading ? 'Sending Verification...' : 'Continue'}
                </button>
              </form>

              <div className={styles.divider}>
                <span>Already have an account?</span>
              </div>

              <Link href="/auth/login" className={styles.loginLink}>
                Sign In
              </Link>
            </>
          )}
          
          {registrationStep === 'verification' && (
            <>
              <div className={styles.header}>
                <div className={styles.logoContainer}>
                  <img 
                    src="/images/logo/footer.png" 
                    alt="SkylineTRD Logo" 
                    width={100} 
                    height={100} 
                    className={styles.logo}
                  />
                </div>
                <h1 className={styles.title}>Verify Email</h1>
                <p className={styles.subtitle}>A verification email has been sent to {tempRegistrationData ? tempRegistrationData.email : ''}</p>
              </div>
              
              {verificationError && (
                <div className={verificationError.includes('resent') ? styles.success : styles.error}>
                  {verificationError}
                </div>
              )}
              
              <div className={styles.verificationInstructions}>
                <p>Please check your inbox for an email from WorkOS with your verification code.</p>
                <p>You can either:</p>
                <ul>
                  <li>Click the verification link in the email, then return here to complete registration</li>
                  <li>OR enter the 6-digit verification code from the email below</li>
                </ul>
              </div>
              
              <form onSubmit={handleCompleteRegistration} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="verificationCode">Verification Code</label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={styles.input}
                    placeholder="Enter verification code"
                    disabled={isLoading}
                  />
                </div>
                <TurnstileWidget
                  action="user_register_verify"
                  className={styles.turnstileWrapper}
                  onTokenChange={setVerificationTurnstileToken}
                />
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading || !verificationTurnstileToken}
                >
                  {isLoading ? 'Processing...' : 'Complete Registration'}
                </button>
              </form>
              
              <div className={styles.verificationActions}>
                <button onClick={handleResendCode} className={styles.textButton} disabled={isLoading}>
                  Resend Verification Email
                </button>
                <button onClick={handleBackToForm} className={styles.textButton} disabled={isLoading}>
                  Back to Form
                </button>
              </div>
            </>
          )}
          
          {registrationStep === 'success' && (
            <div className={styles.successContainer}>
              <div className={styles.header}>
                <div className={styles.logoContainer}>
                  <img 
                    src="/images/logo/footer.png" 
                    alt="SkylineTRD Logo" 
                    width={100} 
                    height={100} 
                    className={styles.logo}
                  />
                </div>
                <h1 className={styles.title}>Registration Complete!</h1>
                <p className={styles.subtitle}>Your account has been created successfully.</p>
              </div>
              
              <div className={styles.success}>
                <p>Redirecting you to the dashboard...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
