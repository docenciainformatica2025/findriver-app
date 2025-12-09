import React, { useState } from 'react';
import { keyframes } from '@mui/system';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Link,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import ThreeDLogo from '../components/ThreeDLogo';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn(email, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error inesperado. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const slideInLeft = keyframes`
      from { transform: translateX(-50px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    `;

    const fadeIn = keyframes`
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    `;

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: `${fadeIn} 0.8s ease-out`,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Background Overlay for Login Page */}
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(/background_pro.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: -1,
                        opacity: 1, // Full opacity for the image logic
                        filter: 'brightness(0.6)' // Darken it specifically here
                    }}
                />

                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight transparency for glass effect
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ transform: 'scale(0.5)', mb: -2, mt: -4 }}>
                            <ThreeDLogo />
                        </Box>
                    </Box>
                    <Typography variant="body1" color="text.secondary" align="center" mb={3}>
                        Inicia sesión en tu cuenta
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo electrónico"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            InputLabelProps={{ shrink: true }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            InputLabelProps={{ shrink: true }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Link component={RouterLink} to="/register" variant="body2">
                            ¿No tienes cuenta? Regístrate
                        </Link>
                    </Box>
                </Paper>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, mb: 2, fontSize: '0.75rem', opacity: 0.8, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    Versión 1.3.0 - STABLE (Datos Guardados & Stats OK) © 2025 Ing. Antonio Rodríguez. Todos los derechos reservados.
                </Typography>
            </Box>
        </Container>
    );
}
