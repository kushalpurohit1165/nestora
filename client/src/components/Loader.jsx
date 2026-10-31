// Loading state: a small spinner with a message
function Loader({ text = 'Loading...' }) {
  return (
    <div className="state">
      <div className="spinner"></div>
      {text}
    </div>
  );
}

export default Loader;