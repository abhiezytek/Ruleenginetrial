import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Evaluate from './pages/Evaluate';
import EvaluationHistory from './pages/EvaluationHistory';
import Rules from './pages/Rules';
import Templates from './pages/Templates';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('accurule_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (u) => setUser(u);

  const handleLogout = () => {
    localStorage.removeItem('accurule_token');
    localStorage.removeItem('accurule_user');
    setUser(null);
  };

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
      />

      {/* Protected */}
      <Route
        element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Dashboard />} />
        <Route path="evaluate" element={<Evaluate />} />
        <Route path="history" element={<EvaluationHistory />} />
        <Route path="rules" element={<Rules />} />
        <Route path="templates" element={<Templates />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
