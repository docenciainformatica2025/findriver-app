import { alpha } from '@mui/material/styles';

export const cardThemes = {
    primary: {
        main: '#2563EB',
        gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', // Brighter blue gradient
        shadow: '0 8px 32px 0 rgba(37, 99, 235, 0.3)'
    },
    secondary: {
        main: '#059669',
        gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', // Distinct Emerald
        shadow: '0 8px 32px 0 rgba(16, 185, 129, 0.3)'
    },
    error: {
        main: '#DC2626',
        gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', // Strong Red
        shadow: '0 8px 32px 0 rgba(239, 68, 68, 0.3)'
    },
    info: {
        main: '#6366F1',
        gradient: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)', // Indigo/Violet
        shadow: '0 8px 32px 0 rgba(99, 102, 241, 0.3)'
    },
    warning: {
        main: '#D97706',
        gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)', // Amber
        shadow: '0 8px 32px 0 rgba(245, 158, 11, 0.3)'
    },
    dark: {
        main: '#1F2937',
        gradient: 'linear-gradient(135deg, #374151 0%, #111827 100%)', // Slate
        shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
    }
};

export const gradients = {
    // Keeping backward compatibility for other components if needed, but pointing to new values
    primary: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    secondary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    info: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    dark: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
};

export const shadows = {
    card: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    cardHover: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fab: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    navbar: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    floating: '0 8px 16px rgba(0, 0, 0, 0.15), 0 4px 4px rgba(0, 0, 0, 0.05)'
};

export const cardStyles = {
    root: {
        borderRadius: 4,
        boxShadow: shadows.card,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        border: '1px solid rgba(0,0,0,0.03)',
        overflow: 'hidden',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: shadows.cardHover,
        },
    },
    gradient: {
        color: '#fff',
        borderRadius: 4,
        boxShadow: shadows.card,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: shadows.cardHover,
        },
    }
};
