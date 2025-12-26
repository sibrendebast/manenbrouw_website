import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/data/products";

export interface CartItem extends Product {
    quantity: number;
    itemType: "product";
}

export interface EventTicketItem {
    id: string;
    title: string;
    date: Date;
    location: string;
    price: number;
    quantity: number;
    itemType: "ticket";
    eventId: string;
    capacity?: number;
    ticketsSold?: number;
}

type CartItemUnion = CartItem | EventTicketItem;

interface CartState {
    items: CartItemUnion[];
    addItem: (product: Product, quantity?: number) => void;
    addTicket: (event: any, quantity?: number) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity = 1) => {
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id && item.itemType === "product");

                // Check stock availability
                const stockCount = product.stockCount || 0;
                const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
                const newTotalQuantity = currentQuantityInCart + quantity;

                // Don't add if it would exceed stock
                if (newTotalQuantity > stockCount) {
                    console.warn(`Cannot add ${quantity} items. Only ${stockCount - currentQuantityInCart} available.`);
                    return;
                }

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id && item.itemType === "product"
                                ? { ...item, quantity: newTotalQuantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity, itemType: "product" as const }] });
                }
            },
            addTicket: (event, quantity = 1) => {
                const items = get().items;
                const ticketId = `ticket-${event.id}`;
                const existingTicket = items.find((item) => item.id === ticketId && item.itemType === "ticket");

                const ticketsAvailable = event.capacity ? Math.max(0, event.capacity - (event.ticketsSold || 0)) : Infinity;
                const currentQuantity = existingTicket ? existingTicket.quantity : 0;

                if (currentQuantity + quantity > ticketsAvailable) {
                    console.warn(`Cannot add ${quantity} tickets. Only ${ticketsAvailable - currentQuantity} available.`);
                    return;
                }

                if (existingTicket) {
                    set({
                        items: items.map((item) =>
                            item.id === ticketId && item.itemType === "ticket"
                                ? { ...item, quantity: item.quantity + quantity, capacity: event.capacity, ticketsSold: event.ticketsSold }
                                : item
                        ),
                    });
                } else {
                    const ticketItem: EventTicketItem = {
                        id: ticketId,
                        title: event.title,
                        date: event.date,
                        location: event.location,
                        price: event.ticketPrice,
                        quantity,
                        itemType: "ticket" as const,
                        eventId: event.id,
                        capacity: event.capacity,
                        ticketsSold: event.ticketsSold
                    };
                    set({ items: [...items, ticketItem] });
                }
            },
            removeItem: (itemId) => {
                set({ items: get().items.filter((item) => item.id !== itemId) });
            },
            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                } else {
                    const items = get().items;
                    const item = items.find((i) => i.id === itemId);

                    // For products, check stock limit
                    if (item && item.itemType === "product" && 'stockCount' in item) {
                        const stockCount = item.stockCount || 0;
                        if (quantity > stockCount) {
                            console.warn(`Cannot update to ${quantity}. Only ${stockCount} available.`);
                            return;
                        }
                    }

                    // For tickets, check capacity limit
                    if (item && item.itemType === "ticket" && 'capacity' in item && item.capacity) {
                        const ticketsAvailable = (item.capacity || 0) - (item.ticketsSold || 0);
                        if (quantity > ticketsAvailable) {
                            console.warn(`Cannot update to ${quantity}. Only ${ticketsAvailable} available.`);
                            return;
                        }
                    }

                    set({
                        items: items.map((item) =>
                            item.id === itemId ? { ...item, quantity } : item
                        ),
                    });
                }
            },
            clearCart: () => set({ items: [] }),
            getTotalItems: () =>
                get().items.reduce((total, item) => total + item.quantity, 0),
            getTotalPrice: () =>
                get().items.reduce((total, item) => total + item.price * item.quantity, 0),
        }),
        {
            name: "cart-storage",
        }
    )
);
