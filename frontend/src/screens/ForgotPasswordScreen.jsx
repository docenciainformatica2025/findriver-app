import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
    Avatar
} from '@mui/material';
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Ingresa tu correo electrónico');
            return;
        }

        setLoading(true);
        setError('');
        const result = await resetPassword(email);
        setLoading(false);

        if (result.success) {
            setSent(true);
        } else {
            setError(result.error);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        width: '100%',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        Restablecer Contraseña
                    </Typography>

                    {sent ? (
                        <Box sx={{ textAlign: 'center', width: '100%' }}>
                            <Avatar
                                sx={{
                                    m: '0 auto',
                                    bgcolor: 'success.light',
                                    width: 60,
                                    height: 60,
                                    mb: 2
                                }}
                            >
                                <EmailIcon fontSize="large" />
                            </Avatar>
                            <Typography variant="body1" paragraph>
                                Se ha enviado un correo a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/login"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 2 }}
                            >
                                Volver al Login
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1, width: '100%' }}>
                            <Typography variant="body2" color="text.secondary" align="center" paragraph>
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Correo electrónico"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading || !email}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Enviar enlace'}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    variant="body2"
                                    sx={{ display: 'inline-flex', alignItems: 'center' }}
                                >
                                    <ArrowBackIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                                    Volver al inicio de sesión
                                </Link>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
}
