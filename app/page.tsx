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
    }));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return <HomeContent featuredProducts={featuredProducts} />;
}
