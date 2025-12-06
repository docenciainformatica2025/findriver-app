// Sistema de colores RGB dinámico
export const dynamicColors = {
    // Generador de colores basado en datos
    generateFromData: (value, min, max, reverse = false) => {
        const normalized = (value - min) / (max - min);
        const hue = reverse ? 120 - (normalized * 120) : normalized * 120;
        return `hsl(${hue}, 70%, 50%)`;
    },

    // Colores por categoría (hash dinámico)
    getCategoryColor: (category, saturation = 70, lightness = 50) => {
        // Generar hue basado en hash del string
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },

    // Gradientes dinámicos
    gradients: {
        primary: (angle = 135) => `linear-gradient(${angle}deg, rgb(52, 152, 219) 0%, rgb(41, 128, 185) 100%)`,
        success: (angle = 135) => `linear-gradient(${angle}deg, rgb(46, 204, 113) 0%, rgb(39, 174, 96) 100%)`,
        danger: (angle = 135) => `linear-gradient(${angle}deg, rgb(231, 76, 60) 0%, rgb(192, 57, 43) 100%)`,
        warning: (angle = 135) => `linear-gradient(${angle}deg, rgb(243, 156, 18) 0%, rgb(230, 126, 34) 100%)`,
        custom: (color1, color2, angle = 135) =>
            `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`,

        // Gradiente animado
        animated: (colors = ['#3498db', '#9b59b6', '#2ecc71'], duration = 5) => ({
            background: `linear-gradient(-45deg, ${colors.join(', ')})`,
            backgroundSize: '400% 400%',
            animation: `gradient ${duration}s ease infinite`,
        }),
    },

    // Colores semánticos dinámicos
    semantic: {
        income: (amount, maxIncome) => {
            const intensity = Math.min(amount / (maxIncome || 1000), 1);
            const green = Math.floor(46 + (204 - 46) * intensity);
            return `rgb(${green}, ${Math.floor(204 - 50 * intensity)}, ${Math.floor(113 - 30 * intensity)})`;
        },

        expense: (amount, maxExpense) => {
            const intensity = Math.min(amount / (maxExpense || 500), 1);
            const red = Math.floor(231 + (255 - 231) * intensity);
            return `rgb(${red}, ${Math.floor(76 - 30 * intensity)}, ${Math.floor(60 - 20 * intensity)})`;
        },

        profit: (profit, maxProfit) => {
            if (profit >= 0) {
                const intensity = Math.min(profit / (maxProfit || 1000), 1);
                return `rgb(52, ${Math.floor(152 + 50 * intensity)}, 219)`;
            } else {
                const intensity = Math.min(Math.abs(profit) / 500, 1);
                return `rgb(${Math.floor(231 - 50 * intensity)}, 76, 60)`;
            }
        },
    },

    // Modo oscuro/claro automático
    adaptive: (baseColor, isDark = false) => {
        const rgb = baseColor.match(/\d+/g);
        if (!rgb) return baseColor;

        if (isDark) {
            // Aclarar colores para modo oscuro
            return `rgb(${Math.min(255, parseInt(rgb[0]) + 40)}, 
                   ${Math.min(255, parseInt(rgb[1]) + 40)}, 
                   ${Math.min(255, parseInt(rgb[2]) + 40)})`;
        } else {
            // Oscurecer colores para modo claro
            return `rgb(${Math.max(0, parseInt(rgb[0]) - 20)}, 
                   ${Math.max(0, parseInt(rgb[1]) - 20)}, 
                   ${Math.max(0, parseInt(rgb[2]) - 20)})`;
        }
    },

    // Colores con transparencia
    withOpacity: (color, opacity = 0.8) => {
        if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
        }
        return color;
    },
};

