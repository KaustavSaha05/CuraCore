// src/api/aiService.js

const CHATBOT_API_URL = "http://localhost:5000/chat";

// This function will now talk to your Python backend
export const getChatbotResponse = async (message) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: message })
  };

  try {
    const response = await fetch(CHATBOT_API_URL, requestOptions);
    const data = await response.json();
    console.log("Full API Response:", data); // Log the entire response
    if (data.result) {
      return data.result;
    } else {
      console.error("API response format error:", data);
      return "Sorry, I received an unexpected response from the server.";
    }
  } catch (error) {
    console.error("Error calling the chatbot server:", error);
    return "Sorry, I'm having trouble connecting to the chatbot service.";
  }
};

export const analyzeReport = async (reportText, imageData = null) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      reportText: reportText,
      imageData: imageData 
    })
  };

  try {
    const response = await fetch("http://localhost:5000/analyze-report", requestOptions);
    const data = await response.json();
    if (data.analysis) {
      return data.analysis;
    } else {
      console.error("API response format error:", data);
      return "Sorry, I received an unexpected response from the server.";
    }
  } catch (error) {
    console.error("Error calling the report analysis server:", error);
    return "Sorry, there was an error analyzing the report. Please try again.";
  }
};