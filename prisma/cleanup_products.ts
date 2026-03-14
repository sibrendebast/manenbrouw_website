import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const productsToDelete = [
        "Betoverende Becca",
        "Passionele Pommelien",
        "Malafide Margarita",
        "Joviale Jasmien",
        "Wulpse Wanda"
    ];

    for (const name of productsToDelete) {
        const result = await prisma.product.deleteMany({
            where: { name }
        });
        console.log(`Deleted ${result.count} products named ${name}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
