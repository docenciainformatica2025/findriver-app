import React, { useState } from 'react';
import VariableCostsForm from '../components/VariableCostsForm';
import FixedCostsForm from '../components/FixedCostsForm';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { SwapHoriz as VariableIcon, Receipt as FixedIcon } from '@mui/icons-material';

export default function AddExpenseScreen() {
    const [tab, setTab] = useState('variable');

    const handleTabChange = (event, newTab) => {
        if (newTab !== null) {
            setTab(newTab);
        }
    };

    return (
        <Box sx={{ p: 2, pb: 10 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Nuevo Gasto
            </Typography>

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
