import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    MenuItem,
    Grid,
    InputAdornment,
    Divider
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    AccessTime as TimeIcon,
    AttachMoney as MoneyIcon,
    Note as NoteIcon,
    Place as PlaceIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useFinance } from '../../contexts/FinanceContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { validateKmInput } from '../../utils/formatters';

export default function NewTripScreen() {
    const { addTransaction } = useFinance();
    const navigate = useNavigate();

    const [tripData, setTripData] = useState({
        platform: 'Uber',
        distance: '',
        duration: '',
        earnings: '',
        startLocation: '',
        endLocation: '',
        notes: ''
    });

    const platforms = ['Uber', 'DiDi', 'inDrive', 'Particular', 'Otro'];

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Enforce integer for distance
        if (name === 'distance') {
            if (validateKmInput(value)) {
                setTripData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        setTripData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!tripData.earnings || !tripData.distance) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        addTransaction({
            tipo: 'ingreso',
            monto: parseFloat(tripData.earnings),
            categoría: tripData.platform,
            descripción: `Viaje: ${tripData.startLocation || 'Origen'} -> ${tripData.endLocation || 'Destino'}`,
            distanciaViaje: parseInt(tripData.distance) || 0,
            duracionMinutos: parseInt(tripData.duration) || 0,
            notas: tripData.notes,
            fecha: new Date().toISOString(),
            isDetailedTrip: true
        });

        toast.success('Viaje registrado exitosamente');
        navigate('/trips/history');
    };

    return (
        <Box maxWidth="md" sx={{ mx: 'auto' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Registrar Nuevo Viaje
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Plataforma"
                                name="platform"
                                value={tripData.platform}
                                onChange={handleChange}
                            >
                                {platforms.map(p => (
                                    <MenuItem key={p} value={p}>{p}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Ganancia del Viaje"
                                name="earnings"
                                type="number"
                                value={tripData.earnings}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><MoneyIcon color="success" /></InputAdornment>
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Distancia (km)"
                                name="distance"
                                value={tripData.distance}
                                onChange={handleChange}
                                placeholder="Solo enteros"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><CarIcon color="primary" /></InputAdornment>,
                                    endAdornment: <InputAdornment position="end">km</InputAdornment>
                                }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Duración (min)"
                                name="duration"
                                type="number"
                                value={tripData.duration}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><TimeIcon color="action" /></InputAdornment>,
                                    endAdornment: <InputAdornment position="end">min</InputAdornment>
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }}>Ubicación (Opcional)</Divider>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Origen"
                                name="startLocation"
                                value={tripData.startLocation}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PlaceIcon color="action" /></InputAdornment>
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Destino"
                                name="endLocation"
                                value={tripData.endLocation}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PlaceIcon color="error" /></InputAdornment>
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Notas adicionales"
                                name="notes"
                                value={tripData.notes}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><NoteIcon color="action" /></InputAdornment>
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                startIcon={<SaveIcon />}
                                sx={{ mt: 2 }}
                            >
                                Guardar Viaje
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
}
