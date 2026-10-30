// src/pages/ReportAnalyzerPage.jsx

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Button from '../components/common/Button.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { analyzeReport } from '../api/aiService' // import the real function

const ReportAnalyzerPage = ({ onNavigate }) => {
  const [reportText, setReportText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Function to format the analysis text with emojis and styling
  const formatAnalysis = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    const formattedContent = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedContent.push(<div key={`space-${index}`} className="h-2"></div>);
        return;
      }

      // Check for markdown headings (###, ##, #)
      if (trimmedLine.match(/^#{1,3}\s+/)) {
        const headingText = trimmedLine.replace(/^#{1,3}\s+/, '');
        const emoji = getSectionEmoji(headingText);
        formattedContent.push(
          <h4 key={`heading-${index}`} className="text-lg font-bold text-indigo-700 mt-4 mb-2 flex items-center gap-2">
            <span>{emoji}</span>
            <span>{headingText}</span>
          </h4>
        );
      }
      // Check for section headings with colon
      else if (trimmedLine.match(/^(summary|overview|key findings|findings|recommendations|diagnosis|impression|conclusion|important notes|details|analysis):/i)) {
        const emoji = getSectionEmoji(trimmedLine);
        formattedContent.push(
          <h4 key={`heading-${index}`} className="text-lg font-bold text-indigo-700 mt-4 mb-2 flex items-center gap-2">
            <span>{emoji}</span>
            <span>{trimmedLine}</span>
          </h4>
        );
      }
      // Check for bullet points or numbered lists
      else if (trimmedLine.match(/^[-•*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
        const listText = trimmedLine.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '');
        formattedContent.push(
          <li key={`list-${index}`} className="ml-6 mb-2 text-gray-700">
            {formatBoldText(listText)}
          </li>
        );
      }
      // Regular paragraph
      else {
        formattedContent.push(
          <p key={`para-${index}`} className="text-gray-700 mb-2 leading-relaxed">
            {formatBoldText(trimmedLine)}
          </p>
        );
      }
    });

    return <div className="space-y-1">{formattedContent}</div>;
  };

  // Helper function to format bold text (**text**)
  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={i} className="font-bold text-gray-900">{boldText}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Helper function to get emoji for section
  const getSectionEmoji = (section) => {
    const lowerSection = section.toLowerCase();
    if (lowerSection.includes('summary') || lowerSection.includes('overview')) return '📋';
    if (lowerSection.includes('finding') || lowerSection.includes('diagnosis')) return '🔍';
    if (lowerSection.includes('recommendation')) return '💡';
    if (lowerSection.includes('important') || lowerSection.includes('note')) return '⚠️';
    if (lowerSection.includes('conclusion') || lowerSection.includes('impression')) return '✅';
    if (lowerSection.includes('detail') || lowerSection.includes('analysis')) return '📊';
    if (lowerSection.includes('what') && lowerSection.includes('shows')) return '👁️';
    if (lowerSection.includes('key') || lowerSection.includes('means')) return '🔑';
    return '📄';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleAnalyze = async () => {
    if (!reportText.trim() && !selectedImage) return;
    setIsLoading(true);
    setAnalysis('');
    setError('');

    try {
      const response = await analyzeReport(reportText, imagePreview);
      setAnalysis(response);
    } catch (err) {
      setError('Failed to get analysis. Please try again later.');
      console.error(err);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <button onClick={() => onNavigate('home')} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Home
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">AI Report Analyzer</h2>
          
          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Report Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 relative">
              <img src={imagePreview} alt="Report preview" className="w-full max-h-64 object-contain rounded-md border border-gray-300" />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          {/* Divider */}
          {imagePreview && <div className="text-center text-gray-500 mb-4">OR</div>}

          {/* Text Input Section */}
          <textarea
            className="w-full h-40 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Paste your medical report text here..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
          <div className="mt-4">
            <Button onClick={handleAnalyze} disabled={isLoading || (!reportText.trim() && !selectedImage)}>
              {isLoading ? 'Analyzing...' : 'Analyze Report'}
            </Button>
          </div>
          <div className="mt-6">
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {analysis && (
              <div className="p-6 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-indigo-200">
                  <span className="text-2xl">🏥</span>
                  <h3 className="text-xl font-bold text-gray-800">Analysis Result</h3>
                </div>
                {formatAnalysis(analysis)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportAnalyzerPage;