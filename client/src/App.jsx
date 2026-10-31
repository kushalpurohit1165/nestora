import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Placeholder from './pages/Placeholder.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import MessMenu from './pages/MessMenu.jsx';
import Rules from './pages/Rules.jsx';
import Register from './pages/Register.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages: anyone can open them */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/mess-menu" element={<MessMenu />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student pages: only logged-in students */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/student" element={<Placeholder title="Student Dashboard" />} />
            <Route path="/student/complaints" element={<Placeholder title="My Complaints" />} />
            <Route path="/student/fees" element={<Placeholder title="My Fees" />} />
          </Route>
        </Route>

        {/* Warden pages: only the warden */}
        <Route element={<ProtectedRoute role="warden" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/warden" element={<Placeholder title="Warden Dashboard" />} />
            <Route path="/warden/rooms" element={<Placeholder title="Room Grid" />} />
            <Route path="/rooms/:id" element={<Placeholder title="Room Details" />} />
            <Route path="/warden/fees" element={<Placeholder title="Manage Fees" />} />
            <Route path="/warden/complaints" element={<Placeholder title="Manage Complaints" />} />
            <Route path="/warden/notices" element={<Placeholder title="Manage Notices" />} />
            <Route path="/warden/pricing" element={<Placeholder title="Manage Pricing" />} />
            <Route path="/warden/menu" element={<Placeholder title="Manage Mess Menu" />} />
            <Route path="/warden/info" element={<Placeholder title="Manage Rules and Facilities" />} />
          </Route>
        </Route>

        {/* Anything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;