import { getProduct } from "@/app/actions/productActions";
import ProductDetails from "@/components/shop/ProductDetails";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    return <ProductDetails product={product} />;
}
