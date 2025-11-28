'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return products.map(p => ({
            ...p,
            images: JSON.parse(p.images) as string[],
        }))
    } catch (error) {
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
        }
    } catch (error) {
        console.error('Failed to fetch product:', error)
        return null
    }
}

export async function createProduct(data: any) {
    try {
        const { images, ...rest } = data
        await prisma.product.create({
            data: {
                ...rest,
                images: JSON.stringify(images),
            },
        })
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
