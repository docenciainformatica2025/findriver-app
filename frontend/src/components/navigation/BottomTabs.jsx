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
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, borderRadius: 0 }} elevation={3}>
            <BottomNavigation
                showLabels
                value={location.pathname}
                onChange={(event, newValue) => {
                    navigate(newValue);
                }}
                sx={{
                    height: 65,
                    '& .Mui-selected': {
                        color: '#2563EB', // Blue-600
                        '& .MuiSvgIcon-root': {
                            filter: 'drop-shadow(0px 2px 4px rgba(37, 99, 235, 0.3))'
                        }
                    }
                }}
            >
                <BottomNavigationAction label="Inicio" value="/dashboard" icon={<HomeIcon />} />
                <BottomNavigationAction label="Estadísticas" value="/estadisticas" icon={<StatsIcon />} />
                <BottomNavigationAction label="Historial" value="/historial" icon={<HistoryIcon />} />
                <BottomNavigationAction label="Perfil" value="/perfil" icon={<ProfileIcon />} />
            </BottomNavigation>
        </Paper>
    );
}
