import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Sidebar.css';

// Links for each role
const studentLinks = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/complaints', label: 'My Complaints' },
  { to: '/student/fees', label: 'My Fees' },
];

const wardenLinks = [
  { to: '/warden', label: 'Dashboard', end: true },
  { to: '/warden/rooms', label: 'Room Grid' },
  { to: '/warden/fees', label: 'Manage Fees' },
  { to: '/warden/complaints', label: 'Complaints' },
  { to: '/warden/notices', label: 'Notices' },
  { to: '/warden/pricing', label: 'Pricing' },
  { to: '/warden/menu', label: 'Mess Menu' },
  { to: '/warden/info', label: 'Rules and Facilities' },
];

// Black left sidebar. The links depend on the user's role (role-based view).
function Sidebar({ open, onClose }) {
  const { user, isWarden, logout } = useAuth();
  const navigate = useNavigate();
  const links = isWarden ? wardenLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand">
        <img src="/icon-white.png" alt="" />
        <span>Nestora</span>
      </div>

      <div className="sidebar-user">
        <div>{user?.name}</div>
        <div className="sidebar-role">{isWarden ? 'Warden' : 'Student'}</div>
      </div>

      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} onClick={onClose}>
            {l.label}
          </NavLink>
        ))}
        <NavLink to="/" onClick={onClose}>Public Site</NavLink>
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
    </aside>
  );
}

export default Sidebar;