import { prisma } from "@/lib/prisma";

/**
 * Safely fetch a product by ID, handling the case where btwCategory column doesn't exist yet.
 * Falls back to raw SQL query if the column is missing.
 */
export async function safeGetProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });
        if (!product) return null;
        const stockCount = product.stockCount !== undefined && product.stockCount !== null ? Number(product.stockCount) : 0;
        return {
            ...product,
            stockCount,
            inStock: Boolean(product.inStock && stockCount > 0),
        };
    } catch (error: any) {
        // If btwCategory column doesn't exist, use raw query
        if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
            const products = await prisma.$queryRaw`
                SELECT id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
                FROM "Product"
                WHERE id = ${id}
                LIMIT 1
            ` as any[];
            if (products.length === 0) return null;
            const p = products[0];
            const stockCount = p.stockCount !== undefined && p.stockCount !== null ? Number(p.stockCount) : 0;
            return {
                ...p,
                stockCount,
                btwCategory: 21,
                isHidden: p.isHidden ?? false,
                inStock: Boolean(p.inStock && stockCount > 0),
            };
        }
        throw error;
    }
}
