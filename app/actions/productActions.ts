'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/session'

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
                    SELECT id, slug, name, category, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
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
                    SELECT id, slug, name, category, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
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
                    SELECT id, slug, name, category, style, abv, volume, price, description, images, "inStock", "stockCount", "isHidden", "createdAt", "updatedAt"
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
    await requireAdminSession()
    try {
        const { images, btwCategory, b2bPrice, kegPrice, kegStockCount, stockCount, price, ...rest } = data

        const parsedData = {
            ...rest,
            price: parseFloat(price),
            b2bPrice: b2bPrice !== undefined && b2bPrice !== "" && b2bPrice !== null ? parseFloat(b2bPrice) : null,
            kegPrice: kegPrice !== undefined && kegPrice !== "" && kegPrice !== null ? parseFloat(kegPrice) : null,
            stockCount: stockCount !== undefined && stockCount !== "" && stockCount !== null ? parseInt(stockCount, 10) : 0,
            kegStockCount: kegStockCount !== undefined && kegStockCount !== "" && kegStockCount !== null ? parseInt(kegStockCount, 10) : 0,
            images: JSON.stringify(images),
            ...(btwCategory !== undefined && { btwCategory }),
        }

        await prisma.product.create({
            data: parsedData,
        })

        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error) {
        console.error('Failed to create product:', error)
        return { success: false, error }
    }
}

export async function updateProduct(id: string, data: any) {
    await requireAdminSession()
    try {
        const { images, b2bPrice, kegPrice, kegStockCount, stockCount, price, ...rest } = data
        
        const updateData: any = {
            ...rest,
            ...(images !== undefined && { images: JSON.stringify(images) }),
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(b2bPrice !== undefined && {
                b2bPrice: b2bPrice !== "" && b2bPrice !== null ? parseFloat(b2bPrice) : null,
            }),
            ...(kegPrice !== undefined && {
                kegPrice: kegPrice !== "" && kegPrice !== null ? parseFloat(kegPrice) : null,
            }),
            ...(stockCount !== undefined && {
                stockCount: stockCount !== "" && stockCount !== null ? parseInt(stockCount, 10) : 0,
            }),
            ...(kegStockCount !== undefined && {
                kegStockCount: kegStockCount !== "" && kegStockCount !== null ? parseInt(kegStockCount, 10) : 0,
            }),
        }

        await prisma.product.update({
            where: { id },
            data: updateData,
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error) {
        console.error('Failed to update product:', error)
        return { success: false, error }
    }
}

export async function updateKegStockCount(id: string, count: number) {
    await requireAdminSession()
    try {
        await prisma.product.update({
            where: { id },
            data: { kegStockCount: count },
        })
        revalidatePath('/shop')
        revalidatePath('/admin/dashboard')
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error) {
        console.error('Failed to update keg stock count:', error)
        return { success: false, error }
    }
}

export async function deleteProduct(id: string) {
    await requireAdminSession()
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
    await requireAdminSession()
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
    await requireAdminSession()
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
    await requireAdminSession()
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
    await requireAdminSession()
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
