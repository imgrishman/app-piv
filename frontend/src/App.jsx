import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function AppRoutes({ isAuthenticated, handleLogin, handleLogout }) {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? 
            <Dashboard onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  // Sync auth state with local storage
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated !== storedAuth) {
      localStorage.setItem('isAuthenticated', isAuthenticated ? 'true' : 'false');
    }
  }, [isAuthenticated]);

  const handleLogin = (username, password) => {
    if ((username === 'admin' && password === 'admin') || (username === 'user' && password === 'user')) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
