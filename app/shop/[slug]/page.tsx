import { getProduct } from "@/app/actions/productActions";
import ProductDetails from "@/components/shop/ProductDetails";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const product = await getProduct(decodedSlug);

    if (!product || product.isHidden) {
        notFound();
    }

    return <ProductDetails product={product} />;
}
