// src/pages/ChatbotPage.jsx

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { getChatbotResponse } from '../api/aiService.js';

const ChatbotPage = ({ onNavigate }) => {
  const [messages, setMessages] = useState([{ sender: 'ai', text: 'Hello! I am your personal medical chatbot. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Call the function that talks to your Python server
    const aiResponseText = await getChatbotResponse(input);
    const aiMessage = { sender: 'ai', text: aiResponseText };
    setMessages(prevMessages => [...prevMessages, aiMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigate={onNavigate} />
      <main className="flex-grow container mx-auto p-4 flex justify-center items-center">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg flex flex-col h-[80vh]">
          <div className="p-4 border-b flex justify-between items-center">
             <button onClick={() => onNavigate('home')} className="text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; Back
             </button>
             <h2 className="text-xl font-bold text-gray-800">AI Healthcare Chatbot</h2>
             <div className="w-16"></div>
          </div>
          
          <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-lg bg-gray-200 text-gray-500">
                  Typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="p-4 border-t flex space-x-2">
            <Input 
              placeholder="Type your message..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChatbotPage;