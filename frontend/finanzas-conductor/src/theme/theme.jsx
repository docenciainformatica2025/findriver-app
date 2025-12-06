import React, { useState, useMemo } from 'react';
import { createTheme, responsiveFontSizes, ThemeProvider } from '@mui/material/styles';
import { dynamicColors, responsivePalette } from './colors';

// Función para crear tema dinámico
export const createDynamicTheme = (mode = 'light', userPreferences = {}) => {
    const isDark = mode === 'dark';

    // Colores base adaptativos
    const baseTheme = createTheme({
        palette: {
            mode,
            primary: {
                light: dynamicColors.adaptive(responsivePalette.primary.light, isDark),
                main: dynamicColors.adaptive(responsivePalette.primary.main, isDark),
                dark: dynamicColors.adaptive(responsivePalette.primary.dark, isDark),
                contrastText: responsivePalette.primary.contrastText,
            },
            secondary: {
                light: dynamicColors.adaptive(responsivePalette.secondary.light, isDark),
                main: dynamicColors.adaptive(responsivePalette.secondary.main, isDark),
                dark: dynamicColors.adaptive(responsivePalette.secondary.dark, isDark),
                contrastText: responsivePalette.secondary.contrastText,
            },
            background: {
                default: isDark ? responsivePalette.background.dark : responsivePalette.background.default,
                paper: isDark ? 'rgb(44, 48, 53)' : responsivePalette.background.paper,
            },
            text: {
                primary: isDark ? responsivePalette.text.inverse : responsivePalette.text.primary,
                secondary: isDark ? 'rgb(200, 200, 200)' : responsivePalette.text.secondary,
            },
            error: {
                main: dynamicColors.semantic.expense(100, 500),
            },
            success: {
                main: dynamicColors.semantic.income(100, 1000),
            },
            warning: {
                main: responsivePalette.status.warning,
            },
            info: {
                main: responsivePalette.status.info,
            },
            // Colores dinámicos para datos
            data: responsivePalette.data,
        },

        // Typography responsivo
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                background: dynamicColors.gradients.primary(),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            },
            h2: {
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
            },
            h3: {
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                fontWeight: 600,
            },
            h4: {
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 600,
            },
            h5: {
                fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                fontWeight: 500,
            },
            h6: {
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                fontWeight: 500,
            },
            body1: {
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
                lineHeight: 1.6,
            },
            body2: {
                fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
                lineHeight: 1.5,
            },
            button: {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            },
        },

        // Breakpoints personalizados
        breakpoints: {
            values: {
                xs: 0,
                sm: 600,
                md: 900,
                lg: 1200,
                xl: 1536,
                xxl: 1920,
            },
        },

        // Componentes personalizados
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                        },
                    },
                    containedPrimary: {
                        background: dynamicColors.gradients.primary(),
                        '&:hover': {
                            background: dynamicColors.gradients.primary(145),
                        },
                    },
                    containedSecondary: {
                        background: dynamicColors.gradients.success(),
                        '&:hover': {
                            background: dynamicColors.gradients.success(145),
                        },
                    },
                    outlined: {
                        borderWidth: 2,
                        '&:hover': {
                            borderWidth: 2,
                        },
                    },
                },
            },

            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        transition: 'all 0.3s ease',
                        background: isDark
                            ? 'linear-gradient(145deg, rgba(50, 50, 50, 0.9), rgba(40, 40, 40, 0.9))'
                            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(245, 245, 245, 0.9))',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: isDark
                                ? '0 20px 40px rgba(0,0,0,0.3)'
                                : '0 20px 40px rgba(0,0,0,0.1)',
                        },
                    },
                },
            },

            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none', // Remover gradiente por defecto
                    },
                },
            },

            MuiAppBar: {
                styleOverrides: {
                    root: {
                        background: isDark
                            ? 'rgba(33, 37, 41, 0.9)'
                            : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    },
                },
            },

            MuiChip: {
                styleOverrides: {
                    root: {
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    },
                    colorPrimary: {
                        background: dynamicColors.gradients.primary(90),
                    },
                    colorSecondary: {
                        background: dynamicColors.gradients.success(90),
                    },
                },
            },

            MuiLinearProgress: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        height: 10,
                    },
                    bar: {
                        borderRadius: 10,
                        background: dynamicColors.gradients.primary(90),
                    },
                },
            },

            MuiSkeleton: {
                styleOverrides: {
                    root: {
                        background: isDark
                            ? 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)'
                            : 'linear-gradient(90deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.05) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-wave 1.5s ease-in-out infinite',
                    },
                },
            },
        },

        // Transiciones personalizadas
        transitions: {
            duration: {
                shortest: 150,
                shorter: 200,
                short: 250,
                standard: 300,
                complex: 375,
                enteringScreen: 225,
                leavingScreen: 195,
            },
            easing: {
                easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
                easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
                easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
                sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
            },
        },

        // Sombras dinámicas
        shadows: [
            'none',
            isDark
                ? '0 2px 4px rgba(0,0,0,0.3)'
                : '0 2px 4px rgba(0,0,0,0.05)',
            isDark
                ? '0 4px 8px rgba(0,0,0,0.3)'
                : '0 4px 8px rgba(0,0,0,0.08)',
            // ... más sombras personalizadas
        ],

        // Formas
        shape: {
            borderRadius: 12,
        },
    });

    // Animaciones CSS
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
    @keyframes skeleton-wave {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.3); }
      50% { box-shadow: 0 0 40px rgba(52, 152, 219, 0.6); }
    }
  `;
    document.head.appendChild(styleSheet);

    // Hacer tipografía responsiva
    return responsiveFontSizes(baseTheme);
};

// Contexto para el tema
const ThemeContext = React.createContext();

// Hook interno para la lógica del tema
const useThemeLogic = () => {
    const [themeMode, setThemeMode] = useState('light');
    const [accentColor, setAccentColor] = useState(responsivePalette.primary.main);

    const toggleTheme = () => {
        setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
    };

    const updateAccentColor = (color) => {
        setAccentColor(color);
    };

    const theme = useMemo(() =>
        createDynamicTheme(themeMode, { accentColor }),
        [themeMode, accentColor]
    );

    return {
        theme,
        themeMode,
        toggleTheme,
        updateAccentColor,
    };
};

// Provider del tema dinámico
export const DynamicThemeProvider = ({ children }) => {
    const themeLogic = useThemeLogic();

    return (
        <ThemeContext.Provider value={themeLogic}>
            <ThemeProvider theme={themeLogic.theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

// Hook para consumir el contexto
export const useDynamicTheme = () => {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useDynamicTheme must be used within a DynamicThemeProvider');
    }
    return context;
};
