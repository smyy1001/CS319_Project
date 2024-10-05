import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import React from "react";
import "./App.css";
import Home from "./Pages/Home/Home";
import LoginPage from "./Pages/Login/LoginPage";
import "./index.css";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const AppContent = () => {
  return (
    <>
      <Routes>
        <Route path="/home" element={ <Home /> } />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default App;