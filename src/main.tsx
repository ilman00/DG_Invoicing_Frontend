import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import { AppRouter } from './router';
import { queryClient } from './lib/query-client';
import './index.css';
import { injectInvoicePrintStyles } from './utils/invoicePrintStyle';
injectInvoicePrintStyles();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
