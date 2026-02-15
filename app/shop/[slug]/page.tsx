import { getProduct } from "@/app/actions/productActions";
import ProductDetails from "@/components/shop/ProductDetails";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const product = await getProduct(decodedSlug);

    return <ProductDetails product={product} />;
}
