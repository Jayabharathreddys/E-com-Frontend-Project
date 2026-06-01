import { describe, it, expect } from 'vitest';
import { STATUS_BADGE, formatDate } from '../utils/orderUtils';

describe('STATUS_BADGE', () => {
    it('has entries for confirmed, pending, failed, success', () => {
        expect(STATUS_BADGE.confirmed).toBeDefined();
        expect(STATUS_BADGE.pending).toBeDefined();
        expect(STATUS_BADGE.failed).toBeDefined();
        expect(STATUS_BADGE.success).toBeDefined();
    });

    it('confirmed badge uses correct CSS class', () => {
        expect(STATUS_BADGE.confirmed.cls).toBe('badge-confirmed');
    });

    it('failed badge uses correct CSS class', () => {
        expect(STATUS_BADGE.failed.cls).toBe('badge-failed');
    });

    it('pending badge uses correct CSS class', () => {
        expect(STATUS_BADGE.pending.cls).toBe('badge-pending');
    });

    it('success badge maps to badge-confirmed (same as confirmed)', () => {
        expect(STATUS_BADGE.success.cls).toBe('badge-confirmed');
    });
});

describe('formatDate', () => {
    it('returns "—" for null', () => {
        expect(formatDate(null)).toBe('—');
    });

    it('returns "—" for undefined', () => {
        expect(formatDate(undefined)).toBe('—');
    });

    it('returns "—" for empty string', () => {
        expect(formatDate('')).toBe('—');
    });

    it('returns a non-empty string for a valid ISO date', () => {
        const result = formatDate('2024-06-15T10:00:00.000Z');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
        expect(result).not.toBe('—');
    });

    it('date mode (default) does not include time components like HH:MM', () => {
        // en-IN date-only format: "15 Jun 2024" — no colon expected
        const result = formatDate('2024-06-15T10:00:00.000Z', 'date');
        // A time string like "10:00" would indicate datetime mode leaked in
        expect(result).not.toMatch(/\d{2}:\d{2}/);
    });

    it('datetime mode includes time information', () => {
        const result = formatDate('2024-06-15T10:30:00.000Z', 'datetime');
        // en-IN datetime format includes HH:MM
        expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('returns consistent results for the same input', () => {
        const iso = '2024-01-01T00:00:00.000Z';
        expect(formatDate(iso)).toBe(formatDate(iso));
    });
});
