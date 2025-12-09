import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, Commute, MapTwoTone } from '@mui/icons-material';

export default function NotFoundScreen() {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh',
                    textAlign: 'center',
                    gap: 3
                }}
            >
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <MapTwoTone sx={{ fontSize: 120, color: 'text.secondary', opacity: 0.3 }} />
                    <Commute
                        sx={{
                            fontSize: 60,
                            color: 'primary.main',
                            position: 'absolute',
                            bottom: 10,
                            right: -10,
                            transform: 'rotate(-10deg)'
                        }}
                    />
                </Box>

                <Typography variant="h1" fontWeight="900" sx={{
                    background: 'linear-gradient(45deg, #2962FF, #00E5FF)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    404
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
                    ¡Te saliste de la ruta!
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, fontSize: '1.1rem' }}>
                    Parece que el GPS falló. La ubicación que buscas no existe en nuestro mapa.
                    Regresa a la base para recargar combustible.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Home />}
                    onClick={() => navigate('/dashboard')}
                    sx={{
                        borderRadius: 50,
                        px: 5,
                        py: 1.5,
                        mt: 2,
                        boxShadow: '0 4px 14px 0 rgba(41, 98, 255, 0.39)'
                    }}
                >
                    Volver al Dashboard
                </Button>
            </Box>
        </Container>
    );
}
