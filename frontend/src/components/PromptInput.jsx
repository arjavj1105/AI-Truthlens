import { useState } from 'react';
import './PromptInput.css';

export default function PromptInput({ onRunEvaluation, isEvaluating }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isEvaluating) {
      onRunEvaluation(prompt.trim());
    }
  };

  return (
    <div className="prompt-container">
      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          className="prompt-textarea"
          placeholder="Enter a question to evaluate across models..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isEvaluating}
          rows={3}
        />
        <div className="prompt-actions">
          <button 
            type="submit" 
            className="evaluate-btn"
            disabled={isEvaluating || !prompt.trim()}
          >
            {isEvaluating ? 'Evaluating...' : 'Run Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
}
