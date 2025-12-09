import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const float = keyframes`
  0% { transform: translateY(0px) rotateX(0deg); }
  50% { transform: translateY(-20px) rotateX(10deg); }
  100% { transform: translateY(0px) rotateX(0deg); }
`;

const rgbShift = keyframes`
  0% { text-shadow: 4px 4px 0px #ff0000, -4px -4px 0px #0000ff; }
  25% { text-shadow: -4px 4px 0px #00ff00, 4px -4px 0px #ff00ff; }
  50% { text-shadow: -4px -4px 0px #ff0000, 4px 4px 0px #0000ff; }
  75% { text-shadow: 4px -4px 0px #00ff00, -4px 4px 0px #ff00ff; }
  100% { text-shadow: 4px 4px 0px #ff0000, -4px -4px 0px #0000ff; }
`;

const zoomInOut = keyframes`
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

export default function ThreeDLogo() {
    return (
        <Box
            sx={{
                perspective: '1000px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                animation: `${zoomInOut} 1.5s ease-out forwards` // Initial "Grow" animation
            }}
        >
            <Box
                sx={{
                    animation: `${float} 3s ease-in-out infinite`, // Continuous 3D float
                    transformStyle: 'preserve-3d',
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: '6rem',
                        fontWeight: '900',
                        color: 'white',
                        animation: `${rgbShift} 2s infinite`, // RGB Color split effect
                        letterSpacing: '5px',
                        fontFamily: '"Roboto", sans-serif',
                        lineHeight: 1
                    }}
                >
                    FD
                </Typography>
            </Box>

            <Typography
                variant="h4"
                sx={{
                    mt: 2,
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #FF0000, #00FF00, #0000FF)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: `${zoomInOut} 1.5s ease-out 0.5s backwards` // Staggered entry
                }}
            >
                FinDriver Pro
            </Typography>
        </Box>
    );
}
