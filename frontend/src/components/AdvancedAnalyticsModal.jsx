import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Paper,
    Box,
    Divider
} from '@mui/material';
import {
    Speed as SpeedIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    DirectionsCar as CarIcon
} from '@mui/icons-material';
import { useAdvancedCalculations } from '../hooks/useAdvancedCalculations';
import { formatMoney } from '../utils/formatters';

export default function AdvancedAnalyticsModal({ open, onClose }) {
    const metrics = useAdvancedCalculations();

    const StatItem = ({ icon, label, value, subtext, color }) => (
        <Paper elevation={0} sx={{ p: 2, bgcolor: `${color}10`, borderRadius: 2, border: `1px solid ${color}30` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ color: color, mr: 1, display: 'flex' }}>{icon}</Box>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                    {label}
                </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
                {value}
            </Typography>
            {subtext && (
                <Typography variant="caption" color="text.secondary">
                    {subtext}
                </Typography>
            )}
        </Paper>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" /> Análisis Avanzado (Hoy)
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    {/* CPK Real */}
                    <Grid item xs={12}>
                        <StatItem
                            icon={<SpeedIcon />}
                            label="CPK Promedio (30 días)"
                            value={formatMoney(metrics.cpkReal)}
                            subtext={`Incluye $${formatMoney(metrics.dailyFixedCost)} de costos fijos diarios`}
                            color="#E74C3C"
                        />
                    </Grid>

                    {/* Rentabilidad por Km */}
                    <Grid item xs={6}>
                        <StatItem
                            icon={<MoneyIcon />}
                            label="Ingreso/Km (Hoy)"
                            value={formatMoney(metrics.ingresoPorKm)}
                            color="#2ECC71"
                        />
                    </Grid>

                    {/* Ganancia Neta Hoy */}
                    <Grid item xs={6}>
                        <StatItem
                            icon={<TrendingUpIcon />}
                            label="Ganancia Neta"
                            value={formatMoney(metrics.gananciaNetaHoy)}
                            subtext="Ingresos - (Fijos + Variables)"
                            color="#3498DB"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>
                            Desglose de Plataformas
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {Object.entries(metrics.byPlatform).map(([plat, amount]) => (
                                amount > 0 && (
                                    <Box key={plat} sx={{ p: 1, border: '1px solid #eee', borderRadius: 1, flex: 1, textAlign: 'center' }}>
                                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{plat}</Typography>
                                        <Typography variant="body1" fontWeight="bold">{formatMoney(amount)}</Typography>
                                    </Box>
                                )
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" fullWidth>Cerrar Análisis</Button>
            </DialogActions>
        </Dialog>
    );
}
