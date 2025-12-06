import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
    Box,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Button,
    Typography,
    Chip,
    Card,
    CardContent
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    Stop as StopIcon,
    AccessTime as TimeIcon,
    Speed as SpeedIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { formatKm } from '../utils/formatters';

export default function ShiftManager() {
    const [currentShift, setCurrentShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [odometer, setOdometer] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);

    const fetchShift = async () => {
        try {
            const { data } = await client.get('/shifts/current');
            setCurrentShift(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShift();
    }, []);

    const handleAction = async () => {
        if (!odometer) return toast.error('Ingresa el odómetro');

        setLoadingAction(true);
        try {
            if (currentShift) {
                // Cerrar jornada
                await client.post('/shifts/end', { odometro: parseFloat(odometer) });
                toast.success('Jornada finalizada. ¡Buen descanso!');
                setCurrentShift(null);
            } else {
                // Iniciar jornada
                const { data } = await client.post('/shifts/start', { odometro: parseFloat(odometer) });
                toast.success('¡Jornada iniciada! Buenas rutas.');
                setCurrentShift(data.data);
            }
            setDialogOpen(false);
            setOdometer('');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Error en la acción');
        } finally {
            setLoadingAction(false);
        }
    };

    if (loading) return null;

    return (
        <>
            {/* FAB para controlar jornada */}
            <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
                <Fab
                    color={currentShift ? "secondary" : "primary"}
                    variant="extended"
                    onClick={() => setDialogOpen(true)}
                >
                    {currentShift ? <StopIcon sx={{ mr: 1 }} /> : <StartIcon sx={{ mr: 1 }} />}
                    {currentShift ? "Terminar Jornada" : "Iniciar Jornada"}
                </Fab>
            </Box>

            {/* Info Card si hay jornada activa */}
            {currentShift && (
                <Card sx={{ mb: 2, bgcolor: 'primary.soft', border: 1, borderColor: 'primary.main' }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon color="primary" sx={{ mr: 1 }} />
                            <Box>
                                <Typography variant="subtitle2" fontWeight="bold">Jornada Activa</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Inicio: {new Date(currentShift.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            icon={<SpeedIcon />}
                            label={`Inicio: ${formatKm(currentShift.odometroInicial)}`}
                            size="small"
                            color="default"
                            variant="outlined"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Dialogo */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>
                    {currentShift ? "Finalizar Jornada" : "Iniciar Jornada"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {currentShift
                            ? "Ingresa el kilometraje final para calcular tu eficiencia y kilómetros muertos."
                            : "Ingresa el kilometraje actual para comenzar a trackear tu día."}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Odómetro Actual"
                        type="number"
                        fullWidth
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        InputProps={{
                            endAdornment: <Typography variant="caption">km</Typography>,
                            inputProps: { step: 0.1 }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={handleAction}
                        variant="contained"
                        color={currentShift ? "error" : "primary"}
                        disabled={loadingAction}
                    >
                        {loadingAction ? "Procesando..." : (currentShift ? "Finalizar" : "Iniciar")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
