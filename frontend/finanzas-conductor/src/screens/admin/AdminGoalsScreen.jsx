import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    InputAdornment,
    Card,
    CardContent,
    LinearProgress
} from '@mui/material';
import {
    AttachMoney as MoneyIcon,
    Save as SaveIcon,
    TrendingUp as TrendingUpIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

export default function AdminGoalsScreen() {
    console.log("AdminGoalsScreen: Mounting");
    const [goals, setGoals] = useState({
        daily: '',
        weekly: '',
        monthly: ''
    });

    useEffect(() => {
        const savedGoals = localStorage.getItem('incomeGoals');
        if (savedGoals) {
            try {
                setGoals(JSON.parse(savedGoals));
            } catch (error) {
                console.error('Error parsing income goals:', error);
                // Reset invalid data
                localStorage.removeItem('incomeGoals');
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGoals(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('incomeGoals', JSON.stringify(goals));
        toast.success('Metas actualizadas correctamente');
    };

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Metas de Ingreso
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon color="primary" /> Definir Objetivos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Establece tus metas financieras para visualizar tu progreso en el Dashboard.
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Meta Diaria"
                                name="daily"
                                type="number"
                                value={goals.daily}
                                onChange={handleChange}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Meta Semanal"
                                name="weekly"
                                type="number"
                                value={goals.weekly}
                                onChange={handleChange}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Meta Mensual"
                                name="monthly"
                                type="number"
                                value={goals.monthly}
                                onChange={handleChange}
                                margin="normal"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                startIcon={<SaveIcon />}
                                sx={{ mt: 3 }}
                            >
                                Guardar Metas
                            </Button>
                        </form>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'white', mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                ¿Por qué establecer metas?
                            </Typography>
                            <Typography variant="body2">
                                Los conductores que establecen objetivos claros ganan en promedio un 20% más. Mantén tu motivación alta visualizando tu progreso diario.
                            </Typography>
                        </CardContent>
                    </Card>

                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Progreso Actual (Ejemplo)
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Meta Diaria ({formatCurrency(goals.daily || 0)})</Typography>
                                <Typography variant="body2" fontWeight="bold">65%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={65} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Meta Semanal ({formatCurrency(goals.weekly || 0)})</Typography>
                                <Typography variant="body2" fontWeight="bold">42%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={42} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
