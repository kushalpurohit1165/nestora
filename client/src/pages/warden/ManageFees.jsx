import { useState } from 'react';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusTag from '../../components/StatusTag.jsx';

const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN');
const typeLabel = { rent: 'Rent', mess: 'Mess', deposit: 'Deposit' };

function ManageFees() {
  const { data, loading, error, reload } = useFetch('/fees', 5000);
  const { showToast } = useToast();
  const fees = data?.fees || [];

  const [filter, setFilter] = useState('All');
  const [month, setMonth] = useState(''); // empty = current month on the server

  const shown = fees.filter((f) => {
    if (filter === 'All') return true;
    if (filter === 'Overdue') return f.overdue;
    return f.status === filter;
  });

  const generate = async () => {
    try {
      const { data } = await api.post('/fees/generate', month ? { month } : {});
      showToast(data.message);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/fees/${id}/pay`);
      showToast('Fee marked as paid');
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div>
      <h1 className="page-title">Manage Fees</h1>
      <p className="page-sub">Record payments manually. Refreshes every 5 seconds.</p>

      <div className="card mb">
        <div className="label mb">Generate monthly fees</div>
        <div className="row">
          <input className="input" style={{ maxWidth: 180 }} placeholder="2026-11 (optional)" value={month} onChange={(e) => setMonth(e.target.value)} />
          <button className="btn btn-accent" onClick={generate}>Generate fees for this month</button>
        </div>
        <p className="muted mt">Creates one rent and one mess fee for every student with a room. Duplicates are skipped.</p>
      </div>

      <div className="row mb">
        {['All', 'Pending', 'Paid', 'Refunded', 'Overdue'].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? '' : 'btn-outline'}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && shown.length === 0 && <EmptyState text="No fees to show." />}

      {shown.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Fee</th><th>Month</th><th>Amount</th><th>Status</th><th>Paid on</th><th>Action</th></tr>
            </thead>
            <tbody>
              {shown.map((f) => (
                <tr key={f._id}>
                  <td>{f.user?.name || 'Deleted user'}</td>
                  <td>{typeLabel[f.type]}</td>
                  <td>{f.month || '-'}</td>
                  <td>{rupee(f.amount)}</td>
                  <td><StatusTag status={f.status} /> {f.overdue && <StatusTag status="Overdue" />}</td>
                  <td>{f.paidOn ? new Date(f.paidOn).toLocaleDateString('en-IN') : '-'}</td>
                  <td>
                    {f.status === 'Pending' && (
                      <button className="btn btn-sm" onClick={() => markPaid(f._id)}>Mark paid</button>
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

export default ManageFees;