export const CURRENCY_CODE = 'MAD';

export function formatCurrency(value) {
    const amount = Number(value || 0);
    return `${amount.toFixed(2)} ${CURRENCY_CODE}`;
}
