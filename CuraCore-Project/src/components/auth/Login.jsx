import React, { useEffect, useRef, useState } from 'react';
import { auth } from '../../firebase/config';
import {
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import Input from '../common/Input';
import Button from '../common/Button';

const toFriendlyAuthError = (error) => {
  const code = error?.code || '';

  if (code === 'auth/captcha-check-failed' || code === 'auth/invalid-app-credential') {
    return 'reCAPTCHA verification failed. Reload the page and try again.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Phone authentication is not enabled in Firebase Authentication settings.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Current domain is not authorized in Firebase Authentication.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a bit and try again.';
  }

  return `Unable to send verification code. ${error?.message || 'Please try again.'}`;
};

export const Login = ({ onTogglePage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaVerificationId, setMfaVerificationId] = useState('');
  const [mfaPhoneHint, setMfaPhoneHint] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaKey, setRecaptchaKey] = useState(0);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerId = `login-recaptcha-container-${recaptchaKey}`;

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try sign in again.');
        },
      });
    } catch (recaptchaError) {
      console.error('Failed to initialize login reCAPTCHA:', recaptchaError);
      setError('Could not initialize reCAPTCHA. Please refresh the page.');
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [recaptchaContainerId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      if (err.code === 'auth/multi-factor-auth-required') {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          const phoneHint =
            resolver.hints.find((hint) => hint.factorId === PhoneMultiFactorGenerator.FACTOR_ID) ||
            resolver.hints[0];

          if (!phoneHint) {
            throw new Error('No supported MFA factor found.');
          }

          const phoneOptions = {
            multiFactorHint: phoneHint,
            session: resolver.session,
          };

          const verificationId = await new PhoneAuthProvider(auth).verifyPhoneNumber(
            phoneOptions,
            recaptchaVerifierRef.current,
          );

          setMfaResolver(resolver);
          setMfaVerificationId(verificationId);
          setMfaPhoneHint(phoneHint.phoneNumber || 'your phone number');
        } catch (mfaError) {
          console.error('MFA challenge setup failed:', mfaError);
          setError(toFriendlyAuthError(mfaError));
          if (
            mfaError?.code === 'auth/captcha-check-failed' ||
            mfaError?.code === 'auth/invalid-app-credential' ||
            `${mfaError?.message || ''}`.toLowerCase().includes('already been rendered')
          ) {
            setRecaptchaKey((k) => k + 1);
          }
        }
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || !mfaResolver || !mfaVerificationId) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const phoneCredential = PhoneAuthProvider.credential(mfaVerificationId, otpCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
      await mfaResolver.resolveSignIn(multiFactorAssertion);
    } catch (mfaVerifyError) {
      console.error('MFA verification failed:', mfaVerifyError);
      if (mfaVerifyError?.code === 'auth/invalid-verification-code') {
        setError('Invalid code. Please try again.');
      } else {
        setError(`Verification failed. ${mfaVerifyError?.message || 'Please try again.'}`);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back to CuraCore</h2>
          <p className="mt-2 text-sm text-gray-600">
            {mfaResolver ? 'Verify your phone to complete sign in' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {mfaResolver ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-600">
              We sent a verification code to {mfaPhoneHint}. Enter it below.
            </p>
            <Input
              type="text"
              placeholder="6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        )}

        <div id={recaptchaContainerId} className="min-h-[1px] opacity-0 pointer-events-none" />

        {!mfaResolver && (
          <div className="text-sm text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button onClick={onTogglePage} className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
