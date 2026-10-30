// src/pages/SubscriptionPage.jsx

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SubscriptionPage = ({ onNavigate }) => {
  const { currentUser, isPremium } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpgrade = async (plan) => {
    if (!currentUser) {
      setMessage('Please log in to subscribe');
      return;
    }

    setUpgrading(true);
    setMessage('');

    try {
      // In a real app, integrate payment gateway (Stripe, PayPal, etc.)
      // For demo purposes, we'll directly update Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        isPremium: true,
        subscriptionPlan: plan,
        subscribedAt: new Date().toISOString()
      });

      setMessage('🎉 Successfully upgraded to Premium! Enjoy your new features.');
      setTimeout(() => {
        onNavigate('home');
      }, 2000);
    } catch (error) {
      console.error('Upgrade error:', error);
      setMessage('Failed to upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => onNavigate('home')} 
            className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upgrade to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Premium</span>
            </h1>
            <p className="text-xl text-gray-600">Unlock powerful health visualizations and advanced features</p>
            {isPremium && (
              <div className="mt-4 inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                ✓ You are already a Premium member!
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
              message.includes('Successfully') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">₹0</div>
                <p className="text-gray-600">Forever free</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Basic Health Calculations (BMI, BP)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">AI Chatbot (Limited queries)</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">Find Healthcare Facilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-400">Health Visualizations</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-400">Historical Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-400">Priority Support</span>
                </li>
              </ul>
              <button 
                disabled
                className="w-full bg-gray-200 text-gray-600 font-semibold py-3 rounded-lg cursor-not-allowed"
              >
                Current Plan
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-8 border-2 border-indigo-400 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <div className="text-center mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">₹649.00</div>
                <p className="text-indigo-100">per month</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-medium">Everything in Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">📊 Interactive Health Visualizations</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">📈 BMI & BP Trend Tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">🎨 Color-Coded Health Zones</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">💬 Unlimited AI Chatbot Queries</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-300 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white">⚡ Priority Support</span>
                </li>
              </ul>
              <button 
                onClick={() => handleUpgrade('monthly')}
                disabled={isPremium || upgrading}
                className={`w-full font-semibold py-3 rounded-lg transition-all ${
                  isPremium 
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                    : 'bg-white text-indigo-600 hover:bg-gray-50 shadow-lg hover:shadow-xl'
                }`}
              >
                {upgrading ? 'Processing...' : isPremium ? 'Already Subscribed' : 'Upgrade Now'}
              </button>
              <p className="text-center text-indigo-100 text-sm mt-3">
                Cancel anytime • Instant access
              </p>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Upgrade to Premium?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Visual Insights</h3>
                <p className="text-gray-600 text-sm">See your health data come to life with beautiful, interactive charts and gauges</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Track Progress</h3>
                <p className="text-gray-600 text-sm">Monitor your health journey over time with historical data and trend analysis</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Instant Access</h3>
                <p className="text-gray-600 text-sm">Upgrade and get immediate access to all premium features, no waiting required</p>
              </div>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">
              <strong>Demo Mode:</strong> Click "Upgrade Now" to instantly enable premium features (no payment required for demo)
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionPage;
