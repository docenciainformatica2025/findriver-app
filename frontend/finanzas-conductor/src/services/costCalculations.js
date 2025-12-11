// Servicio para cálculos de costos de conductor
export const costCalculations = {
    // Calcular costo por kilómetro basado en gastos
    calculateCostPerKm: (totalExpenses, totalKm) => {
        if (!totalKm || totalKm <= 0) return 0;
        return totalExpenses / totalKm;
    },

    // Calcular costo por viaje
    calculateCostPerTrip: (totalExpenses, totalTrips) => {
        if (!totalTrips || totalTrips <= 0) return 0;
        return totalExpenses / totalTrips;
    },

    // Calcular eficiencia (ingresos vs gastos)
    calculateEfficiency: (income, expenses) => {
        if (!expenses || expenses <= 0) return 0;
        return ((income - expenses) / expenses) * 100;
    },

    // Calcular rentabilidad
    calculateProfitability: (income, expenses) => {
        if (!expenses || expenses <= 0) return 0;
        return (income / expenses) * 100;
    },

    // Calcular consumo de combustible por kilómetro
    calculateFuelConsumptionPerKm: (totalFuelLiters, totalKm) => {
        if (!totalKm || totalKm <= 0) return 0;
        return totalFuelLiters / totalKm;
    },

    // Calcular costo de combustible por kilómetro
    calculateFuelCostPerKm: (totalFuelCost, totalKm) => {
        if (!totalKm || totalKm <= 0) return 0;
        return totalFuelCost / totalKm;
    },

    // Calcular costo total por kilómetro (incluye todos los gastos)
    calculateTotalCostPerKm: (expenses, expensesBreakdown, totalKm) => {
        if (!totalKm || totalKm <= 0) return 0;

        const {
            fuel = 0,
            maintenance = 0,
            insurance = 0,
            tolls = 0,
            parking = 0,
            fines = 0,
            food = 0,
            other = 0
        } = expensesBreakdown;

        const totalExpenses = fuel + maintenance + insurance + tolls + parking + fines + food + other;

        return {
            totalCostPerKm: totalExpenses / totalKm,
            breakdownPerKm: {
                fuel: fuel / totalKm,
                maintenance: maintenance / totalKm,
                insurance: insurance / totalKm,
                tolls: tolls / totalKm,
                parking: parking / totalKm,
                fines: fines / totalKm,
                food: food / totalKm,
                other: other / totalKm
            }
        };
    },

    // Calcular precio mínimo por kilómetro para ser rentable
    calculateMinimumPricePerKm: (totalCostPerKm, desiredProfitMargin = 0.2) => {
        return totalCostPerKm * (1 + desiredProfitMargin);
    },

    // Calcular distancia óptima para viajes
    calculateOptimalTripDistance: (fixedCosts, variableCostPerKm, avgRevenuePerKm) => {
        if (!variableCostPerKm || !avgRevenuePerKm) return 0;
        return fixedCosts / (avgRevenuePerKm - variableCostPerKm);
    },

    // Proyectar ganancias basado en kilómetros
    projectEarnings: (kmToDrive, avgRevenuePerKm, totalCostPerKm) => {
        const totalRevenue = kmToDrive * avgRevenuePerKm;
        const totalCost = kmToDrive * totalCostPerKm;
        const profit = totalRevenue - totalCost;

        return {
            totalRevenue,
            totalCost,
            profit,
            profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
        };
    },

    // Calcular punto de equilibrio (km necesarios para cubrir gastos)
    calculateBreakEvenPoint: (fixedCosts, revenuePerKm, variableCostPerKm) => {
        const contributionMargin = revenuePerKm - variableCostPerKm;
        if (contributionMargin <= 0) return Infinity; // Nunca alcanza punto de equilibrio
        return fixedCosts / contributionMargin;
    },

    // Análisis de viaje específico
    analyzeTrip: (tripData) => {
        const {
            distanceKm,
            tripRevenue,
            fuelCost,
            tollCost = 0,
            parkingCost = 0,
            otherCosts = 0
        } = tripData;

        const totalTripCost = fuelCost + tollCost + parkingCost + otherCosts;
        const costPerKm = distanceKm > 0 ? totalTripCost / distanceKm : 0;
        const revenuePerKm = distanceKm > 0 ? tripRevenue / distanceKm : 0;
        const tripProfit = tripRevenue - totalTripCost;
        const profitMargin = tripRevenue > 0 ? (tripProfit / tripRevenue) * 100 : 0;

        return {
            distanceKm,
            tripRevenue,
            totalTripCost,
            costPerKm,
            revenuePerKm,
            tripProfit,
            profitMargin,
            efficiency: tripRevenue > 0 ? (tripProfit / totalTripCost) * 100 : 0
        };
    }
};

// Simulación de datos de vehículo
export const vehicleData = {
    averageFuelConsumption: 12, // km por litro
    fuelPrice: 22.5, // precio por litro
    maintenanceCostPerKm: 0.05,
    insuranceDaily: 30, // costo diario de seguro
    depreciationPerKm: 0.15
};

