import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    LinearProgress,
    Stack,
    IconButton,
    Collapse,
    Alert
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    DirectionsCar as CarIcon,
    Edit as EditIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAdvancedCalculations } from '../hooks/useAdvancedCalculations';
import { formatMoney } from '../utils/formatters';
import moment from 'moment';

export default function GoalTracker() {
    const { user, updateProfile } = useAuth();
    const { gananciaNetaHoy, ingresoPorKm, cpkReal, cpkGlobal } = useAdvancedCalculations();

    const [goal, setGoal] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Determine effective CPK (use Real if available, fallback to Global)
    const effectiveCPK = cpkReal > 0 ? cpkReal : cpkGlobal;

    // Check if goal is set for TODAY
    const todayStr = moment().format('YYYY-MM-DD');
    const hasActiveGoal = user?.dailyGoal && user?.dailyGoalDate === todayStr;
    const currentGoal = hasActiveGoal ? user.dailyGoal : 0;

    // Persist goal
    const handleSetGoal = async () => {
        if (!goal || isNaN(goal) || goal <= 0) return;
        setLoading(true);
        try {
            await updateProfile({
                dailyGoal: parseFloat(goal),
                dailyGoalDate: todayStr
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error setting goal:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Progress
    const progress = currentGoal > 0 ? Math.min((gananciaNetaHoy / currentGoal) * 100, 100) : 0;
    const remainingProfit = Math.max(currentGoal - gananciaNetaHoy, 0);

    // Calculate "Coach" Recommendations
    // Formula: Required Gross = Remaining Net + (Required Km * CPK)
    // Also: Required Gross = Required Km * IncomePerKm
    // So: Required Km * IncomePerKm = Remaining Net + Required Km * CPK
    // Required Km * (IncomePerKm - CPK) = Remaining Net
    // Required Km = Remaining Net / (IncomePerKm - CPK)

    let advice = "";
    let color = "primary.main";
    const profitPerKm = ingresoPorKm - effectiveCPK;

    if (currentGoal > 0) {
        if (gananciaNetaHoy >= currentGoal) {
            advice = "¡Felicidades! 🎉 Has cumplido tu meta de hoy. Todo lo que hagas ahora es extra.";
            color = "success.main";
        } else if (profitPerKm <= 0) {
            advice = "Tu rentabilidad actual es baja. Intenta reducir costos o buscar zonas con mejor tarifa para alcanzar la meta.";
            color = "warning.main";
        } else {
            const kmNeeded = Math.ceil(remainingProfit / profitPerKm);
            // Estimation of trips (avg $12,000 gross per trip?) - rough heuristic
            // Or use avg distance per trip from valid history if possible, but keeping it simple:
            const estimatedTrips = Math.ceil(kmNeeded / 5); // Assume 5km avg trip

            advice = `Te faltan $${formatMoney(remainingProfit)}. Según tu ritmo actual ($${formatMoney(profitPerKm)}/km libres), necesitas recorrer aproximadamente ${kmNeeded} km más (${estimatedTrips} viajes).`;
        }
    }

    if (!hasActiveGoal && !isEditing) {
        return (
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <EmojiEventsIconWrapper />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        ¡Buenos días, {user?.nombre?.split(' ')[0] || 'Conductor'}! ☀️
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                        ¿Cuánto dinero libre quieres llevarte a casa hoy?
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setIsEditing(true)}
                        sx={{ borderRadius: 20, px: 4, fontWeight: 'bold' }}
                    >
                        Fijar Meta Diaria
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isEditing) {
        return (
            <Card sx={{ mb: 3, border: '1px solid #ddd' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Fijar Meta de Ganancia Neta
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Esta es la cantidad que te quedará en el bolsillo después de gasolina y gastos.
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Meta ($)"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            size="small"
                            placeholder="Ej. 50000"
                            autoFocus
                        />
                        <Button
                            variant="contained"
                            onClick={handleSetGoal}
                            disabled={loading || !goal}
                        >
                            Guardar
                        </Button>
                    </Stack>
                    <Button
                        size="small"
                        color="inherit"
                        onClick={() => setIsEditing(false)}
                        sx={{ mt: 1 }}
                    >
                        Cancelar
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ mb: 3, position: 'relative', overflow: 'visible' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrophyIcon color="warning" fontSize="small" />
                        Meta Diaria: {formatMoney(currentGoal)}
                    </Typography>
                    <IconButton size="small" onClick={() => setIsEditing(true)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="h4" fontWeight="bold" color={gananciaNetaHoy >= currentGoal ? 'success.main' : 'text.primary'}>
                            {formatMoney(gananciaNetaHoy)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'flex-end', mb: 1 }}>
                            Libres
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 5,
                                bgcolor: gananciaNetaHoy >= currentGoal ? '#4caf50' : '#2196f3'
                            }
                        }}
                    />
                </Box>

                <Alert
                    icon={gananciaNetaHoy >= currentGoal ? <TrophyIcon fontSize="inherit" /> : <TrendingUpIcon fontSize="inherit" />}
                    severity={gananciaNetaHoy >= currentGoal ? "success" : "info"}
                    sx={{ alignItems: 'center', '& .MuiAlert-message': { width: '100%' } }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {advice}
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
}

function EmojiEventsIconWrapper() {
    return (
        <Box sx={{
            width: 40,
            height: 40,
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1
        }}>
            <TrophyIcon fontSize="medium" />
        </Box>
    );
}
