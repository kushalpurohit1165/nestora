import useFetch from '../../hooks/useFetch';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import StatusTag from '../../components/StatusTag.jsx';

const rupee = (n) => '₹' + Number(n).toLocaleString('en-IN');
const typeLabel = { rent: 'Room rent', mess: 'Mess charge', deposit: 'Security deposit' };

function MyFees() {
  const { data, loading, error, reload } = useFetch('/fees/mine', 5000);
  const fees = data?.fees || [];

  const overdue = fees.filter((f) => f.overdue);
  const dues = fees.filter((f) => f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
  const deposit = fees.find((f) => f.type === 'deposit');

  return (
    <div>
      <h1 className="page-title">My Fees</h1>
      <p className="page-sub">Rent and mess are due between the 1st and 5th of each month. Refreshes every 5 seconds.</p>

      {overdue.length > 0 && (
        <div className="form-error card mb" style={{ borderColor: 'var(--warning)' }}>
          Warning: you have {overdue.length} overdue fee(s). Please pay at the warden's office.
        </div>
      )}

      <div className="grid grid-4 mb">
        <div className="card">
          <div className="label">Total dues</div>
          <div className="card-num">{rupee(dues)}</div>
        </div>
        <div className="card">
          <div className="label">Security deposit</div>
          <div className="card-num" style={{ fontSize: 18 }}>
            {deposit ? <StatusTag status={deposit.status} /> : 'Not created'}
          </div>
        </div>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && fees.length === 0 && <EmptyState text="No fees yet. They appear after a room is allotted." />}

      {fees.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Fee</th><th>Month</th><th>Amount</th><th>Status</th><th>Paid on</th></tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id}>
                  <td>{typeLabel[f.type]}</td>
                  <td>{f.month || '-'}</td>
                  <td>{rupee(f.amount)}</td>
                  <td>
                    <StatusTag status={f.status} />{' '}
                    {f.overdue && <StatusTag status="Overdue" />}
                  </td>
                  <td>{f.paidOn ? new Date(f.paidOn).toLocaleDateString('en-IN') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyFees;