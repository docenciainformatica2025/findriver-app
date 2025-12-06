import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CardActionArea,
    Avatar
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    AttachMoney as MoneyIcon,
    Assessment as ReportIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardScreen() {
    console.log("AdminDashboardScreen: Mounting");
    const navigate = useNavigate();

    const menuItems = [
        {
            title: 'Configuración del Vehículo',
            description: 'Gestiona consumo, tipo de combustible y precios.',
            icon: <CarIcon fontSize="large" />,
            color: 'primary.main',
            path: '/admin/vehicle'
        },
        {
            title: 'Costos Fijos',
            description: 'Administra seguros, impuestos y otros gastos mensuales.',
            icon: <MoneyIcon fontSize="large" />,
            color: 'error.main',
            path: '/admin/fixed-costs'
        },
        {
            title: 'Metas de Ingreso',
            description: 'Establece objetivos diarios y mensuales.',
            icon: <ReportIcon fontSize="large" />,
            color: 'success.main',
            path: '/admin/goals' // Placeholder
        },
        {
            title: 'Configuración General',
            description: 'Preferencias de la aplicación y cuenta.',
            icon: <SettingsIcon fontSize="large" />,
            color: 'text.secondary',
            path: '/profile'
        }
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Panel Administrativo
            </Typography>

            <Grid container spacing={3}>
                {menuItems.map((item) => (
                    <Grid item xs={12} sm={6} key={item.title}>
                        <Card sx={{ height: '100%', borderRadius: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                            <CardActionArea
                                onClick={() => {
                                    console.log(`AdminDashboardScreen: Navigating to ${item.path}`);
                                    navigate(item.path);
                                }}
                                sx={{ height: '100%', p: 2 }}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                    <Avatar sx={{ bgcolor: `${item.color}20`, color: item.color, width: 64, height: 64, mb: 2 }}>
                                        {item.icon}
                                    </Avatar>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
