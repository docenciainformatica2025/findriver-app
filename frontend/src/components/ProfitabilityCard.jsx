import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Grid, LinearProgress, Divider } from '@mui/material';
import { TrendingUp, TrendingDown, LocalGasStation, Speed } from '@mui/icons-material';
import client from '../api/client';
import { formatMoney, formatPercent, formatKm } from '../utils/formatters';

export default function ProfitabilityCard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await client.get('/stats/cpk');
                setStats(data.data.summary);
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return null;

    const MetricRow = ({ label, value, color = 'text.primary', bold = false }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" color={color} fontWeight={bold ? 'bold' : 'normal'}>
                {value}
            </Typography>
        </Box>
    );

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Rentabilidad Real
            </Typography>

            <Box sx={{ my: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ganancia Neta (Utilidad)
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                    {formatMoney(stats.utilidad)}
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <MetricRow
                label="Eficiencia de Kilometraje"
                value={formatPercent(stats.eficienciaKm / 100)}
                bold
            />
            <LinearProgress
                variant="determinate"
                value={stats.eficienciaKm}
                color={stats.eficienciaKm > 70 ? "success" : "warning"}
                sx={{ mb: 2, height: 6, borderRadius: 3 }}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Speed fontSize="small" color="action" sx={{ mr: 1 }} />
                            <Typography variant="caption">Km Muertos</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold">
                            {formatKm(stats.kmMuertos)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TrendingDown fontSize="small" color="error" sx={{ mr: 1 }} />
                            <Typography variant="caption">Costo / Km</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold" color="error.main">
                            {formatMoney(stats.cpk)}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
