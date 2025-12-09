import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, SentimentVeryDissatisfied } from '@mui/icons-material';

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
                <SentimentVeryDissatisfied sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.5 }} />

                <Typography variant="h1" fontWeight="bold" color="primary">
                    404
                </Typography>

                <Typography variant="h5" component="h2" gutterBottom>
                    ¡Ups! Página no encontrada
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
                    La ruta que buscas no existe o ha sido movida. Parece que te has desviado del camino.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/dashboard')}
                    sx={{ borderRadius: 50, px: 4, py: 1.5 }}
                >
                    Volver al Inicio
                </Button>
            </Box>
        </Container>
    );
}
