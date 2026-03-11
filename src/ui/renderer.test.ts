import { describe, it, expect } from 'vitest';
import { formatMoney } from './format';

describe('formatMoney', () => {
    it('converts thousands to a formatted dollar string', () => {
        expect(formatMoney(1500)).toBe('$1,500,000');
    });

    it('handles values under 1000', () => {
        expect(formatMoney(500)).toBe('$500,000');
    });

    it('handles large values', () => {
        expect(formatMoney(30000)).toBe('$30,000,000');
    });

    it('handles zero', () => {
        expect(formatMoney(0)).toBe('$0');
    });
});
