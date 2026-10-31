// Error state: shown when loading data fails, with a Retry button
function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error">
      <p>{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="btn btn-outline btn-sm mt" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;