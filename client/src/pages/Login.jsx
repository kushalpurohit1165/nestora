import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../api';

function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Controlled form: React state holds what the user types
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast('Welcome back, ' + user.name);
      navigate(user.role === 'warden' ? '/warden' : '/student');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '0 auto' }}>
      <h1 className="page-title">Login</h1>
      <p className="page-sub">Sign in to your Nestora account.</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label className="label">Password</label>
          <input className="input" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-accent" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="mt muted">New student? <Link to="/register">Register</Link></p>
    </div>
  );
}

export default Login;