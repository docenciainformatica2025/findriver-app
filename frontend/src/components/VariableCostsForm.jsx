import React, { useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';
import {
    Box,
    TextField,
    Button,
    Typography,
    MenuItem,
    InputAdornment,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
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
import { formatMoney } from '../utils/formatters';

export default function VariableCostsForm() {
    const { addTransaction } = useFinance();
    const { user } = useAuth();

    // Form States
    const [category, setCategory] = useState('Combustible');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [km, setKm] = useState('');

    // Fuel Logic States
    const [fuelPrice, setFuelPrice] = useState(0);
    const [showPriceConfig, setShowPriceConfig] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [tempPrice, setTempPrice] = useState('');

    useEffect(() => {
        if (user?.configuracion?.precioCombustible) {
            setFuelPrice(user.configuracion.precioCombustible);
        }
    }, [user]);

    const handleCategoryChange = (e) => {
        const newCat = e.target.value;
        setCategory(newCat);
        if (newCat === 'Combustible' && (!fuelPrice || fuelPrice === 0)) {
            setShowPriceConfig(true);
        }
    };

    const updateFuelPrice = async (newPrice) => {
        try {
            const price = parseFloat(newPrice);
            if (!price || price <= 0) return toast.error('Precio inválido');

            // Actualizar config usuario
            await client.put('/users/config', {
                configuracion: {
                    ...user.configuracion,
                    precioCombustible: price
                }
            });

            setFuelPrice(price);
            setShowPriceConfig(false);

            // Si venía de confirmar, procedemos a enviar
            if (showConfirmDialog) {
                setShowConfirmDialog(false);
                submitTransaction(price);
            } else {
                toast.success('Precio del combustible actualizado');
            }
        } catch (error) {
            console.error(error);
            toast.error(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount) return;

        if (category === 'Combustible') {
            setShowConfirmDialog(true);
        } else {
            submitTransaction();
        }
    };



    const submitTransaction = async (currentFuelPrice = fuelPrice) => {
        // VALIDACIÓN DE KILOMETRAJE
        if (km && user?.vehiculos?.length > 0) {
            // Buscar vehículo principal o el primero
            const vehicle = user.vehiculos.find(v => v.principal) || user.vehiculos[0];
            const currentKm = vehicle?.estadisticas?.kilometrajeActual || 0;
            const newKm = parseFloat(km);

            if (newKm < currentKm) {
                return toast.error(`El kilometraje no puede ser menor al actual (${currentKm} km)`);
            }
        }

        const transactionData = {
            tipo: 'gasto',
            monto: parseFloat(amount),
            categoria: category, // Note: Backend uses 'categoria' not 'categoría'
            descripcion: description || (category === 'Combustible' ? `Tanqueo a ${formatMoney(currentFuelPrice)}/gl` : category),
            fecha: new Date().toISOString()
        };

        if (category === 'Combustible') {
            // Calcular litros
            const litros = parseFloat(amount) / currentFuelPrice;
            transactionData.gasto = {
                litros: parseFloat(litros.toFixed(2)),
                precioLitro: currentFuelPrice,
                odometro: parseFloat(km) || 0
            };
        } else if (km) {
            transactionData.gasto = {
                odometro: parseFloat(km)
            };
        }

        const result = await addTransaction(transactionData);

        if (result.success) {
            setAmount('');
            setDescription('');
            setKm('');
            toast.success('Gasto registrado correctamente');
        } else {
            toast.error(result.error || 'Error al registrar');
        }
        setShowConfirmDialog(false);
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
                    onChange={handleCategoryChange}
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

                <TextField
                    fullWidth
                    label="Monto"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    margin="normal"
                    placeholder="0"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MoneyIcon color="error" />
                            </InputAdornment>
                        ),
                        inputProps: { step: "1" } // Enteros
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Km Actual"
                        type="number"
                        value={km}
                        onChange={(e) => setKm(e.target.value)}
                        margin="normal"
                        placeholder="0.0"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SpeedIcon color="warning" />
                                </InputAdornment>
                            ),
                            inputProps: { step: "0.1" } // 1 Decimal
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

            {/* Dialogo Configurar Precio */}
            <Dialog open={showPriceConfig} onClose={() => setShowPriceConfig(false)}>
                <DialogTitle>Configurar Precio Combustible</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Para cálculos exactos, necesitamos el precio por Galón/Litro.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Precio"
                        type="number"
                        fullWidth
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPriceConfig(false)}>Cancelar</Button>
                    <Button onClick={() => updateFuelPrice(tempPrice)}>Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialogo Confirmar Precio al Tanquear */}
            <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
                <DialogTitle>¿Precio del Combustible?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        El precio registrado es <b>{formatMoney(fuelPrice)}</b>.
                        ¿Se mantiene o cambió?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowPriceConfig(true)} color="warning">
                        Cambió (Actualizar)
                    </Button>
                    <Button onClick={() => submitTransaction(fuelPrice)} autoFocus>
                        Sí, es correcto
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}
