import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/app/actions/productActions";
import { ArrowRight } from "lucide-react";

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
                        <div
                            key={product.id}
                            className="bg-white border-2 border-black overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
                        >
                            <div className="relative h-64 w-full bg-gray-100">
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                {!product.inStock && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="bg-red-600 text-white px-4 py-2 font-bold transform -rotate-12 border-2 border-white">
                                            SOLD OUT
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-brewery-dark">
                                        {product.name}
                                    </h3>
                                    <span className="bg-brewery-light text-brewery-dark text-xs font-bold px-2 py-1 border border-black">
                                        {product.abv}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-semibold mb-4">
                                    {product.style} • {product.volume}
                                </p>
                                <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xl font-bold text-brewery-green">
                                        €{product.price.toFixed(2)}
                                    </span>
                                    <Link
                                        href={`/shop/${product.slug}`}
                                        className="inline-flex items-center text-white bg-brewery-green hover:bg-opacity-90 font-bold py-2 px-4 transition-colors border-2 border-black"
                                    >
                                        Details <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
