import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/shared/AppLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { Dashboard } from '../features/dashboard/pages/DashboardPage';
import { CustomersPage } from '../features/customers/pages/CustomersPage';
import { ItemsPage } from '../features/items/pages/ItemsPage';
import { InvoicesPage } from '../features/invoices/pages/InvoicesPage';
import { PaymentsPage } from '../features/payments/pages/PaymentPage';
import { SettingsPage } from '../features/settings/pages/SettingPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AppLayout />, // 🔥 directly use layout
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/customers', element: <CustomersPage /> },
      { path: '/items', element: <ItemsPage /> },
      { path: '/invoices', element: <InvoicesPage /> },
      { path: '/payments', element: <PaymentsPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;