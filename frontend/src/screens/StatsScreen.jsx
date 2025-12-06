import React, { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import ChartsDashboard from '../components/ChartsDashboard';
import CategoryCharts from '../components/CategoryCharts';
import RealTimeChart from '../components/RealTimeChart';
import AdvancedAnalyticsModal from '../components/AdvancedAnalyticsModal';
import { Box } from '@mui/material';

export default function StatsScreen() {
    const { transactions } = useFinance();
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <Box sx={{ pb: 10 }}>
            <RealTimeChart />
            <ChartsDashboard transactions={transactions} />
            <CategoryCharts
                transactions={transactions}
                onOpenAdvanced={() => setShowAdvanced(true)}
            />
            <AdvancedAnalyticsModal
                open={showAdvanced}
                onClose={() => setShowAdvanced(false)}
            />
        </Box>
    );
}
