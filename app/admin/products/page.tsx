"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getProducts, createProduct, deleteProduct, updateStock, updateStockCount, updatePrice, toggleHidden } from "@/app/actions/productActions";
import { Plus, Trash2, LogOut, Upload, X, RefreshCw, ArrowLeft, Pencil, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminDashboard() {
    const { isAuthenticated, logout } = useAdminStore();
    const [products, setProducts] = useState<any[]>([]);
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Form State
    const [newProduct, setNewProduct] = useState({
        name: "",
        style: "",
        abv: "",
        volume: "33cl",
        price: "",
        description: "",
        images: [] as string[],
        stockCount: 0,
        btwCategory: 21,
    });

    const [uploading, setUploading] = useState(false);

    const loadProducts = async () => {
        const data = await getProducts();
        // Sort: 1. In Stock & Not Hidden, 2. Out of Stock & Not Hidden, 3. Hidden
        const sorted = data.sort((a: any, b: any) => {
            if (a.isHidden && !b.isHidden) return 1;
            if (!a.isHidden && b.isHidden) return -1;

            // If both are hidden or both are visible, sort by stock if visible
            if (!a.isHidden && !b.isHidden) {
                if (a.inStock && !b.inStock) return -1;
                if (!a.inStock && b.inStock) return 1;
            }

            return 0; // Keep original order (createdAt)
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
        Array.from(e.target.files).forEach((file: any) => {
            formData.append("files", file);
        });

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setNewProduct((prev) => ({
                    ...prev,
                    images: [...prev.images, ...data.urls],
                }));
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setNewProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const slug = newProduct.name.toLowerCase().replace(/ /g, "-");

        const result = await createProduct({
            slug,
            name: newProduct.name,
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
            setNewProduct({
                name: "",
                style: "",
                abv: "",
                volume: "33cl",
                price: "",
                description: "",
                images: [],
                stockCount: 0,
                btwCategory: 21,
            });
        } else {
            alert("Failed to add product");
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
                        </Link>
                        <h1 className="text-4xl font-bold text-brewery-dark">
                            Products Management
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-red-600 hover:text-red-800 font-bold"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Product Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 border-2 border-black shadow-lg sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Plus className="h-6 w-6 mr-2" /> Add New Beer
                            </h2>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={newProduct.name}
                                        onChange={(e) =>
                                            setNewProduct({ ...newProduct, name: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Style
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={newProduct.style}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, style: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">ABV</label>
                                        <input
                                            required
                                            type="text"
                                            value={newProduct.abv}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, abv: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Volume
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={newProduct.volume}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, volume: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Price (€)
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={newProduct.price}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, price: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            Stock Count
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            value={newProduct.stockCount}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, stockCount: parseInt(e.target.value) })
                                            }
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1 text-black">
                                            BTW Category (%)
                                        </label>
                                        <select
                                            required
                                            value={newProduct.btwCategory}
                                            onChange={(e) =>
                                                setNewProduct({ ...newProduct, btwCategory: parseInt(e.target.value) })
                                            }
                                            className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        >
                                            <option value={0}>0%</option>
                                            <option value={6}>6%</option>
                                            <option value={12}>12%</option>
                                            <option value={21}>21%</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Images <span className="text-red-600">*</span>
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed cursor-pointer hover:bg-gray-100 ${newProduct.images.length === 0 ? 'border-red-300 bg-red-50' : 'border-black bg-gray-50'}`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className={`w-8 h-8 mb-2 ${newProduct.images.length === 0 ? 'text-red-400' : 'text-black'}`} />
                                                <p className={`text-sm font-semibold ${newProduct.images.length === 0 ? 'text-red-500' : 'text-black'}`}>
                                                    {uploading
                                                        ? "Uploading..."
                                                        : "Click to upload images"}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    {newProduct.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mt-2">
                                            {newProduct.images.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className="relative h-20 w-full border border-black"
                                                >
                                                    <Image
                                                        src={img}
                                                        alt="Preview"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Description
                                    </label>
                                    <textarea
                                        required
                                        value={newProduct.description}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green h-24"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-brewery-dark text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={uploading || newProduct.images.length === 0}
                                >
                                    {uploading ? "Uploading..." : "Add Product"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Current Inventory</h2>
                        {products.map((product: any) => (
                            <div
                                key={product.id}
                                className="bg-white p-6 border-2 border-black flex flex-col sm:flex-row gap-6 items-center"
                            >
                                <div className="relative h-32 w-32 flex-shrink-0 border-2 border-black">
                                    <Image
                                        src={(!product.images || product.images.length === 0 || product.images[0].includes("placehold.co")) ? "/logo.png" : product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-brewery-dark">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-black font-semibold mb-2">
                                        {product.style} • {product.abv} • BTW: {product.btwCategory || 21}%
                                    </p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-brewery-green font-bold text-lg">€</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-24 px-2 py-1 border-2 border-black font-bold text-lg text-brewery-green"
                                            defaultValue={product.price}
                                            onBlur={async (e) => {
                                                const newPrice = parseFloat(e.target.value);
                                                if (newPrice !== product.price) {
                                                    await updatePrice(product.id, newPrice);
                                                    loadProducts();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start gap-4">
                                        <label className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={product.inStock}
                                                    onChange={async (e) => {
                                                        await updateStock(product.id, e.target.checked);
                                                        loadProducts();
                                                    }}
                                                />
                                                <div
                                                    className={`block w-14 h-8 rounded-full border-2 border-black transition-colors ${product.inStock ? "bg-green-500" : "bg-gray-300"
                                                        }`}
                                                ></div>
                                                <div
                                                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full border-2 border-black transition-transform ${product.inStock ? "transform translate-x-6" : ""
                                                        }`}
                                                ></div>
                                            </div>
                                            <span className="ml-3 font-bold text-sm text-black">
                                                {product.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-black">Stock:</span>
                                            <input
                                                type="number"
                                                className="w-20 px-2 py-1 border-2 border-black"
                                                value={product.stockCount}
                                                onChange={async (e) => {
                                                    // Optimistic update could be done here, but for now just trigger action
                                                    await updateStockCount(product.id, parseInt(e.target.value));
                                                    loadProducts();
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    className="p-3 text-blue-600 hover:bg-blue-50 border-2 border-transparent hover:border-blue-600 transition-all rounded-none"
                                    title="Edit Product"
                                >
                                    <Pencil className="h-6 w-6" />
                                </Link>
                                <button
                                    onClick={async () => {
                                        await toggleHidden(product.id, !product.isHidden);
                                        loadProducts();
                                    }}
                                    className={`p-3 border-2 border-transparent transition-all rounded-none ${product.isHidden
                                        ? "text-gray-400 hover:text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                                        : "text-indigo-600 hover:bg-indigo-50 hover:border-indigo-600"
                                        }`}
                                    title={product.isHidden ? "Show Product" : "Hide Product"}
                                >
                                    {product.isHidden ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure?')) {
                                            await deleteProduct(product.id);
                                            loadProducts();
                                        }
                                    }}
                                    className="p-3 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all rounded-none"
                                    title="Remove Product"
                                >
                                    <Trash2 className="h-6 w-6" />
                                </button>
                            </div>

                        ))}
                    </div>
                </div>
            </div >
        </div >
    );
}
