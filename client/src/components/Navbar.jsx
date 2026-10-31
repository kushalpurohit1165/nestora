import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

// Top bar for public pages
function Navbar() {
  const { isLoggedIn, isWarden, logout } = useAuth();
  const navigate = useNavigate(); // lets us change page from code

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <img src="/icon.png" alt="" />
          <span>Nestora</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/mess-menu">Mess Menu</Link>
          <Link to="/rules">Rules and Facilities</Link>
        </nav>

        <div className="row">
          {isLoggedIn ? (
            <>
              <Link className="btn btn-outline btn-sm" to={isWarden ? '/warden' : '/student'}>
                Dashboard
              </Link>
              <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline btn-sm" to="/login">Login</Link>
              <Link className="btn btn-accent btn-sm" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;