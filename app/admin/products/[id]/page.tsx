"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getProductById, updateProduct } from "@/app/actions/productActions";
import { ArrowLeft, Save, Upload, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isAuthenticated, logout } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [product, setProduct] = useState({
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
        inStock: false
    });

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
            return;
        }

        const loadProduct = async () => {
            try {
                const data = await getProductById(id);
                if (data) {
                    setProduct({
                        name: data.name,
                        category: data.category || "BEER",
                        style: data.style || "",
                        abv: data.abv || "",
                        volume: data.volume || "",
                        price: data.price.toString(),
                        description: data.description,
                        images: data.images,
                        stockCount: data.stockCount,
                        btwCategory: data.btwCategory || 21,
                        inStock: data.inStock
                    });
                } else {
                    alert("Product not found");
                    router.push("/admin/products");
                }
            } catch (error) {
                console.error("Failed to load product", error);
                alert("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [isAuthenticated, router, id]);

    // ... (keep file handling functions)
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
                setProduct((prev) => ({
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
        setProduct((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const moveImage = (index: number, direction: 'left' | 'right') => {
        setProduct((prev) => {
            const newImages = [...prev.images];
            if (direction === 'left') {
                if (index === 0) return prev;
                [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
            } else {
                if (index === newImages.length - 1) return prev;
                [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
            }
            return { ...prev, images: newImages };
        });
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const result = await updateProduct(id, {
                name: product.name,
                category: product.category,
                style: product.style,
                abv: product.abv,
                volume: product.volume,
                price: parseFloat(product.price),
                description: product.description,
                images: product.images,
                stockCount: Number(product.stockCount),
                btwCategory: Number(product.btwCategory),
                inStock: product.inStock
            });

            if (result.success) {
                router.push("/admin/products");
                router.refresh();
            } else {
                alert("Failed to update product");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    // ... (keep handleLogout, checks, and loading)

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    if (!mounted || !isAuthenticated) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brewery-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ... (keep header) */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <Link
                            href="/admin/products"
                            className="flex items-center text-brewery-dark hover:text-brewery-green font-bold mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Products
                        </Link>
                        <h1 className="text-4xl font-bold text-brewery-dark">
                            Edit Product
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-red-600 hover:text-red-800 font-bold"
                    >
                        <LogOut className="h-5 w-5 mr-2" /> Logout
                    </button>
                </div>

                <div className="bg-white p-8 border-2 border-black shadow-lg">
                    <form onSubmit={handleUpdateProduct} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-1 text-black">Category</label>
                            <select
                                required
                                value={product.category}
                                onChange={(e) =>
                                    setProduct({ ...product, category: e.target.value })
                                }
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            >
                                <option value="BEER">Beer</option>
                                <option value="GIFTBOX">Giftbox</option>
                                <option value="GLASS">Glassware</option>
                                <option value="MERCH">Merchandise</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-black">Name</label>
                            <input
                                required
                                type="text"
                                value={product.name}
                                onChange={(e) =>
                                    setProduct({ ...product, name: e.target.value })
                                }
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            />
                        </div>

                        {product.category === 'BEER' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Style
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={product.style}
                                        onChange={(e) =>
                                            setProduct({ ...product, style: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">ABV</label>
                                    <input
                                        required
                                        type="text"
                                        value={product.abv}
                                        onChange={(e) =>
                                            setProduct({ ...product, abv: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                            {['BEER', 'GLASS', 'GIFTBOX'].includes(product.category) && (
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-black">
                                        Volume
                                    </label>
                                    <input
                                        type="text"
                                        value={product.volume}
                                        onChange={(e) =>
                                            setProduct({ ...product, volume: e.target.value })
                                        }
                                        placeholder="e.g. 33cl"
                                        className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                    />
                                </div>
                            )}
                            <div className={['BEER', 'GLASS', 'GIFTBOX'].includes(product.category) ? "" : "col-span-2"}>
                                <label className="block text-sm font-bold mb-1 text-black">
                                    Price (€)
                                </label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={product.price}
                                    onChange={(e) =>
                                        setProduct({ ...product, price: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-black">
                                    Stock Count
                                </label>
                                <input
                                    required
                                    type="number"
                                    value={product.stockCount}
                                    onChange={(e) =>
                                        setProduct({ ...product, stockCount: parseInt(e.target.value) })
                                    }
                                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1 text-black">
                                    BTW Category (%)
                                </label>
                                <select
                                    required
                                    value={product.btwCategory}
                                    onChange={(e) =>
                                        setProduct({ ...product, btwCategory: parseInt(e.target.value) })
                                    }
                                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                >
                                    <option value={0}>0%</option>
                                    <option value={6}>6%</option>
                                    <option value={12}>12%</option>
                                    <option value={21}>21%</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center cursor-pointer mb-2">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            checked={product.inStock}
                                            onChange={(e) =>
                                                setProduct({ ...product, inStock: e.target.checked })
                                            }
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
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1 text-black">
                                Images <span className="text-red-600">*</span>
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed cursor-pointer hover:bg-gray-100 ${product.images.length === 0 ? 'border-red-300 bg-red-50' : 'border-black bg-gray-50'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className={`w-8 h-8 mb-2 ${product.images.length === 0 ? 'text-red-400' : 'text-black'}`} />
                                        <p className={`text-sm font-semibold ${product.images.length === 0 ? 'text-red-500' : 'text-black'}`}>
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
                            {product.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {product.images.map((img, index) => (
                                        <div
                                            key={index}
                                            className="relative border border-black group"
                                        >
                                            <div className="relative h-32 w-full bg-gray-50">
                                                <Image
                                                    src={img}
                                                    alt={`Product image ${index + 1}`}
                                                    fill
                                                    className="object-contain" // Changed to contain to see full image
                                                />
                                            </div>

                                            {/* Action buttons overlay */}
                                            <div className="absolute top-1 right-1">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="bg-red-500 text-white p-1.5 shadow-md hover:bg-red-600 transition-colors border border-black"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Order controls */}
                                            <div className="flex border-t-2 border-black divide-x-2 divide-black">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => moveImage(index, 'left')}
                                                    className="flex-1 p-2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-colors"
                                                    title="Move Left"
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </button>
                                                <div className="px-3 flex items-center justify-center bg-gray-50 font-bold text-sm">
                                                    {index + 1}
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={index === product.images.length - 1}
                                                    onClick={() => moveImage(index, 'right')}
                                                    className="flex-1 p-2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-colors"
                                                    title="Move Right"
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </button>
                                            </div>
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
                                value={product.description}
                                onChange={(e) =>
                                    setProduct({
                                        ...product,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green h-32"
                            />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Link
                                href="/admin/products"
                                className="w-1/3 text-center bg-gray-200 text-black font-bold py-3 px-4 hover:bg-gray-300 transition-colors border-2 border-black"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="w-2/3 bg-brewery-green text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black disabled:opacity-50 flex justify-center items-center"
                                disabled={saving || uploading || product.images.length === 0}
                            >
                                <Save className="h-5 w-5 mr-2" />
                                {saving ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
