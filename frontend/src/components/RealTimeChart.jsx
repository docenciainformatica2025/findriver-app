import React, { useState, useEffect, useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AutoAwesome as MagicIcon
} from '@mui/icons-material';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Chip
} from '@mui/material';
import { useFinance } from '../contexts/FinanceContext';
import { chartStyles } from '../styles/chartStyles';
import { formatMoney } from '../utils/formatters';
import moment from 'moment';

export default function RealTimeChart() {
    const { transactions } = useFinance();
    const [data, setData] = useState([]);
    const [currentTotal, setCurrentTotal] = useState(0);

    // Process real data for the chart (Today's performance)
    useEffect(() => {
        const today = moment().startOf('day');
        const todaysTransactions = transactions
            .filter(t => t.tipo === 'ingreso' && moment(t.fecha).isSame(today, 'day'))
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        if (todaysTransactions.length === 0) {
            // Placeholder for empty state
            setData([{ name: '00:00', value: 0 }, { name: moment().format('HH:mm'), value: 0 }]);
            setCurrentTotal(0);
            return;
        }

        let cumulative = 0;
        const chartData = todaysTransactions.map(t => {
            cumulative += parseFloat(t.monto);
            return {
                name: moment(t.fecha).format('HH:mm'),
                value: cumulative,
                originalMonto: t.monto,
                descripcion: t.descripcion
            };
        });

        // Add start of day point if needed
        if (chartData.length > 0) {
            chartData.unshift({ name: 'Inicio', value: 0 });
        }

        setData(chartData);
        setCurrentTotal(cumulative);
    }, [transactions]);

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Ingresos de Hoy</Typography>
                    {data.length <= 2 && currentTotal === 0 && (
                        <Chip label="Sin actividad hoy" size="small" variant="outlined" color="default" sx={{ mt: 0.5, fontSize: '0.7rem' }} />
                    )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.main"
                    >
                        {formatMoney(currentTotal)}
                    </Typography>
                    <Chip
                        icon={<TrendingUpIcon />}
                        label="Acumulado Hoy"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
            </Box>

            <Box sx={{ height: 250, width: '100%', mb: 3 }}>
                <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRealTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartStyles.colors.primary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartStyles.colors.primary} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} width={80} tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip
                            formatter={(value) => formatMoney(value)}
                            labelStyle={{ color: '#000' }}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartStyles.colors.primary}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRealTime)"
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            <Grid container spacing={2} sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Promedio por Viaje</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {data.length > 1
                            ? formatMoney(currentTotal / (data.length - 1))
                            : formatMoney(0)}
                    </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total Viajes</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {Math.max(0, data.length - 1)}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
}
