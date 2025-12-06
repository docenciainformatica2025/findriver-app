import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
    Home as HomeIcon,
    BarChart as StatsIcon,
    History as HistoryIcon,
    Person as ProfileIcon,
    PieChart as ChartsIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomTabs() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
            <BottomNavigation
                showLabels
                value={location.pathname}
                onChange={(event, newValue) => {
                    navigate(newValue);
                }}
            >
                <BottomNavigationAction label="Inicio" value="/" icon={<HomeIcon />} />
                <BottomNavigationAction label="Gráficos" value="/graficos" icon={<ChartsIcon />} />
                <BottomNavigationAction label="Historial" value="/historial" icon={<HistoryIcon />} />
                <BottomNavigationAction label="Perfil" value="/perfil" icon={<ProfileIcon />} />
            </BottomNavigation>
        </Paper>
    );
}
