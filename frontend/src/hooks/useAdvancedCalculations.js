import { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext.jsx'; // Note the .jsx extension as per file listing
import moment from 'moment';

export function useAdvancedCalculations() {
    const { transactions = [] } = useFinance();
    const { user } = useAuth(); // Access user profile for Fixed Costs

    const metrics = useMemo(() => {
        const today = moment().startOf('day');

        // 1. Calculate Daily Fixed Cost Proration
        const costosFijos = user?.costosFijos || {};
        const totalAnnualFixed = (
            Number(costosFijos.seguroAnual || 0) +
            Number(costosFijos.impuestosAnuales || 0) +
            Number(costosFijos.depreciacionAnual || 0)
        );
        const totalMonthlyFixed = (
            Number(costosFijos.sueldoConductorMensual || 0) +
            Number(costosFijos.planCelularMensual || 0) +
            Number(costosFijos.otrosMensuales || 0)
        );

        const dailyFixedCost = (totalAnnualFixed / 365) + (totalMonthlyFixed / 30);

        // 2. Filter Today's Data
        const todayTx = transactions.filter(t => moment(t.fecha).isSame(today, 'day'));
        const incomesHoy = todayTx.filter(t => t.tipo === 'ingreso');
        const expensesHoy = todayTx.filter(t => t.tipo === 'gasto');

        // 3. Operational Calculations
        const totalIngresosHoy = incomesHoy.reduce((acc, t) => acc + (Number(t.monto) || 0), 0);
        const totalGastosVariablesHoy = expensesHoy.reduce((acc, t) => acc + (Number(t.monto) || 0), 0);

        // Sum of trip distances (Revenue Km)
        const kmRecorridosHoy = incomesHoy.reduce((acc, t) => acc + (Number(t.kmRecorridos) || Number(t.distanciaViaje) || 0), 0);

        // NOTE: We ideally need Shift Total Km to find Dead Km. 
        // For now, if no shift closed, we use Trip Km as base, but this assumes 100% efficiency.
        // In a real shift closure, we would get total shift km.
        // Assuming user might log "Gasolina" with odometer reading to approximate via manual logic in future.
        const totalKmHoy = kmRecorridosHoy; // Placeholder until Shift integration is deep

        // 4. Advanced Metrics (The Core)
        const totalCostosHoy = dailyFixedCost + totalGastosVariablesHoy;
        const gananciaNetaHoy = totalIngresosHoy - totalCostosHoy;

        // CPK Real: (Fixed + Variable) / KM
        // Prevent division by zero
        const cpkReal = totalKmHoy > 0 ? (totalCostosHoy / totalKmHoy) : 0;

        // Rentabilidad por Km
        const ingresoPorKm = totalKmHoy > 0 ? (totalIngresosHoy / totalKmHoy) : 0;

        return {
            // 5. Historical/Global Metrics (From all loaded transactions)
            // This failsafe ensures cards aren't empty if "Today" has no data yet.
            const totalIngresosHist = transactions.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + (Number(t.monto) || 0), 0);
            const totalGastosHist = transactions.filter(t => t.tipo === 'gasto').reduce((acc, t) => acc + (Number(t.monto) || 0), 0);
            const totalKmHist = transactions.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + (Number(t.montoKms) || Number(t.kmRecorridos) || Number(t.distanciaViaje) || 0), 0);

            // Calculate Costos Fijos portion for the loaded period? 
            // Hard to estimate exact fixed cost for "random 50 transactions".
            // Simplified Global CPK: (Total Var Expenses / Total Km)
            // Ideally: (Total Var + (DailyFixed * DaysSpanned)) / Total Km
            const txDates = transactions.map(t => moment(t.fecha));
            const daysSpanned = txDates.length > 0 ? moment.max(txDates).diff(moment.min(txDates), 'days') + 1 : 1;
            const estimatedFixedCostHist = dailyFixedCost * daysSpanned;

            const cpkGlobal = totalKmHist > 0 ? ((totalGastosHist + estimatedFixedCostHist) / totalKmHist) : 0;
            const gananciaGlobal = totalIngresosHist - (totalGastosHist + estimatedFixedCostHist);

            return {
                dailyFixedCost,
                totalIngresosHoy,
                totalGastosVariablesHoy,
                totalCostosHoy,
                gananciaNetaHoy,
                kmRecorridosHoy,
                cpkReal,
                cpkGlobal, // Exporting the new metric
                gananciaGlobal,
                ingresoPorKm,
                viajesHoy: incomesHoy.length,
                // Platform breakdown
                byPlatform: {
                    uber: incomesHoy.filter(t => t.plataforma === 'uber').reduce((acc, t) => acc + t.monto, 0),
                    didi: incomesHoy.filter(t => t.plataforma === 'didi').reduce((acc, t) => acc + t.monto, 0),
                    indrive: incomesHoy.filter(t => t.plataforma === 'indrive').reduce((acc, t) => acc + t.monto, 0),
                }
            };
        }, [transactions, user]);

    return metrics;
}
