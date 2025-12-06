import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    Divider,
    Alert
} from '@mui/material';
import {
    LocalGasStation as GasIcon,
    Speed as SpeedIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { validateKmInput } from '../../utils/formatters';

export default function VehicleSettingsScreen() {
    const [vehicleSettings, setVehicleSettings] = useState({
        fuelEfficiency: 12, // km/l
        fuelPrice: 22.5, // per liter/gallon
        fuelType: 'Gasolina'
    });

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('vehicleSettings');
        if (savedSettings) {
            setVehicleSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehicleSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('vehicleSettings', JSON.stringify(vehicleSettings));
        toast.success('Configuración guardada correctamente');
    };

    return (
        <Box maxWidth="md" mx="auto">
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Configuración del Vehículo
            </Typography>

            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Estos valores se utilizarán para calcular automáticamente tus costos estimados por kilómetro.
                </Alert>

                <Box component="form" noValidate autoComplete="off">
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                        Eficiencia y Consumo
                    </Typography>

                    <TextField
                        fullWidth
                        label="Rendimiento Promedio (km/l)"
                        name="fuelEfficiency"
                        type="text"
                        value={vehicleSettings.fuelEfficiency}
                        onChange={(e) => {
                            if (validateKmInput(e.target.value)) {
                                handleChange(e);
                            }
                        }}
                        margin="normal"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SpeedIcon color="primary" /></InputAdornment>,
                            endAdornment: <InputAdornment position="end">km/l</InputAdornment>
                        }}
                        helperText="Kilómetros que recorre tu vehículo por cada litro de combustible."
                    />

                    <TextField
                        fullWidth
                        label="Precio Promedio Combustible"
                        name="fuelPrice"
                        type="number"
                        value={vehicleSettings.fuelPrice}
                        onChange={handleChange}
                        margin="normal"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><GasIcon color="error" /></InputAdornment>,
                            endAdornment: <InputAdornment position="end">$</InputAdornment>
                        }}
                        helperText="Precio estimado por litro/galón para cálculos rápidos."
                    />

                    <Divider sx={{ my: 3 }} />

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        fullWidth
                    >
                        Guardar Configuración
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
