import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    MenuItem,
    MenuItem,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    Description as DescriptionIcon,
    Category as CategoryIcon,
    DirectionsCar as CarIcon,
    CheckCircle as CheckIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AddIncomeScreen() {
    const navigate = useNavigate();
    const { addTransaction } = useFinance();
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [plataforma, setPlataforma] = useState('uber'); // Default to Uber
    const [km, setKm] = useState('');

    const plataformas = [
        { label: 'Uber', value: 'uber' },
        { label: 'Didi', value: 'didi' },
        { label: 'InDrive', value: 'indrive' },
        { label: 'Particular', value: 'particular' }
    ];

    const registrarIngreso = (e) => {
        e.preventDefault();
        if (!monto) return;

        addTransaction({
            tipo: 'ingreso',
            monto: parseFloat(monto),
            categoría: 'Viaje', // Simplified for income
            plataforma: plataforma,
            descripción: descripcion || `Viaje ${plataforma}`,
            kmRecorridos: parseFloat(km) || 0,
            fecha: new Date().toISOString()
        });

        setMonto('');
        setDescripcion('');
        setKm('');
        toast.success('Ingreso registrado correctamente');
    };

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            import {useNavigate} from 'react-router-dom';
            import {
                ArrowBack as ArrowBackIcon,
                AttachMoney as MoneyIcon,
// ... existing imports ...

export default function AddIncomeScreen() {
    const navigate = useNavigate();
            const {addTransaction} = useFinance();
            // ... existing hooks ...
                            fullWidth
                            label="Plataforma"
                            value={plataforma}
                            onChange={(e) => setPlataforma(e.target.value)}
                            margin="normal"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CarIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {plataformas.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Monto"
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            margin="normal"
                            placeholder="0.00"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MoneyIcon color="success" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Descripción"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            margin="normal"
                            placeholder="Opcional (ej. Viaje al aeropuerto)"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <DescriptionIcon color="secondary" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Kilómetros (Opcional)"
                            type="number"
                            value={km}
                            onChange={(e) => setKm(e.target.value)}
                            margin="normal"
                            placeholder="0"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CarIcon color="warning" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            startIcon={<CheckIcon />}
                            disabled={!monto}
                            sx={{ mt: 3 }}
                        >
                            Registrar Ingreso
                        </Button>
                    </form >
                </Paper >
            </Box >
            );
}
