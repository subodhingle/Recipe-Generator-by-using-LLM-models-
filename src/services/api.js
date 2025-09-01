// src/services/api.js
import axios from 'axios';

// API configurations
const API_CONFIG = {
  gemini: {
    name: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    key: process.env.REACT_APP_GEMINI_API_KEY
  },
  huggingface: {
    name: 'HuggingFace',
    url: 'https://api-inference.huggingface.co/models',
    models: {
      recipe: 'microsoft/DialoGPT-medium'
    }
  },
  deepinfra: {
    name: 'DeepInfra',
    url: 'https://api.deepinfra.com/v1/openai/chat/completions',
    models: {
      recipe: 'mistralai/Mistral-7B-Instruct-v0.1'
    }
  }
};

// Get current API configuration
const getApiConfig = () => {
  const apiType = process.env.REACT_APP_API_TYPE || 'gemini';
  return API_CONFIG[apiType] || API_CONFIG.gemini;
};

/**
 * Generates a recipe response using the configured API
 */
export const generateRecipeResponse = async (prompt, context) => {
  try {
    const apiConfig = getApiConfig();
    const apiType = process.env.REACT_APP_API_TYPE || 'gemini';
    
    switch (apiType) {
      case 'gemini':
        return await generateWithGemini(prompt, context);
      case 'huggingface':
        return await generateWithHuggingFace(prompt, context);
      case 'deepinfra':
        return await generateWithDeepInfra(prompt, context);
      default:
        return await generateWithGemini(prompt, context);
    }
  } catch (error) {
    console.error('API Error:', error);
    return generateMockResponse(prompt, context);
  }
};

/**
 * Google Gemini API integration
 */
