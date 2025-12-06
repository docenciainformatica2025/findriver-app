import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
    Box,
    TextField,
    Button,
    Typography,
    MenuItem,
    InputAdornment,
    Paper
} from '@mui/material';
import {
    LocalGasStation as GasIcon,
    Build as MaintenanceIcon,
    DirectionsCar as TollIcon,
    MoreHoriz as OtherIcon,
    AttachMoney as MoneyIcon,
    Speed as SpeedIcon,
    Description as DescriptionIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

import { validateKmInput } from '../utils/formatters';

export default function VariableCostsForm() {
    const { addTransaction } = useFinance();
    const [category, setCategory] = useState('Combustible');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [km, setKm] = useState('');

    // ... (rest of component until TextField)

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;

        const transaction = {
            tipo: 'gasto',
            monto: parseFloat(amount),
            categoría: category,
            descripción: description,
            odómetro: parseInt(km) || 0,
            fecha: new Date().toISOString()
        };

        if (category === 'Combustible' && fuelPrice) {
            transaction.precioGalon = parseFloat(fuelPrice);
            transaction.galones = parseFloat(amount) / parseFloat(fuelPrice);
        }

        addTransaction(transaction);

        setAmount('');
        setDescription('');
        setKm('');
        setFuelPrice('');
        toast.success('Gasto registrado correctamente');
    };

    const getIcon = (cat) => {
        switch (cat) {
            case 'Combustible': return <GasIcon color="action" />;
            case 'Mantenimiento': return <MaintenanceIcon color="action" />;
            case 'Peaje': return <TollIcon color="action" />;
            default: return <OtherIcon color="action" />;
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Registrar Gasto Variable
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    select
                    fullWidth
                    label="Categoría"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    margin="normal"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {getIcon(category)}
                            </InputAdornment>
                        ),
                    }}
                >
                    <MenuItem value="Combustible">Combustible</MenuItem>
                    <MenuItem value="Mantenimiento">Mantenimiento</MenuItem>
                    <MenuItem value="Peaje">Peaje/Estacionamiento</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                </TextField>

                {category === 'Combustible' && (
                    <TextField
                        fullWidth
                        label="Precio por Galón"
                        type="number"
                        value={fuelPrice}
                        onChange={(e) => setFuelPrice(e.target.value)}
                        margin="normal"
                        placeholder="0.00"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MoneyIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}

                <TextField
                    fullWidth
                    label="Monto"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    margin="normal"
                    placeholder="0.00"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MoneyIcon color="error" />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Km Actual"
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
                                    <SpeedIcon color="warning" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Descripción"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        margin="normal"
                        placeholder="Opcional"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <DescriptionIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="error"
                    size="large"
                    startIcon={<CheckIcon />}
                    disabled={!amount}
                    sx={{ mt: 3 }}
                >
                    Registrar Gasto
                </Button>
            </form>
        </Paper>
    );
}
