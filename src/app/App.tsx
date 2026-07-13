import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import SectionGuard from './SectionGuard';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/LoginPage';
import InvitePage from '../pages/InvitePage';
import DashboardPage from '../pages/DashboardPage';
import TasksPage from '../pages/TasksPage';
import BudgetPage from '../pages/BudgetPage';
import InvoicesPage from '../pages/InvoicesPage';
import LocationsPage from '../pages/LocationsPage';
import CastingPage from '../pages/CastingPage';
import CrewPage from '../pages/CrewPage';
import PropsPage from '../pages/PropsPage';
import ProductionOptionsPage from '../pages/ProductionOptionsPage';
import RisksDecisionsPage from '../pages/RisksDecisionsPage';
import SettingsPage from '../pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<SectionGuard section="dashboard"><DashboardPage /></SectionGuard>} />
              <Route path="/tasks" element={<SectionGuard section="tasks"><TasksPage /></SectionGuard>} />
              <Route path="/budget" element={<SectionGuard section="budget"><BudgetPage /></SectionGuard>} />
              <Route path="/invoices" element={<SectionGuard section="invoices"><InvoicesPage /></SectionGuard>} />
              <Route path="/locations" element={<SectionGuard section="locations"><LocationsPage /></SectionGuard>} />
              <Route path="/casting" element={<SectionGuard section="casting"><CastingPage /></SectionGuard>} />
              <Route path="/crew" element={<SectionGuard section="crew"><CrewPage /></SectionGuard>} />
              <Route path="/props" element={<SectionGuard section="props"><PropsPage /></SectionGuard>} />
              <Route path="/production" element={<SectionGuard section="production"><ProductionOptionsPage /></SectionGuard>} />
              <Route path="/risks" element={<SectionGuard section="risks"><RisksDecisionsPage /></SectionGuard>} />
              <Route path="/settings" element={<SectionGuard section="settings"><SettingsPage /></SectionGuard>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
