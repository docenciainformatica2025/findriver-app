import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box, Button, Divider } from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useFinance } from '../contexts/FinanceContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export default function RecentTransactions() {
    const { transactions } = useFinance();
    const navigate = useNavigate();

    // Get last 5 transactions
    const recent = [...transactions]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
    };

    if (recent.length === 0) return null;

    return (
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Recientes
                    </Typography>
                    <Button size="small" onClick={() => navigate('/historial')} endIcon={<HistoryIcon />}>
                        Ver Todo
                    </Button>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <List dense>
                    {recent.map((tx) => (
                        <ListItem key={tx._id || tx.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <Avatar sx={{
                                    bgcolor: tx.tipo === 'ingreso' ? 'success.light' : 'error.light',
                                    color: tx.tipo === 'ingreso' ? 'success.dark' : 'error.dark'
                                }}>
                                    {tx.tipo === 'ingreso' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={tx.categoria || tx.categoría || 'General'}
                                secondary={moment(tx.fecha).format('DD MMM - HH:mm')}
                                primaryTypographyProps={{ fontWeight: 600 }}
                            />
                            <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={tx.tipo === 'ingreso' ? 'success.main' : 'error.main'}
                            >
                                {tx.tipo === 'ingreso' ? '+' : '-'}{formatMoney(tx.monto)}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}
