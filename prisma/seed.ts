import { PrismaClient } from '@prisma/client'
import { products } from '../data/products'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    for (const product of products) {
        const { id, ...rest } = product
        // We'll let Prisma generate new UUIDs or use the existing ones if they are valid UUIDs.
        // The existing IDs are "1", "2", etc., which are not UUIDs. 
        // So we will create new entries.

        // Check if product exists by slug to avoid duplicates on re-runs
        const existing = await prisma.product.findUnique({
            where: { slug: product.slug }
        })

        if (!existing) {
            await prisma.product.create({
                data: {
                    ...rest,
                    images: JSON.stringify(product.images),
                    stockCount: 10, // Default stock count for initial seed
                },
            })
            console.log(`Created product: ${product.name}`)
        } else {
            console.log(`Product already exists: ${product.name}`)
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
