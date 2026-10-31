import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import './RoomGrid.css';

const BLOCKS = ['A', 'B', 'C', 'D'];
const FLOORS = [1, 2, 3];
const GROUPS = [
  { label: 'Single (01-04)', from: 1, to: 4 },
  { label: 'Double (05-08)', from: 5, to: 8 },
  { label: 'Triple (09-12)', from: 9, to: 12 },
];
const STATUS_CLASS = {
  Full: 'full',
  'Partially filled': 'partial',
  Vacant: 'vacant',
  Maintenance: 'maint',
};

function RoomGrid() {
  const { data, loading, error, reload } = useFetch('/rooms', 5000);
  const students = useFetch('/students', 5000);
  const { showToast } = useToast();

  const [block, setBlock] = useState('A');
  const [selectedId, setSelectedId] = useState(null); // we store the id, so the panel stays fresh after each refresh
  const [studentId, setStudentId] = useState('');

  const rooms = data?.rooms || [];
  const selected = rooms.find((r) => r._id === selectedId);

  // Counts for the legend
  const count = (status) => rooms.filter((r) => r.status === status).length;

  // Find one room by block, floor and number
  const roomAt = (floor, n) =>
    rooms.find((r) => r.roomNo === `${block}${floor}${String(n).padStart(2, '0')}`);

  // Students who are not in any room yet
  const occupiedIds = rooms.flatMap((r) => r.occupants.map((o) => o._id));
  const freeStudents = (students.data?.students || []).filter((s) => !occupiedIds.includes(s._id));

  // Wrapper for every action: call the API, show a toast, refresh
  const act = async (fn, okMessage) => {
    try {
      await fn();
      showToast(okMessage);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const allot = () => {
    if (!studentId) return showToast('Choose a student first', 'error');
    act(() => api.post(`/rooms/${selected._id}/allot`, { studentId }), 'Student allotted');
    setStudentId('');
  };

  const vacate = (id) => {
    if (!window.confirm('Vacate this student? A paid deposit will be marked Refunded.')) return;
    act(() => api.post(`/rooms/${selected._id}/vacate`, { studentId: id }), 'Student vacated');
  };

  const toggleMaintenance = () =>
    act(
      () => api.put(`/rooms/${selected._id}`, { maintenance: !selected.maintenance }),
      selected.maintenance ? 'Maintenance off' : 'Maintenance on'
    );

  const blocked = selected && (selected.maintenance || selected.occupants.length >= selected.capacity);

  return (
    <div>
      <h1 className="page-title">Room Grid</h1>
      <p className="page-sub">Click a room to manage it. Refreshes every 5 seconds.</p>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {rooms.length > 0 && (
        <>
          <div className="legend mb">
            <span><i className="dot full"></i>Full ({count('Full')})</span>
            <span><i className="dot partial"></i>Partially filled ({count('Partially filled')})</span>
            <span><i className="dot vacant"></i>Vacant ({count('Vacant')})</span>
            <span><i className="dot maint"></i>Maintenance ({count('Maintenance')})</span>
          </div>

          <div className="row mb">
            {BLOCKS.map((b) => (
              <button
                key={b}
                className={`btn btn-sm ${block === b ? '' : 'btn-outline'}`}
                onClick={() => { setBlock(b); setSelectedId(null); }}
              >
                Block {b} ({['A', 'B'].includes(b) ? 'AC' : 'Non-AC'})
              </button>
            ))}
          </div>

          <div className="grid-layout">
            <div className="table-wrap">
              <table className="room-table">
                <thead>
                  <tr>
                    <th>Floor</th>
                    {GROUPS.map((g) => <th key={g.label}>{g.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {FLOORS.map((floor) => (
                    <tr key={floor}>
                      <td><strong>Floor {floor}</strong></td>
                      {GROUPS.map((g) => (
                        <td key={g.label}>
                          <div className="tiles">
                            {Array.from({ length: g.to - g.from + 1 }, (_, i) => g.from + i).map((n) => {
                              const room = roomAt(floor, n);
                              if (!room) return null;
                              return (
                                <button
                                  key={room._id}
                                  className={`tile ${STATUS_CLASS[room.status]} ${selectedId === room._id ? 'selected' : ''}`}
                                  onClick={() => setSelectedId(room._id)}
                                >
                                  <span>{room.roomNo}</span>
                                  <small>{room.occupants.length}/{room.capacity}</small>
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Side panel for the clicked room */}
            <div className="card side-panel">
              {!selected ? (
                <p className="muted">Select a room to see its students and actions.</p>
              ) : (
                <>
                  <h3>Room {selected.roomNo}</h3>
                  <p className="muted">
                    {selected.type}, {selected.ac ? 'AC' : 'Non-AC'}, {selected.capacity} bed(s), {selected.status}
                  </p>

                  <div className="label mt mb">Students</div>
                  {selected.occupants.length === 0 && <p className="muted">No students.</p>}
                  {selected.occupants.map((o) => (
                    <div className="row-between mb" key={o._id}>
                      <span>{o.name}</span>
                      <button className="btn btn-danger btn-sm" onClick={() => vacate(o._id)}>Vacate</button>
                    </div>
                  ))}

                  <div className="label mt mb">Allot student</div>
                  <select
                    className="input"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    disabled={blocked}
                  >
                    <option value="">
                      {blocked ? 'Not available (full or maintenance)' : 'Choose a student'}
                    </option>
                    {freeStudents.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                  <button className="btn btn-accent btn-sm mt" onClick={allot} disabled={blocked}>Allot</button>

                  <div className="label mt mb">Maintenance</div>
                  <button className="btn btn-outline btn-sm" onClick={toggleMaintenance}>
                    {selected.maintenance ? 'Switch OFF' : 'Switch ON'}
                  </button>

                  <p className="mt">
                    <Link to={`/rooms/${selected._id}`}>Open room details</Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RoomGrid;