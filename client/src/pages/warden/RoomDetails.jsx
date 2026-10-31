import { Link, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';

function RoomDetails() {
  const { id } = useParams(); // the :id part of /rooms/:id
  const { data, loading, error, reload } = useFetch(`/rooms/${id}`, 5000);
  const room = data?.room;

  return (
    <div>
      <p className="mb"><Link to="/warden/rooms">&larr; Back to Room Grid</Link></p>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {room && (
        <>
          <h1 className="page-title">Room {room.roomNo}</h1>
          <p className="page-sub">Refreshes every 5 seconds.</p>

          <div className="grid grid-4 mb">
            <div className="card"><div className="label">Block</div><div className="card-num">{room.block}</div></div>
            <div className="card"><div className="label">Floor</div><div className="card-num">{room.floor}</div></div>
            <div className="card"><div className="label">Type</div><div className="card-num" style={{ fontSize: 20, textTransform: 'capitalize' }}>{room.type}</div></div>
            <div className="card"><div className="label">AC</div><div className="card-num" style={{ fontSize: 20 }}>{room.ac ? 'AC' : 'Non-AC'}</div></div>
            <div className="card"><div className="label">Beds</div><div className="card-num">{room.occupants.length}/{room.capacity}</div></div>
            <div className="card"><div className="label">Status</div><div className="card-num" style={{ fontSize: 20 }}>{room.status}</div></div>
          </div>

          <h2 className="mb">Students in this room</h2>
          {room.occupants.length === 0 ? (
            <div className="state">No students in this room.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Course</th></tr></thead>
                <tbody>
                  {room.occupants.map((o) => (
                    <tr key={o._id}>
                      <td>{o.name}</td><td>{o.email}</td><td>{o.phone}</td><td>{o.course || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RoomDetails;