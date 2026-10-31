import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import './DashboardLayout.css';

// Black sidebar on the left, page content on the right (used by student and warden pages)
function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false); // phone menu open or closed

  return (
    <div className="dash">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="dash-main">
        <button className="btn btn-outline btn-sm dash-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          Menu
        </button>
        <div className="dash-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;