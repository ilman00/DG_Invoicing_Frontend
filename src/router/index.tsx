// AppRouter.tsx

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/shared/AppLayout';
import { ProtectedRoute } from './ProtectedRoute'; // ← import
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
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
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,          // ← guards all children
    children: [
      {
        element: <AppLayout />,
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
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;