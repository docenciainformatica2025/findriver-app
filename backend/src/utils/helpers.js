const crypto = require('crypto');
const moment = require('moment');

// Generar código aleatorio
exports.generateRandomCode = (length = 6) => {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
};

// Formatear moneda
exports.formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

// Formatear fecha
exports.formatDate = (date, format = 'DD/MM/YYYY') => {
    return moment(date).format(format);
};

// Calcular edad
exports.calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

// Validar email
exports.isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validar teléfono (México)
exports.isValidPhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
};

// Sanitizar string
exports.sanitizeString = (str) => {
    return str
        .replace(/[<>]/g, '') // Remover < y >
        .trim();
};

// Calcular distancia entre coordenadas (Haversine)
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
};

// Calcular tiempo estimado de viaje
exports.estimateTravelTime = (distanceKm, trafficFactor = 1.2) => {
    const averageSpeed = 40; // km/h promedio
    const timeHours = distanceKm / averageSpeed;
    const adjustedTime = timeHours * trafficFactor;
    return Math.ceil(adjustedTime * 60); // Minutos
};

// Calcular costo estimado de viaje
exports.estimateTravelCost = (distanceKm, baseRate = 15, ratePerKm = 8) => {
    const baseCost = baseRate;
    const distanceCost = distanceKm * ratePerKm;
    const totalCost = baseCost + distanceCost;

    // Aplicar IVA (16%)
    const iva = totalCost * 0.16;

    return {
        base: baseCost,
        distance: distanceCost,
        subtotal: totalCost,
        iva: iva,
        total: totalCost + iva
    };
};

// Generar resumen de estadísticas
exports.generateStatsSummary = (transactions) => {
    const ingresos = transactions.filter(t => t.tipo === 'ingreso');
    const gastos = transactions.filter(t => t.tipo === 'gasto');

    const totalIngresos = ingresos.reduce((sum, t) => sum + t.monto, 0);
    const totalGastos = gastos.reduce((sum, t) => sum + t.monto, 0);
    const totalGanancias = totalIngresos - totalGastos;

    // Agrupar por categoría
    const gastosPorCategoria = {};
    gastos.forEach(gasto => {
        if (!gastosPorCategoria[gasto.categoria]) {
            gastosPorCategoria[gasto.categoria] = 0;
        }
        gastosPorCategoria[gasto.categoria] += gasto.monto;
    });

    const ingresosPorCategoria = {};
    ingresos.forEach(ingreso => {
        if (!ingresosPorCategoria[ingreso.categoria]) {
            ingresosPorCategoria[ingreso.categoria] = 0;
        }
        ingresosPorCategoria[ingreso.categoria] += ingreso.monto;
    });

    // Encontrar categorías principales
    const topGastos = Object.entries(gastosPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([categoria, monto]) => ({ categoria, monto }));

    const topIngresos = Object.entries(ingresosPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([categoria, monto]) => ({ categoria, monto }));

    return {
        totalIngresos,
        totalGastos,
        totalGanancias,
        cantidadIngresos: ingresos.length,
        cantidadGastos: gastos.length,
        topGastos,
        topIngresos,
        promedioIngreso: ingresos.length > 0 ? totalIngresos / ingresos.length : 0,
        promedioGasto: gastos.length > 0 ? totalGastos / gastos.length : 0,
        eficiencia: totalGastos > 0 ? (totalGanancias / totalGastos) * 100 : 0
    };
};

// Paginar array de resultados
exports.paginate = (array, page = 1, limit = 20) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = array.slice(startIndex, endIndex);

    return {
        results,
        page,
        limit,
        totalPages: Math.ceil(array.length / limit),
        totalResults: array.length,
        hasNextPage: endIndex < array.length,
        hasPrevPage: startIndex > 0
    };
};

// Generar hash para archivos
exports.generateFileHash = (buffer) => {
    return crypto.createHash('md5').update(buffer).digest('hex');
};

// Delay helper
exports.delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Retry helper
exports.retry = async (fn, retries = 3, delayMs = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;

        await exports.delay(delayMs);
        return exports.retry(fn, retries - 1, delayMs * 2); // Exponential backoff
    }
};
