import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Avatar,
    Fab,
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCalculations } from '../hooks/useCalculations';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

import { formatCurrency } from '../utils/formatters';

export default function DashboardScreen() {
    const { user, logout } = useAuth();
    const {
        ingresosHoy,
        gastosHoy,
        gananciaNetaHoy,
        viajesHoy,
        promedioViaje
    } = useCalculations();

    const navigate = useNavigate();
    const theme = useTheme();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}> {/* Added mb: 10 for bottom tabs/fabs space */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Dashboard
                </Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                    Cerrar Sesión
                </Button>
            </Box>

            {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                    <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                        {user.email?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            {user.displayName || 'Conductor'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Ingresos Hoy
                            </Typography>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {formatCurrency(ingresosHoy)}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" endIcon={<ArrowIcon />} component={RouterLink} to="/historial">Ver detalles</Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Gastos Hoy
                            </Typography>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                {formatCurrency(gastosHoy)}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" endIcon={<ArrowIcon />} component={RouterLink} to="/historial">Ver detalles</Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Ganancia Neta
                            </Typography>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {formatCurrency(gananciaNetaHoy)}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" endIcon={<ArrowIcon />} component={RouterLink} to="/estadisticas">Ver estadísticas</Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Viajes Hoy
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {viajesHoy}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Promedio: {formatCurrency(promedioViaje)}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" endIcon={<ArrowIcon />} component={RouterLink} to="/historial">Ver historial</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                    Bienvenido a Finanzas Conductor
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                    Gestiona tus ingresos y gastos de forma sencilla. Usa los botones flotantes para registrar actividad rápida.
                </Typography>
            </Box>

            {/* Floating Action Buttons */}
            <Box sx={{ position: 'fixed', bottom: 80, right: 20, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1000 }}>
                <Fab
                    color="error"
                    component={RouterLink}
                    to="/gastos"
                    aria-label="add expense"
                    size="medium"
                >
                    <RemoveIcon />
                </Fab>
                <Fab
                    color="success"
                    component={RouterLink}
                    to="/ingresos"
                    aria-label="add income"
                    size="large"
                >
                    <AddIcon />
                </Fab>
            </Box>
        </Container>
    );
}
