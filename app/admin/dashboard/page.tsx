"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getProducts, createProduct, deleteProduct, updateStock, updateStockCount } from "@/app/actions/productActions";
import { Plus, Trash2, LogOut, Upload, X, RefreshCw } from "lucide-react";
import Image from "next/image";

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
    });

    const [uploading, setUploading] = useState(false);

    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
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
        Array.from(e.target.files).forEach((file) => {
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
            images: newProduct.images.length > 0 ? newProduct.images : ["https://placehold.co/600x600/png"],
            inStock: true,
            stockCount: Number(newProduct.stockCount),
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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-brewery-dark">
                        Admin Dashboard
                    </h1>
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
                                    <label className="block text-sm font-bold mb-1">Name</label>
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
                                        <label className="block text-sm font-bold mb-1">
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
                                        <label className="block text-sm font-bold mb-1">ABV</label>
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
                                        <label className="block text-sm font-bold mb-1">
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
                                        <label className="block text-sm font-bold mb-1">
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
                                <div>
                                    <label className="block text-sm font-bold mb-1">
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
                                    <label className="block text-sm font-bold mb-1">
                                        Images
                                    </label>
                                    <div className="flex items-center justify-center w-full">
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-black border-dashed cursor-pointer bg-gray-50 hover:bg-gray-100">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                                <p className="text-sm text-gray-500 font-semibold">
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
                                    <label className="block text-sm font-bold mb-1">
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
                                    className="w-full bg-brewery-dark text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black"
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Add Product"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Current Inventory</h2>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white p-6 border-2 border-black flex flex-col sm:flex-row gap-6 items-center"
                            >
                                <div className="relative h-32 w-32 flex-shrink-0 border-2 border-black">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-brewery-dark">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-semibold mb-2">
                                        {product.style} • {product.abv}
                                    </p>
                                    <p className="text-brewery-green font-bold text-lg mb-4">
                                        €{product.price.toFixed(2)}
                                    </p>
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
                                            <span className="ml-3 font-bold text-sm">
                                                {product.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">Stock:</span>
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
