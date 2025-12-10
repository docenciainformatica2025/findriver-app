import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Collapse,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    CheckCircle as CheckIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export default function FixedCostsForm() {
    const { addTransaction } = useFinance();
    const [isOpen, setIsOpen] = useState(false);
    const [costs, setCosts] = useState({
        Seguro: 0,
        Impuestos: 0,
        Depreciación: 0,
        'Plan de Datos': 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCosts(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let count = 0;
        Object.entries(costs).forEach(([category, amount]) => {
            if (amount > 0) {
                addTransaction({
                    tipo: 'gasto',
                    monto: amount,
                    categoria: category,
                    descripcion: `Costo Fijo Mensual: ${category}`,
                    odómetro: 0,
                    fecha: new Date().toISOString()
                });
                count++;
            }
        });

        if (count > 0) {
            toast.success('Costos fijos registrados correctamente');
            setIsOpen(false);
            setCosts({
                Seguro: 0,
                Impuestos: 0,
                Depreciación: 0,
                'Plan de Datos': 0
            });
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, borderLeft: 6, borderColor: 'info.main', borderRadius: 2 }}>
            <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Box>
                    <Typography variant="h6" fontWeight="bold">Costos Fijos</Typography>
                    <Typography variant="body2" color="text.secondary">Registrar pagos mensuales (Seguro, Plan, etc.)</Typography>
                </Box>
                <IconButton color="info">
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={isOpen}>
                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                        {Object.keys(costs).map(key => (
                            <TextField
                                key={key}
                                label={key}
                                name={key}
                                type="number"
                                value={costs[key] || ''}
                                onChange={handleChange}
                                placeholder="0"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MoneyIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                    inputProps: { step: "1" }
                                }}
                            />
                        ))}
                    </Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="info"
                        startIcon={<CheckIcon />}
                        sx={{ mt: 3 }}
                    >
                        Confirmar Pagos
                    </Button>
                </form>
            </Collapse>
        </Paper>
    );
}
