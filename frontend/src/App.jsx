import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IoTMonitoring from './pages/IoTMonitoring';
import DiseaseDetection from './pages/DiseaseDetection';
import WaterFertilizer from './pages/WaterFertilizer';
import IrrigationPlanner from './pages/IrrigationPlanner';
import FertilizerPlanner from './pages/FertilizerPlanner';
import PriceManagement from './pages/PriceManagement';

function App() {
  // Simple auth check
  const isAuthenticated = () => {
    return !!localStorage.getItem('user');
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AdminRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!isAuthenticated() || user.role !== 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated pages share AppLayout, which renders the global bottom nav. */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/iot-monitoring" element={<IoTMonitoring />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/water-fertilizer" element={<WaterFertilizer />} />
          <Route path="/irrigation" element={<IrrigationPlanner />} />
          <Route path="/fertilizer" element={<FertilizerPlanner />} />
          <Route
            path="/admin/prices"
            element={
              <AdminRoute>
                <PriceManagement />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
