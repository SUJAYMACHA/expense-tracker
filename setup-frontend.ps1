# Frontend Setup Script

Write-Host "`nSetting up Frontend..." -ForegroundColor Cyan

cd c:\Users\admin\OneDrive\Desktop\expense-tracker-frontend

# Update index.css
@"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
  }
}
"@ | Out-File -FilePath "src\index.css" -Encoding UTF8

# Update main.tsx
@"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
"@ | Out-File -FilePath "src\main.tsx" -Encoding UTF8

# Update App.tsx
@"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position='top-right' richColors />
          <Routes>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/expenses'
              element={
                <ProtectedRoute>
                  <ExpensesPage />
                </ProtectedRoute>
              }
            />
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
"@ | Out-File -FilePath "src\App.tsx" -Encoding UTF8

Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "`nStarting dev server..." -ForegroundColor Yellow
npm run dev
