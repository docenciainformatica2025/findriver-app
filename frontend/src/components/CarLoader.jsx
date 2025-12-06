import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const driveAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
`;

const CarLoader = () => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            bgcolor: '#121212', // Force dark background (or 'rgba(18, 18, 18, 0.9)') to ensure visibility
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 9999
        }}>
            <Box sx={{ position: 'relative', width: 150, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Track */}
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px dashed rgba(41, 98, 255, 0.2)',
                }} />

                {/* Central Pulse */}
                <Box sx={{
                    position: 'absolute',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'secondary.main',
                    opacity: 0.2,
                    animation: `${pulseAnimation} 2s infinite ease-in-out`,
                    filter: 'blur(10px)'
                }} />

                {/* Driving Car Container */}
                <Box sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    // Use a simpler rotation animation for the container
                    animation: `${driveAnimation} 1.5s linear infinite`
                }}>
                    {/* The Car Icon */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translate(-50%, -50%)', // Centered on the line
                        width: 40,
                        height: 20,
                        bgcolor: 'primary.main',
                        borderRadius: '4px',
                        boxShadow: '0 0 10px #2962FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: -2,
                            width: 2,
                            height: 10,
                            bgcolor: '#FFD600',
                            boxShadow: '0 0 5px #FFD600'
                        }
                    }}>
                        {/* Windows */}
                        <Box sx={{ width: '40%', height: '80%', bgcolor: '#fff', opacity: 0.8, borderRadius: 1 }} />
                    </Box>
                </Box>
            </Box>

            <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold', color: 'primary.main', letterSpacing: 1 }}>
                FINDRIVER
            </Typography>
            <Typography variant="caption" color="text.secondary">
                Cargando tu oficina móvil...
            </Typography>
        </Box>
    );
};

export default CarLoader;