// Cálculo completo para dashboard
export const calculateCompleteCostAnalysis = (transactions, totalKm) => {
    // Filtrar y sumar gastos por categoría
    const expensesBreakdown = {
        fuel: 0,
        maintenance: 0,
        insurance: 0,
        tolls: 0,
        parking: 0,
        fines: 0,
        food: 0,
        other: 0
    };

    let totalExpenses = 0;
    let totalIncome = 0;
    let totalTrips = 0;

    // Helper para normalizar categorías
    const mapCategoryToKey = (category) => {
        if (!category) return 'other';
        const lowerCat = category.toLowerCase().trim();

        if (lowerCat.includes('combustible') || lowerCat.includes('gasolina')) return 'fuel';
        if (lowerCat.includes('mantenimiento')) return 'maintenance';
        if (lowerCat.includes('seguro')) return 'insurance';
        if (lowerCat.includes('peaje')) return 'tolls';
        if (lowerCat.includes('estacionamiento') || lowerCat.includes('parqueadero')) return 'parking';
        if (lowerCat.includes('multa')) return 'fines';
        if (lowerCat.includes('comida') || lowerCat.includes('alimento')) return 'food';

        return 'other';
    };

    transactions.forEach(transaction => {
        if (transaction.tipo === 'gasto') {
            const amount = Number(transaction.monto) || 0;
            // Usar la categoría mapeada
            const originalCategory = transaction.categoria || transaction.categoría || 'other'; // Soporte para ambas llaves si es necesario
            const categoryKey = mapCategoryToKey(originalCategory);

            if (expensesBreakdown.hasOwnProperty(categoryKey)) {
                expensesBreakdown[categoryKey] += amount;
            } else {
                expensesBreakdown.other += amount;
            }

            totalExpenses += amount;
        } else if (transaction.tipo === 'ingreso') {
            totalIncome += Number(transaction.monto) || 0;
            totalTrips++;
        }
    });

    // Calcular métricas
    const costPerKm = costCalculations.calculateCostPerKm(totalExpenses, totalKm);
    const costPerTrip = costCalculations.calculateCostPerTrip(totalExpenses, totalTrips);
    const efficiency = costCalculations.calculateEfficiency(totalIncome, totalExpenses);
    const profitability = costCalculations.calculateProfitability(totalIncome, totalExpenses);
    const totalCostAnalysis = costCalculations.calculateTotalCostPerKm(totalExpenses, expensesBreakdown, totalKm);

    // Calcular métricas de combustible
    const fuelLiters = expensesBreakdown.fuel / vehicleData.fuelPrice;
    const fuelConsumptionPerKm = costCalculations.calculateFuelConsumptionPerKm(fuelLiters, totalKm);
    const fuelCostPerKm = costCalculations.calculateFuelCostPerKm(expensesBreakdown.fuel, totalKm);

    // Calcular precios mínimos recomendados
    const minPricePerKm20 = costCalculations.calculateMinimumPricePerKm(costPerKm, 0.2);
    const minPricePerKm30 = costCalculations.calculateMinimumPricePerKm(costPerKm, 0.3);
    const minPricePerKm50 = costCalculations.calculateMinimumPricePerKm(costPerKm, 0.5);

    // Proyecciones
    const projections = {
        daily: costCalculations.projectEarnings(100, totalIncome / totalKm, costPerKm),
        weekly: costCalculations.projectEarnings(700, totalIncome / totalKm, costPerKm),
        monthly: costCalculations.projectEarnings(3000, totalIncome / totalKm, costPerKm)
    };

    return {
        summary: {
            totalKm,
            totalIncome,
            totalExpenses,
            totalTrips,
            netProfit: totalIncome - totalExpenses
        },
        metrics: {
            costPerKm,
            costPerTrip,
            efficiency,
            profitability,
            fuelConsumptionPerKm,
            fuelCostPerKm
        },
        costBreakdown: {
            total: totalCostAnalysis.totalCostPerKm,
            byCategory: totalCostAnalysis.breakdownPerKm,
            percentages: {
                fuel: (expensesBreakdown.fuel / totalExpenses) * 100,
                maintenance: (expensesBreakdown.maintenance / totalExpenses) * 100,
                insurance: (expensesBreakdown.insurance / totalExpenses) * 100,
                tolls: (expensesBreakdown.tolls / totalExpenses) * 100,
                parking: (expensesBreakdown.parking / totalExpenses) * 100,
                other: (expensesBreakdown.other / totalExpenses) * 100
            }
        },
        recommendations: {
            minPricePerKm20,
            minPricePerKm30,
            minPricePerKm50,
            suggestedTripPrice: minPricePerKm30 * 5, // Para viaje de 5km
            optimalTripDistance: costCalculations.calculateOptimalTripDistance(
                expensesBreakdown.insurance / 30, // Costo diario fijo
                costPerKm,
                totalIncome / totalKm
            )
        },
        projections,
        expensesBreakdown
    };
};
