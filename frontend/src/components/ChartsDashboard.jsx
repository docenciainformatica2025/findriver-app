import React, { useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';


import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar, Brush
} from 'recharts';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AttachMoney as MoneyIcon,
    DirectionsCar as CarIcon,
    Lightbulb as LightbulbIcon,
    Download as DownloadIcon,
    Share as ShareIcon,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    ShowChart as LineChartIcon,
    StackedBarChart as StackedBarChartIcon
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Paper
} from '@mui/material';
import { groupByPeriod, getSummaryStats, sampleData } from '../utils/financeUtils';
import { chartStyles, categoryColors } from '../styles/chartStyles';
import { useChartExport } from '../hooks/useChartExport';
import { shadows } from '../utils/themeUtils';
import { formatMoney } from '../utils/formatters';

export default function ChartsDashboard({ transactions = [] }) {
    const [period, setPeriod] = useState('semana');
    const [chartType, setChartType] = useState('ingresos_gastos');
    const dashboardRef = useRef(null);
    const { exportAsImage } = useChartExport();
    const theme = useTheme();
    const axisColor = theme.palette.mode === 'dark' ? '#E0E0E0' : '#9e9e9e';

    const data = transactions.length > 0 ? transactions : sampleData.transacciones;
    const stats = getSummaryStats(data);
    const groupedData = groupByPeriod(data, period === 'semana' ? 'day' : period);

    const barChartData = groupedData.map(item => ({
        name: item.label,
        ingresos: item.ingresos,
        gastos: item.gastos,
        ganancias: item.ganancias
    }));

    const expenseCategories = sampleData.categoriasGastos.map(c => ({ name: c.categoria, value: c.monto, color: c.color }));
    const incomeCategories = sampleData.categoriasIngresos.map(c => ({ name: c.categoria, value: c.monto, color: c.color }));

    const progressData = [
        { name: 'Eficiencia', value: 70, fill: '#8884d8' },
        { name: 'Rentabilidad', value: 80, fill: '#83a6ed' },
        { name: 'Productividad', value: 60, fill: '#8dd1e1' }
    ];

    const stackedData = [
        { name: 'Lun', Viajes: 60, Encomiendas: 40, Apps: 0 },
        { name: 'Mar', Viajes: 70, Encomiendas: 30, Apps: 0 },
        { name: 'Mié', Viajes: 80, Encomiendas: 20, Apps: 0 },
        { name: 'Jue', Viajes: 90, Encomiendas: 10, Apps: 0 },
        { name: 'Vie', Viajes: 70, Encomiendas: 30, Apps: 0 },
        { name: 'Sáb', Viajes: 50, Encomiendas: 50, Apps: 0 },
        { name: 'Dom', Viajes: 40, Encomiendas: 60, Apps: 0 },
    ];

    const handlePeriodChange = (event, newPeriod) => {
        if (newPeriod !== null) setPeriod(newPeriod);
    };

    const handleChartTypeChange = (event, newType) => {
        if (newType !== null) setChartType(newType);
    };

    const renderStatsCard = (title, amount, subtitle, comparison, icon, color, bgColor) => (
        <Card sx={{ minWidth: 200, flex: 1, bgcolor: bgColor, borderLeft: `4px solid ${color}` }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                    {React.cloneElement(icon, { sx: { ...icon.props.sx, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' } })}
                    <Typography variant="body2" sx={{ ml: 1 }}>{title}</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5, color: 'text.primary' }}>
                    {amount}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {subtitle}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                    {comparison}
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box ref={dashboardRef} sx={{ p: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Análisis Financiero
            </Typography>

            {/* Stats Cards */}
            <Stack direction="row" spacing={2} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
                {renderStatsCard(
                    'Ingresos',
                    formatMoney(stats.mes.ingresos),
                    'Este mes',
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} /> vs semana anterior</Box>,
                    <TrendingUpIcon sx={{ color: 'success.main' }} />,
                    chartStyles.colors.success,
                    theme.palette.mode === 'dark' ? 'rgba(46, 204, 113, 0.15)' : '#f0f9f0'
                )}
                {renderStatsCard(
                    'Gastos',
                    formatMoney(stats.mes.gastos),
                    'Este mes',
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><TrendingDownIcon sx={{ color: 'success.main', fontSize: 16 }} /> vs semana anterior</Box>,
                    <TrendingDownIcon sx={{ color: 'error.main' }} />,
                    chartStyles.colors.danger,
                    theme.palette.mode === 'dark' ? 'rgba(231, 76, 60, 0.15)' : '#fef0f0'
                )}
                {renderStatsCard(
                    'Ganancias',
                    formatMoney(stats.mes.ganancias),
                    'Este mes',
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} /> vs semana anterior</Box>,
                    <MoneyIcon sx={{ color: 'primary.main' }} />,
                    chartStyles.colors.primary,
                    theme.palette.mode === 'dark' ? 'rgba(52, 152, 219, 0.15)' : '#f0f7fe'
                )}
                {renderStatsCard(
                    'Viajes',
                    data.filter(t => t.tipo === 'ingreso').length,
                    'Total registrados',
                    <span>Promedio: {formatMoney(stats.total.ingresos / (data.filter(t => t.tipo === 'ingreso').length || 1))}</span>,
                    <CarIcon sx={{ color: 'info.main' }} />,
                    chartStyles.colors.info,
                    theme.palette.mode === 'dark' ? 'rgba(155, 89, 182, 0.15)' : '#f7f0fe'
                )}
            </Stack>

            {/* Charts Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: shadows.card, border: '1px solid rgba(0,0,0,0.03)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <ToggleButtonGroup
                        value={period}
                        exclusive
                        onChange={handlePeriodChange}
                        size="small"
                        sx={{ boxShadow: shadows.fab }}
                    >
                        {['semana', 'mes', 'año'].map(p => (
                            <ToggleButton key={p} value={p} sx={{ textTransform: 'capitalize' }}>
                                {p}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Box sx={{ overflowX: 'auto', maxWidth: '100%', pb: 1 }}>
                        <ToggleButtonGroup
                            value={chartType}
                            exclusive
                            onChange={handleChartTypeChange}
                            size="small"
                            sx={{ boxShadow: shadows.fab, whiteSpace: 'nowrap' }}
                        >
                            <ToggleButton value="ingresos_gastos">Ingresos/Gastos</ToggleButton>
                            <ToggleButton value="ganancias">Ganancias</ToggleButton>
                            <ToggleButton value="categorias">Categorías</ToggleButton>
                            <ToggleButton value="progreso">Progreso</ToggleButton>
                            <ToggleButton value="apilado">Apilado</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                <Box sx={{ height: 350, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'ingresos_gastos' ? (
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                                <Tooltip contentStyle={{ ...chartStyles.tooltip, boxShadow: shadows.card }} itemStyle={chartStyles.tooltipText} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="ingresos" fill={chartStyles.colors.income} radius={[4, 4, 0, 0]} name="Ingresos" />
                                <Bar dataKey="gastos" fill={chartStyles.colors.expense} radius={[4, 4, 0, 0]} name="Gastos" />
                                <Brush dataKey="name" height={30} stroke={chartStyles.colors.primary} />
                            </BarChart>
                        ) : chartType === 'ganancias' ? (
                            <AreaChart data={barChartData}>
                                <defs>
                                    <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3498DB" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3498DB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                                <Tooltip contentStyle={{ ...chartStyles.tooltip, boxShadow: shadows.card }} itemStyle={chartStyles.tooltipText} />
                                <Area type="monotone" dataKey="ganancias" stroke={chartStyles.colors.primary} fillOpacity={1} fill="url(#colorGanancias)" name="Ganancias" />
                                <Brush dataKey="name" height={30} stroke={chartStyles.colors.primary} />
                            </AreaChart>
                        ) : chartType === 'categorias' ? (
                            <Grid container spacing={2} sx={{ height: '100%' }}>
                                <Grid item xs={12} md={6} sx={{ textAlign: 'center', height: '100%' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Gastos</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {expenseCategories.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ ...chartStyles.tooltip, boxShadow: shadows.card }} />
                                            <Legend wrapperStyle={{ fontSize: '11px', bottom: 0 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Grid>
                                <Grid item xs={12} md={6} sx={{ textAlign: 'center', height: '100%' }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Ingresos</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie data={incomeCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {incomeCategories.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ ...chartStyles.tooltip, boxShadow: shadows.card }} />
                                            <Legend wrapperStyle={{ fontSize: '11px', bottom: 0 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Grid>
                            </Grid>
                        ) : chartType === 'progreso' ? (
                            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={progressData}>
                                <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: '50%', right: 0, transform: 'translate(0, -50%)' }} />
                                <Tooltip contentStyle={{ ...chartStyles.tooltip, boxShadow: shadows.card }} />
                            </RadialBarChart>
                        ) : (
                            <BarChart data={stackedData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 12 }} />
                                <Tooltip contentStyle={{ ...chartStyles.tooltip, boxShadow: shadows.card }} itemStyle={chartStyles.tooltipText} cursor={{ fill: 'transparent' }} />
                                <Legend />
                                <Bar dataKey="Viajes" stackId="a" fill={chartStyles.colors.success} radius={[0, 0, 4, 4]} />
                                <Bar dataKey="Encomiendas" stackId="a" fill={chartStyles.colors.primary} />
                                <Bar dataKey="Apps" stackId="a" fill={chartStyles.colors.info} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </Box>
            </Paper>

            {/* Trends Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: shadows.card, border: '1px solid rgba(0,0,0,0.03)' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">Tendencias</Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Box sx={{ p: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(46, 204, 113, 0.2)' : '#e8f5e9', borderRadius: '50%' }}>
                            <TrendingUpIcon color="success" sx={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                        </Box>
                        <Typography variant="body2">Ingresos aumentaron <Box component="span" fontWeight="bold" color="success.main">15%</Box> vs semana pasada</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Box sx={{ p: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(231, 76, 60, 0.2)' : '#ffebee', borderRadius: '50%' }}>
                            <TrendingDownIcon color="error" sx={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                        </Box>
                        <Typography variant="body2">Gastos de gasolina disminuyeron <Box component="span" fontWeight="bold" color="success.main">8%</Box></Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <Box sx={{ p: 1, bgcolor: theme.palette.mode === 'dark' ? 'rgba(41, 98, 255, 0.2)' : '#e3f2fd', borderRadius: '50%' }}>
                            <TrendingUpIcon color="primary" sx={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                        </Box>
                        <Typography variant="body2">Ganancias netas: <Box component="span" fontWeight="bold" color="primary.main">+22%</Box> este mes</Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Insights Card */}
            <Card sx={{
                mb: 3,
                bgcolor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#fff9e6',
                borderLeft: '4px solid #F39C12',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 6px rgba(0,0,0,0.3)' : shadows.card
            }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.mode === 'dark' ? '#F39C12' : 'inherit' }}>
                        <LightbulbIcon sx={{ color: '#F39C12' }} /> Insights del Mes
                    </Typography>
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                            <LightbulbIcon sx={{ color: '#F39C12', fontSize: 16, mt: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ color: theme.palette.mode === 'dark' ? '#ccc' : 'text.secondary' }}>
                                <Box component="span" fontWeight="bold" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>Gasolina</Box> representa el <Box component="span" fontWeight="bold" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>{((95 / (stats.mes.gastos || 1)) * 100).toFixed(0)}%</Box> de tus gastos este mes.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                            <LightbulbIcon sx={{ color: '#F39C12', fontSize: 16, mt: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ color: theme.palette.mode === 'dark' ? '#ccc' : 'text.secondary' }}>
                                Tu <Box component="span" fontWeight="bold" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>mejor día</Box> fue el <Box component="span" fontWeight="bold" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>04/01</Box> con <Box component="span" fontWeight="bold" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>{formatMoney(220000)}</Box> en ingresos.
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Actions */}
            <Stack direction="row" spacing={2}>
                <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => exportAsImage(dashboardRef, 'analisis-financiero')}
                >
                    Exportar Reporte
                </Button>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ShareIcon />}
                    onClick={async () => {
                        try {
                            if (navigator.share) {
                                await navigator.share({
                                    title: 'Reporte FinDriver',
                                    text: `Mis finanzas este mes: Ingresos ${formatMoney(stats.mes.ingresos)} - Gastos ${formatMoney(stats.mes.gastos)}`,
                                    url: window.location.href
                                });
                            } else {
                                await navigator.clipboard.writeText(`Reporte FinDriver: Ingresos ${formatMoney(stats.mes.ingresos)}`);
                                alert('Resumen copiado al portapapeles');
                            }
                        } catch (error) {
                            console.error('Error sharing:', error);
                        }
                    }}
                >
                    Compartir
                </Button>
            </Stack>
        </Box>
    );
}
