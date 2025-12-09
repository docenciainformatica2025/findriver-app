import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { gradients, shadows, cardThemes } from '../utils/themeUtils';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
    // 1. Intentar leer del localStorage o usar preferencia del sistema
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('themeMode');
        return saved || 'light';
    });

    // 2. Guardar en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // 3. Crear el tema de MUI dinámicamente
    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: {
                main: '#2962FF', // Electric Blue
                light: '#768FFF',
                dark: '#0039CB',
            },
            secondary: {
                main: '#00E5FF', // Cyan A400 (Neon Blue)
                light: '#6EFFFF',
                dark: '#00B2CC',
            },
            background: {
                default: mode === 'light' ? '#f4f6f8' : '#121212', // Solid dark background for dashboard
                paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
            },
            text: {
                primary: mode === 'light' ? '#1a2027' : '#ffffff',
                secondary: mode === 'light' ? '#3E5060' : 'rgba(255, 255, 255, 0.7)',
            },
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h4: { fontWeight: 700 },
        },
        shape: { borderRadius: 12 },
        // Custom mixins to share our extra theme utils
        custom: {
            gradients: mode === 'light' ? gradients : { ...gradients, primary: cardThemes.dark.gradient }, // Example adjustment
            shadows,
            cardThemes
        }
    }), [mode]);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
