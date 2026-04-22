import { useState } from 'react';
import PromptInput from './components/PromptInput';
import ResponseCard from './components/ResponseCard';
import './App.css';

const MODELS = [
  'google/gemini-1.5-pro',
  'openai/gpt-4o',
  'anthropic/claude-3.5-sonnet'
];

function App() {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRunEvaluation = async (prompt) => {
    setIsEvaluating(true);
    setResults([]);
    setErrorMsg(null);

    try {
        // Initialize loading state for all models
        const initialResults = MODELS.map(model => ({
            model,
            isLoading: true,
            response: null,
            error: null
        }));
        setResults(initialResults);

        const response = await fetch('http://localhost:3000/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to communicate with the server');
        }

        const data = await response.json();
        
        // Map backend results format to frontend state
        const updatedResults = data.results.map(r => ({
            model: r.model,
            isLoading: false,
            response: r.success ? r.response : null,
            error: !r.success ? r.error : null
        }));
        
        setResults(updatedResults);

    } catch (err) {
        console.error("Evaluation error:", err);
        setErrorMsg(err.message);
        setResults(prev => prev.map(r => ({ ...r, isLoading: false, error: 'Evaluation failed completely.' })));
    } finally {
        setIsEvaluating(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CouncilBench</h1>
        <p>Parallel Model Evaluation Dashboard</p>
      </header>
      
      <main className="app-main">
        {errorMsg && (
            <div className="global-error">{errorMsg}</div>
        )}
        
        <PromptInput 
          onRunEvaluation={handleRunEvaluation} 
          isEvaluating={isEvaluating} 
        />

        <div className="results-grid">
          {results.length === 0 ? (
             MODELS.map(model => (
                <ResponseCard 
                  key={model} 
                  modelName={model} 
                  isLoading={false}
                  response={null}
                  error={null}
                />
             ))
          ) : (
             results.map((result, index) => (
                <ResponseCard
                  key={index}
                  modelName={result.model}
                  isLoading={result.isLoading}
                  response={result.response}
                  error={result.error}
                />
             ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
