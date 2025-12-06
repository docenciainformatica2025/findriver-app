import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line
} from 'recharts';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import client from '../api/client';
import { formatMoney } from '../utils/formatters';

export default function CpkChart() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await client.get('/stats/cpk');
                setData(data.data);
            } catch (error) {
                console.error("Error fetching chart data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (!data || !data.history) return null;

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Tendencia de Costos e Ingresos</Typography>
                <Typography variant="body2" color="text.secondary">
                    CPK Real Promedio: <b>{formatMoney(data.summary.cpk)}/km</b>
                </Typography>
            </Box>

            <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data.history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tickFormatter={(val) => `$${val / 1000}k`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value) => formatMoney(value)}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#2ecc71" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="gastos" name="Gastos" fill="#e74c3c" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
