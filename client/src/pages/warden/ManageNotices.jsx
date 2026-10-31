import { useState } from 'react';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';

function ManageNotices() {
  const { data, loading, error, reload } = useFetch('/notices');
  const { showToast } = useToast();
  const notices = data?.notices || [];

  const [form, setForm] = useState({ title: '', message: '' });
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setFormError('Title and message are required');
      return;
    }
    setFormError('');
    try {
      await api.post('/notices', form);
      showToast('Notice posted');
      setForm({ title: '', message: '' });
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing.title.trim() || !editing.message.trim()) {
      showToast('Title and message are required', 'error');
      return;
    }
    try {
      await api.put(`/notices/${editing._id}`, { title: editing.title, message: editing.message });
      showToast('Notice updated');
      setEditing(null);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      showToast('Notice deleted');
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Notices</h1>
      <p className="page-sub">Notices appear on every student's dashboard.</p>

      <form className="card mb" onSubmit={handleCreate} noValidate>
        <div className="label mb">Post a notice</div>
        <div className="field">
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="field">
          <label className="label">Message</label>
          <textarea className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <button className="btn btn-accent">Post</button>
      </form>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && notices.length === 0 && <EmptyState text="No notices posted." />}

      {notices.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Title</th><th>Message</th><th>Actions</th></tr></thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n._id}>
                  <td>{new Date(n.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{n.title}</td>
                  <td>{n.message}</td>
                  <td>
                    <div className="row">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...n })}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title="Edit notice" onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} noValidate>
            <div className="field">
              <label className="label">Title</label>
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Message</label>
              <textarea className="input" value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} />
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

export default ManageNotices;