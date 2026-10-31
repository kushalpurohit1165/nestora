import { useState } from 'react';
import api, { getErrorMessage } from '../../api';
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Modal from '../../components/Modal.jsx';

function ManageMenu() {
  const { data, loading, error, reload } = useFetch('/menu');
  const { showToast } = useToast();
  const menu = data?.menu || [];
  const [editing, setEditing] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { breakfast, lunch, snacks, dinner } = editing;
      await api.put(`/menu/${editing.day}`, { breakfast, lunch, snacks, dinner });
      showToast(`${editing.day} menu updated`);
      setEditing(null);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];

  return (
    <div>
      <h1 className="page-title">Manage Mess Menu</h1>
      <p className="page-sub">One common weekly menu for both halls.</p>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {menu.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Snacks</th><th>Dinner</th><th>Action</th></tr>
            </thead>
            <tbody>
              {menu.map((m) => (
                <tr key={m._id}>
                  <td><strong>{m.day}</strong></td>
                  <td>{m.breakfast}</td><td>{m.lunch}</td><td>{m.snacks}</td><td>{m.dinner}</td>
                  <td><button className="btn btn-outline btn-sm" onClick={() => setEditing({ ...m })}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={`Edit ${editing.day}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave}>
            {meals.map((meal) => (
              <div className="field" key={meal}>
                <label className="label">{meal}</label>
                <input className="input" value={editing[meal]} onChange={(e) => setEditing({ ...editing, [meal]: e.target.value })} />
              </div>
            ))}
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

export default ManageMenu;