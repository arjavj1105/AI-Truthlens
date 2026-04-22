import './ResponseCard.css';

export default function ResponseCard({ modelName, response, isLoading, error }) {
  
  const formatModelName = (name) => {
    return name.split('/').pop().replace(/-/g, ' ').toUpperCase();
  };

  return (
    <div className="response-card">
      <div className="card-header">
        <span className="model-name">{formatModelName(modelName)}</span>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Generating response...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        ) : response ? (
          <div className="response-content">
            {response.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Waiting for evaluation to start...</p>
          </div>
        )}
      </div>
    </div>
  );
}
