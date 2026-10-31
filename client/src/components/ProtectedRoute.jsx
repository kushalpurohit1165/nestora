import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Guards a group of pages.
//  - not logged in            -> redirect to /login
//  - student on warden pages  -> redirect to the student dashboard
//  - warden on student pages  -> redirect to the warden dashboard
function ProtectedRoute({ role }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'warden' ? '/warden' : '/student'} replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;