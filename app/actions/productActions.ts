'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return products.map((p: any) => ({
            ...p,
            images: JSON.parse(p.images) as string[],
            btwCategory: p.btwCategory ?? 21, // Default to 21 if not set
        }))
    } catch (error: any) {
        // If btwCategory column doesn't exist, retry with raw query or handle gracefully
        if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
            console.log('btwCategory column does not exist yet, fetching products without it')
            try {
                // Use raw query to select only existing columns
                const products = await prisma.$queryRaw`
                    SELECT id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
                    FROM "Product"
                    ORDER BY "createdAt" DESC
                ` as any[]
                return products.map((p: any) => ({
                    ...p,
                    images: JSON.parse(p.images) as string[],
                    btwCategory: 21, // Default to 21 when column doesn't exist
                }))
            } catch (rawError) {
                console.error('Failed to fetch products with raw query:', rawError)
                return []
            }
        }
        console.error('Failed to fetch products:', error)
        return []
    }
}

export async function getProduct(slug: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { slug },
        })
        if (!product) return null
        return {
            ...product,
            images: JSON.parse(product.images) as string[],
            btwCategory: (product as any).btwCategory ?? 21,
        }
    } catch (error: any) {
        // If btwCategory column doesn't exist, retry with raw query
        if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
            console.log('btwCategory column does not exist yet, fetching product without it')
            try {
                const products = await prisma.$queryRaw`
                    SELECT id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
                    FROM "Product"
                    WHERE slug = ${slug}
                    LIMIT 1
                ` as any[]
                if (products.length === 0) return null
                const product = products[0]
                return {
                    ...product,
                    images: JSON.parse(product.images) as string[],
                    btwCategory: 21,
                }
            } catch (rawError) {
                console.error('Failed to fetch product with raw query:', rawError)
                return null
            }
        }
        console.error('Failed to fetch product:', error)
        return null
    }
}

export async function getProductById(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
        })
        if (!product) return null
        return {
            ...product,
            images: JSON.parse(product.images) as string[],
            btwCategory: (product as any).btwCategory ?? 21,
        }
    } catch (error: any) {
        if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
            try {
                const products = await prisma.$queryRaw`
                    SELECT id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
                    FROM "Product"
                    WHERE id = ${id}
                    LIMIT 1
                ` as any[]
                if (products.length === 0) return null
                const product = products[0]
                return {
                    ...product,
                    images: JSON.parse(product.images) as string[],
                    btwCategory: 21,
                }
            } catch (rawError) {
                console.error('Failed to fetch product by id with raw query:', rawError)
                return null
            }
        }
        console.error('Failed to fetch product by id:', error)
        return null
    }
}

export async function createProduct(data: any) {
    try {
        const { images, btwCategory, ...rest } = data

        // Try to create with btwCategory first
        try {
            await prisma.product.create({
                data: {
                    ...rest,
                    images: JSON.stringify(images),
                    ...(btwCategory !== undefined && { btwCategory }),
                },
            })
        } catch (error: any) {
            // If column doesn't exist (P2022), retry without btwCategory
            if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
                console.log('btwCategory column does not exist yet, creating product without it')
                await prisma.product.create({
                    data: {
                        ...rest,
                        images: JSON.stringify(images),
                    },
                })
            } else {
                throw error
            }
        }

        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to create product:', error)
        return { success: false, error }
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        const { images, ...rest } = data
        await prisma.product.update({
            where: { id },
            data: {
                ...rest,
                images: JSON.stringify(images),
            },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to update product:', error)
        return { success: false, error }
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete product:', error)
        return { success: false, error }
    }
}

export async function updateStock(id: string, inStock: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { inStock },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to update stock:', error)
        return { success: false, error }
    }
}

export async function updateStockCount(id: string, count: number) {
    try {
        await prisma.product.update({
            where: { id },
            data: { stockCount: count },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to update stock count:', error)
        return { success: false, error }
    }
}

export async function updatePrice(id: string, price: number) {
    try {
        await prisma.product.update({
            where: { id },
            data: { price },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        return { success: true }
    } catch (error) {
        console.error('Failed to update price:', error)
        return { success: false, error }
    }
}

export async function toggleHidden(id: string, isHidden: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isHidden },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error) {
        console.error('Failed to update hidden status:', error)
        return { success: false, error }
    }
}
