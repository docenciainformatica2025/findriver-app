import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    IconButton,
    LinearProgress,
    Chip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    TrendingUp,
    TrendingDown,
    MoreVert,
    Refresh,
} from '@mui/icons-material';
import { dynamicColors } from '../../theme/colors';
import { useDynamicColors } from '../../hooks/useDynamicColors';
import { motion, AnimatePresence } from 'framer-motion';

const DynamicCard = ({
    title,
    value,
    change,
    category,
    icon: Icon,
    data = [],
    maxHeight = 200,
    interactive = true,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDark = theme.palette.mode === 'dark';
    const { generateHeatmapColor, getTimeBasedColor } = useDynamicColors();

    const [hovered, setHovered] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [currentColor, setCurrentColor] = useState(
        dynamicColors.getCategoryColor(category || title)
    );

    // Efecto para cambio dinámico de color basado en hora
    useEffect(() => {
        if (category === 'timeBased') {
            const interval = setInterval(() => {
                setCurrentColor(getTimeBasedColor());
            }, 60000); // Actualizar cada minuto

            return () => clearInterval(interval);
        }
    }, [category]);

    // Efecto para animación de pulso en cambios
    useEffect(() => {
        if (change !== undefined) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [change, value]);

    // Calcular color basado en valor
    const getValueColor = () => {
        if (!data.length) return currentColor;

        const values = data.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        return generateHeatmapColor(value, min, max);
    };

    // Color del cambio (positivo/negativo)
    const changeColor = change >= 0
        ? dynamicColors.semantic.income(Math.abs(change), 100)
        : dynamicColors.semantic.expense(Math.abs(change), 100);

    // Estilo del gradiente dinámico
    const gradientStyle = {
        background: dynamicColors.gradients.custom(
            dynamicColors.withOpacity(getValueColor(), 0.8),
            dynamicColors.withOpacity(currentColor, 0.4),
            hovered ? 145 : 135
        ),
        transition: 'all 0.5s ease',
    };

    // Animación de entrada
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        },
        hover: {
            y: -8,
            transition: { duration: 0.2 }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={interactive ? "hover" : ""}
            onHoverStart={() => interactive && setHovered(true)}
            onHoverEnd={() => interactive && setHovered(false)}
            style={{ height: '100%' }}
        >
            <Card
                sx={{
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    ...gradientStyle,
                    animation: pulse ? 'glow 1s ease-in-out' : 'none',
                    cursor: interactive ? 'pointer' : 'default',
                }}
            >
                {/* Fondo animado */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at 30% 20%, 
              ${dynamicColors.withOpacity(getValueColor(), 0.2)} 0%, 
              transparent 50%)`,
                        opacity: hovered ? 0.8 : 0.4,
                        transition: 'opacity 0.3s ease',
                    }}
                />

                {/* Partículas flotantes */}
                {hovered && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                        }}
                    >
                        {[...Array(5)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    position: 'absolute',
                                    width: 4,
                                    height: 4,
                                    background: 'white',
                                    borderRadius: '50%',
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: 'float 3s ease-in-out infinite',
                                    animationDelay: `${i * 0.3}s`,
                                    opacity: 0.6,
                                }}
                            />
                        ))}
                    </Box>
                )}

                <CardHeader
                    title={
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(90deg, #fff 30%, rgba(255,255,255,0.8) 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            {title}
                        </Typography>
                    }
                    action={
                        interactive && (
                            <IconButton
                                size="small"
                                sx={{
                                    color: 'white',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.1)',
                                        transform: 'rotate(90deg)',
                                    },
                                    transition: 'transform 0.3s ease',
                                }}
                            >
                                <MoreVert />
                            </IconButton>
                        )
                    }
                    sx={{ pb: 0 }}
                />

                <CardContent>
                    {/* Valor principal */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                        <Typography
                            variant={isMobile ? 'h4' : 'h3'}
                            sx={{
                                fontWeight: 800,
                                color: 'white',
                                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                animation: pulse ? 'pulse 1s ease-in-out' : 'none',
                            }}
                        >
                            {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                        </Typography>

                        {change !== undefined && (
                            <Chip
                                icon={change >= 0 ? <TrendingUp /> : <TrendingDown />}
                                label={`${change >= 0 ? '+' : ''}${change}%`}
                                size="small"
                                sx={{
                                    ml: 2,
                                    background: changeColor,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    '& .MuiChip-icon': {
                                        color: 'white',
                                        fontSize: '1rem',
                                    },
                                }}
                            />
                        )}
                    </Box>

                    {/* Categoría */}
                    {category && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                color: 'rgba(255,255,255,0.8)',
                                mb: 2,
                                fontWeight: 500,
                            }}
                        >
                            {category}
                        </Typography>
                    )}

                    {/* Icono dinámico */}
                    {Icon && (
                        <Box
                            sx={{
                                position: 'absolute',
                                right: 16,
                                bottom: 16,
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                opacity: hovered ? 1 : 0.7,
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <Icon sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                    )}

                    {/* Progress bar dinámica */}
                    {data.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <LinearProgress
                                variant="determinate"
                                value={(value / Math.max(...data.map(d => d.value))) * 100}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.1)',
                                    '& .MuiLinearProgress-bar': {
                                        background: dynamicColors.gradients.primary(90),
                                        borderRadius: 3,
                                    },
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    textAlign: 'right',
                                    color: 'rgba(255,255,255,0.7)',
                                    mt: 0.5,
                                }}
                            >
                                {((value / Math.max(...data.map(d => d.value))) * 100).toFixed(1)}% del máximo
                            </Typography>
                        </Box>
                    )}
                </CardContent>

                {/* Efecto de borde brillante */}
                {hovered && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            border: '2px solid',
                            borderImage: `linear-gradient(45deg, ${getValueColor()}, ${currentColor}) 1`,
                            borderRadius: 'inherit',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </Card>
        </motion.div>
    );
};

export default DynamicCard;
