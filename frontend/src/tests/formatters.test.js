import { describe, it, expect } from 'vitest';
import { formatMoney, formatKm, formatPercent } from '../utils/formatters';

describe('Utility Formatters', () => {
    it('formats money correctly (COP)', () => {
        // Allow for space or no space after symbol
        expect(formatMoney(12000)).toMatch(/\$\s?12\.000/);
        expect(formatMoney(0)).toMatch(/\$\s?0/);
        expect(formatMoney(1000000)).toMatch(/\$\s?1\.000\.000/);
    });

    it('formats kilometers correctly', () => {
        expect(formatKm(120.5)).toBe('120.5 km');
        expect(formatKm(100)).toBe('100.0 km');
        expect(formatKm(0)).toBe('0.0 km');
    });

    it('formats percentages correctly', () => {
        // Note: formatPercent(val, isDecimal)
        expect(formatPercent(0.25, true)).toBe('25%');
        expect(formatPercent(100)).toBe('100%');
        expect(formatPercent(0.125, true)).toBe('13%');
    });
});
