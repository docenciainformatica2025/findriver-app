import { useState, useMemo, useEffect } from 'react';
import { calculateCompleteCostAnalysis } from '../services/costCalculations';

export const useCostCalculations = (transactions = [], vehicleInfo = {}) => {
    const [totalKm, setTotalKm] = useState(0);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    // Calcular kilometraje total de los viajes
    useEffect(() => {
        const calculateTotalKm = () => {
            const kmFromTrips = transactions
                .filter(t => t.tipo === 'ingreso' && t.viaje?.distanciaKm)
                .reduce((sum, t) => sum + (t.viaje.distanciaKm || 0), 0);

            // Si no hay datos de viajes, usar estimación basada en gastos de gasolina
            if (kmFromTrips === 0) {
                const fuelExpenses = transactions
                    .filter(t => t.tipo === 'gasto' && t.categoria === 'gasolina')
                    .reduce((sum, t) => sum + (t.monto || 0), 0);

                // Estimación: 12 km por litro, $22.5 por litro (usando vehicleInfo si existe, o defaults)
                const fuelPrice = vehicleInfo.fuelPrice || 22.5;
                const efficiency = vehicleInfo.averageFuelConsumption || 12;

                const estimatedLiters = fuelExpenses / fuelPrice;
                const estimatedKm = estimatedLiters * efficiency;
                return estimatedKm;
            }

            return kmFromTrips;
        };

        setTotalKm(calculateTotalKm());
    }, [transactions, vehicleInfo]);

    // Calcular análisis completo
    useEffect(() => {
        if (transactions.length > 0 && totalKm > 0) {
            setLoading(true);

            try {
                // Usar el servicio de cálculo real
                const analysisResult = calculateCompleteCostAnalysis(transactions, totalKm);
                setAnalysis(analysisResult);
            } catch (error) {
                console.error("Error calculating cost analysis:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [transactions, totalKm]);

    // Métodos para cálculos específicos
    const calculateTripCost = useMemo(() => (distanceKm, expenses) => {
        if (!analysis?.metrics?.costPerKm) return 0;
        const variableCost = distanceKm * analysis.metrics.costPerKm;
        const fixedCost = analysis.metrics.costPerTrip;
        return variableCost + fixedCost;
    }, [analysis]);

    const calculateMinimumPrice = useMemo(() => (distanceKm, profitMargin = 0.3) => {
        if (!analysis?.metrics?.costPerKm) return 0;
        const totalCost = calculateTripCost(distanceKm, {});
        return totalCost * (1 + profitMargin);
    }, [analysis, calculateTripCost]);

    const calculateProfitProjection = useMemo(() => (kmToDrive, pricePerKm) => {
        if (!analysis?.metrics?.costPerKm) return { revenue: 0, cost: 0, profit: 0 };

        const revenue = kmToDrive * pricePerKm;
        const cost = kmToDrive * analysis.metrics.costPerKm;
        const profit = revenue - cost;

        return {
            revenue,
            cost,
            profit,
            profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0
        };
    }, [analysis]);

    return {
        totalKm,
        analysis,
        loading,
        calculateTripCost,
        calculateMinimumPrice,
        calculateProfitProjection,

        // Métodos rápidos
        getCostPerKm: () => analysis?.metrics?.costPerKm || 0,
        getEfficiency: () => analysis?.metrics?.efficiency || 0,
        getCostBreakdown: () => analysis?.expensesBreakdown || {},
        getNetProfit: () => analysis?.summary?.netProfit || 0
    };
};
