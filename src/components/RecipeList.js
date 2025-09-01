// src/components/RecipeList.js
import React from 'react';

const RecipeList = ({ recipes }) => {
  if (recipes.length === 0) {
    return (
      <div className="recipe-list">
        <h2>Your Recipes</h2>
        <p>No recipes yet. Add your first recipe!</p>
      </div>
    );
  }

  return (
    <div className="recipe-list">
      <h2>Your Recipes ({recipes.length})</h2>
      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.title}</h3>
            <p className="difficulty">{recipe.difficulty}</p>
            {recipe.cookingTime && (
              <p className="cooking-time">⏱️ {recipe.cookingTime} min</p>
            )}
            <div className="ingredients">
              <h4>Ingredients:</h4>
              <ul>
                {recipe.ingredients.split('\n').map((ingredient, index) => (
                  <li key={index}>{ingredient.trim()}</li>
                ))}
              </ul>
            </div>
            {recipe.instructions && (
              <div className="instructions">
                <h4>Instructions:</h4>
                <p>{recipe.instructions}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;