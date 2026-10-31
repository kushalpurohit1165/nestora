// Empty state: shown when a list has no data
function EmptyState({ text = 'Nothing to show yet.' }) {
  return <div className="state">{text}</div>;
}

export default EmptyState;