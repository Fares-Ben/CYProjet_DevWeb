import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import VisitorHome from './pages/VisitorHome/VisitorHome';
import RegisterPage from './pages/Register/RegisterPage'
import LoginPage from './pages/Login/LoginPage'
import AdminDashboard from './pages/Admin/AdminDashboard'
import Profile from './pages/Profile/profile'
import ValidateAccountPage from './pages/Validation/ValidateAccountPage'


function App() {
  const [devices, setDevices] = useState([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<VisitorHome devices={devices} />} />
        {/* Routes temporaires - à compléter plus tard */}
        <Route path="/register" element={<RegisterPage devices={devices} />} />
        <Route path="/login" element={<LoginPage devices={devices} />} />
        <Route path="/validate-account/:token" element={<ValidateAccountPage />} />
        <Route path="/validate-account" element={<ValidateAccountPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;