import React, { useState, useRef, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import moment from 'moment';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend
} from 'recharts';
import {
    LocalGasStation as GasIcon,
    Build as MaintenanceIcon,
    DirectionsCar as TollIcon,
    Restaurant as FoodIcon,
    MoreHoriz as OtherIcon,
    BarChart as BarChartIcon,
    Lightbulb as LightbulbIcon,
    TrackChanges as BullseyeIcon,
    CalendarToday as CalendarIcon,
    Download as DownloadIcon,
    ShowChart as ChartLineIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Paper,
    Stack,
    Chip
} from '@mui/material';
import { chartStyles, categoryColors } from '../styles/chartStyles';
import { useChartExport } from '../hooks/useChartExport';

export default function CategoryCharts({ transactions = [], onOpenAdvanced }) {
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [timeRange, setTimeRange] = useState('mes');
    const categoryRef = useRef(null);
    const { exportAsImage } = useChartExport();
    const theme = useTheme();
    const axisColor = theme.palette.mode === 'dark' ? '#E0E0E0' : '#9e9e9e';

    const categories = [
        { id: 'todos', name: 'Todos', color: chartStyles.colors.primary, icon: <BarChartIcon /> },
        { id: 'gasolina', name: 'Gasolina', color: categoryColors.gasolina, icon: <GasIcon /> },
        { id: 'mantenimiento', name: 'Mantenimiento', color: categoryColors.mantenimiento, icon: <MaintenanceIcon /> },
        { id: 'peajes', name: 'Peajes', color: categoryColors.peaje, icon: <TollIcon /> },
        { id: 'comida', name: 'Comida', color: categoryColors.comida, icon: <FoodIcon /> },
        { id: 'otros', name: 'Otros', color: categoryColors.otros, icon: <OtherIcon /> }
    ];

    const categoryData = useMemo(() => {
        const now = moment();
        let start;
        switch (timeRange) {
            case 'día': start = moment().startOf('day'); break;
            case 'semana': start = moment().startOf('week'); break;
            case 'mes': start = moment().startOf('month'); break;
            case 'año': start = moment().startOf('year'); break;
            default: start = moment().startOf('month');
        }

        const filteredDocs = transactions.filter(t =>
            t.tipo === 'gasto' && moment(t.fecha).isSameOrAfter(start)
        );

        const result = {};

        // Initialize for all categories except 'todos'
        categories.slice(1).forEach(cat => {
            result[cat.id] = {
                data: [],
                total: 0,
                promedio: 0,
                tendencia: '0%',
                insights: ['Sin datos suficientes para generar insights']
            };
        });

        // Helper to normalize category
        const normalizeCategory = (cat) => {
            if (!cat) return 'otros';
            const lower = cat.toLowerCase();

            if (lower.includes('peaje')) return 'peajes';
            if (lower.includes('gasolina') || lower.includes('combustible')) return 'gasolina';
            if (lower.includes('comida') || lower.includes('alimentacion') || lower.includes('alimentos')) return 'comida';
            if (lower.includes('mantenimiento') || lower.includes('taller') || lower.includes('reparacion') || lower.includes('aceite')) return 'mantenimiento';

            if (result[lower]) return lower;
            return 'otros';
        };

        // Process transactions
        filteredDocs.forEach(t => {
            const catId = normalizeCategory(t.categoria);
            if (result[catId]) {
                result[catId].total += Number(t.monto);
            }
        });

        // Generate daily data for charts
        Object.keys(result).forEach(catId => {
            const catTrans = filteredDocs.filter(t => normalizeCategory(t.categoria) === catId);

            // Group by day for the chart
            const daysMap = {};
            catTrans.forEach(t => {
                const dayName = moment(t.fecha).format('DD/MM');
                daysMap[dayName] = (daysMap[dayName] || 0) + Number(t.monto);
            });

            // Sort by date
            result[catId].data = Object.entries(daysMap)
                .sort((a, b) => moment(a[0], 'DD/MM').diff(moment(b[0], 'DD/MM')))
                .map(([name, value]) => ({ name, value }));

            // Calculate average
            const daysCount = result[catId].data.length || 1;
            result[catId].promedio = result[catId].total / daysCount;

            // Generate Insights
            if (result[catId].total > 0) {
                const maxDay = result[catId].data.reduce((max, p) => p.value > max.value ? p : max, { value: 0 });
                result[catId].insights = [
                    `Gasto total: $${result[catId].total.toFixed(2)}`,
                    `Día con mayor gasto: ${maxDay.name} ($${maxDay.value})`,
                    `Promedio diario (días activos): $${result[catId].promedio.toFixed(2)}`
                ];
            }
        });

        return result;
    }, [transactions, timeRange]);

    const comparisonData = useMemo(() => {
        return categories.slice(1).map(cat => ({
            name: cat.name,
            value: categoryData[cat.id]?.total || 0,
            fill: cat.color
        })).filter(item => item.value > 0);
    }, [categoryData]);

    const renderCategoryDetails = () => {
        if (selectedCategory === 'todos') {
            return (
                <Box sx={{ p: 1 }}>
                    <Typography variant="h6" gutterBottom>Resumen por Categoría</Typography>
                    <Grid container spacing={2}>
                        {categories.slice(1).map(cat => (
                            <Grid item xs={6} sm={4} key={cat.id}>
                                <Card
                                    onClick={() => setSelectedCategory(cat.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        borderLeft: `4px solid ${cat.color}`,
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'scale(1.02)' }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: cat.color }}>
                                            {React.cloneElement(cat.icon, { sx: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' } })}
                                            <Typography variant="subtitle2" sx={{ ml: 1, color: 'text.primary' }}>{cat.name}</Typography>
                                        </Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            ${categoryData[cat.id]?.total || 0}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {categoryData[cat.id] ? `${categoryData[cat.id].data.length} días` : 'Sin datos'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            );
        }

        const data = categoryData[selectedCategory];
        if (!data) return null;
        const categoryInfo = categories.find(c => c.id === selectedCategory);

        return (
            <Box sx={{ p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box sx={{
                        width: 50, height: 50, borderRadius: '50%',
                        bgcolor: `${categoryInfo.color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        mr: 2, color: categoryInfo.color
                    }}>
                        {React.cloneElement(categoryInfo.icon, { sx: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' } })}
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Total: ${data.total}</Typography>
                        <Typography variant="body2" color="text.secondary">Promedio/día: ${data.promedio.toFixed(2)}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                            Tendencia:
                            <Box component="span" sx={{
                                color: data.tendencia.includes('+') ? 'success.main' : 'error.main',
                                fontWeight: 'bold', display: 'flex', alignItems: 'center'
                            }}>
                                {data.tendencia.includes('+') ? <ArrowUpIcon fontSize="inherit" /> : <ArrowDownIcon fontSize="inherit" />} {data.tendencia}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ mb: 4, height: 250 }}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">Gasto Diario</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={categoryInfo.color} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={categoryInfo.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                            <Tooltip contentStyle={chartStyles.tooltip} itemStyle={chartStyles.tooltipText} />
                            <Area type="monotone" dataKey="value" stroke={categoryInfo.color} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>

                <Paper sx={{ mb: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(243, 156, 18, 0.15)' : '#fff9e6', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LightbulbIcon sx={{ color: '#F39C12', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} /> Insights
                    </Typography>
                    {data.insights.map((insight, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'start', mb: 0.5 }}>
                            <LightbulbIcon sx={{ color: '#F39C12', fontSize: 16, mt: 0.5, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
                            <Typography variant="body2" color="text.secondary">{insight}</Typography>
                        </Box>
                    ))}
                </Paper>

                <Paper sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(41, 98, 255, 0.15)' : '#f0f7fe', p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BullseyeIcon sx={{ color: 'info.main', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} /> Recomendaciones
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', mb: 0.5 }}>
                        <BullseyeIcon sx={{ color: 'success.main', fontSize: 16, mt: 0.5, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
                        <Typography variant="body2" color="text.secondary">
                            Establece un presupuesto máximo de <strong>${(data.promedio * 1.1).toFixed(2)}/día</strong>
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                        <CalendarIcon sx={{ color: 'info.main', fontSize: 16, mt: 0.5, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
                        <Typography variant="body2" color="text.secondary">
                            Planifica gastos para optimizar tu flujo de caja semanal.
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        );
    };

    return (
        <Box ref={categoryRef} sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Análisis por Categoría
            </Typography>

            {/* Category Selector */}
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 2, mb: 1 }}>
                {categories.map(category => (
                    <Chip
                        key={category.id}
                        icon={category.icon}
                        label={category.name}
                        onClick={() => setSelectedCategory(category.id)}
                        variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                        sx={{
                            bgcolor: selectedCategory === category.id ? category.color : 'transparent',
                            color: selectedCategory === category.id ? '#fff' : 'text.primary',
                            borderColor: category.color,
                            '& .MuiChip-icon': { color: selectedCategory === category.id ? '#fff' : category.color },
                            '&:hover': { bgcolor: selectedCategory === category.id ? category.color : `${category.color}20` }
                        }}
                    />
                ))}
            </Stack>

            {/* Time Range Selector */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                {['día', 'semana', 'mes', 'año'].map(range => (
                    <Chip
                        key={range}
                        label={range}
                        onClick={() => setTimeRange(range)}
                        color={timeRange === range ? 'primary' : 'default'}
                        variant={timeRange === range ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                    />
                ))}
            </Stack>

            {/* Main Content Card */}
            <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                {renderCategoryDetails()}
            </Paper>

            {/* Comparison Charts */}
            <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Comparativa Semanal</Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={20} data={comparisonData}>
                            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: '50%', right: 0, transform: 'translate(0, -50%)' }} />
                            <Tooltip />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => exportAsImage(categoryRef, 'analisis-categorias')}
                >
                    Exportar Reporte
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ChartLineIcon />}
                    onClick={onOpenAdvanced}
                >
                    Análisis Avanzado
                </Button>
            </Stack>
        </Box>
    );
}
