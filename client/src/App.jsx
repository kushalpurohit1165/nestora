// Temporary page to test api.js, AuthContext and ToastContext. Replaced in Step 11c.
import api, { getErrorMessage } from './api';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './context/ToastContext.jsx';

function App() {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();

  const testPublicApi = async () => {
    try {
      const { data } = await api.get('/pricing');
      showToast(`Mess charge is ₹${data.pricing.messCharge}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const loginWarden = async () => {
    try {
      await login('warden@nestora.com', 'warden123');
      showToast('Logged in as warden');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const testProtectedApi = async () => {
    try {
      const { data } = await api.get('/rooms/stats');
      showToast(`Total rooms: ${data.stats.totals.totalRooms}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="container page">
      <h1 className="page-title">Nestora</h1>
      <p className="page-sub">
        {user ? `Logged in: ${user.name} (${user.role})` : 'Not logged in'}
      </p>

      <div className="row">
        <button className="btn" onClick={testPublicApi}>Test public API</button>
        <button className="btn btn-accent" onClick={loginWarden}>Login as warden</button>
        <button className="btn btn-outline" onClick={testProtectedApi}>Test protected API</button>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default App;