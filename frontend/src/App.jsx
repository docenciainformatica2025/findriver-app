import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddIncomeScreen from './screens/AddIncomeScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import HistoryScreen from './screens/HistoryScreen';
import StatsScreen from './screens/StatsScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { FinanceProvider } from './contexts/FinanceContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import SplashScreen from './components/SplashScreen';
import { CustomThemeProvider } from './contexts/ThemeContext';

// Logic to show Splash Screen while loading auth
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LoginScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/registro" element={<RegisterScreen />} />

      {/* Rutas Privadas (Inside Layout) */}
      <Route path="/dashboard" element={<Layout><DashboardScreen /></Layout>} />
      <Route path="/ingresos" element={<Layout><AddIncomeScreen /></Layout>} />
      <Route path="/gastos" element={<Layout><AddExpenseScreen /></Layout>} />
      <Route path="/historial" element={<Layout><HistoryScreen /></Layout>} />
      <Route path="/estadisticas" element={<Layout><StatsScreen /></Layout>} />
      <Route path="/perfil" element={<Layout><ProfileScreen /></Layout>} />

      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <FinanceProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#2ecc71',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#e74c3c',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <AppContent />
            </FinanceProvider>
          </AuthProvider>
        </Router>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
