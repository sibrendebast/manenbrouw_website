"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getProducts, createProduct, deleteProduct, toggleHidden } from "@/app/actions/productActions";
import { Plus, Trash2, Upload, X, ArrowLeft, Pencil, Eye, EyeOff, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const EMPTY_FORM = {
    name: "",
    category: "BEER",
    style: "",
    abv: "",
    volume: "33cl",
    price: "",
    description: "",
    images: [] as string[],
    stockCount: 0,
    btwCategory: 21,
};

export default function AdminProductsPage() {
    const { isAuthenticated } = useAdminStore();
    const [products, setProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ ...EMPTY_FORM });
    const [uploading, setUploading] = useState(false);
    const [filterCategory, setFilterCategory] = useState("ALL");
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const loadProducts = async () => {
        const data = await getProducts();
        const sorted = data.sort((a: any, b: any) => {
            if (a.isHidden && !b.isHidden) return 1;
            if (!a.isHidden && b.isHidden) return -1;
            if (!a.isHidden && !b.isHidden) {
                if (a.inStock && !b.inStock) return -1;
                if (!a.inStock && b.inStock) return 1;
            }
            return 0;
        });
        setProducts(sorted);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            loadProducts();
        }
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        const formData = new FormData();
        Array.from(e.target.files).forEach((file: any) => formData.append("files", file));
        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.success) {
                setNewProduct(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
            } else alert("Upload failed");
        } catch { alert("Upload failed"); }
        finally { setUploading(false); }
    };

    const removeImage = (index: number) =>
        setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const slug = newProduct.name.toLowerCase().replace(/ /g, "-");
        const result = await createProduct({
            slug,
            name: newProduct.name,
            category: newProduct.category,
            style: newProduct.style,
            abv: newProduct.abv,
            volume: newProduct.volume,
            price: parseFloat(newProduct.price),
            description: newProduct.description,
            images: newProduct.images,
            inStock: true,
            stockCount: Number(newProduct.stockCount),
            btwCategory: Number(newProduct.btwCategory),
        });
        if (result.success) {
            loadProducts();
            setNewProduct({ ...EMPTY_FORM });
            setShowForm(false);
        } else {
            alert("Failed to add product");
        }
    };

    const categories = ["ALL", "BEER", "GIFTBOX", "GLASS", "MERCH"];
    const filteredProducts = products.filter(p =>
        filterCategory === "ALL" || p.category === filterCategory
    );

    return (
        <div className="min-h-screen bg-gray-100 text-black">

            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
                    <Link href="/admin/dashboard" className="text-brewery-dark hover:text-brewery-green">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-black text-brewery-dark flex-1">Products</h1>
                    <span className="text-sm text-gray-400 font-semibold">{filteredProducts.length}</span>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 bg-brewery-dark text-white px-4 py-2 font-bold text-sm border-2 border-black hover:bg-brewery-green transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>

                {/* Category filter pills */}
                <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide max-w-2xl mx-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`shrink-0 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
                                filterCategory === cat
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-300 hover:border-black"
                            }`}
                        >
                            {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product card list */}
            <div className="px-3 pt-4 pb-24 max-w-2xl mx-auto space-y-3">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="h-14 w-14 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-semibold text-lg">No products found</p>
                    </div>
                ) : (
                    filteredProducts.map((product: any) => {
                        const imgSrc = (!product.images || product.images.length === 0 || product.images[0]?.includes("placehold.co"))
                            ? "/logo.png"
                            : product.images[0];

                        return (
                            <div
                                key={product.id}
                                className={`bg-white border-2 border-black flex overflow-hidden ${product.isHidden ? "opacity-60" : ""}`}
                            >
                                {/* Product image — fills card height */}
                                <div className="relative w-28 self-stretch shrink-0 bg-gray-100">
                                    <Image src={imgSrc} alt={product.name} fill className="object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-black text-brewery-dark text-sm leading-tight truncate">
                                                {product.name}
                                            </p>
                                            <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                                                product.isHidden
                                                    ? "bg-gray-100 text-gray-500"
                                                    : product.inStock
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                            }`}>
                                                {product.isHidden ? "Hidden" : product.inStock ? `${product.stockCount} in stock` : "Out of stock"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-semibold capitalize mt-0.5">
                                            {product.category?.toLowerCase()} {product.style ? `· ${product.style}` : ""} {product.abv ? `· ${product.abv}` : ""}
                                        </p>
                                    </div>

                                    {/* Price + actions */}
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-black text-brewery-dark text-base">
                                            €{product.price.toFixed(2)}
                                        </span>
                                        <div className="flex gap-1.5">
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="p-2 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={async () => {
                                                    await toggleHidden(product.id, !product.isHidden);
                                                    loadProducts();
                                                }}
                                                className={`p-2 border transition-colors ${
                                                    product.isHidden
                                                        ? "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                                        : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                                                }`}
                                                title={product.isHidden ? "Show" : "Hide"}
                                            >
                                                {product.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm("Delete this product?")) {
                                                        await deleteProduct(product.id);
                                                        loadProducts();
                                                    }
                                                }}
                                                className="p-2 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Product modal / bottom sheet */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowForm(false)}
                    />

                    {/* Sheet */}
                    <div className="relative bg-white border-t-2 sm:border-2 border-black w-full sm:max-w-lg sm:max-h-[90vh] max-h-[92vh] overflow-y-auto z-10">
                        {/* Sheet header */}
                        <div className="sticky top-0 bg-white border-b-2 border-black flex items-center justify-between px-4 py-3 z-10">
                            <h2 className="font-black text-lg text-brewery-dark flex items-center gap-2">
                                <Plus className="h-5 w-5" /> Add New Product
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddProduct} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Category</label>
                                <select
                                    required
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                >
                                    <option value="BEER">Beer</option>
                                    <option value="GIFTBOX">Giftbox</option>
                                    <option value="GLASS">Glassware</option>
                                    <option value="MERCH">Merchandise</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Name</label>
                                <input
                                    required
                                    type="text"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                />
                            </div>

                            {newProduct.category === "BEER" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Style</label>
                                        <input
                                            required
                                            type="text"
                                            value={newProduct.style}
                                            onChange={e => setNewProduct({ ...newProduct, style: e.target.value })}
                                            className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">ABV</label>
                                        <input
                                            required
                                            type="text"
                                            value={newProduct.abv}
                                            onChange={e => setNewProduct({ ...newProduct, abv: e.target.value })}
                                            placeholder="e.g. 6.5%"
                                            className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                {["BEER", "GLASS", "GIFTBOX"].includes(newProduct.category) && (
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Volume</label>
                                        <input
                                            type="text"
                                            value={newProduct.volume}
                                            onChange={e => setNewProduct({ ...newProduct, volume: e.target.value })}
                                            placeholder="e.g. 33cl"
                                            className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                        />
                                    </div>
                                )}
                                <div className={["BEER", "GLASS", "GIFTBOX"].includes(newProduct.category) ? "" : "col-span-2"}>
                                    <label className="block text-sm font-bold mb-1">Price (€)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={newProduct.price}
                                        onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Stock Count</label>
                                    <input
                                        required
                                        type="number"
                                        value={newProduct.stockCount}
                                        onChange={e => setNewProduct({ ...newProduct, stockCount: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">BTW (%)</label>
                                    <select
                                        required
                                        value={newProduct.btwCategory}
                                        onChange={e => setNewProduct({ ...newProduct, btwCategory: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green text-base"
                                    >
                                        <option value={0}>0%</option>
                                        <option value={6}>6%</option>
                                        <option value={12}>12%</option>
                                        <option value={21}>21%</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image upload */}
                            <div>
                                <label className="block text-sm font-bold mb-1">
                                    Images <span className="text-red-500">*</span>
                                </label>
                                <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors ${
                                    newProduct.images.length === 0 ? "border-red-300 bg-red-50" : "border-black bg-gray-50"
                                }`}>
                                    <Upload className={`h-6 w-6 mb-1 ${newProduct.images.length === 0 ? "text-red-400" : "text-gray-500"}`} />
                                    <span className={`text-sm font-semibold ${newProduct.images.length === 0 ? "text-red-500" : "text-gray-600"}`}>
                                        {uploading ? "Uploading..." : "Tap to upload"}
                                    </span>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                </label>
                                {newProduct.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {newProduct.images.map((img, index) => (
                                            <div key={index} className="relative h-16 border border-black">
                                                <Image src={img} alt="Preview" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">Description</label>
                                <textarea
                                    required
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full px-3 py-2.5 border-2 border-black focus:outline-none focus:border-brewery-green h-24 text-base resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || newProduct.images.length === 0}
                                className="w-full bg-brewery-dark text-white font-black py-3.5 border-2 border-black hover:bg-brewery-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
                            >
                                {uploading ? "Uploading..." : "Add Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
