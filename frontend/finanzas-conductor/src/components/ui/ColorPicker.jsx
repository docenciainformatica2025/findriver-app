import React, { useState, useEffect } from 'react';
import {
    Box,
    Slider,
    Typography,
    Grid,
    Paper,
    IconButton,
    Popover,
    Button,
} from '@mui/material';
import {
    Palette,
    Refresh,
    ContentCopy,
    CheckCircle,
} from '@mui/icons-material';
import { dynamicColors } from '../theme/colors';

const ColorPicker = ({ onColorChange, initialColor }) => {
    const [color, setColor] = useState(initialColor || dynamicColors.getCategoryColor('primary'));
    const [hue, setHue] = useState(204);
    const [saturation, setSaturation] = useState(70);
    const [lightness, setLightness] = useState(50);
    const [copied, setCopied] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (color.startsWith('hsl')) {
            const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%/);
            if (match) {
                setHue(parseInt(match[1]));
                setSaturation(parseInt(match[2]));
                setLightness(parseInt(match[3]));
            }
        }
    }, [color]);

    const handleHueChange = (event, newValue) => {
        setHue(newValue);
        const newColor = `hsl(${newValue}, ${saturation}%, ${lightness}%)`;
        setColor(newColor);
        onColorChange?.(newColor);
    };

    const handleSaturationChange = (event, newValue) => {
        setSaturation(newValue);
        const newColor = `hsl(${hue}, ${newValue}%, ${lightness}%)`;
        setColor(newColor);
        onColorChange?.(newColor);
    };

    const handleLightnessChange = (event, newValue) => {
        setLightness(newValue);
        const newColor = `hsl(${hue}, ${saturation}%, ${newValue}%)`;
        setColor(newColor);
        onColorChange?.(newColor);
    };

    const handleRandomColor = () => {
        const randomHue = Math.floor(Math.random() * 360);
        const randomSaturation = 40 + Math.floor(Math.random() * 40);
        const randomLightness = 30 + Math.floor(Math.random() * 40);

        const newColor = `hsl(${randomHue}, ${randomSaturation}%, ${randomLightness}%)`;
        setColor(newColor);
        setHue(randomHue);
        setSaturation(randomSaturation);
        setLightness(randomLightness);
        onColorChange?.(newColor);
    };

    const handleCopyColor = async () => {
        try {
            await navigator.clipboard.writeText(color);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error copying color:', err);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    // Colores predefinidos
    const predefinedColors = [
        dynamicColors.getCategoryColor('ingresos'),
        dynamicColors.getCategoryColor('gastos'),
        dynamicColors.getCategoryColor('ganancias'),
        dynamicColors.getCategoryColor('viajes'),
        dynamicColors.gradients.primary().match(/rgb\([^)]+\)/g)?.[0] || 'rgb(52, 152, 219)',
        dynamicColors.gradients.success().match(/rgb\([^)]+\)/g)?.[0] || 'rgb(46, 204, 113)',
        dynamicColors.gradients.danger().match(/rgb\([^)]+\)/g)?.[0] || 'rgb(231, 76, 60)',
    ];

    return (
        <Box>
            <IconButton onClick={handleClick} sx={{ color }}>
                <Palette />
            </IconButton>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Paper sx={{ p: 3, width: 320 }}>
                    <Typography variant="h6" gutterBottom>
                        Selector de Color Dinámico
                    </Typography>

                    {/* Color actual */}
                    <Box
                        sx={{
                            height: 80,
                            background: color,
                            borderRadius: 2,
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: lightness > 50 ? '#000' : '#fff',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            position: 'relative',
                        }}
                    >
                        {color}
                        <IconButton
                            size="small"
                            onClick={handleCopyColor}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'inherit',
                            }}
                        >
                            {copied ? <CheckCircle /> : <ContentCopy />}
                        </IconButton>
                    </Box>

                    {/* Controles HSL */}
                    <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>
                            Hue: {hue}°
                        </Typography>
                        <Slider
                            value={hue}
                            onChange={handleHueChange}
                            min={0}
                            max={360}
                            sx={{
                                color: `hsl(${hue}, 100%, 50%)`,
                            }}
                        />

                        <Typography gutterBottom sx={{ mt: 2 }}>
                            Saturación: {saturation}%
                        </Typography>
                        <Slider
                            value={saturation}
                            onChange={handleSaturationChange}
                            min={0}
                            max={100}
                            sx={{
                                color: `hsl(${hue}, ${saturation}%, 50%)`,
                            }}
                        />

                        <Typography gutterBottom sx={{ mt: 2 }}>
                            Brillo: {lightness}%
                        </Typography>
                        <Slider
                            value={lightness}
                            onChange={handleLightnessChange}
                            min={0}
                            max={100}
                            sx={{
                                color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                            }}
                        />
                    </Box>

                    {/* Colores predefinidos */}
                    <Typography variant="subtitle2" gutterBottom>
                        Colores Predefinidos
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        {predefinedColors.map((preColor, index) => (
                            <Grid item xs={3} key={index}>
                                <Box
                                    sx={{
                                        height: 40,
                                        background: preColor,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        border: color === preColor ? '3px solid white' : 'none',
                                        boxShadow: color === preColor ? '0 0 0 2px #1976d2' : 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                        },
                                    }}
                                    onClick={() => {
                                        setColor(preColor);
                                        onColorChange?.(preColor);
                                    }}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={handleRandomColor}
                            fullWidth
                        >
                            Aleatorio
                        </Button>
                    </Box>
                </Paper>
            </Popover>
        </Box>
    );
};

export default ColorPicker;
