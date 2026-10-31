import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import MessMenu from "./pages/MessMenu.jsx";
import Rules from "./pages/Rules.jsx";
import Register from "./pages/Register.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import MyComplaints from "./pages/student/MyComplaints.jsx";
import MyFees from "./pages/student/MyFees.jsx";
import WardenDashboard from "./pages/warden/WardenDashboard.jsx";
import RoomGrid from "./pages/warden/RoomGrid.jsx";
import RoomDetails from "./pages/warden/RoomDetails.jsx";
import ManageFees from "./pages/warden/ManageFees.jsx";
import ManageComplaints from "./pages/warden/ManageComplaints.jsx";
import ManageNotices from "./pages/warden/ManageNotices.jsx";
import ManagePricing from "./pages/warden/ManagePricing.jsx";
import ManageMenu from "./pages/warden/ManageMenu.jsx";
import ManageInfo from "./pages/warden/ManageInfo.jsx";

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
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/complaints" element={<MyComplaints />} />
            <Route path="/student/fees" element={<MyFees />} />
          </Route>
        </Route>

        {/* Warden pages: only the warden */}
        <Route element={<ProtectedRoute role="warden" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/warden" element={<WardenDashboard />} />
            <Route path="/warden/rooms" element={<RoomGrid />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/warden/fees" element={<ManageFees />} />
            <Route path="/warden/complaints" element={<ManageComplaints />} />
            <Route path="/warden/notices" element={<ManageNotices />} />
            <Route path="/warden/pricing" element={<ManagePricing />} />
            <Route path="/warden/menu" element={<ManageMenu />} />
            <Route path="/warden/info" element={<ManageInfo />} />
          </Route>
        </Route>

        {/* Anything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
