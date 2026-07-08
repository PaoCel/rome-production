import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import TasksPage from '../pages/TasksPage';
import BudgetPage from '../pages/BudgetPage';
import LocationsPage from '../pages/LocationsPage';
import CastingPage from '../pages/CastingPage';
import ProductionOptionsPage from '../pages/ProductionOptionsPage';
import ContactsPage from '../pages/ContactsPage';
import RisksDecisionsPage from '../pages/RisksDecisionsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/casting" element={<CastingPage />} />
              <Route path="/production" element={<ProductionOptionsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/risks" element={<RisksDecisionsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
