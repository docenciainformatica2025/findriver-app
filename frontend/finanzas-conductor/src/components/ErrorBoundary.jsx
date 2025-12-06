import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '100vh',
                        bgcolor: '#f8f9fa',
                        p: 3
                    }}
                >
                    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="h4" color="error" gutterBottom fontWeight="bold">
                            ¡Ups! Algo salió mal.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Ha ocurrido un error inesperado en la aplicación.
                        </Typography>

                        {this.state.error && (
                            <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#fff0f0', borderRadius: 1, textAlign: 'left', overflow: 'auto', maxHeight: 200 }}>
                                <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace', color: '#d32f2f' }}>
                                    {this.state.error.toString()}
                                </Typography>
                            </Box>
                        )}

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={this.handleReset}
                            size="large"
                        >
                            Volver al Dashboard
                        </Button>
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
