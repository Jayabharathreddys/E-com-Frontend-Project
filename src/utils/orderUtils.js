/**
 * Shared utilities for order display — used by Orders.jsx and OrderDetail.jsx.
 * Centralising here removes code duplication and ensures consistent formatting.
 */

/** Maps booking status → badge CSS class and display text. */
export const STATUS_BADGE = {
    confirmed: { cls: 'badge-confirmed', text: '✓ Confirmed' },
    pending: { cls: 'badge-pending', text: '⏳ Pending' },
    failed: { cls: 'badge-failed', text: '✗ Failed' },
    success: { cls: 'badge-confirmed', text: '✓ Success' },
};

/**
 * Format an ISO date string into a human-readable locale string.
 *
 * @param {string|null} iso - ISO 8601 date string.
 * @param {'date'|'datetime'} [mode='date'] - 'date' for date only, 'datetime' to include time.
 * @returns {string}
 */
export function formatDate(iso, mode = 'date') {
    if (!iso) return '—';
    const opts =
        mode === 'datetime'
            ? {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              }
            : { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(iso).toLocaleDateString('en-IN', opts);
}
