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
                main: '#3498db',
                light: '#5dade2',
                dark: '#21618c',
            },
            secondary: {
                main: '#2ecc71',
                light: '#58d68d',
                dark: '#1e8449',
            },
            background: {
                default: mode === 'light' ? '#f8f9fa' : '#121212',
                paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
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
