
import { useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import moment from 'moment';

export function useCalculations() {
    const { transactions } = useFinance();

    const metrics = useMemo(() => {
        // Filter transactions
        const incomes = transactions.filter(t => t.tipo === 'ingreso');
        const expenses = transactions.filter(t => t.tipo === 'gasto');

        // 1. Calculate Totals
        const totalGross = incomes.reduce((acc, item) => acc + (item.montoBruto || item.monto), 0);
        const totalNet = incomes.reduce((acc, item) => acc + item.monto, 0);
        const totalExpenses = expenses.reduce((acc, item) => acc + item.monto, 0);

        // Split Fixed vs Variable (Heuristic: Fixed are specific categories)
        const fixedCategories = ['Seguro', 'Impuestos', 'Depreciación', 'Plan de Datos'];
        const totalFixed = expenses
            .filter(t => fixedCategories.includes(t.categoría))
            .reduce((acc, item) => acc + item.monto, 0);

        const totalVariable = totalExpenses - totalFixed;

        // 2. Calculate Total Km
        // Strategy: Use sum of trip kms for Revenue Km.
        const revenueKm = incomes.reduce((acc, item) => acc + (item.distanciaViaje || 0), 0);

        // For Total Km, look at odometer readings in expenses
        const odometers = expenses
            .map(t => t.odómetro)
            .filter(k => k > 0)
            .sort((a, b) => a - b);

        let totalKm = revenueKm; // Default fallback

        if (odometers.length > 1) {
            const odoDelta = odometers[odometers.length - 1] - odometers[0];
            if (odoDelta > revenueKm) {
                totalKm = odoDelta;
            }
        }

        // 3. Calculate CPK
        const cpk = totalKm > 0 ? totalExpenses / totalKm : 0;

        // Placeholder values for missing calculations
        const variableCpk = 0;
        const profit = totalNet - totalExpenses;
        const profitPerKm = totalKm > 0 ? profit / totalKm : 0;
        const ingresosHoy = 0;
        const gastosHoy = 0;
        const gananciaNetaHoy = 0;
        const viajesHoy = 0;
        const promedioViaje = 0;

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
