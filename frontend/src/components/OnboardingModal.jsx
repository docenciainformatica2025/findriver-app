import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField,
    Box,
    InputAdornment
} from '@mui/material';
import {
    Speed as SpeedIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import { toast } from 'react-hot-toast';

export default function OnboardingModal() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [fuelPrice, setFuelPrice] = useState('');
    const [odometer, setOdometer] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const hasFuelPrice = user.configuracion?.precioCombustible > 0;
            const hasVehicle = user.vehiculos && user.vehiculos.length > 0;

            // Show modal if critical data is missing
            if (!hasFuelPrice || !hasVehicle) {
                setOpen(true);
            }
        }
    }, [user]);

    const handleSave = async () => {
        if (!fuelPrice || !odometer) return;
        setLoading(true);

        try {
            // 1. Update User Config (Fuel Price)
            await client.put('/users/config', {
                configuracion: {
                    ...user.configuracion,
                    precioCombustible: parseFloat(fuelPrice)
                }
            });

            // 2. Update or Create Vehicle (Odometer)
            if (user.vehiculos && user.vehiculos.length > 0) {
                // Update principal vehicle
                const vehicle = user.vehiculos.find(v => v.principal) || user.vehiculos[0];
                await client.put(`/vehicles/${vehicle._id}`, {
                    estadisticas: {
                        ...vehicle.estadisticas,
                        kilometrajeActual: parseFloat(odometer)
                    }
                });
            } else {
                // Create new vehicle
                await client.post('/vehicles', {
                    marca: 'Mi Vehículo',
                    modelo: 'General',
                    año: new Date().getFullYear(),
                    placa: `TEMPORAL-${Date.now()}`,
                    tipo: user.tipoVehiculo || 'auto',
                    principal: true,
                    estadisticas: {
                        kilometrajeActual: parseFloat(odometer),
                        kilometrajeTotal: parseFloat(odometer)
                    }
                });
            }

            toast.success('¡Configuración completada!');
            setOpen(false);
            // Simple reload to ensure all contexts (Auth, Vehicle) refresh with new data
            window.location.reload();
        } catch (error) {
            console.error(error);
            toast.error(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog
            open={open}
            disableEscapeKeyDown
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pt: 4 }}>
                🚀 ¡Bienvenido a FinDriver!
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ textAlign: 'center', mb: 4 }}>
                    Para comenzar a maximizar tus ganancias, necesitamos 2 datos clave.
                </DialogContentText>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField
                        label="Precio Gasolina/Combustible"
                        type="number"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        helperText="Precio por galón o unidad de medida"
                    />

                    <TextField
                        label="Kilometraje Actual (Odómetro)"
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SpeedIcon /></InputAdornment>
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ pb: 4, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={!fuelPrice || !odometer || loading}
                    sx={{ minWidth: 200, borderRadius: 50 }}
                >
                    {loading ? 'Guardando...' : 'Comenzar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
