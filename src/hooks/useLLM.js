// src/hooks/useLLM.js
import { useState } from 'react';
import { generateRecipeResponse } from '../services/api';

export const useLLM = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateResponse = async (prompt, context) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await generateRecipeResponse(prompt, context);
      return response;
    } catch (error) {
      console.error('LLM Error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateResponse, isLoading, error };
};