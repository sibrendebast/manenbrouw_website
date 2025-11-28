import { getProduct } from "@/app/actions/productActions";
import ProductDetails from "@/components/shop/ProductDetails";
import Link from "next/link";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
                <Link
                    href="/shop"
                    className="text-brewery-green hover:underline font-bold"
                >
                    Back to Shop
                </Link>
            </div>
        );
    }

    return <ProductDetails product={product} />;
}
