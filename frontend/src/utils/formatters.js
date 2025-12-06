/**
 * Formatea valores monetarios
 * Requerimiento: Sin decimales, con separador de miles (Punto)
 * @param {number} amount - El monto a formatear
 * @returns {string} - El string formateado (ej: "$12.000")
 */
export const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Formatea valores de distancia
 * Requerimiento: 1 decimal
 * @param {number} km - La distancia en kilómetros
 * @returns {string} - El string formateado (ej: "120.5 km")
 */
export const formatKm = (km) => {
    if (km === undefined || km === null) return '0.0 km';
    // Asegurar que sea un número
    const val = Number(km);
    if (isNaN(val)) return '0.0 km';

    return `${val.toFixed(1)} km`;
};

/**
 * Formatea valores de porcentaje
 * Requerimiento: 1 decimal (ej: 15.5%)
 * @param {number} value - El valor porcentual (0-100 o 0-1)
 * @returns {string} - El string formateado
 */
export const formatPercent = (value) => {
    if (value === undefined || value === null) return '0.0%';
    let val = Number(value);
    if (isNaN(val)) return '0.0%';

    // Si viene como decimal (0.15), convertir a 15
    if (val <= 1 && val > 0) val *= 100;

    return `${val.toFixed(1)}%`;
};
