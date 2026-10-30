import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const Navbar = ({ onNavigate }) => {
  const { currentUser, isPremium } = useAuth(); // Get the current user and premium status from the context

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will automatically update the state
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600 cursor-pointer" onClick={() => onNavigate && onNavigate('home')}>CuraCore</h1>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              {isPremium && (
                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full">
                  ✨ PREMIUM
                </span>
              )}
              <span className="text-gray-600 text-sm hidden sm:block">
                Welcome, {currentUser.email}
              </span>
              {!isPremium && onNavigate && (
                <button
                  onClick={() => onNavigate('subscription')}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  ✨ Upgrade
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;