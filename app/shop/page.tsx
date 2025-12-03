import { getProducts } from "@/app/actions/productActions";
import ShopContent from "./ShopContent";

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const products = await getProducts();

    return <ShopContent products={products} />;
}
