import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Slider,
    Button,
    Grid,
    Chip,
    Alert,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Calculate,
    DirectionsCar,
    AttachMoney,
    TrendingUp,
    Info
} from '@mui/icons-material';

const QuickTripCalculator = ({ costPerKm = 0.85 }) => {
    const [distance, setDistance] = useState(5);
    const [profitMargin, setProfitMargin] = useState(30);
    const [extraCosts, setExtraCosts] = useState(0);
    const [calculatedPrice, setCalculatedPrice] = useState(0);

    const calculateTripPrice = () => {
        const baseCost = distance * costPerKm;
        const totalCost = baseCost + extraCosts;
        const price = totalCost * (1 + profitMargin / 100);
        setCalculatedPrice(price);
        return price;
    };

    const handleCalculate = () => {
        calculateTripPrice();
    };

    const handleQuickDistance = (km) => {
        setDistance(km);
        const price = distance * costPerKm * (1 + profitMargin / 100);
        setCalculatedPrice(price);
    };

    const quickDistances = [
        { label: 'Corto (3km)', value: 3 },
        { label: 'Medio (8km)', value: 8 },
        { label: 'Largo (15km)', value: 15 },
        { label: 'Extra (25km)', value: 25 }
    ];

    const profitMargins = [
        { label: 'Bajo (20%)', value: 20 },
        { label: 'Estándar (30%)', value: 30 },
        { label: 'Alto (50%)', value: 50 },
        { label: 'Premium (80%)', value: 80 }
    ];

    const breakdown = {
        baseCost: distance * costPerKm,
        extraCosts: extraCosts,
        totalCost: (distance * costPerKm) + extraCosts,
        profitAmount: calculatedPrice - ((distance * costPerKm) + extraCosts)
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Calculate color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Calculadora Rápida de Viaje</Typography>
                <Tooltip title={`Basado en tu costo actual de $${costPerKm} por kilómetro`}>
                    <IconButton size="small" sx={{ ml: 1 }}>
                        <Info fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Grid container spacing={3}>
                {/* Columna izquierda - Inputs */}
                <Grid item xs={12} md={6}>
                    {/* Distancia */}
                    <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <DirectionsCar sx={{ mr: 1, fontSize: 20 }} /> Distancia (km)
                        </Typography>
                        <TextField
                            type="number"
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                            fullWidth
                            size="small"
                        />
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {quickDistances.map((item) => (
                                <Chip
                                    key={item.value}
                                    label={item.label}
                                    size="small"
                                    onClick={() => handleQuickDistance(item.value)}
                                    variant={distance === item.value ? "filled" : "outlined"}
                                    color="primary"
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Margen de ganancia */}
                    <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUp sx={{ mr: 1, fontSize: 20 }} /> Margen de Ganancia
                        </Typography>
                        <Slider
                            value={profitMargin}
                            onChange={(_, value) => setProfitMargin(value)}
                            min={10}
                            max={100}
                            valueLabelDisplay="auto"
                            valueLabelFormat={(value) => `${value}%`}
                        />
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {profitMargins.map((item) => (
                                <Chip
                                    key={item.value}
                                    label={item.label}
                                    size="small"
                                    onClick={() => setProfitMargin(item.value)}
                                    variant={profitMargin === item.value ? "filled" : "outlined"}
                                    color="secondary"
                                />
                            ))}
                        </Box>
                    </Box>

                    {/* Costos extra */}
                    <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoney sx={{ mr: 1, fontSize: 20 }} /> Costos Extra (peajes, estacionamiento)
                        </Typography>
                        <TextField
                            type="number"
                            value={extraCosts}
                            onChange={(e) => setExtraCosts(Number(e.target.value))}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                            }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={handleCalculate}
                        startIcon={<Calculate />}
                    >
                        Calcular Precio
                    </Button>
                </Grid>

                {/* Columna derecha - Resultados */}
                <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                            Resultados
                        </Typography>

                        {calculatedPrice > 0 ? (
                            <>
                                {/* Precio recomendado */}
                                <Box sx={{ textAlign: 'center', my: 3 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Precio mínimo recomendado
                                    </Typography>
                                    <Typography variant="h3" color="primary">
                                        ${calculatedPrice.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption">
                                        ${(calculatedPrice / distance).toFixed(2)} por kilómetro
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Desglose */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom fontWeight="medium">
                                        Desglose del precio:
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Costo base ({distance}km × ${costPerKm}/km)
                                        </Typography>
                                        <Typography variant="body2">${breakdown.baseCost.toFixed(2)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Costos extra
                                        </Typography>
                                        <Typography variant="body2">${breakdown.extraCosts.toFixed(2)}</Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Costo total del viaje
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            ${breakdown.totalCost.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Ganancia ({profitMargin}%)
                                        </Typography>
                                        <Typography variant="body2" color="success.main" fontWeight="medium">
                                            +${breakdown.profitAmount.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" fontWeight="medium">
                                            Precio final
                                        </Typography>
                                        <Typography variant="h6">${calculatedPrice.toFixed(2)}</Typography>
                                    </Box>
                                </Box>

                                {/* Recomendación */}
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Recomendación:</strong> Para {distance}km con {profitMargin}% de ganancia,
                                        cobra al menos <strong>${calculatedPrice.toFixed(2)}</strong>.
                                    </Typography>
                                </Alert>
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Calculate sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                                <Typography color="text.secondary">
                                    Ingresa los datos y haz click en "Calcular Precio"
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Tips rápidos */}
            <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                    <strong>Tip:</strong> Considera el tráfico, hora del día y demanda al fijar tu precio final.
                    En horas pico puedes aumentar entre 20-50% el precio calculado.
                </Typography>
            </Alert>
        </Paper>
    );
};

export default QuickTripCalculator;
