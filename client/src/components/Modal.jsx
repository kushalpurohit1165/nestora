// Reusable popup. Clicking the dark background closes it.
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-back" onClick={onClose}>
      {/* stopPropagation: clicks inside the box must not close the modal */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default Modal;