import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'

// Layout
import MainLayout from './components/layout/MainLayout'
import ErrorBoundary from './components/ErrorBoundary'

// Páginas de Autenticación
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Pantallas Principales
// import DashboardScreen from './screens/DashboardScreen'
// import AddIncomeScreen from './screens/AddIncomeScreen'
// import AddExpenseScreen from './screens/AddExpenseScreen'
// import HistoryScreen from './screens/HistoryScreen'
// import StatsScreen from './screens/StatsScreen'

// Nuevos Módulos
// import NewTripScreen from './screens/trips/NewTripScreen'
// import TripsHistoryScreen from './screens/trips/TripsHistoryScreen'
// import AdminDashboardScreen from './screens/admin/AdminDashboardScreen'
// import VehicleSettingsScreen from './screens/admin/VehicleSettingsScreen'
// import AdminGoalsScreen from './screens/admin/AdminGoalsScreen'
// import ProfileScreen from './screens/admin/ProfileScreen'
// import FixedCostsForm from './components/FixedCostsForm'

// Contextos
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FinanceProvider } from './contexts/FinanceContext'

// Tema MUI personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#21618c',
    },
    secondary: {
      main: '#2ecc71',
      light: '#58d68d',
      dark: '#1e8449',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
})

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute state:', { user: user ? user.email : 'null', loading });

  if (loading) return null; // O un spinner

  if (!user) {
    console.warn('ProtectedRoute: Access denied, redirecting to login');
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <AuthProvider>
          {/* Debug: AuthProvider mounted */}
          <FinanceProvider>
            <ErrorBoundary>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Rutas Protegidas con Layout Principal */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  {/* <Route path="/dashboard" element={<DashboardScreen />} /> */}

                  {/* Accesos rápidos (Legacy/Mobile) */}
                  {/* <Route path="/ingresos" element={<AddIncomeScreen />} /> */}
                  {/* <Route path="/gastos" element={<AddExpenseScreen />} /> */}
                  {/* <Route path="/historial" element={<HistoryScreen />} /> */}
                  {/* <Route path="/estadisticas" element={<StatsScreen />} /> */}

                  {/* Módulo de Viajes */}
                  {/* <Route path="/trips/new" element={<NewTripScreen />} /> */}
                  {/* <Route path="/trips/history" element={<TripsHistoryScreen />} /> */}

                  {/* Módulo Administrativo */}
                  {/* <Route path="/admin" element={<AdminDashboardScreen />} /> */}
                  {/* <Route path="/admin/vehicle" element={<VehicleSettingsScreen />} /> */}
                  {/* <Route path="/admin/goals" element={<AdminGoalsScreen />} /> */}
                  {/* <Route path="/profile" element={<ProfileScreen />} /> */}
                  {/* <Route path="/admin/fixed-costs" element={
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                      <FixedCostsForm />
                    </div>
                  } /> */}

                  {/* Redirección raíz */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </ErrorBoundary>
          </FinanceProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
