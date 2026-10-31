import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getErrorMessage } from '../api';

// Client-side validation: returns an object of error messages (empty = all good)
const validate = (f) => {
  const errors = {};
  if (!f.name.trim()) errors.name = 'Name is required';
  if (!/^\S+@\S+\.\S+$/.test(f.email)) errors.email = 'Enter a valid email';
  if (f.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (f.confirm !== f.password) errors.confirm = 'Passwords do not match';
  if (!/^\d{10}$/.test(f.phone)) errors.phone = 'Phone must be exactly 10 digits';
  return errors;
};

function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const nameRef = useRef(null); // useRef: lets us focus the first field with an error

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', phone: '', course: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      nameRef.current?.focus();
      return; // stop: do not call the server
    }

    setLoading(true);
    try {
      const { confirm, ...data } = form; // confirm is only for the browser, not sent
      void confirm;
      await register(data);
      showToast('Registered successfully');
      navigate('/student');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div className="field">
      <label className="label">{label}</label>
      <input
        className="input"
        name={name}
        type={type}
        value={form[name]}
        onChange={handleChange}
        ref={name === 'name' ? nameRef : null}
      />
      {errors[name] && <div className="field-error">{errors[name]}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1 className="page-title">Student Registration</h1>
      <p className="page-sub">Create your Nestora account.</p>
      <form onSubmit={handleSubmit} noValidate>
        {field('name', 'Full name')}
        {field('email', 'Email', 'email')}
        {field('phone', 'Phone (10 digits)')}
        {field('course', 'Course (optional)')}
        {field('password', 'Password', 'password')}
        {field('confirm', 'Confirm password', 'password')}
        <button className="btn btn-accent" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt muted">Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}

export default Register;