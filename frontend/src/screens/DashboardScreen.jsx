import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Fab,
    useTheme,
    IconButton,
    Paper
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Logout as LogoutIcon,
    AccountBalanceWallet as WalletIcon,
    TrendingDown as TrendingDownIcon,
    TrendingUp as TrendingUpIcon,
    DirectionsCar as CarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAdvancedCalculations } from '../hooks/useAdvancedCalculations';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { gradients, cardStyles, shadows, cardThemes } from '../utils/themeUtils';
import MaintenanceAlerts from '../components/MaintenanceAlerts';
import StatCard from '../components/StatCard';
import OnboardingModal from '../components/OnboardingModal';
import RecentTransactions from '../components/RecentTransactions';
import GoalTracker from '../components/GoalTracker';
import { formatMoney } from '../utils/formatters';

export default function DashboardScreen() {
    const { user, logout } = useAuth();
    const {
        totalIngresosHoy,
        totalCostosHoy,
        gananciaNetaHoy,
        cpkReal,
        cpkGlobal, // New
        gananciaGlobal, // New
        ingresoPorKm,
        viajesHoy,
        kmHoy, // New 
        dailyFixedCost
    } = useAdvancedCalculations();

    const navigate = useNavigate();
    const theme = useTheme();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            position: 'relative',
            zIndex: 0
        }}>
            {/* Background Image & Overlay */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(/background_pro.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                zIndex: -2,
            }} />
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(248, 249, 250, 0.85)', // Light overlay for readability
                backdropFilter: 'blur(5px)',
                zIndex: -1,
            }} />

            <Container maxWidth="lg" sx={{ mt: 2, mb: 12, position: 'relative', zIndex: 1 }}>
                {/* Header section with Welcome and Logout */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 50,
                                height: 50,
                                mr: 2,
                                background: gradients.primary,
                                boxShadow: shadows.fab,
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/perfil')}
                        >
                            {user?.email?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Bienvenido de vuelta,
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">
                                {(user?.nombre && user.nombre !== 'Usuario Mock')
                                    ? user.nombre
                                    : (user?.displayName || 'Conductor')}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleLogout} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
                        <LogoutIcon color="action" />
                    </IconButton>
                </Box>

                {/* Onboarding Wizard */}
                <OnboardingModal />

                {/* Motivational Goal Tracker */}
                <GoalTracker />

                {/* KPI Cards Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Maintenance Alert Section - Takes half width on large screens */}
                    <Grid item xs={12} md={6}>
                        <MaintenanceAlerts />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RecentTransactions />
                    </Grid>

                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Ingresos Hoy"
                            value={formatMoney(totalIngresosHoy)}
                            icon={<WalletIcon />}
                            theme={cardThemes.secondary}
                            to="/ingresos"
                            subtitle={`${viajesHoy} viajes • ${kmHoy} km`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Gastos Hoy"
                            value={formatMoney(totalCostosHoy)}
                            icon={<TrendingDownIcon />}
                            theme={cardThemes.error}
                            to="/gastos"
                            subtitle={`Incluye $${formatMoney(dailyFixedCost)} fijos`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Ganancia Real"
                            value={formatMoney(gananciaNetaHoy)}
                            icon={<TrendingUpIcon />}
                            theme={cardThemes.primary}
                            to="/estadisticas"
                            subtitle={gananciaNetaHoy > 0 ? "Rentable" : "Pérdida"}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="CPK (Promedio)"
                            value={formatMoney(cpkReal > 0 ? cpkReal : cpkGlobal)}
                            icon={<CarIcon />}
                            theme={cardThemes.info} // Blue/Indigo theme
                            to="/estadisticas"
                            subtitle={`Ingreso: ${formatMoney(ingresoPorKm)}/km`}
                        />
                    </Grid>
                </Grid>

                {/* Floating Action Buttons */}
                <Box sx={{ position: 'fixed', bottom: 90, right: 24, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000, alignItems: 'flex-end' }}>
                    <Fab
                        variant="extended"
                        sx={{ bgcolor: '#fff', color: '#e74c3c', '&:hover': { bgcolor: '#ffebee' } }}
                        component={RouterLink}
                        to="/gastos"
                        aria-label="add expense"
                        size="medium"
                    >
                        <RemoveIcon sx={{ mr: 1 }} />
                        Gasto
                    </Fab>
                    <Fab
                        variant="extended"
                        color="primary"
                        component={RouterLink}
                        to="/ingresos"
                        aria-label="add income"
                        size="large"
                        sx={{ boxShadow: shadows.fab, background: gradients.secondary }}
                    >
                        <AddIcon sx={{ mr: 1 }} />
                        Ingreso
                    </Fab>
                </Box>
            </Container>
        </Box>
    );
}
