import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Pages/Home/Home';
import LoginPage from './Pages/Login/LoginPage';
import { AuthProvider } from './AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import AppBarComponent from './Components/AppBarComponent/AppBarComponent';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppBarComponent />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          {/* More routes here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
