import { useState } from 'react';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';

const blank = { kind: 'rule', category: '', text: '', order: 0 };

function ManageInfo() {
  const { data, loading, error, reload } = useFetch('/info');
  const { showToast } = useToast();
  const items = data?.items || [];

  // "editing" holds the item in the modal; _id exists only when editing an existing one
  const [editing, setEditing] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing.category.trim() || !editing.text.trim()) {
      showToast('Category and text are required', 'error');
      return;
    }
    const body = {
      kind: editing.kind,
      category: editing.category,
      text: editing.text,
      order: Number(editing.order) || 0,
    };
    try {
      if (editing._id) {
        await api.put(`/info/${editing._id}`, body);
        showToast('Updated');
      } else {
        await api.post('/info', body);
        showToast('Added');
      }
      setEditing(null);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/info/${id}`);
      showToast('Deleted');
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <div className="row-between">
        <div>
          <h1 className="page-title">Manage Rules and Facilities</h1>
          <p className="page-sub">Shown on the public Rules and Facilities page.</p>
        </div>
        <button
          className="btn btn-accent"
          onClick={() => setEditing({ ...blank, order: items.length + 1 })}
        >
          Add new
        </button>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && items.length === 0 && <EmptyState text="Nothing added yet." />}

      {items.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Kind</th><th>Category</th><th>Text</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id}>
                  <td>{i.order}</td>
                  <td style={{ textTransform: 'capitalize' }}>{i.kind}</td>
                  <td>{i.category}</td>
                  <td>{i.text}</td>
                  <td>
                    <div className="row">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...i })}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing._id ? 'Edit item' : 'Add item'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} noValidate>
            <div className="field">
              <label className="label">Kind</label>
              <select className="input" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })}>
                <option value="rule">Rule</option>
                <option value="facility">Facility</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Category</label>
              <input className="input" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Text</label>
              <textarea className="input" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Order</label>
              <input className="input" type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-accent">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default ManageInfo;
