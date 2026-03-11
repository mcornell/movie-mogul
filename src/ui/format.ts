/** Format a dollar amount from thousands: 1500 → "$1,500,000" */
export function formatMoney(thousands: number): string {
    const full = thousands * 1000;
    return '$' + full.toLocaleString('en-US');
}
