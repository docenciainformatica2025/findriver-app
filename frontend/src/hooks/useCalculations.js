
import { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import moment from 'moment';

export function useCalculations() {
    const { transactions = [] } = useFinance();

    const metrics = useMemo(() => {
        const today = moment().startOf('day');

        // Filter transactions
        const incomes = transactions.filter(t => t.tipo === 'ingreso');
        const expenses = transactions.filter(t => t.tipo === 'gasto');

        // Filter for specific timeframes (TODAY)
        const incomesHoy = incomes.filter(t => moment(t.fecha).isSame(today, 'day'));
        const expensesHoy = expenses.filter(t => moment(t.fecha).isSame(today, 'day'));

        // 1. Calculate Totals (All Time)
        const totalGross = incomes.reduce((acc, item) => acc + (item.montoBruto || item.monto), 0);
        const totalNet = incomes.reduce((acc, item) => acc + item.monto, 0);
        const totalExpenses = expenses.reduce((acc, item) => acc + item.monto, 0);

        // Split Fixed vs Variable
        const fixedCategories = ['Seguro', 'Impuestos', 'Depreciación', 'Plan de Datos'];
        const totalFixed = expenses
            .filter(t => fixedCategories.includes(t.categoría))
            .reduce((acc, item) => acc + item.monto, 0);

        const totalVariable = totalExpenses - totalFixed;

        // 2. Calculate Total Km
        const revenueKm = incomes.reduce((acc, item) => acc + (item.distanciaViaje || 0), 0);

        const odometers = expenses
            .map(t => t.odómetro)
            .filter(k => k > 0)
            .sort((a, b) => a - b);

        let totalKm = revenueKm;

        if (odometers.length > 1) {
            const odoDelta = odometers[odometers.length - 1] - odometers[0];
            if (odoDelta > revenueKm) {
                totalKm = odoDelta;
            }
        }

        // 3. Calculate CPK
        const cpk = totalKm > 0 ? totalExpenses / totalKm : 0;

        // 4. Calculate Daily Stats (HOY)
        const ingresosHoy = incomesHoy.reduce((acc, item) => acc + item.monto, 0);
        const gastosHoy = expensesHoy.reduce((acc, item) => acc + item.monto, 0);
        const gananciaNetaHoy = ingresosHoy - gastosHoy;
        const viajesHoy = incomesHoy.length;

        // Calculate average trip today (prevent division by zero)
        const promedioViaje = viajesHoy > 0 ? (ingresosHoy / viajesHoy) : 0;

        const variableCpk = 0; // Placeholder until variable logic refined
        const profit = totalNet - totalExpenses;
        const profitPerKm = totalKm > 0 ? profit / totalKm : 0;

        return {
            totalFixed,
            totalVariable,
            totalGross,
            totalNet,
            totalKm,
            revenueKm,
            cpk,
            variableCpk,
            profit,
            profitPerKm,
            // Daily Stats
            ingresosHoy,
            gastosHoy,
            gananciaNetaHoy,
            viajesHoy,
            promedioViaje
        };
    }, [transactions]);

    return metrics;
}
