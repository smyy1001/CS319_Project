import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Pages/Home/Home';
import LoginPage from './Pages/Login/LoginPage';
import RegisterPage from './Pages/Register/RegisterPage';
import SchoolRegister from './Pages/Register/SchoolRegister/SchoolRegister';
import GuideRegister from './Pages/Register/GuideRegister/GuideRegister';
import AboutUs from './Pages/AboutUs/AboutUs';
import Tours from './Pages/Tours/Tours';
import { AuthProvider } from './AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import AppBarComponent from './Components/AppBarComponent/AppBarComponent';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // from the localstorage get 'role'
  const role = localStorage.getItem('role');
  // if 'role' is 'admin' then redirect to '/tours'

  return (
    <AuthProvider>
      <Router>
        <AppBarComponent />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/school" element={<SchoolRegister />} />
          <Route path="/register/guide" element={<GuideRegister />} />
          <Route path="/us" element={<AboutUs />} />
          <Route path="/home" element={<ProtectedRoute><Home role={role} /></ProtectedRoute>} />
          <Route path="/tours" element={<ProtectedRoute><Tours role={role} /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
