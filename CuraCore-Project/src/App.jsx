// src/App.jsx

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth.js';

// Import all your page components
import HomePage from './pages/HomePage.jsx';
import BasicHealthPage from './pages/BasicHealthPage.jsx';
import ReportAnalyzerPage from './pages/ReportAnalyzerPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import FindFacilitiesPage from './pages/FindFacilitiesPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import { Login } from './components/auth/Login.jsx';
import { Signup } from './components/auth/Signup.jsx';
import { MfaEnrollment } from './components/auth/MfaEnrollment.jsx';
import { VerifyEmail } from './components/auth/VerifyEmail.jsx';

function App() {
  const { currentUser, authLoading, emailVerified, mfaEnrollmentRequired } = useAuth();
  const [showLoginPage, setShowLoginPage] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  const toggleAuthPage = () => {
    setShowLoginPage(!showLoginPage);
  };

  // This function will render the correct page based on the currentPage state
  const renderPage = () => {
    // We now pass onNavigate to every page so they can return to the homepage
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'basicHealth':
        return <BasicHealthPage onNavigate={setCurrentPage} />;
      case 'reportAnalyzer':
        return <ReportAnalyzerPage onNavigate={setCurrentPage} />;
      case 'chatbot':
        return <ChatbotPage onNavigate={setCurrentPage} />;
      case 'findFacilities':
        return <FindFacilitiesPage onNavigate={setCurrentPage} />;
      case 'subscription':
        return <SubscriptionPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      {authLoading ? null : currentUser ? (
        !emailVerified ? (
          <VerifyEmail />
        ) : mfaEnrollmentRequired ? (
          <MfaEnrollment />
        ) : (
          renderPage()
        )
      ) : (
        showLoginPage ? (
          <Login onTogglePage={toggleAuthPage} />
        ) : (
          <Signup onTogglePage={toggleAuthPage} />
        )
      )}
    </div>
  );
}

export default App;