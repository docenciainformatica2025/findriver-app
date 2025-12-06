import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" color="error" gutterBottom>
                        ⚠️ Algo salió mal.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {this.state.error && this.state.error.toString()}
                    </Typography>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left', overflow: 'auto' }}>
                        <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </Box>
                    <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        onClick={() => window.location.reload()}
                    >
                        Recargar Página
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
