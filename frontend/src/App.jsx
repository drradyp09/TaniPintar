import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IoTMonitoring from './pages/IoTMonitoring';
import DiseaseDetection from './pages/DiseaseDetection';
import WaterFertilizer from './pages/WaterFertilizer';
import IrrigationPlanner from './pages/IrrigationPlanner';
import FertilizerPlanner from './pages/FertilizerPlanner';

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

  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/iot-monitoring"
          element={
            <ProtectedRoute>
              <IoTMonitoring />
            </ProtectedRoute>
          }
        />

        <Route
          path="/disease-detection"
          element={
            <ProtectedRoute>
              <DiseaseDetection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/water-fertilizer"
          element={
            <ProtectedRoute>
              <WaterFertilizer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/irrigation"
          element={
            <ProtectedRoute>
              <IrrigationPlanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fertilizer"
          element={
            <ProtectedRoute>
              <FertilizerPlanner />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
