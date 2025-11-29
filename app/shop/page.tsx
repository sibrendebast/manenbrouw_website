import { getProducts } from "@/app/actions/productActions";
import ProductCard from "./ProductCard";

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const products = await getProducts();

    return (
        <div className="bg-white min-h-screen py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brewery-dark mb-4">Our Beers</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Browse our current selection of small-batch craft beers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
}
