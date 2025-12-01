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

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id && item.itemType === "product"
                                ? { ...item, quantity: item.quantity + quantity }
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

                if (existingTicket) {
                    set({
                        items: items.map((item) =>
                            item.id === ticketId && item.itemType === "ticket"
                                ? { ...item, quantity: item.quantity + quantity }
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
                    set({
                        items: get().items.map((item) =>
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
