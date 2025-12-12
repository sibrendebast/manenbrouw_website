import { prisma } from "@/lib/prisma";

/**
 * Safely fetch a product by ID, handling the case where btwCategory column doesn't exist yet.
 * Falls back to raw SQL query if the column is missing.
 */
export async function safeGetProduct(id: string) {
    try {
        return await prisma.product.findUnique({
            where: { id },
        });
    } catch (error: any) {
        // If btwCategory column doesn't exist, use raw query
        if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
            const products = await prisma.$queryRaw`
                SELECT id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "createdAt", "updatedAt"
                FROM "Product"
                WHERE id = ${id}
                LIMIT 1
            ` as any[];
            return products.length > 0 ? { ...products[0], btwCategory: 21 } : null;
        }
        throw error;
    }
}
