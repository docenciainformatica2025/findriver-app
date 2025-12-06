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
    // Colores temáticos Metálicos/RGB
    colors: {
        primary: '#2962FF', // Electric Blue
        secondary: '#00E5FF', // Cyan Neon
        danger: '#FF3D00', // Deep Orange
        warning: '#FF9100', // Orange Neon
        info: '#AA00FF', // Purple Neon
        dark: '#212121',
        light: '#FAFAFA',
        success: '#00E676', // Green Neon

        // Específico Finanzas
        income: '#00E676', // Verde Neón (Ingresos)
        expense: '#FF3D00', // Naranja/Rojo Intenso (Gastos)
        profit: '#2979FF'  // Azul Intenso (Ganancia)
    },
    gradients: {
        primary: ['#2962FF', '#00B0FF'],
        success: ['#00E676', '#00B0FF'], // Verde a Azul (Ingresos)
        danger: ['#FF9100', '#FF3D00'], // Amarillo a Naranja (Gastos)
        info: ['#AA00FF', '#EA80FC']
    }
};

// Paleta de colores para categorías (Vibrante)
export const categoryColors = {
    // Gastos (Cálidos)
    gasolina: '#FF9100', // Naranja Neón
    mantenimiento: '#FF3D00', // Rojo Naranja
    peaje: '#FFC400', // Amber
    comida: '#FF6D00', // Pumpkin
    otros: '#BF360C', // Deep Red

    // Ingresos (Fríos/Frescos)
    viaje: '#00E676', // Green Neon
    encomienda: '#00E5FF', // Cyan Neon
    app: '#2979FF', // Blue

    // Otros
    seguro: '#AA00FF', // Purple
    lavado: '#00B0FF' // Light Blue
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
