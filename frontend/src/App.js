import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import React from "react";
import "./App.css";
import Home from "./Pages/Home/Home";
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
        <Route
          path="/home"
          element={
            <Home />
          }
        />
      </Routes>
    </>
  );
};

export default App;