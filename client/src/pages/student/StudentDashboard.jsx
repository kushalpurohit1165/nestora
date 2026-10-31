import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const POLL = 5000; // auto-refresh every 5 seconds ("real-time" updates)

function StudentDashboard() {
  const { user } = useAuth();
  const room = useFetch('/rooms/mine', POLL);
  const notices = useFetch('/notices', POLL);

  const myRoom = room.data?.room;
  // Hall 1 for Blocks A and B, Hall 2 for Blocks C and D (computed from the block)
  const hall = myRoom ? (['A', 'B'].includes(myRoom.block) ? 'Hall 1' : 'Hall 2') : null;
  const roommates = myRoom ? myRoom.occupants.filter((o) => o._id !== user._id) : [];

  return (
    <div>
      <h1 className="page-title">Welcome, {user.name}</h1>
      <p className="page-sub">Your hostel at a glance. This page refreshes every 5 seconds.</p>

      <div className="grid grid-2 mb">
        <div className="card">
          <div className="label mb">Profile</div>
          <p><strong>{user.name}</strong></p>
          <p className="muted">{user.email}</p>
        </div>

        <div className="card">
          <div className="label mb">My room</div>
          {room.loading && <Loader />}
          {room.error && <ErrorState message={room.error} onRetry={room.reload} />}
          {!room.loading && !room.error && !myRoom && (
            <EmptyState text="No room allotted yet. Please contact the warden." />
          )}
          {myRoom && (
            <>
              <p className="card-num">{myRoom.roomNo}</p>
              <p className="muted">
                Block {myRoom.block}, Floor {myRoom.floor}, {myRoom.type}, {myRoom.ac ? 'AC' : 'Non-AC'}
              </p>
              <p className="mt"><span className="label">Mess hall</span> {hall}</p>
              <p className="mt label">Roommates</p>
              {roommates.length === 0 ? (
                <p className="muted">None yet</p>
              ) : (
                <ul style={{ paddingLeft: 18 }}>
                  {roommates.map((r) => (
                    <li key={r._id}>{r.name} <span className="muted">({r.course || 'course not set'})</span></li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      <h2 className="mb">Notices</h2>
      {notices.loading && <Loader />}
      {notices.error && <ErrorState message={notices.error} onRetry={notices.reload} />}
      {!notices.loading && !notices.error && (notices.data?.notices || []).length === 0 && (
        <EmptyState text="No notices right now." />
      )}
      <div className="grid">
        {(notices.data?.notices || []).map((n) => (
          <div className="card" key={n._id}>
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            <p className="muted mt">
              {n.postedBy?.name} on {new Date(n.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;