// Paleta responsiva
export const responsivePalette = {
    // Colores primarios adaptativos
    primary: {
        light: 'rgb(92, 173, 226)',
        main: 'rgb(52, 152, 219)',
        dark: 'rgb(33, 97, 140)',
        contrastText: '#ffffff',
    },

    secondary: {
        light: 'rgb(88, 214, 141)',
        main: 'rgb(46, 204, 113)',
        dark: 'rgb(30, 132, 73)',
        contrastText: '#ffffff',
    },

    // Estados dinámicos
    status: {
        success: 'rgb(46, 204, 113)',
        error: 'rgb(231, 76, 60)',
        warning: 'rgb(243, 156, 18)',
        info: 'rgb(52, 152, 219)',
    },

    // Fondo y texto adaptativos
    background: {
        default: 'rgb(248, 249, 250)',
        paper: 'rgb(255, 255, 255)',
        dark: 'rgb(33, 37, 41)',
    },

    text: {
        primary: 'rgb(33, 37, 41)',
        secondary: 'rgb(108, 117, 125)',
        disabled: 'rgb(173, 181, 189)',
        inverse: 'rgb(255, 255, 255)',
    },

    // Para gráficos y datos
    data: {
        sequential: [
            'rgb(255, 245, 240)',
            'rgb(254, 224, 210)',
            'rgb(252, 187, 161)',
            'rgb(252, 146, 114)',
            'rgb(251, 106, 74)',
            'rgb(239, 59, 44)',
            'rgb(203, 24, 29)',
            'rgb(165, 15, 21)',
            'rgb(103, 0, 13)',
        ],

        categorical: [
            'rgb(52, 152, 219)',   // Azul
            'rgb(46, 204, 113)',   // Verde
            'rgb(155, 89, 182)',   // Morado
            'rgb(241, 196, 15)',   // Amarillo
            'rgb(230, 126, 34)',   // Naranja
            'rgb(231, 76, 60)',    // Rojo
            'rgb(149, 165, 166)',  // Gris
            'rgb(52, 73, 94)',     // Azul oscuro
        ],

        diverging: {
            positive: ['rgb(236, 244, 245)', 'rgb(46, 204, 113)'],
            negative: ['rgb(253, 237, 236)', 'rgb(231, 76, 60)'],
            neutral: ['rgb(248, 249, 250)', 'rgb(108, 117, 125)'],
        },
    },
};

// Hook para colores dinámicos
export const useDynamicColors = () => {
    const getResponsiveColor = (baseColor, themeMode = 'light') => {
        const colors = {
            light: {
                'rgb(52, 152, 219)': 'rgb(41, 128, 185)', // Más oscuro en claro
                'rgb(46, 204, 113)': 'rgb(39, 174, 96)',
                'rgb(231, 76, 60)': 'rgb(192, 57, 43)',
            },
            dark: {
                'rgb(52, 152, 219)': 'rgb(93, 173, 226)', // Más claro en oscuro
                'rgb(46, 204, 113)': 'rgb(88, 214, 141)',
                'rgb(231, 76, 60)': 'rgb(245, 108, 94)',
            },
        };

        return colors[themeMode][baseColor] || baseColor;
    };

    const generateHeatmapColor = (value, min, max) => {
        const normalized = (value - min) / (max - min);
        const red = Math.floor(255 * normalized);
        const green = Math.floor(255 * (1 - normalized));
        const blue = 100;
        return `rgb(${red}, ${green}, ${blue})`;
    };

    const getTimeBasedColor = () => {
        const hour = new Date().getHours();

        // Cambia según la hora del día
        if (hour >= 6 && hour < 12) {
            return 'rgb(255, 236, 179)'; // Mañana - amarillo suave
        } else if (hour >= 12 && hour < 18) {
            return 'rgb(179, 229, 252)'; // Tarde - azul claro
        } else if (hour >= 18 && hour < 22) {
            return 'rgb(255, 204, 188)'; // Atardecer - naranja
        } else {
            return 'rgb(179, 179, 255)'; // Noche - azul oscuro
        }
    };

    return {
        getResponsiveColor,
        generateHeatmapColor,
        getTimeBasedColor,
    };
};
