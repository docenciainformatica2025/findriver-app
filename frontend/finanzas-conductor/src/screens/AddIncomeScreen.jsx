import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    Description as DescriptionIcon,
    Category as CategoryIcon,
    DirectionsCar as CarIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { validateKmInput } from '../utils/formatters';

export default function AddIncomeScreen() {
    const { addTransaction } = useFinance();
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('viaje');
    const [km, setKm] = useState('');

    // ... (rest of component until TextField)

    const registrarIngreso = (e) => {
        e.preventDefault();
        if (!monto) return;

        addTransaction({
            tipo: 'ingreso',
            monto: parseFloat(monto),
            categoría: categorias.find(c => c.value === categoria)?.label || categoria,
            descripción: descripcion,
            distanciaViaje: parseInt(km) || 0,
            fecha: new Date().toISOString()
        });

        setMonto('');
        setDescripcion('');
        setKm('');
        toast.success('Ingreso registrado correctamente');
    };

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Registrar Ingreso
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <form onSubmit={registrarIngreso}>
                    <TextField
                        select
                        fullWidth
                        label="Categoría"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        margin="normal"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CategoryIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    >
                        {categorias.map((option) => (
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
                        type="text"
                        value={km}
                        onChange={(e) => {
                            if (validateKmInput(e.target.value)) {
                                setKm(e.target.value);
                            }
                        }}
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
                </form>
            </Paper>
        </Box>
    );
}
