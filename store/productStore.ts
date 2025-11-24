import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products as initialProducts, Product } from "@/data/products";

interface ProductState {
    products: Product[];
    addProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;
    updateStock: (productId: string, inStock: boolean) => void;
    getProduct: (slug: string) => Product | undefined;
}

export const useProductStore = create<ProductState>()(
    persist(
        (set, get) => ({
            products: initialProducts,
            addProduct: (product) =>
                set((state) => ({ products: [...state.products, product] })),
            removeProduct: (productId) =>
                set((state) => ({
                    products: state.products.filter((p) => p.id !== productId),
                })),
            updateStock: (productId, inStock) =>
                set((state) => ({
                    products: state.products.map((p) =>
                        p.id === productId ? { ...p, inStock } : p
                    ),
                })),
            getProduct: (slug) => get().products.find((p) => p.slug === slug),
        }),
        {
            name: "product-storage",
        }
    )
);
