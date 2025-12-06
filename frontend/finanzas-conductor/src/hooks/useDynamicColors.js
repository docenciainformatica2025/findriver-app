import { useState, useEffect, useCallback } from 'react';
import { dynamicColors } from '../theme/colors';

export const useDynamicColors = (initialConfig = {}) => {
    const [config, setConfig] = useState({
        mode: 'dynamic',
        saturation: 70,
        brightness: 50,
        animationSpeed: 1,
        ...initialConfig,
    });

    const [currentPalette, setCurrentPalette] = useState({});

    // Generar paleta basada en datos
    const generatePalette = useCallback((data = {}) => {
        const palette = {};

        Object.keys(data).forEach(key => {
            switch (config.mode) {
                case 'dynamic':
                    palette[key] = dynamicColors.getCategoryColor(
                        key,
                        config.saturation,
                        config.brightness
                    );
                    break;

                case 'data':
                    if (data[key] && typeof data[key].value === 'number') {
                        const values = Object.values(data)
                            .filter(d => d && typeof d.value === 'number')
                            .map(d => d.value);
                        const min = Math.min(...values);
                        const max = Math.max(...values);
                        palette[key] = dynamicColors.generateFromData(
                            data[key].value,
                            min,
                            max
                        );
                    }
                    break;

                case 'time':
                    palette[key] = dynamicColors.getCategoryColor(
                        key + new Date().getHours(),
                        config.saturation,
                        config.brightness
                    );
                    break;

                default:
                    palette[key] = dynamicColors.getCategoryColor(key);
            }
        });

        setCurrentPalette(palette);
        return palette;
    }, [config]);

    // Actualizar configuración
    const updateConfig = useCallback((updates) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    // Color para un valor específico
    const getColorForValue = useCallback((value, min, max) => {
        return dynamicColors.semantic.profit(value, max);
    }, []);

    // Color adaptativo al tema
    const getAdaptiveColor = useCallback((baseColor, isDark) => {
        return dynamicColors.adaptive(baseColor, isDark);
    }, []);

    // Animación de color
    const getAnimatedColor = useCallback((colors = ['#3498db', '#9b59b6', '#2ecc71']) => {
        return dynamicColors.gradients.animated(colors, 10 / config.animationSpeed);
    }, [config.animationSpeed]);

    // Efecto para actualizar paleta cuando cambia la configuración
    useEffect(() => {
        generatePalette(currentPalette);
    }, [config, generatePalette]);

    return {
        config,
        currentPalette,
        updateConfig,
        generatePalette,
        getColorForValue,
        getAdaptiveColor,
        getAnimatedColor,
        ...dynamicColors,
    };
};
