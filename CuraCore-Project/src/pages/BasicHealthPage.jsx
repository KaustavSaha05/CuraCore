// src/pages/BasicHealthPage.jsx

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import PremiumGate from '../components/common/PremiumGate.jsx';
import HealthVisualization from '../components/common/HealthVisualization.jsx';

const BasicHealthPage = ({ onNavigate }) => { // Accept the onNavigate prop
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  // Add state for blood pressure
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const [result, setResult] = useState(null);

  // Function to determine blood pressure category
const getBloodPressureCategory = (sys, dia) => {
  const s = parseInt(sys, 10);
  const d = parseInt(dia, 10);

  if (isNaN(s) || isNaN(d)) {
    return "Invalid input";
  }

  if (s >= 180 || d >= 120) {
    return "Hypertensive Crisis (consult doctor immediately)";
  }

  if (s >= 140 || d >= 90) {
    return "Hypertension Stage 2";
  }

  if (s >= 130 || d >= 80) {
    return "Hypertension Stage 1";
  }

  if (s >= 120 && s <= 129 && d < 80) {
    return "Elevated";
  }

  if (s < 120 && d < 80) {
    return "Normal";
  }

  return "Uncategorized reading";
};

  const handleCalculate = () => {
    const newResult = {};

    // BMI Calculation
    if (weight && height && weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
      
      let bmiCategory = '';
      if (bmi < 18.5) bmiCategory = 'Underweight';
      else if (bmi >= 18.5 && bmi <= 24.9) bmiCategory = 'Normal weight';
      else if (bmi >= 25 && bmi <= 29.9) bmiCategory = 'Overweight';
      else bmiCategory = 'Obesity';

      newResult.bmi = bmi;
      newResult.bmiCategory = bmiCategory;
    }

    // Blood Pressure Calculation
    if (systolic && diastolic && systolic > 0 && diastolic > 0) {
        newResult.bpCategory = getBloodPressureCategory(systolic, diastolic);
    }

    // Set result or error
    if (Object.keys(newResult).length > 0) {
        setResult(newResult);
    } else {
        setResult({ error: 'Please enter valid details for at least one calculation (BMI or Blood Pressure).' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <button onClick={() => onNavigate('home')} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Home
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Basic Health Calculator</h2>
          
          {/* Inputs Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">General</h3>
            <Input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">BMI Calculator</h3>
            <Input type="number" placeholder="Weight (in kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <Input type="number" placeholder="Height (in cm)" value={height} onChange={(e) => setHeight(e.target.value)} />

            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 pt-4">Blood Pressure</h3>
            <Input type="number" placeholder="Systolic (e.g., 120)" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
            <Input type="number" placeholder="Diastolic (e.g., 80)" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} />
            
            <Button onClick={handleCalculate}>Calculate</Button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="mt-6 p-4 rounded-md bg-indigo-50 text-center space-y-3">
              {result.error && (
                <p className="text-red-600 font-medium">{result.error}</p>
              )}
              
              {result.bmi && (
                <div>
                  <p className="text-lg font-bold text-gray-800">Your BMI is: {result.bmi}</p>
                  <p className="text-md text-indigo-700">You are in the '{result.bmiCategory}' category.</p>
                </div>
              )}

              {result.bpCategory && (
                <div>
                  <p className="text-lg font-bold text-gray-800">Your Blood Pressure is: {result.bpCategory}</p>
                </div>
              )}
            </div>
          )}

          {/* Premium Visualizations */}
          {result && !result.error && (result.bmi || result.bpCategory) && (
            <PremiumGate featureName="Health Visualizations" onNavigate={onNavigate}>
              <HealthVisualization 
                bmi={result.bmi}
                systolic={systolic}
                diastolic={diastolic}
              />
            </PremiumGate>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BasicHealthPage;