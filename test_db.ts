import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const adminUsers = await prisma.adminUser.count()
  const recipes = await prisma.recipe.count()
  const brouwsels = await prisma.brouwsel.count()
  const products = await prisma.product.count()
  const orders = await prisma.order.count()
  console.log(`AdminUsers: ${adminUsers}, Recipes: ${recipes}, Brouwsels: ${brouwsels}, Products: ${products}, Orders: ${orders}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
