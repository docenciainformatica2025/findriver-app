import React from 'react';
import { useFinance } from '../contexts/FinanceContext';
import ChartsDashboard from '../components/charts/ChartsDashboard';
import CategoryCharts from '../components/charts/CategoryCharts';
import RealTimeChart from '../components/charts/RealTimeChart';
import { Box } from '@mui/material';

export default function StatsScreen() {
    const { transactions } = useFinance();

    return (
        <Box sx={{ pb: 10 }}>
            <RealTimeChart />
            <ChartsDashboard transactions={transactions} />
            <CategoryCharts />
        </Box>
    );
}
