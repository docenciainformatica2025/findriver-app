// Adapted from React Native styles for React Web

export const chartStyles = {
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    card: {
        margin: '10px',
        borderRadius: '15px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1.5rem'
    },
    title: {
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#2C3E50',
        marginBottom: '10px'
    },
    subtitle: {
        fontSize: '16px',
        color: '#7F8C8D',
        marginBottom: '20px'
    },
    chartContainer: {
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        marginVertical: '10px'
    },
    legendContainer: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    legendItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        margin: '5px',
        padding: '5px 10px',
        backgroundColor: '#fff',
        borderRadius: '20px',
        border: '1px solid #eee'
    },
    legendColor: {
        width: '12px',
        height: '12px',
        borderRadius: '6px',
        marginRight: '8px'
    },
    legendText: {
        fontSize: '12px',
        color: '#34495E'
    },
    tooltip: {
        backgroundColor: '#2C3E50',
        padding: '10px',
        borderRadius: '6px',
        border: 'none',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    tooltipText: {
        color: '#fff',
        fontSize: '12px'
    },
    axisLabel: {
        fontSize: '11px',
        fill: '#7F8C8D',
        fontWeight: '500'
    },
    gridLine: {
        stroke: '#ecf0f1',
        strokeWidth: 1
    },
    // Colores temáticos
    colors: {
        primary: '#3498DB',
        secondary: '#2ECC71',
        danger: '#E74C3C',
        warning: '#F39C12',
        info: '#9B59B6',
        dark: '#2C3E50',
        light: '#ECF0F1',
        success: '#27AE60',
        income: '#2ECC71',
        expense: '#E74C3C',
        profit: '#3498DB'
    },
    gradients: {
        primary: ['#3498DB', '#2980B9'],
        success: ['#2ECC71', '#27AE60'],
        danger: ['#E74C3C', '#C0392B']
    }
};

// Paleta de colores para categorías
export const categoryColors = {
    gasolina: '#FF6384',
    mantenimiento: '#4BC0C0',
    peaje: '#FFCE56',
    comida: '#36A2EB',
    otros: '#9966FF',
    viaje: '#2ECC71',
    encomienda: '#3498DB',
    app: '#9B59B6',
    seguro: '#FF9F40',
    lavado: '#8AC926'
};

// Configuración de gráficos por tipo
export const chartConfigs = {
    bar: {
        barPercentage: 0.7,
        decimalPlaces: 0,
        style: {
            borderRadius: 16
        },
        propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: '#ecf0f1'
        }
    },
    line: {
        strokeWidth: 3,
        bezier: true,
        decimalPlaces: 0,
        propsForDots: {
            r: '6',
            strokeWidth: '2'
        }
    },
    pie: {
        backgroundColor: 'transparent',
        paddingLeft: '15',
        absolute: true
    }
};
