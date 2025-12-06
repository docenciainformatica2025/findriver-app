import React, { useState } from 'react';
import VariableCostsForm from '../components/VariableCostsForm';
import FixedCostsForm from '../components/FixedCostsForm';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, SwapHoriz as VariableIcon, Receipt as FixedIcon } from '@mui/icons-material';
import { Box, Typography, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';

export default function AddExpenseScreen() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('variable');

    const handleTabChange = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate('/dashboard')} edge="start" sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Nuevo Gasto
                </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={tab}
                    exclusive
                    onChange={handleTabChange}
                    aria-label="expense type"
                    fullWidth
                    sx={{ width: '100%' }}
                >
                    <ToggleButton value="variable" sx={{ flex: 1 }}>
                        <VariableIcon sx={{ mr: 1 }} /> Variable
                    </ToggleButton>
                    <ToggleButton value="fixed" sx={{ flex: 1 }}>
                        <FixedIcon sx={{ mr: 1 }} /> Fijo
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {tab === 'variable' ? <VariableCostsForm /> : <FixedCostsForm />}
        </Box>
    );
}
