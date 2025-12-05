import { prisma } from "@/lib/prisma";
import HomeContent from "./HomeContent";

export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      where: { inStock: true }
    });
    return products.map((p: any) => ({
      ...p,
      images: JSON.parse(p.images) as string[],
      btwCategory: p.btwCategory ?? 21,
    }));
  } catch (error: any) {
    // If btwCategory column doesn't exist, retry with raw query
    if (error?.code === 'P2022' && error?.meta?.column === 'btwCategory') {
      console.log('btwCategory column does not exist yet, fetching featured products without it');
      try {
        const products = await prisma.$queryRaw`
          SELECT id, slug, name, style, abv, volume, price, description, images, "inStock", "stockCount", "createdAt", "updatedAt"
          FROM "Product"
          WHERE "inStock" = true
          ORDER BY "createdAt" DESC
          LIMIT 2
        ` as any[];
        return products.map((p: any) => ({
          ...p,
          images: JSON.parse(p.images) as string[],
          btwCategory: 21,
        }));
      } catch (rawError) {
        console.error('Failed to fetch featured products with raw query:', rawError);
        return [];
      }
    }
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return <HomeContent featuredProducts={featuredProducts} />;
}
