import { useMemo, useState, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext.jsx';
import moment from 'moment';
import client from '../api/client';

export function useAdvancedCalculations() {
    const { transactions = [] } = useFinance();
    const { user } = useAuth();
    const [backendStats, setBackendStats] = useState(null);

    // Fetch authoritative stats from backend (which handles Shifts & Fuel Estimation)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await client.get('/stats/cpk');
                if (data.success) {
                    setBackendStats(data.data); // Store INNER payload (summary, today, history)
                }
            } catch (err) {
                console.error("Error fetching backend CPK stats:", err);
            }
        };
        if (user) fetchStats();
        // Refresh when transactions change (simulated real-time)
    }, [user, transactions.length]);

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

        // Sum of trip distances (Revenue Km) - Client side fallback
        const kmRecorridosHoy = incomesHoy.reduce((acc, t) => acc + (Number(t.kmRecorridos) || Number(t.distanciaViaje) || 0), 0);

        // 4. Advanced Metrics
        const totalCostosHoy = dailyFixedCost + totalGastosVariablesHoy;
        const gananciaNetaHoy = totalIngresosHoy - totalCostosHoy;

        // --- OVERRIDE WITH BACKEND STATS IF AVAILABLE ---
        // Backend provides 'cpk' (Global) in summary.
        const summary = backendStats?.summary || {};
        const backendCpk = summary.cpk || 0;
        const backendTotalKm = summary.totalKm || 0;

        // CPK Real: Prioritize backend value which includes Fuel Estimation & Shifts
        const cpkReal = backendCpk > 0 ? backendCpk : (kmRecorridosHoy > 0 ? (totalCostosHoy / kmRecorridosHoy) : 0);

        // Use Global CPK from backend as well
        const cpkGlobal = backendCpk;

        // --- DAILY METRICS FROM BACKEND DIRECTLY ---
        // ROBUST FIX: Search 'history' array for the Client's Local Date key.
        let backendTodayKm = 0;

        const localDateKey = today.format('YYYY-MM-DD');
        const historyEntry = (backendStats?.history || []).find(d => d.date === localDateKey);

        if (historyEntry) {
            backendTodayKm = Number(historyEntry.totalKm) || 0;
        } else {
            // Fallback to explicit 'today' object if history search fails
            const backendToday = backendStats?.today || {};
            backendTodayKm = Number(backendToday.totalKm) || 0;
        }

        // Rentabilidad por Km
        const activeKm = backendTodayKm > 0 ? backendTodayKm : (kmRecorridosHoy > 0 ? kmRecorridosHoy : 0);

        const ingresoPorKm = activeKm > 0 ? (totalIngresosHoy / activeKm) : 0;

        return {
            dailyFixedCost,
            totalIngresosHoy,
            totalGastosVariablesHoy,
            totalCostosHoy,
            gananciaNetaHoy,
            kmRecorridosHoy,
            cpkReal, // Now powered by Backend
            cpkGlobal, // Now powered by Backend
            gananciaGlobal: 0, // Simplified
            ingresoPorKm, // Use the robustly calculated variable from above
            viajesHoy: incomesHoy.length,
            byPlatform: {
                uber: incomesHoy.filter(t => t.plataforma === 'uber').reduce((acc, t) => acc + t.monto, 0),
                didi: incomesHoy.filter(t => t.plataforma === 'didi').reduce((acc, t) => acc + t.monto, 0),
                indrive: incomesHoy.filter(t => t.plataforma === 'indrive').reduce((acc, t) => acc + t.monto, 0),
            }
        };
    }, [transactions, user, backendStats]);

    return metrics;
}
