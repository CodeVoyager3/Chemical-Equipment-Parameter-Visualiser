import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authHeader, setAuthHeader] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check for saved auth
    const savedAuth = localStorage.getItem('authHeader');
    if (savedAuth) {
      setAuthHeader(savedAuth);
      setIsAuthenticated(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLoginSuccess = (auth) => {
    setAuthHeader(auth);
    setIsAuthenticated(true);
    localStorage.setItem('authHeader', auth);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthHeader('');
    localStorage.removeItem('authHeader');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Signup />
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Dashboard
                authHeader={authHeader}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            </ProtectedRoute>
          }
        />
        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;