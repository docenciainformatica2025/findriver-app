import React, { useState, useRef } from 'react';
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
import { groupByPeriod, getSummaryStats, sampleData } from '../../utils/financeUtils';
import { chartStyles, categoryColors } from '../../styles/chartStyles';
import { formatCurrency } from '../../utils/formatters';

const handleChartTypeChange = (event, newType) => {
    if (newType !== null) setChartType(newType);
};

const renderStatsCard = (title, amount, subtitle, comparison, icon, color, bgColor) => (
    <Card sx={{ minWidth: 200, flex: 1, bgcolor: bgColor, borderLeft: `4px solid ${color}` }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                {icon}
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
                `$${formatCurrency(stats.mes.ingresos)}`,
                'Este mes',
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} /> vs semana anterior</Box>,
                <TrendingUpIcon sx={{ color: 'success.main' }} />,
                chartStyles.colors.success,
                '#f0f9f0'
            )}
            {renderStatsCard(
                'Gastos',
                `$${formatCurrency(stats.mes.gastos)}`,
                'Este mes',
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><TrendingDownIcon sx={{ color: 'success.main', fontSize: 16 }} /> vs semana anterior</Box>,
                <TrendingDownIcon sx={{ color: 'error.main' }} />,
                chartStyles.colors.danger,
                '#fef0f0'
            )}
            {renderStatsCard(
                'Ganancias',
                `$${formatCurrency(stats.mes.ganancias)}`,
                'Este mes',
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}><TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} /> vs semana anterior</Box>,
                <MoneyIcon sx={{ color: 'primary.main' }} />,
                chartStyles.colors.primary,
                '#f0f7fe'
            )}
            {renderStatsCard(
                'Viajes',
                data.filter(t => t.tipo === 'ingreso').length,
                'Total registrados',
                <span>Promedio: ${formatCurrency(stats.total.ingresos / (data.filter(t => t.tipo === 'ingreso').length || 1))}</span>,
                <CarIcon sx={{ color: 'info.main' }} />,
                chartStyles.colors.info,
                '#f7f0fe'
            )}
        </Stack>

        {/* Charts Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <ToggleButtonGroup
                    value={period}
                    exclusive
                    onChange={handlePeriodChange}
                    size="small"
                >
                    {['semana', 'mes', 'año'].map(p => (
                        <ToggleButton key={p} value={p} sx={{ textTransform: 'capitalize' }}>
                            {p}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    size="small"
                >
                    <ToggleButton value="ingresos_gastos">Ingresos/Gastos</ToggleButton>
                    <ToggleButton value="ganancias">Ganancias</ToggleButton>
                    <ToggleButton value="categorias">Categorías</ToggleButton>
                    <ToggleButton value="progreso">Progreso</ToggleButton>
                    <ToggleButton value="apilado">Apilado</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'ingresos_gastos' ? (
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={chartStyles.tooltip} itemStyle={chartStyles.tooltipText} cursor={{ fill: 'transparent' }} />
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={chartStyles.tooltip} itemStyle={chartStyles.tooltipText} />
                            <Area type="monotone" dataKey="ganancias" stroke={chartStyles.colors.primary} fillOpacity={1} fill="url(#colorGanancias)" name="Ganancias" />
                            <Brush dataKey="name" height={30} stroke={chartStyles.colors.primary} />
                        </AreaChart>
                    ) : chartType === 'categorias' ? (
                        <Grid container spacing={2} sx={{ height: '100%' }}>
                            <Grid item xs={6} sx={{ textAlign: 'center', height: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Gastos</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {expenseCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'center', height: '100%' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Ingresos</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <PieChart>
                                        <Pie data={incomeCategories} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {incomeCategories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Grid>
                        </Grid>
                    ) : chartType === 'progreso' ? (
                        <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={progressData}>
                            <RadialBar minAngle={15} label={{ position: 'insideStart', fill: '#fff' }} background clockWise dataKey="value" />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: '50%', right: 0, transform: 'translate(0, -50%)' }} />
                            <Tooltip />
                        </RadialBarChart>
                    ) : (
                        <BarChart data={stackedData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={chartStyles.tooltip} itemStyle={chartStyles.tooltipText} cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar dataKey="Viajes" stackId="a" fill={chartStyles.colors.success} />
                            <Bar dataKey="Encomiendas" stackId="a" fill={chartStyles.colors.primary} />
                            <Bar dataKey="Apps" stackId="a" fill={chartStyles.colors.info} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </Box>
        </Paper>

        {/* Trends Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Tendencias</Typography>
            <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <TrendingUpIcon color="success" />
                    <Typography variant="body2">Ingresos aumentaron <strong>15%</strong> vs semana pasada</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <TrendingDownIcon color="error" />
                    <Typography variant="body2">Gastos de gasolina disminuyeron <strong>8%</strong></Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <TrendingUpIcon color="primary" />
                    <Typography variant="body2">Ganancias netas: <strong>+22%</strong> este mes</Typography>
                </Box>
            </Stack>
        </Paper>

        {/* Insights Card */}
        <Card sx={{ mb: 3, bgcolor: '#fff9e6', borderLeft: '4px solid #F39C12' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LightbulbIcon sx={{ color: '#F39C12' }} /> Insights del Mes
                </Typography>
                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                        <LightbulbIcon sx={{ color: '#F39C12', fontSize: 16, mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            <Box component="span" fontWeight="bold" color="text.primary">Gasolina</Box> representa el <Box component="span" fontWeight="bold" color="text.primary">{((95 / (stats.mes.gastos || 1)) * 100).toFixed(0)}%</Box> de tus gastos este mes.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }}>
                        <LightbulbIcon sx={{ color: '#F39C12', fontSize: 16, mt: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                            Tu <Box component="span" fontWeight="bold" color="text.primary">mejor día</Box> fue el <Box component="span" fontWeight="bold" color="text.primary">04/01</Box> con <Box component="span" fontWeight="bold" color="text.primary">$220</Box> en ingresos.
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
            >
                Compartir
            </Button>
        </Stack>
    </Box>
);
}
