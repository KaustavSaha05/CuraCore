import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { multiFactor, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mfaEnrollmentRequired, setMfaEnrollmentRequired] = useState(false);

  const refreshUserStatus = async (userArg = auth.currentUser) => {
    if (!userArg) {
      setEmailVerified(false);
      setMfaEnrollmentRequired(false);
      return;
    }

    try {
      await userArg.reload();
      setEmailVerified(Boolean(userArg.emailVerified));
      setMfaEnrollmentRequired(multiFactor(userArg).enrolledFactors.length === 0);
    } catch (error) {
      console.error('Unable to refresh user auth status:', error);
      setEmailVerified(Boolean(userArg.emailVerified));
      setMfaEnrollmentRequired(false);
    }
  };

  useEffect(() => {
    let unsubscribeUser = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await refreshUserStatus(user);
        const userDocRef = doc(db, 'users', user.uid);
        
        // Real-time listener for premium status changes
        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setIsPremium(userData.isPremium || false);
          } else {
            // Create user document if it doesn't exist
            setDoc(userDocRef, {
              email: user.email,
              isPremium: false,
              createdAt: new Date().toISOString()
            }).catch(err => console.error("Error creating user doc:", err));
            setIsPremium(false);
          }
        });
      } else {
        setIsPremium(false);
        setEmailVerified(false);
        setMfaEnrollmentRequired(false);
      }

      setAuthLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const value = {
    currentUser,
    isPremium,
    authLoading,
    emailVerified,
    mfaEnrollmentRequired,
    refreshUserStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};