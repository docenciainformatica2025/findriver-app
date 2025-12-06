export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '$0';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatKm = (km) => {
    if (km === null || km === undefined || isNaN(km)) return '0 km';
    return `${parseFloat(km).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} km`;
};

export const validateKmInput = (value) => {
    // Allows empty string, integers, and numbers with up to 1 decimal place
    return value === '' || /^\d*\.?\d{0,1}$/.test(value);
};

export const parseKmInput = (value) => {
    if (value === '') return '';
    const number = parseFloat(value);
    return isNaN(number) ? '' : number;
};
