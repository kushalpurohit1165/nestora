import { useState } from 'react';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusTag from '../../components/StatusTag.jsx';

function ManageComplaints() {
  const { data, loading, error, reload } = useFetch('/complaints', 5000);
  const { showToast } = useToast();
  const [filter, setFilter] = useState('All');

  const complaints = (data?.complaints || []).filter(
    (c) => filter === 'All' || c.status === filter
  );

  const setStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      showToast(`Marked ${status}`);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Complaints</h1>
      <p className="page-sub">Refreshes every 5 seconds.</p>

      <div className="row mb">
        {['All', 'Pending', 'Resolved'].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? '' : 'btn-outline'}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && complaints.length === 0 && <EmptyState text="No complaints to show." />}

      {complaints.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Student</th><th>Title</th><th>Description</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{c.user?.name || 'Deleted user'}<br /><span className="muted">{c.user?.phone}</span></td>
                  <td>{c.title}</td>
                  <td>{c.description}</td>
                  <td><StatusTag status={c.status} /></td>
                  <td>
                    {c.status === 'Pending' ? (
                      <button className="btn btn-sm" onClick={() => setStatus(c._id, 'Resolved')}>Resolve</button>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => setStatus(c._id, 'Pending')}>Reopen</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageComplaints;