import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    InputAdornment
} from '@mui/material';
import {
    LocalGasStation as FuelIcon,
    Speed as SpeedIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import client from '../api/client';
import { toast } from 'react-hot-toast';

export default function OnboardingModal({ open, onClose }) {
    const { user, updateProfile } = useAuth();
    const [fuelPrice, setFuelPrice] = useState('');
    const [odometer, setOdometer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update Profile Config (Fuel Price)
            const profileUpdates = {
                configuracion: {
                    ...user.configuracion,
                    precioCombustible: parseFloat(fuelPrice)
                }
            };
            await updateProfile(profileUpdates);

            // 2. Update Vehicle Stats (Odometer)
            if (user.vehiculos && user.vehiculos.length > 0) {
                const vehicle = user.vehiculos.find(v => v.principal) || user.vehiculos[0];
                await client.put(`/vehicles/${vehicle._id}`, {
                    estadisticas: {
                        ...vehicle.estadisticas,
                        kilometrajeActual: parseFloat(odometer)
                    }
                });
            }

            toast.success('Configuración inicial guardada');
            onClose();
        } catch (error) {
            console.error("Error onboarding:", error);
            toast.error('Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => { }} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                🚀 Configuración Rápida
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" align="center" paragraph>
                    Para darte estadísticas precisas, necesitamos dos datos clave:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <TextField
                        label="Precio Combustible (Galón/Litro)"
                        type="number"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><FuelIcon /></InputAdornment>
                        }}
                        helperText="Precio actual en tu estación de servicio"
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
