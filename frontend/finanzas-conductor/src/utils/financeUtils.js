import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

// Formatear fechas para gráficos
export const formatDate = (date, format = 'DD/MM') => {
    return moment(date).format(format);
};

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

// Agrupar transacciones por periodo
export const groupByPeriod = (transactions, period = 'day') => {
    const groups = {};

    transactions.forEach(transaction => {
        let key;
        const date = moment(transaction.fecha);

        switch (period) {
            case 'day':
                key = date.format('YYYY-MM-DD');
                break;
            case 'week':
                key = `${date.year()}-W${date.week()}`;
                break;
            case 'month':
                key = date.format('YYYY-MM');
                break;
            case 'year':
                key = date.year().toString();
                break;
            default:
                key = date.format('YYYY-MM-DD');
        }

        if (!groups[key]) {
            groups[key] = {
                ingresos: 0,
                gastos: 0,
                ganancias: 0,
                fecha: transaction.fecha,
                label: period === 'day' ? date.format('DD/MM') :
                    period === 'week' ? `Sem ${date.week()}` :
                        period === 'month' ? date.format('MMM') : date.year().toString()
            };
        }

        if (transaction.tipo === 'ingreso') {
            groups[key].ingresos += transaction.monto;
        } else {
            groups[key].gastos += transaction.monto;
        }

        groups[key].ganancias = groups[key].ingresos - groups[key].gastos;
    });

    // Ordenar por fecha
    return Object.values(groups).sort((a, b) =>
        new Date(a.fecha) - new Date(b.fecha)
    );
};

// Obtener estadísticas resumidas
export const getSummaryStats = (transactions) => {
    const today = moment().startOf('day');
    const weekStart = moment().startOf('week');
    const monthStart = moment().startOf('month');

    const stats = {
        hoy: { ingresos: 0, gastos: 0, ganancias: 0 },
        semana: { ingresos: 0, gastos: 0, ganancias: 0 },
        mes: { ingresos: 0, gastos: 0, ganancias: 0 },
        total: { ingresos: 0, gastos: 0, ganancias: 0 }
    };

    transactions.forEach(transaction => {
        const monto = transaction.monto;
        const fecha = moment(transaction.fecha);

        // Totales
        if (transaction.tipo === 'ingreso') {
            stats.total.ingresos += monto;
        } else {
            stats.total.gastos += monto;
        }

        // Hoy
        if (fecha.isSame(today, 'day')) {
            if (transaction.tipo === 'ingreso') {
                stats.hoy.ingresos += monto;
            } else {
                stats.hoy.gastos += monto;
            }
        }

        // Esta semana
        if (fecha.isSameOrAfter(weekStart)) {
            if (transaction.tipo === 'ingreso') {
                stats.semana.ingresos += monto;
            } else {
                stats.semana.gastos += monto;
            }
        }

        // Este mes
        if (fecha.isSameOrAfter(monthStart)) {
            if (transaction.tipo === 'ingreso') {
                stats.mes.ingresos += monto;
            } else {
                stats.mes.gastos += monto;
            }
        }
    });

    // Calcular ganancias
    stats.hoy.ganancias = stats.hoy.ingresos - stats.hoy.gastos;
    stats.semana.ganancias = stats.semana.ingresos - stats.semana.gastos;
    stats.mes.ganancias = stats.mes.ingresos - stats.mes.gastos;
    stats.total.ganancias = stats.total.ingresos - stats.total.gastos;

    return stats;
};

// Datos de ejemplo para desarrollo
export const sampleData = {
    transacciones: [
        { id: 1, tipo: 'ingreso', monto: 150, categoria: 'viaje', fecha: '2024-01-01', descripcion: 'Viaje centro' },
        { id: 2, tipo: 'gasto', monto: 50, categoria: 'gasolina', fecha: '2024-01-01', descripcion: 'Gasolina' },
        { id: 3, tipo: 'ingreso', monto: 200, categoria: 'viaje', fecha: '2024-01-02', descripcion: 'Viaje aeropuerto' },
        { id: 4, tipo: 'gasto', monto: 30, categoria: 'comida', fecha: '2024-01-02', descripcion: 'Almuerzo' },
        { id: 5, tipo: 'ingreso', monto: 180, categoria: 'viaje', fecha: '2024-01-03', descripcion: 'Viaje hotel' },
        { id: 6, tipo: 'gasto', monto: 45, categoria: 'gasolina', fecha: '2024-01-03', descripcion: 'Gasolina' },
        { id: 7, tipo: 'ingreso', monto: 220, categoria: 'encomienda', fecha: '2024-01-04', descripcion: 'Paquete' },
        { id: 8, tipo: 'gasto', monto: 25, categoria: 'peaje', fecha: '2024-01-04', descripcion: 'Peaje' },
        { id: 9, tipo: 'ingreso', monto: 190, categoria: 'viaje', fecha: '2024-01-05', descripcion: 'Viaje centro' },
        { id: 10, tipo: 'gasto', monto: 60, categoria: 'mantenimiento', fecha: '2024-01-05', descripcion: 'Aceite' },
    ],

    categoriasGastos: [
        { categoria: 'gasolina', monto: 95, color: '#FF6384' },
        { categoria: 'comida', monto: 30, color: '#36A2EB' },
        { categoria: 'peaje', monto: 25, color: '#FFCE56' },
        { categoria: 'mantenimiento', monto: 60, color: '#4BC0C0' },
        { categoria: 'otros', monto: 15, color: '#9966FF' }
    ],

    categoriasIngresos: [
        { categoria: 'viaje', monto: 720, color: '#2ECC71' },
        { categoria: 'encomienda', monto: 220, color: '#3498DB' },
        { categoria: 'app', monto: 0, color: '#9B59B6' },
        { categoria: 'otros', monto: 0, color: '#E74C3C' }
    ]
};
