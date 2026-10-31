import useFetch from '../hooks/useFetch.js';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

function MessMenu() {
  const { data, loading, error, reload } = useFetch('/menu');
  const menu = data?.menu || [];

  return (
    <div>
      <h1 className="page-title">Mess Menu</h1>
      <p className="page-sub">One common weekly menu. Hall 1 is for Blocks A and B, Hall 2 for Blocks C and D.</p>

      <div className="table-wrap mb">
        <table>
          <thead>
            <tr><th>Meal</th><th>Timing</th></tr>
          </thead>
          <tbody>
            <tr><td>Breakfast</td><td>7:30 AM to 9:30 AM</td></tr>
            <tr><td>Lunch</td><td>12:30 PM to 2:30 PM</td></tr>
            <tr><td>Snacks</td><td>5:00 PM to 6:00 PM</td></tr>
            <tr><td>Dinner</td><td>7:30 PM to 9:30 PM</td></tr>
          </tbody>
        </table>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {!loading && !error && menu.length === 0 && <EmptyState text="Menu not added yet." />}

      {menu.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Snacks</th><th>Dinner</th></tr>
            </thead>
            <tbody>
              {menu.map((m) => (
                <tr key={m._id}>
                  <td><strong>{m.day}</strong></td>
                  <td>{m.breakfast}</td>
                  <td>{m.lunch}</td>
                  <td>{m.snacks}</td>
                  <td>{m.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MessMenu;