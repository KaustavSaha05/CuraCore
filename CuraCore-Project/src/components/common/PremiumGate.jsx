// src/components/common/PremiumGate.jsx

import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const PremiumGate = ({ children, featureName = "This feature", onNavigate }) => {
  const { isPremium } = useAuth();

  if (isPremium) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    if (onNavigate) {
      onNavigate('subscription');
    } else {
      window.location.href = '#/subscription';
    }
  };

  return (
    <div className="relative">
      {/* Blurred/Disabled Content */}
      <div className="pointer-events-none opacity-30 blur-sm">
        {children}
      </div>
      
      {/* Premium Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50/90 to-purple-50/90 rounded-lg border-2 border-indigo-200">
        <div className="text-center p-6 max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">{featureName} is exclusive to Premium members</p>
          <button
            onClick={handleUpgradeClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            Upgrade to Premium
          </button>
          <p className="text-sm text-gray-500 mt-3">Get unlimited access to all features</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumGate;
