// src/App.js
import React, { useState } from 'react';
import RecipeForm from './components/RecipeForm';
import RecipeList from './components/RecipeList';
import FileManager from './components/FileManager';
import LLMIntegration from './components/LLMIntegration';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [files, setFiles] = useState([]);

  const addRecipe = (recipe) => {
    setRecipes([...recipes, { ...recipe, id: Date.now() }]);
  };

  const updateFiles = (newFiles) => {
    setFiles(newFiles);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍳 Recipe LLM Assistant</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'recipes' ? 'active' : ''}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </button>
          <button 
            className={activeTab === 'files' ? 'active' : ''}
            onClick={() => setActiveTab('files')}
          >
            File Manager
          </button>
          <button 
            className={activeTab === 'llm' ? 'active' : ''}
            onClick={() => setActiveTab('llm')}
          >
            AI Assistant
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'recipes' && (
          <div className="recipes-section">
            <RecipeForm onAddRecipe={addRecipe} />
            <RecipeList recipes={recipes} />
          </div>
        )}

        {activeTab === 'files' && (
          <FileManager files={files} onFilesUpdate={updateFiles} />
        )}

        {activeTab === 'llm' && (
          <LLMIntegration recipes={recipes} files={files} />
        )}
      </main>
    </div>
  );
}

export default App;