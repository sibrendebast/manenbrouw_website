export interface BtwBreakdown {
    category: number;
    subtotal: number;
    btw: number;
}

export function calculateBtwBreakdown(items: { price: number; quantity: number; btwCategory?: number }[]): BtwBreakdown[] {
    const btwMap = new Map<number, number>();
    
    items.forEach(item => {
        const category = item.btwCategory || 21;
        const itemTotal = item.price * item.quantity;
        const currentSubtotal = btwMap.get(category) || 0;
        btwMap.set(category, currentSubtotal + itemTotal);
    });
    
    const breakdown: BtwBreakdown[] = [];
    btwMap.forEach((subtotal, category) => {
        // Calculate VAT component from VAT-inclusive price
        // If price includes VAT: VAT = price - (price / (1 + rate))
        // Example: €10 incl. 21% VAT -> VAT = €10 - (€10 / 1.21) = €1.74
        const btw = subtotal - (subtotal / (1 + category / 100));
        breakdown.push({ category, subtotal, btw });
    });
    
    return breakdown.sort((a, b) => b.category - a.category);
}
