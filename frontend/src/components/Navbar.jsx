import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e5e7eb', color: '#1f2937' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.025em', background: 'linear-gradient(to right, #2563EB, #1D4ED8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    FinDriver
                </Typography>
                {user && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="inherit" onClick={() => navigate('/dashboard')} sx={{ fontWeight: 600 }}>
                            Dashboard
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/estadisticas')} sx={{ fontWeight: 600 }}>
                            Estadísticas
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/historial')} sx={{ fontWeight: 600 }}>
                            Historial
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/perfil')} sx={{ fontWeight: 600 }}>
                            Perfil
                        </Button>
                        <Button color="inherit" onClick={handleLogout} sx={{ fontWeight: 600, color: '#DC2626' }}>
                            Salir
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
