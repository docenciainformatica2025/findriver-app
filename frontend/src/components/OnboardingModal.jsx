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
    Typography,
    InputAdornment
} from '@mui/material';
import {
    Speed as SpeedIcon,
    LocalGasStation as GasIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import { toast } from 'react-hot-toast';

export default function OnboardingModal() {
    const { user, refreshUser } = useAuth(); // Assuming refreshUser exists or I update user manually
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Intro, 2: Data
    const [fuelPrice, setFuelPrice] = useState('');
    const [odometer, setOdometer] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const hasFuelPrice = user.configuracion?.precioCombustible > 0;
            const hasVehicle = user.vehiculos && user.vehiculos.length > 0;
            // Strict check: Must have fuel price AND a vehicle with mileage set (or at least a vehicle record)
            // If the user is new, they might not have a vehicle record yet.

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
                    placa: `TEMPORAL-${Date.now()}`, // Unique placeholder to avoid validation errors
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
            if (window.location.reload) window.location.reload(); // Simple reload to refresh all context data
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
                        label="Precio Combustible (Galón/Litro)"
                        type="number"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        fullWidth
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
