// src/components/common/HealthVisualization.jsx

import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HealthVisualization = ({ bmi, systolic, diastolic }) => {
  // BMI Gauge Data
  const getBMIGaugeData = () => {
    const bmiValue = parseFloat(bmi) || 0;
    
    // Calculate needle position (0-40 BMI scale)
    const maxBMI = 40;
    const normalizedBMI = Math.min(bmiValue, maxBMI);
    
    return {
      datasets: [{
        data: [18.5, 6.4, 5, 10.1, maxBMI - 40], // Underweight, Normal, Overweight, Obese, Remaining
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',   // Blue - Underweight
          'rgba(34, 197, 94, 0.7)',     // Green - Normal
          'rgba(251, 191, 36, 0.7)',    // Yellow - Overweight
          'rgba(239, 68, 68, 0.7)',     // Red - Obese
          'rgba(229, 231, 235, 0.3)'    // Gray - Remaining
        ],
        borderWidth: 2,
        borderColor: '#fff',
        cutout: '70%',
      }]
    };
  };

  // Blood Pressure Bar Chart Data
  const getBPChartData = () => {
    const sys = parseInt(systolic) || 0;
    const dia = parseInt(diastolic) || 0;
    
    return {
      labels: ['Your Systolic', 'Your Diastolic', 'Normal Systolic', 'Normal Diastolic'],
      datasets: [{
        label: 'Blood Pressure (mmHg)',
        data: [sys, dia, 120, 80],
        backgroundColor: [
          sys > 130 ? 'rgba(239, 68, 68, 0.7)' : sys > 120 ? 'rgba(251, 191, 36, 0.7)' : 'rgba(34, 197, 94, 0.7)',
          dia > 80 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)',
          'rgba(156, 163, 175, 0.5)',
          'rgba(156, 163, 175, 0.5)',
        ],
        borderColor: [
          sys > 130 ? 'rgb(239, 68, 68)' : sys > 120 ? 'rgb(251, 191, 36)' : 'rgb(34, 197, 94)',
          dia > 80 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)',
          'rgb(156, 163, 175)',
          'rgb(156, 163, 175)',
        ],
        borderWidth: 2,
      }]
    };
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Blood Pressure Comparison',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 200,
        ticks: {
          callback: function(value) {
            return value + ' mmHg';
          }
        }
      }
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="text-center mb-4">
        <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          PREMIUM VISUALIZATIONS
        </span>
      </div>

      {/* BMI Gauge */}
      {bmi && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">BMI Gauge</h3>
          <div className="relative h-64">
            <Doughnut data={getBMIGaugeData()} options={gaugeOptions} />
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{bmi}</div>
                <div className="text-sm text-gray-600">Your BMI</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 flex-wrap text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Underweight (&lt;18.5)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Normal (18.5-24.9)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Overweight (25-29.9)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Obese (≥30)</span>
            </div>
          </div>
        </div>
      )}

      {/* Blood Pressure Chart */}
      {systolic && diastolic && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-80">
            <Bar data={getBPChartData()} options={barOptions} />
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 text-center">
              Normal BP: Systolic &lt;120 mmHg, Diastolic &lt;80 mmHg
            </p>
          </div>
        </div>
      )}

      {/* Health Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Premium Insights
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Visual tracking helps you understand your health trends better</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Color-coded zones make it easy to identify healthy ranges</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Compare your values against medical standards instantly</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HealthVisualization;
