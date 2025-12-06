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
import { formatCurrency } from '../../utils/formatters';

// ... (inside component)

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Ganancias en Tiempo Real</Typography>
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
                        ${formatCurrency(currentValue)}
                    </Typography>
                    <Chip
                        icon={trend === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={`${Math.abs(((currentValue - (data[data.length - 2]?.value || currentValue)) / currentValue) * 100).toFixed(1)}%`}
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
                    <Typography variant="subtitle2" fontWeight="bold">${formatCurrency(Math.min(...data.map(d => d.value)))}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Máximo</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">${formatCurrency(Math.max(...data.map(d => d.value)))}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Promedio</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">${formatCurrency(data.reduce((sum, d) => sum + d.value, 0) / (data.length || 1))}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                    <Typography variant="subtitle2" fontWeight="bold">${formatCurrency(data.reduce((sum, d) => sum + d.value, 0))}</Typography>
                </Grid>
            </Grid>

            <Box sx={{ mt: 2, bgcolor: '#f7f0fe', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MagicIcon sx={{ color: '#9B59B6' }} />
                <Typography variant="body2">
                    Proyección hora siguiente: <strong>${formatCurrency(currentValue * 1.05)}</strong> (+5%)
                </Typography>
            </Box>
        </Paper >
    );
}
