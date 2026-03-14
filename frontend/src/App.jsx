import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Evaluate from './pages/Evaluate';
import EvaluationHistory from './pages/EvaluationHistory';
import Rules from './pages/Rules';
import Templates from './pages/Templates';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
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
