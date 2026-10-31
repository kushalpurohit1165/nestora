import { useState } from 'react';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusTag from '../../components/StatusTag.jsx';
import Modal from '../../components/Modal.jsx';

function MyComplaints() {
  const { data, loading, error, reload } = useFetch('/complaints/mine', 5000);
  const { showToast } = useToast();
  const complaints = data?.complaints || [];

  const [form, setForm] = useState({ title: '', description: '' });
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState(null); // the complaint being edited, or null

  // ----- Create -----
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    setFormError('');
    try {
      await api.post('/complaints', form);
      showToast('Complaint raised');
      setForm({ title: '', description: '' });
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  // ----- Update -----
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing.title.trim() || !editing.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }
    try {
      await api.put(`/complaints/${editing._id}`, {
        title: editing.title,
        description: editing.description,
      });
      showToast('Complaint updated');
      setEditing(null);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  // ----- Delete -----
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      showToast('Complaint deleted');
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <h1 className="page-title">My Complaints</h1>
      <p className="page-sub">Raise a problem and track its status. Refreshes every 5 seconds.</p>

      <form className="card mb" onSubmit={handleCreate} noValidate>
        <div className="label mb">Raise a complaint</div>
        <div className="field">
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="field">
          <label className="label">Description</label>
          <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {formError && <div className="form-error">{formError}</div>}
        <button className="btn btn-accent">Submit</button>
      </form>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && complaints.length === 0 && <EmptyState text="You have not raised any complaints." />}

      {complaints.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Title</th><th>Description</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{c.title}</td>
                  <td>{c.description}</td>
                  <td><StatusTag status={c.status} /></td>
                  <td>
                    <div className="row">
                      {c.status === 'Pending' && (
                        <button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...c })}>Edit</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title="Edit complaint" onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} noValidate>
            <div className="field">
              <label className="label">Title</label>
              <input className="input" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Description</label>
              <textarea className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
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

export default MyComplaints;