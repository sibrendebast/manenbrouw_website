export type TastingStatusType = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type TastingPaymentStatusType = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export function calculateEstimatedPrice(formula: string, peopleCount: number, keepGlass: boolean): number {
    let pricePerPerson = 20;
    if (formula.includes("6")) {
        pricePerPerson = 25;
    }
    let total = pricePerPerson * peopleCount;
    if (keepGlass) {
        total += 5 * peopleCount;
    }
    // Minimum group price is €150 according to brewery policy
    return Math.max(150, total);
}
