import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  multiFactor,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';

const toFriendlyAuthError = (error) => {
  const code = error?.code || '';

  if (code === 'auth/invalid-phone-number') {
    return 'Invalid phone number format. Use E.164, e.g. +15551234567.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a bit and try again.';
  }
  if (code === 'auth/captcha-check-failed' || code === 'auth/invalid-app-credential') {
    return 'reCAPTCHA verification failed. Reload the page and try again.';
  }
  if (code === 'auth/quota-exceeded') {
    return 'SMS quota exceeded for this Firebase project. Try later.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Phone authentication is not enabled in Firebase Authentication settings.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Current domain is not authorized in Firebase Authentication.';
  }

  return `Unable to send SMS code. ${error?.message || 'Please try again.'}`;
};

export const MfaEnrollment = () => {
  const { currentUser, refreshUserStatus } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresRecentLogin, setRequiresRecentLogin] = useState(false);
  const [recaptchaKey, setRecaptchaKey] = useState(0);
  const recaptchaVerifierRef = useRef(null);
  const recaptchaContainerId = `enroll-recaptcha-container-${recaptchaKey}`;

  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [currentUser]);

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
          setError('reCAPTCHA expired. Please click Send Verification Code again.');
        },
      });
    } catch (recaptchaError) {
      console.error('Failed to initialize reCAPTCHA:', recaptchaError);
      setError('Could not initialize reCAPTCHA. Please refresh the page.');
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [recaptchaContainerId]);

  const normalizePhoneNumber = (value) => value.replace(/\s+/g, '');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setRequiresRecentLogin(false);

    if (!currentUser) {
      setError('You must be signed in to enable MFA.');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setError('Phone must be in E.164 format, e.g. +15551234567.');
      return;
    }

    setLoading(true);
    try {
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) {
        throw new Error('reCAPTCHA verifier is not ready.');
      }

      const multiFactorSession = await multiFactor(currentUser).getSession();
      const phoneInfoOptions = {
        phoneNumber: normalizedPhone,
        session: multiFactorSession,
      };

      const sentVerificationId = await new PhoneAuthProvider(auth).verifyPhoneNumber(
        phoneInfoOptions,
        verifier,
      );

      setVerificationId(sentVerificationId);
      setPhoneNumber(normalizedPhone);
    } catch (sendError) {
      console.error('Failed to send MFA enrollment code:', sendError);
      if (sendError?.code === 'auth/requires-recent-login') {
        setRequiresRecentLogin(true);
        setError('For security, please sign in again before enabling SMS MFA.');
      } else {
        setError(toFriendlyAuthError(sendError));
      }

      // Recreate container and verifier for a clean retry when captcha/app credential fails.
      if (
        sendError?.code === 'auth/captcha-check-failed' ||
        sendError?.code === 'auth/invalid-app-credential' ||
        `${sendError?.message || ''}`.toLowerCase().includes('already been rendered')
      ) {
        setRecaptchaKey((k) => k + 1);
      }
    }
    setLoading(false);
  };

  const handleVerifyAndEnroll = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be signed in to enable MFA.');
      return;
    }

    if (!verificationId || !otpCode) {
      setError('Enter the verification code that was sent to your phone.');
      return;
    }

    setLoading(true);
    try {
      const phoneCredential = PhoneAuthProvider.credential(verificationId, otpCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneCredential);
      await multiFactor(currentUser).enroll(multiFactorAssertion, 'Primary phone');

      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          phone: phoneNumber,
          mfaEnabled: true,
          mfaEnrolledAt: serverTimestamp(),
        },
        { merge: true },
      );

      await refreshUserStatus(currentUser);
    } catch (verifyError) {
      console.error('Failed to verify and enroll MFA:', verifyError);
      if (verifyError?.code === 'auth/invalid-verification-code') {
        setError('Invalid verification code. Please try again.');
      } else {
        setError(`Enrollment failed. ${verifyError?.message || 'Please try again.'}`);
      }
    }
    setLoading(false);
  };

  const handleSignOutForReauth = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Secure Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            SMS multi-factor authentication is required before continuing.
          </p>
        </div>

        {!verificationId ? (
          <form className="mt-8 space-y-4" onSubmit={handleSendCode}>
            <Input
              type="tel"
              placeholder="Phone Number (e.g. +15551234567)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>

            {requiresRecentLogin && (
              <button
                type="button"
                onClick={handleSignOutForReauth}
                className="w-full py-2 px-4 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100"
              >
                Sign Out and Sign In Again
              </button>
            )}
          </form>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleVerifyAndEnroll}>
            <p className="text-sm text-gray-600">Enter the 6-digit code sent to {phoneNumber}.</p>
            <Input
              type="text"
              placeholder="6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify and Enable MFA'}
            </Button>
          </form>
        )}

        <div id={recaptchaContainerId} className="min-h-[1px] opacity-0 pointer-events-none" />
      </div>
    </div>
  );
};
