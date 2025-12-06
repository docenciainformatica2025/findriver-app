import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';
import { cardThemes } from '../utils/themeUtils';

export default function StatCard({ title, value, subtitle, icon, theme, to }) {
    // Default to primary if no theme provided
    const cardTheme = theme || {
        main: '#ffffff',
        gradient: 'none',
        shadow: '0 4px 6px rgba(0,0,0,0.1)',
        text: '#000000'
    };

    const isLight = cardTheme.main === '#ffffff';
    const textColor = isLight ? '#1e293b' : '#ffffff';
    const subTextColor = isLight ? '#64748b' : 'rgba(255,255,255,0.9)';

    return (
        <Card
            component={RouterLink}
            to={to}
            sx={{
                height: '100%',
                position: 'relative',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                backgroundColor: cardTheme.main,
                backgroundImage: cardTheme.gradient,
                boxShadow: cardTheme.shadow,
                color: textColor,
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 20px 40px -5px rgba(0, 0, 0, 0.3), ${cardTheme.shadow}`,
                }
            }}
            style={{ textDecoration: 'none' }}
        >
            {/* Background Icon Decoration */}
            <Box sx={{
                position: 'absolute',
                right: -20,
                bottom: -20,
                opacity: 0.1,
                transform: 'rotate(-15deg)',
                color: textColor
            }}>
                {React.cloneElement(icon, { sx: { fontSize: 140 } })}
            </Box>

            <CardContent sx={{ position: 'relative', zIndex: 1, width: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {React.cloneElement(icon, { sx: { fontSize: 24, color: textColor, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' } })}
                    </Box>
                    <ArrowIcon sx={{ opacity: 0.7, color: textColor }} />
                </Box>

                <Typography variant="overline" sx={{ color: subTextColor, fontWeight: 700, letterSpacing: '1px', opacity: 0.9 }}>
                    {title}
                </Typography>

                <Typography variant="h3" fontWeight="800" sx={{ my: 1, color: textColor, letterSpacing: '-1px' }}>
                    {value}
                </Typography>

                {subtitle && (
                    <Box sx={{ display: 'inline-block', mt: 1 }}>
                        <Typography variant="caption" sx={{
                            color: textColor,
                            bgcolor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.15)',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '12px',
                            fontWeight: 600
                        }}>
                            {subtitle}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
