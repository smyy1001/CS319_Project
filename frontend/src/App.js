import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Pages/Home/Home';
import LoginPage from './Pages/Login/LoginPage';
import RegisterPage from './Pages/Register/RegisterPage';
import SchoolRegister from './Pages/Register/SchoolRegister/SchoolRegister';
import GuideRegister from './Pages/Register/GuideRegister/GuideRegister';
import { AuthProvider } from './AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import AppBarComponent from './Components/AppBarComponent/AppBarComponent';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppBarComponent />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/school" element={<SchoolRegister />} />
          <Route path="/register/guide" element={<GuideRegister />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          {/* More routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
