import React, { useState, useEffect } from 'react';
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
import { chartStyles } from '../styles/chartStyles';
import { formatMoney } from '../utils/formatters';

export default function RealTimeChart() {
    const [data, setData] = useState([]);
    const [currentValue, setCurrentValue] = useState(0);
    const [trend, setTrend] = useState('up');
    const [pulse, setPulse] = useState(false);

    // Initial Data
    useEffect(() => {
        const initialData = Array.from({ length: 20 }, (_, i) => ({
            name: new Date(Date.now() - (19 - i) * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: Math.random() * 20000 + 10000
        }));
        setData(initialData);
        setCurrentValue(initialData[initialData.length - 1].value);
    }, []);

    // Simulate Real-Time Updates
    useEffect(() => {
        const interval = setInterval(() => {
            const newValue = Math.random() * 20000 + 10000; // Simulated values in COP (10k-30k)
            const newDataPoint = {
                name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: newValue
            };

            setData(prev => {
                const updated = [...prev.slice(1), newDataPoint]; // Keep last 20 points
                return updated;
            });

            setCurrentValue(newValue);
            setTrend(newValue > (data[data.length - 1]?.value || 0) ? 'up' : 'down');

            // Trigger pulse animation
            setPulse(true);
            setTimeout(() => setPulse(false), 300);

        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, [data]);

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Ganancias en Tiempo Real</Typography>
                    <Chip label="DEMO / SIMULACIÓN" size="small" variant="outlined" color="primary" sx={{ mt: 0.5, fontSize: '0.7rem' }} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.main"
                        sx={{
                            transform: pulse ? 'scale(1.1)' : 'scale(1)',
                            transition: 'transform 0.2s ease-in-out'
                        }}
                    >
                        {formatMoney(currentValue)}
                    </Typography>
                    <Chip
                        icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${Math.abs(((currentValue - (data.length > 1 ? data[data.length - 2].value : currentValue)) / (currentValue || 1)) * 100).toFixed(1)}%`}
                        color={trend === 'up' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
            </Box>

            <Box sx={{ height: 250, width: '100%', mb: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRealTime" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartStyles.colors.primary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartStyles.colors.primary} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={chartStyles.tooltip} itemStyle={chartStyles.tooltipText} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartStyles.colors.primary}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRealTime)"
                            animationDuration={500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>

            <Grid container spacing={2} sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Mínimo</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">{formatMoney(Math.min(...data.map(d => d.value)))}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Máximo</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">{formatMoney(Math.max(...data.map(d => d.value)))}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Promedio</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">{formatMoney(data.reduce((sum, d) => sum + d.value, 0) / (data.length || 1))}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">{formatMoney(data.reduce((sum, d) => sum + d.value, 0))}</Typography>
                </Grid>
            </Grid>

            <Box sx={{ mt: 2, bgcolor: '#f7f0fe', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MagicIcon sx={{ color: '#9B59B6' }} />
                <Typography variant="body2">
                    Proyección hora siguiente: <strong>{formatMoney(currentValue * 1.05)}</strong> (+5%)
                </Typography>
            </Box>
        </Paper>
    );
}
