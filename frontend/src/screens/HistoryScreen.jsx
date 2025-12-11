import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import moment from 'moment';
import 'moment/locale/es';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    Chip,
    IconButton
} from '@mui/material';
import { Download as DownloadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

moment.locale('es');

export default function HistoryScreen() {
    const { transactions, deleteTransaction } = useFinance();

    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
    );

    const formatCurrency = (val) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

    const exportToCSV = () => {
        if (transactions.length === 0) {
            toast.error('No hay datos para exportar');
            return;
        }

        const headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto', 'Odómetro'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
                moment(t.fecha).format('DD/MM/YYYY HH:mm'),
                t.tipo,
                t.categoría,
                `"${(t.descripción || '').replace(/"/g, '""')}"`, // Escape quotes
                t.monto,
                t.odómetro || 0
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `transacciones_${moment().format('YYYY-MM-DD')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Exportación exitosa');
    };

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Historial
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={exportToCSV}
                    size="small"
                >
                    CSV
                </Button>
            </Box>

            <Stack spacing={2}>
                {sortedTransactions.length === 0 && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                        No hay transacciones aún.
                    </Typography>
                )}

                {sortedTransactions.map(t => (
                    <Card
                        key={t._id || t.id} // Ensure ID access
                        sx={{
                            borderLeft: 6,
                            borderColor: t.tipo === 'ingreso' ? 'success.main' : 'error.main',
                            borderRadius: 2
                        }}
                    >
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {t.categoria || t.categoría || 'General'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {moment(t.fecha).format('DD/MM/YYYY HH:mm')} • {t.descripcion || t.descripción || 'Sin descripción'}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        color={t.tipo === 'ingreso' ? 'success.main' : 'error.main'}
                                    >
                                        {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
                                    </Typography>
                                    {(t.odometro > 0 || t.odómetro > 0 || t.kmRecorridos > 0 || t.distanciaViaje > 0) && (
                                        <Chip
                                            label={`${t.odometro || t.odómetro || t.kmRecorridos || t.distanciaViaje} km`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            sx={{ mt: 0.5 }}
                                        />
                                    )}
                                </Box>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={async () => {
                                        if (window.confirm('¿Eliminar esta transacción?')) {
                                            const res = await deleteTransaction(t._id || t.id);
                                            if (res.success) toast.success('Eliminado');
                                            else toast.error(res.error || 'Error al eliminar');
                                        }
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}
