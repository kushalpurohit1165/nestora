import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

// Navbar on top, the page below. <Outlet /> is where the child route's page appears.
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;