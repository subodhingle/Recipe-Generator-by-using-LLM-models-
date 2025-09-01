// src/components/LLMIntegration.js
import React, { useState, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Key, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { useLLM } from '../hooks/useLLM';
import { testAPI } from '../services/api';

const LLMIntegration = ({ recipes, files }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const { generateResponse, isLoading, error } = useLLM();
  const [apiStatus, setApiStatus] = useState('checking');
  const [usingAPI, setUsingAPI] = useState(false);
  const [apiType, setApiType] = useState('');

  // Check API status on component mount
  useEffect(() => {
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    setApiStatus('checking');
    
    // Determine which API is configured
    const currentApiType = process.env.REACT_APP_API_TYPE || 'gemini';
    setApiType(currentApiType);
    
    // Check if we have an API key for the configured service
    const hasKey = currentApiType === 'gemini' 
      ? !!process.env.REACT_APP_GEMINI_API_KEY
      : currentApiType === 'huggingface'
      ? !!process.env.REACT_APP_HUGGINGFACE_API_KEY
      : currentApiType === 'deepinfra'
      ? !!process.env.REACT_APP_DEEPINFRA_API_KEY
      : false;

    if (!hasKey) {
      setApiStatus('not-configured');
      setUsingAPI(false);
      addWelcomeMessage();
      return;
    }

    // Test if API is actually working
    try {
      const result = await testAPI();
      setApiStatus(result === 'api' ? 'connected' : 'unavailable');
      setUsingAPI(result === 'api');
      
      if (result === 'api') {
        setMessages([{
          role: 'assistant', 
          content: `Hello! I'm your AI recipe assistant powered by ${currentApiType === 'gemini' ? 'Google Gemini 🤖' : 'AI'}. I'm connected and ready to help with all your cooking questions! 🍳\n\nWhat would you like to cook today?`
        }]);
      } else {
        addWelcomeMessage();
      }
    } catch (error) {
      setApiStatus('unavailable');
      setUsingAPI(false);
      addWelcomeMessage();
    }
  };

  const addWelcomeMessage = () => {
    const apiName = apiType === 'gemini' ? 'Google Gemini' : 'AI';
    
    setMessages([{
      role: 'assistant',
      content: `Welcome to Recipe Assistant! 🍳\n\nI'm currently in demo mode. To enable ${apiName} responses:\n\n1. Get a FREE API key${
        apiType === 'gemini' 
          ? ' from Google AI Studio: https://aistudio.google.com/'
          : apiType === 'huggingface'
          ? ' from HuggingFace: https://huggingface.co/settings/tokens'
          : ' from DeepInfra'
      }\n2. Create a .env file with REACT_APP_${apiType.toUpperCase()}_API_KEY=your_key\n3. Restart the application\n\nIn the meantime, I can still help with cooking advice! What would you like to know?`
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const context = {
        recipes: recipes,
        files: files
      };

      const response = await generateResponse(input, context);
      const botMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      const errorMessage = { 
        role: 'assistant', 
        content: `I apologize, but I'm having some technical difficulties. Here's what I can suggest:\n\n${generateFallbackResponse(input, recipes, files)}`
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const generateFallbackResponse = (prompt, recipes, files) => {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('recipe') || promptLower.includes('cook')) {
      return "Check out popular recipe websites like AllRecipes, Food Network, or BBC Good Food for inspiration. You might also try searching for specific ingredients you have on hand!";
    }
    
    if (promptLower.includes('healthy')) {
      return "For healthier cooking, try using more vegetables, lean proteins, and whole grains. Baking instead of frying and reducing sugar can also make recipes healthier.";
    }
    
    return "I recommend checking online cooking resources or recipe communities for the most current information and ideas. Happy cooking!";
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    setTimeout(() => handleSend(), 100);
  };

  const getApiHelpLink = () => {
    switch (apiType) {
      case 'gemini':
        return 'https://aistudio.google.com/';
      case 'huggingface':
        return 'https://huggingface.co/settings/tokens';
      case 'deepinfra':
        return 'https://deepinfra.com/';
      default:
        return 'https://aistudio.google.com/';
    }
  };

  return (
    <div className="llm-integration">
      <h2>Recipe Assistant {usingAPI ? '🤖' : '📝'}</h2>
      
      <div className="api-status">
        {apiStatus === 'checking' && (
          <div className="status-checking">
            <Wifi size={16} />
            <span>Checking API connection...</span>
          </div>
        )}
        {apiStatus === 'not-configured' && (
          <div className="status-not-configured">
            <WifiOff size={16} />
            <span>Demo mode - {apiType.toUpperCase()} API not configured</span>
            <button onClick={() => window.open(getApiHelpLink(), '_blank')}>
              <Key size={14} />
              Get API Key
            </button>
          </div>
        )}
        {apiStatus === 'connected' && (
          <div className="status-connected">
            <Sparkles size={16} />
            <span>Connected to {apiType} API</span>
          </div>
        )}
        {apiStatus === 'unavailable' && (
          <div className="status-unavailable">
            <WifiOff size={16} />
            <span>API unavailable - Using demo mode</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="quick-questions">
        <h4>Quick Questions:</h4>
        <div className="quick-buttons">
          <button onClick={() => handleQuickQuestion('How can I make my recipes healthier?')}>
            Make healthier
          </button>
          <button onClick={() => handleQuickQuestion('Give me quick recipe ideas')}>
            Quick recipes
          </button>
          <button onClick={() => handleQuickQuestion('Vegetarian substitutions?')}>
            Vegetarian options
          </button>
          <button onClick={() => handleQuickQuestion('Basic cooking techniques')}>
            Cooking basics
          </button>
        </div>
      </div>
      
      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about recipes, cooking techniques, or get suggestions..."
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send size={20} />
          </button>
        </div>
      </div>

      <div className="context-info">
        <h4>Available Context:</h4>
        <p>📋 Recipes: {recipes.length} | 📁 Files: {files.length}</p>
      </div>
    </div>
  );
};

export default LLMIntegration;