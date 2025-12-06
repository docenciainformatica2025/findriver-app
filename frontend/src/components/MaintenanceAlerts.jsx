import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Chip, LinearProgress, Button } from '@mui/material';
import { HealthAndSafety, Build, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import client from '../api/client';
import { formatKm } from '../utils/formatters';

export default function MaintenanceAlerts() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        try {
            const { data } = await client.get('/vehicles/health');
            setHealth(data.data);
        } catch (error) {
            console.error("Error fetching vehicle health", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, []);

    if (loading) return null;
    if (!health) return null;

    const getSeverityColor = (priority) => {
        switch (priority) {
            case 'alta': return 'error';
            case 'media': return 'warning';
            default: return 'info';
        }
    };

    const hasAlerts = health.alertas && health.alertas.length > 0;

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                borderLeft: hasAlerts ? '6px solid #e74c3c' : '6px solid #2ecc71'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HealthAndSafety color={hasAlerts ? "error" : "success"} sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                    Salud del Vehículo
                </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
                {health.vehicleName}
            </Typography>

            <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Odómetro Actual</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatKm(health.kilometraje)}</Typography>
                </Box>
                {health.kmProximoServicio && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Próx. Servicio</Typography>
                            <Typography variant="body2" color="text.secondary">{formatKm(health.kmProximoServicio)}</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(((health.kilometraje / health.kmProximoServicio) * 100), 100)}
                            color={health.alertas.some(a => a.tipo === 'kilometraje') ? "error" : "primary"}
                            sx={{ borderRadius: 2, height: 6 }}
                        />
                    </>
                )}
            </Box>

            <Box sx={{ mt: 3 }}>
                {!hasAlerts ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                        <CheckCircle sx={{ mr: 1 }} />
                        <Typography variant="body2" fontWeight="500">Todo en orden. ¡Excelentes condiciones!</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {health.alertas.map((alerta, index) => (
                            <Chip
                                key={index}
                                icon={alerta.prioridad === 'alta' ? <ErrorIcon /> : <Warning />}
                                label={alerta.mensaje}
                                color={getSeverityColor(alerta.prioridad)}
                                variant={alerta.prioridad === 'alta' ? "filled" : "outlined"}
                                size="small"
                                sx={{ justifyContent: 'flex-start' }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
