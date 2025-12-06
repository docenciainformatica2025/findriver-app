import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Stack
} from '@mui/material';
import {
    DirectionsCar as CarIcon,
    Delete as DeleteIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import { useFinance } from '../../contexts/FinanceContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { formatCurrency, formatKm } from '../../utils/formatters';

export default function TripsHistoryScreen() {
    const { transactions, deleteTransaction } = useFinance();
    const [filterPlatform, setFilterPlatform] = useState('Todos');

    // Filter only trips (ingresos with isDetailedTrip or just ingresos)
    // For now, let's show all 'ingreso' type transactions as trips
    const trips = transactions
        .filter(t => t.tipo === 'ingreso')
        .filter(t => filterPlatform === 'Todos' || t.categoría === filterPlatform)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const platforms = ['Todos', 'Uber', 'DiDi', 'inDrive', 'Particular'];

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Historial de Viajes
                </Typography>
                <TextField
                    select
                    size="small"
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value)}
                    sx={{ width: 150 }}
                    InputProps={{
                        startAdornment: <FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                >
                    {platforms.map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                </TextField>
            </Stack>

            <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <List>
                    {trips.length === 0 ? (
                        <Box p={4} textAlign="center">
                            <Typography color="text.secondary">No hay viajes registrados</Typography>
                        </Box>
                    ) : (
                        trips.map((trip, index) => (
                            <React.Fragment key={trip.id || index}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => deleteTransaction(trip.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                                            <CarIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" pr={2}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {formatCurrency(trip.monto)}
                                                </Typography>
                                                <Chip
                                                    label={trip.categoría}
                                                    size="small"
                                                    color={trip.categoría === 'Uber' ? 'primary' : 'default'}
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" component="span" display="block">
                                                    {format(new Date(trip.fecha), "d 'de' MMMM, h:mm a", { locale: es })}
                                                </Typography>
                                                {trip.distanciaViaje > 0 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatKm(trip.distanciaViaje)} • {trip.descripción || 'Sin descripción'}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {index < trips.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Paper>
        </Box>
    );
}
