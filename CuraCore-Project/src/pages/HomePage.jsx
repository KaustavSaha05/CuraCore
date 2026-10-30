// src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { db } from '../firebase/config.js';
import { doc, getDoc, enableNetwork } from 'firebase/firestore';

const FeatureCard = ({ title, description, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="classic-feature-card"
    >
      <h3>{title}</h3>
      <p className="mt-2">{description}</p>
    </div>
  );
};

const HomePage = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const enableFirestore = async () => {
      try {
        await enableNetwork(db);
        console.log("Firestore network enabled.");
      } catch (error) {
        console.error("Error enabling Firestore network:", error);
      }
    };
    enableFirestore();
  }, []);

  // This effect runs once when the component loads
  useEffect(() => {
    /*
    const fetchUserData = async () => {
      if (currentUser) {
        // Create a reference to the user's document in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          // Fetch the document
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // If the document exists, get the username from its data
            setUsername(userDoc.data().username);
          } else {
            console.log("No such user document!");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
    */
  }, [currentUser]); // The effect depends on currentUser

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {/* --- UPDATED WELCOME MESSAGE --- */}
          {/* It shows the username if available, otherwise a generic welcome */}
          <h2 className="text-4xl font-bold text-gray-800">
            Welcome, {username || 'User'}!
          </h2>
          {/* ------------------------------------ */}
          <p className="text-lg text-gray-600 mt-2">Choose one of the options below to get started.</p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard 
            title="Basic Healthcare"
            description="Enter body parameters to get generalized health advice and calculate your BMI."
            onClick={() => onNavigate('basicHealth')}
          />
          <FeatureCard 
            title="AI Report Analyzer"
            description="Paste medical report text here to get a simplified, easy-to-understand summary."
            onClick={() => onNavigate('reportAnalyzer')}
          />
          <FeatureCard 
            title="AI Healthcare Chatbot"
            description="Have a health question? Chat with our AI to get information and guidance."
            onClick={() => onNavigate('chatbot')}
          />
          <FeatureCard 
            title="Find Facilities"
            description="Search for nearby hospitals, clinics, and pharmacies based on a city name."
            onClick={() => onNavigate('findFacilities')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;