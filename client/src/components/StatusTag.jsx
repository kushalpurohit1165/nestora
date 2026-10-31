// Small flat uppercase tag: PAID, PENDING, OVERDUE, RESOLVED, REFUNDED
function StatusTag({ status }) {
  return <span className={`tag tag-${status.toLowerCase()}`}>{status}</span>;
}

export default StatusTag;