import React, { useState } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export const VerifyEmail = () => {
  const { currentUser, refreshUserStatus } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSendVerification = async () => {
    setError('');
    setMessage('');

    if (!currentUser) {
      setError('No signed-in user found. Please sign in again.');
      return;
    }

    setSending(true);
    try {
      await sendEmailVerification(currentUser);
      setMessage(`Verification email sent to ${currentUser.email}.`);
    } catch (sendError) {
      setError(sendError?.message || 'Could not send verification email.');
    }
    setSending(false);
  };

  const handleIHaveVerified = async () => {
    setError('');
    setMessage('');
    setChecking(true);

    try {
      await refreshUserStatus(currentUser);
      if (!auth.currentUser?.emailVerified) {
        setError('Email is still not verified. Please verify, then click this again.');
      }
    } catch (checkError) {
      setError(checkError?.message || 'Could not refresh verification status.');
    }

    setChecking(false);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Firebase requires email verification before enabling SMS multi-factor authentication.
          </p>
          <p className="mt-2 text-sm text-gray-700">
            Signed in as: <span className="font-semibold">{currentUser?.email || 'unknown user'}</span>
          </p>
        </div>

        {error && <p className="text-sm text-center text-red-600">{error}</p>}
        {message && <p className="text-sm text-center text-green-700">{message}</p>}

        <div className="space-y-3">
          <Button type="button" onClick={handleSendVerification} disabled={sending || checking}>
            {sending ? 'Sending Email...' : 'Send Verification Email'}
          </Button>
          <Button type="button" onClick={handleIHaveVerified} disabled={sending || checking}>
            {checking ? 'Checking...' : 'I Have Verified My Email'}
          </Button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-2 px-4 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