const generateWithGemini = async (prompt, context) => {
  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  
  if (!API_KEY) {
    console.log('Gemini API key not found, using mock response');
    return generateMockResponse(prompt, context);
  }

  try {
    const systemPrompt = `You are a helpful recipe assistant. You have access to:
    - ${context.recipes?.length || 0} recipes in the user's collection
    - ${context.files?.length || 0} uploaded files
    
    Provide helpful, concise responses about cooking, recipes, and food preparation. 
    Be practical and give specific advice when possible.`;

    const fullPrompt = `${systemPrompt}

    User question: ${prompt}

    ${buildContextString(context)}`;

    const response = await axios.post(
      `${API_CONFIG.gemini.url}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.8,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Extract the response text from Gemini's structure
    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Invalid response format from Gemini API');
    }

    return responseText;
  } catch (error) {
    console.warn('Gemini API failed:', error.response?.data || error.message);
    return generateMockResponse(prompt, context);
  }
};

/**
 * Hugging Face API integration (fallback)
 */
const generateWithHuggingFace = async (prompt, context) => {
  const API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY;
  const model = 'microsoft/DialoGPT-medium';
  
  if (!API_KEY) {
    return generateMockResponse(prompt, context);
  }

  try {
    const fullPrompt = buildPromptWithContext(prompt, context);
    
    const response = await axios.post(
      `${API_CONFIG.huggingface.url}/${model}`,
      { inputs: fullPrompt },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data.generated_text || 'I apologize, but I had trouble generating a response. Please try again.';
  } catch (error) {
    console.warn('HuggingFace API failed:', error.message);
    return generateMockResponse(prompt, context);
  }
};

/**
 * Build context string for the prompt
 */
const buildContextString = (context) => {
  let contextString = '';
  
  // Add recipe context
  if (context.recipes && context.recipes.length > 0) {
    contextString += "Available recipes:\n";
    context.recipes.slice(0, 3).forEach((recipe, index) => {
      contextString += `${index + 1}. ${recipe.title} (${recipe.difficulty || 'unknown'})\n`;
      if (recipe.ingredients) {
        const ingredients = recipe.ingredients.split('\n').slice(0, 3).join(', ');
        contextString += `   Ingredients: ${ingredients}...\n`;
      }
    });
    contextString += "\n";
  }
  
  // Add file context
  if (context.files && context.files.length > 0) {
    contextString += "Uploaded files:\n";
    context.files.slice(0, 5).forEach(file => {
      contextString += `- ${file.name} (${file.type})\n`;
    });
  }
  
  return contextString;
};

/**
 * Build prompt with context (for other APIs)
 */
const buildPromptWithContext = (prompt, context) => {
  return `User question: ${prompt}\n\n${buildContextString(context)}`;
};

/**
 * Enhanced mock responses
 */
export const generateMockResponse = (prompt, context) => {
  const promptLower = prompt.toLowerCase();
  const hasRecipes = context.recipes && context.recipes.length > 0;
  
  if (promptLower.includes('healthy') || promptLower.includes('diet')) {
    return `For healthier recipes, I recommend:\n\n• Use olive oil instead of butter\n• Replace white flour with whole wheat or almond flour\n• Add more vegetables to increase fiber and nutrients\n• Reduce sugar by 25-50% and enhance with spices like cinnamon or vanilla\n• Bake, grill, or steam instead of frying\n• Use Greek yogurt instead of sour cream\n\n${hasRecipes ? 'I can help modify any of your recipes to be healthier!' : 'Would you like specific healthy recipe ideas?'}`;
  }
  
  if (promptLower.includes('quick') || promptLower.includes('fast') || promptLower.includes('easy')) {
    return `Quick recipe ideas:\n\n• 15-minute pasta with garlic, olive oil, and red pepper flakes\n• 10-minute omelette with leftover vegetables and cheese\n• 5-minute avocado toast with cherry tomatoes and everything seasoning\n• 20-minute stir-fry with pre-cut vegetables and protein\n• No-cook options: salads, sandwiches, yogurt parfaits\n\nI can help you adapt recipes to be quicker or suggest time-saving techniques!`;
  }
  
  if (promptLower.includes('vegetarian') || promptLower.includes('vegan')) {
    return `Vegetarian/vegan substitutions:\n\n• Meat: mushrooms, lentils, tofu, tempeh, or beans\n• Dairy milk: almond, soy, oat, or coconut milk\n• Eggs: flax eggs (1 tbsp ground flax + 3 tbsp water), applesauce, or commercial egg replacers\n• Cheese: nutritional yeast, vegan cheese, or blended cashews\n• Honey: maple syrup, agave, or date syrup\n\nI'd be happy to help convert any recipe to vegetarian or vegan!`;
  }
  
  if (promptLower.includes('ingredient') || promptLower.includes('substitut')) {
    return `Common ingredient substitutions:\n\n• Buttermilk: 1 cup milk + 1 tbsp lemon juice or vinegar (let sit 5 minutes)\n• Baking powder: 1/4 tsp baking soda + 1/2 tsp cream of tartar\n• Brown sugar: 1 cup white sugar + 1-2 tbsp molasses\n• Tomato paste: ketchup (use 2x amount) or tomato sauce (reduce other liquids)\n• Fresh herbs: use 1/3 amount of dried herbs\n• Wine: broth with a splash of vinegar\n\nWhat specific ingredient do you need to substitute?`;
  }
  
  // Default helpful responses
  const defaultResponses = [
    `I'd be happy to help with your cooking questions! I can assist with recipes, techniques, substitutions, and more. What would you like to know?`,
    `As your recipe assistant, I can help you plan meals, adjust recipes, or solve cooking challenges. What do you need help with today?`,
    `I notice you ${hasRecipes ? `have ${context.recipes.length} recipes` : 'haven\'t added any recipes yet'}. I can help you create new recipes or suggest ideas based on ingredients you have!`,
    `Let me know what you'd like to cook, and I'll help you with recipes, techniques, and tips to make it successful!`,
    `Whether you're making a simple weeknight dinner or an elaborate celebration meal, I'm here to help. What's cooking?`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Test function to check API availability
export const testAPI = async () => {
  try {
    const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_HUGGINGFACE_API_KEY;
    
    if (!API_KEY) {
      return 'mock';
    }
    
    const response = await generateRecipeResponse('Hello, are you working?', { recipes: [], files: [] });
    return response.includes('Sorry') || response.includes('apologize') ? 'mock' : 'api';
  } catch (error) {
    return 'mock';
  }
};