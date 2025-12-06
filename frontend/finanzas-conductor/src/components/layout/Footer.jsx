import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';

const Footer = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            className="app-footer"
            sx={{
                marginTop: 'auto',
                width: '100%',
                // Styles from .app-copyright
                mt: '40px',
                py: isMobile ? '16px' : '20px',
                px: isMobile ? '12px' : 0,
                borderTop: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb',
                textAlign: 'center',
                color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
                fontSize: isMobile ? '0.8125rem' : '0.875rem',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                lineHeight: 1.5,
                position: 'relative',
                zIndex: 10
            }}
        >
            <div className="app-copyright">
                <Typography
                    component="p"
                    className="copyright-text"
                    sx={{
                        margin: 0,
                        padding: 0,
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                        color: 'inherit'
                    }}
                >
                    Desarrollado por{' '}
                    <Box
                        component="strong"
                        className="developer-name"
                        sx={{
                            color: theme.palette.mode === 'dark' ? '#e5e7eb' : '#374151',
                            fontWeight: 600
                        }}
                    >
                        Ing. Antonio Rodríguez
                    </Box>
                    <Box
                        component="span"
                        className="separator"
                        aria-hidden="true"
                        sx={{
                            margin: isMobile ? '0 6px' : '0 8px',
                            color: theme.palette.mode === 'dark' ? '#4b5563' : '#d1d5db'
                        }}
                    >
                        •
                    </Box>
                    <Box
                        component="span"
                        className="copyright-symbol"
                        aria-hidden="true"
                        sx={{ marginRight: '4px' }}
                    >
                        ©
                    </Box>
                    <time id="current-year" dateTime={currentYear.toString()}>
                        {currentYear}
                    </time>
                </Typography>
            </div>
        </Box>
    );
};

export default Footer;
