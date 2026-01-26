"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getProducts, createProduct, deleteProduct, toggleHidden } from "@/app/actions/productActions";
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
                        <div className="bg-white border-2 border-black overflow-x-auto">
                            <table className="min-w-full divide-y-2 divide-black">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider border-r-2 border-black">
                                            Image
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-bold text-black uppercase tracking-wider border-r-2 border-black">
                                            Product
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-center text-xs font-bold text-black uppercase tracking-wider border-r-2 border-black">
                                            Price
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-center text-xs font-bold text-black uppercase tracking-wider border-r-2 border-black">
                                            Stock
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-center text-xs font-bold text-black uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-black bg-white">
                                    {products.map((product: any) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 whitespace-nowrap border-r-2 border-black w-14">
                                                <div className="relative h-10 w-10 border border-black">
                                                    <Image
                                                        src={(!product.images || product.images.length === 0 || product.images[0].includes("placehold.co")) ? "/logo.png" : product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 border-r-2 border-black">
                                                <div className="text-sm font-bold text-brewery-dark">{product.name}</div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center border-r-2 border-black">
                                                <div className="text-sm font-bold text-black">€ {product.price.toFixed(2)}</div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center border-r-2 border-black">
                                                <div className="flex flex-col items-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full border border-black mb-1 ${product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}>
                                                        {product.inStock ? "In" : "Out"}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {product.stockCount}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center items-center space-x-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}`}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 border border-black transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={async () => {
                                                            await toggleHidden(product.id, !product.isHidden);
                                                            loadProducts();
                                                        }}
                                                        className={`p-1.5 border border-black transition-colors ${product.isHidden
                                                            ? "text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100"
                                                            : "text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100"
                                                            }`}
                                                        title={product.isHidden ? "Show Product" : "Hide Product"}
                                                    >
                                                        {product.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Are you sure?')) {
                                                                await deleteProduct(product.id);
                                                                loadProducts();
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 border border-black transition-colors"
                                                        title="Remove Product"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
