import { getProducts } from "@/app/actions/productActions";
import ShopContent from "./ShopContent";

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const allProducts = await getProducts();
    const products = allProducts.filter((p: any) => !p.isHidden);

    return <ShopContent products={products} />;
}
