import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';

const rupee = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function WardenDashboard() {
  // Both calls use Mongoose aggregate() on the server. Polled every 5 seconds.
  const rooms = useFetch('/rooms/stats', 5000);
  const fees = useFetch('/fees/stats', 5000);

  const totals = rooms.data?.stats?.totals;
  const byFloor = rooms.data?.stats?.byFloor || [];
  const byType = rooms.data?.stats?.byType || [];
  const f = fees.data?.stats;

  return (
    <div>
      <h1 className="page-title">Warden Dashboard</h1>
      <p className="page-sub">Live hostel statistics. Refreshes every 5 seconds.</p>

      {(rooms.loading || fees.loading) && <Loader />}
      {rooms.error && <ErrorState message={rooms.error} onRetry={rooms.reload} />}
      {fees.error && <ErrorState message={fees.error} onRetry={fees.reload} />}

      {totals && (
        <div className="grid grid-4 mb">
          <div className="card"><div className="label">Total beds</div><div className="card-num">{totals.totalBeds}</div></div>
          <div className="card"><div className="label">Occupied beds</div><div className="card-num">{totals.occupiedBeds}</div></div>
          <div className="card"><div className="label">Vacant rooms</div><div className="card-num">{totals.vacantRooms}</div></div>
          <div className="card"><div className="label">Full rooms</div><div className="card-num">{totals.fullRooms}</div></div>
        </div>
      )}

      {f && (
        <div className="grid grid-4 mb">
          <div className="card"><div className="label">Fees collected</div><div className="card-num" style={{ color: 'var(--success)' }}>{rupee(f.collected)}</div></div>
          <div className="card"><div className="label">Fees pending</div><div className="card-num" style={{ color: 'var(--warning)' }}>{rupee(f.pending)}</div></div>
          <div className="card"><div className="label">Deposits refunded</div><div className="card-num">{rupee(f.refunded)}</div></div>
        </div>
      )}

      {byFloor.length > 0 && (
        <>
          <h2 className="mb">By block and floor</h2>
          <div className="table-wrap mb">
            <table>
              <thead>
                <tr><th>Block</th><th>Floor</th><th>Empty</th><th>Partly filled</th><th>Full</th><th>Maintenance</th><th>Vacant beds</th></tr>
              </thead>
              <tbody>
                {byFloor.map((r) => (
                  <tr key={`${r._id.block}${r._id.floor}`}>
                    <td>{r._id.block}</td>
                    <td>{r._id.floor}</td>
                    <td>{r.vacantRooms}</td>
                    <td>{r.partialRooms}</td>
                    <td>{r.fullRooms}</td>
                    <td>{r.maintenanceRooms}</td>
                    <td>{r.vacantBeds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {byType.length > 0 && (
        <>
          <h2 className="mb">Occupancy by room type</h2>
          <div className="table-wrap mb">
            <table>
              <thead>
                <tr><th>Type</th><th>AC</th><th>Rooms</th><th>Total beds</th><th>Occupied beds</th></tr>
              </thead>
              <tbody>
                {byType.map((r) => (
                  <tr key={`${r._id.type}${r._id.ac}`}>
                    <td style={{ textTransform: 'capitalize' }}>{r._id.type}</td>
                    <td>{r._id.ac ? 'AC' : 'Non-AC'}</td>
                    <td>{r.rooms}</td>
                    <td>{r.totalBeds}</td>
                    <td>{r.occupiedBeds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Link className="btn btn-accent" to="/warden/rooms">Open Room Grid</Link>
    </div>
  );
}

export default WardenDashboard;