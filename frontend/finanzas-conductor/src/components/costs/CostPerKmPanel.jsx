import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    LinearProgress,
    Alert,
    Button,
    TextField,
    Slider,
    IconButton,
    Tooltip,
    Divider
} from '@mui/material';
// import {
//     LocalGasStation,
//     Build,
//     Security,
//     Road,
//     LocalParking,
//     Restaurant,
//     AttachMoney,
//     TrendingUp,
//     TrendingDown,
//     Info,
//     Calculate,
//     Timeline,
//     Savings
// } from '@mui/icons-material';
import { useCostCalculations } from '../../hooks/useCostCalculations';
import { formatCurrency, formatKm } from '../../utils/formatters';

const CostPerKmPanel = ({ transactions = [], vehicleInfo = {} }) => {
    const {
        totalKm,
        analysis,
        loading,
        calculateMinimumPrice,
        calculateProfitProjection
    } = useCostCalculations(transactions, vehicleInfo);

    const [tripDistance, setTripDistance] = useState(5);
    const [desiredProfit, setDesiredProfit] = useState(30);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Cargando análisis de costos...</Typography>
            </Box>
        );
    }

    if (!analysis) {
        return (
            <Alert severity="info">
                No hay suficientes datos para calcular costos por kilómetro.
                Registra algunos viajes y gastos primero.
            </Alert>
        );
    }

    const { summary, metrics, expensesBreakdown } = analysis;

    // Iconos por categoría (Placeholder text instead of icons)
    const categoryIcons = {
        fuel: <span>⛽</span>, // <LocalGasStation />,
        maintenance: <span>🔧</span>, // <Build />,
        insurance: <span>🛡️</span>, // <Security />,
        tolls: <span>🛣️</span>, // <Road />,
        parking: <span>🅿️</span>, // <LocalParking />,
        food: <span>🍽️</span>, // <Restaurant />,
        other: <span>💰</span> // <AttachMoney />
    };

    // Colores por categoría
    const categoryColors = {
        fuel: '#FF6384',
        maintenance: '#36A2EB',
        insurance: '#FFCE56',
        tolls: '#4BC0C0',
        parking: '#9966FF',
        food: '#FF9F40',
        other: '#C9CBCF'
    };

    // Calcular precios mínimos
    const minPriceForTrip = calculateMinimumPrice(tripDistance, desiredProfit / 100);
    const projection = calculateProfitProjection(tripDistance, minPriceForTrip / tripDistance);

    // Tabla de desglose de costos
    const costBreakdownRows = Object.entries(expensesBreakdown)
        .filter(([_, value]) => value > 0)
        .map(([category, amount]) => ({
            category,
            amount,
            costPerKm: totalKm > 0 ? amount / totalKm : 0,
            percentage: summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0,
            icon: categoryIcons[category] || <span>💰</span>,
            color: categoryColors[category] || '#C9CBCF'
        }));

    return (
        <Box>
            {/* Resumen Principal */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {/* <Timeline color="primary" sx={{ mr: 1 }} /> */}
                                <Typography variant="h6">Costo por Kilómetro</Typography>
                            </Box>
                            <Typography variant="h3" color="primary" sx={{ mb: 1 }}>
                                ${formatCurrency(metrics.costPerKm)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cada kilómetro te cuesta ${formatCurrency(metrics.costPerKm)}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(metrics.costPerKm * 10, 100)}
                                sx={{ mt: 2, height: 8, borderRadius: 4 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {/* <TrendingUp color={metrics.efficiency >= 0 ? "success" : "error"} sx={{ mr: 1 }} /> */}
                                <Typography variant="h6">Eficiencia</Typography>
                            </Box>
                            <Typography
                                variant="h3"
                                color={metrics.efficiency >= 0 ? "success.main" : "error.main"}
                                sx={{ mb: 1 }}
                            >
                                {Math.round(metrics.efficiency)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {metrics.efficiency >= 0 ? 'Ganas $' + Math.round(metrics.efficiency) : 'Pierdes $' + Math.round(Math.abs(metrics.efficiency))} por cada $1 de gasto
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {/* <Savings color="secondary" sx={{ mr: 1 }} /> */}
                                <Typography variant="h6">Ganancia Neta</Typography>
                            </Box>
                            <Typography variant="h3" color="secondary.main" sx={{ mb: 1 }}>
                                ${formatCurrency(summary.netProfit)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Después de todos los gastos
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                    Por kilómetro:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                    ${formatCurrency(summary.netProfit / totalKm)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Calculadora de Viaje */}
            <Card sx={{ mb: 4, borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <Calculate sx={{ mr: 1 }} /> */} Calculadora de Viaje
                    </Typography>

                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Box>
                                <Typography gutterBottom>Distancia del viaje (km)</Typography>
                                <TextField
                                    type="number"
                                    value={tripDistance}
                                    onChange={(e) => setTripDistance(Number(e.target.value))}
                                    fullWidth
                                    InputProps={{
                                        endAdornment: <Typography variant="body2">km</Typography>
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box>
                                <Typography gutterBottom>Margen de ganancia deseado</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Slider
                                        value={desiredProfit}
                                        onChange={(_, value) => setDesiredProfit(value)}
                                        min={10}
                                        max={100}
                                        valueLabelDisplay="auto"
                                        valueLabelFormat={(value) => `${value}%`}
                                        sx={{ flex: 1 }}
                                    />
                                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                                        {desiredProfit}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">Precio mínimo recomendado</Typography>
                                <Typography variant="h4" color="primary">
                                    ${formatCurrency(minPriceForTrip)}
                                </Typography>
                                <Typography variant="caption">
                                    ${formatCurrency(minPriceForTrip / tripDistance)}/km
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Resultados del cálculo */}
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">Costo del viaje</Typography>
                                <Typography variant="h6">${formatCurrency(tripDistance * metrics.costPerKm)}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">Ganancia</Typography>
                                <Typography variant="h6" color="success.main">
                                    ${formatCurrency(projection.profit)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">Margen</Typography>
                                <Typography variant="h6" color={projection.profitMargin >= 0 ? "success.main" : "error.main"}>
                                    {Math.round(projection.profitMargin)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">Rentabilidad</Typography>
                                <Typography variant="h6" color={projection.profitMargin >= desiredProfit ? "success.main" : "warning.main"}>
                                    {projection.profitMargin >= desiredProfit ? '✅ Buena' : '⚠️ Baja'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mt: 3 }}>
                        <Typography variant="body2">
                            <strong>Recomendación:</strong> Para un viaje de {formatKm(tripDistance)}, cobra al menos
                            <strong> ${formatCurrency(minPriceForTrip)}</strong> para obtener un {Math.round(desiredProfit)}% de ganancia.
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>

            {/* Desglose Detallado de Costos */}
            <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* <Info sx={{ mr: 1 }} /> */} Desglose de Costos por Kilómetro
                    </Typography>

                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Categoría</TableCell>
                                    <TableCell align="right">Gasto Total</TableCell>
                                    <TableCell align="right">Costo por Km</TableCell>
                                    <TableCell align="right">Porcentaje</TableCell>
                                    <TableCell align="center">Distribución</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {costBreakdownRows.map((row) => (
                                    <TableRow key={row.category}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ color: row.color, mr: 1 }}>{row.icon}</Box>
                                                <Typography sx={{ textTransform: 'capitalize' }}>
                                                    {row.category === 'fuel' ? 'Combustible' :
                                                        row.category === 'maintenance' ? 'Mantenimiento' :
                                                            row.category === 'insurance' ? 'Seguro' :
                                                                row.category === 'tolls' ? 'Peajes' :
                                                                    row.category === 'parking' ? 'Estacionamiento' :
                                                                        row.category === 'food' ? 'Comida' : 'Otros'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight="medium">
                                                ${formatCurrency(row.amount)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={`$${formatCurrency(row.costPerKm)}/km`}
                                                size="small"
                                                sx={{ bgcolor: `${row.color}20`, color: row.color }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight="medium">
                                                {Math.round(row.percentage)}%
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <LinearProgress
                                                variant="determinate"
                                                value={row.percentage}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: 'action.hover',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: row.color,
                                                        borderRadius: 4
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* Fila total */}
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell>
                                        <Typography fontWeight="bold">Total</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold">
                                            ${formatCurrency(summary.totalExpenses)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={`$${formatCurrency(metrics.costPerKm)}/km`}
                                            color="primary"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold">100%</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <LinearProgress
                                            variant="determinate"
                                            value={100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'action.hover',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'primary.main',
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Insights y recomendaciones */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                            💡 Insights y Recomendaciones
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Mayor gasto:</strong> {(() => {
                                            const maxCategory = costBreakdownRows.reduce((max, row) =>
                                                row.amount > max.amount ? row : max,
                                                { category: '', amount: 0 }
                                            );
                                            return maxCategory.category === 'fuel' ? 'Combustible' :
                                                maxCategory.category === 'maintenance' ? 'Mantenimiento' :
                                                    maxCategory.category === 'insurance' ? 'Seguro' :
                                                        'Otros gastos';
                                        })()} representa el {
                                            Math.round(Math.max(...costBreakdownRows.map(r => r.percentage)))
                                        }% de tus gastos.
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Eficiencia:</strong> Tu costo por kilómetro es {
                                            metrics.costPerKm < 0.5 ? 'excelente' :
                                                metrics.costPerKm < 1 ? 'bueno' :
                                                    metrics.costPerKm < 1.5 ? 'regular' : 'alto'
                                        }. El promedio de la industria es $0.8/km.
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Acciones recomendadas */}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            // startIcon={<TrendingUp />}
                            onClick={() => {
                                // Acción para optimizar costos
                                console.log('Optimizar costos');
                            }}
                        >
                            Optimizar Costos
                        </Button>
                        <Button
                            variant="contained"
                            // startIcon={<Calculate />}
                            onClick={() => {
                                // Acción para calcular nuevo viaje
                                setTripDistance(10);
                                setDesiredProfit(40);
                            }}
                        >
                            Calcular Nuevo Viaje
                        </Button>
                        <Button
                            variant="outlined"
                            // startIcon={<Savings />}
                            onClick={() => {
                                // Acción para ver proyecciones
                                console.log('Ver proyecciones');
                            }}
                        >
                            Ver Proyecciones
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CostPerKmPanel;
