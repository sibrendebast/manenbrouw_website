"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Package, Beer, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const { isAuthenticated, logout } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        }
    }, [isAuthenticated, router]);

    if (!mounted || !isAuthenticated) return null;

    const handleLogout = () => {
        logout();
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 text-black">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                    {/* Products Management Card */}
                    <Link
                        href="/admin/products"
                        className="bg-white p-8 border-2 border-black hover:border-brewery-green transition-all group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-brewery-dark p-6 mb-6 group-hover:bg-brewery-green transition-colors">
                                <Beer className="h-16 w-16 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-brewery-dark mb-3">
                                Products Management
                            </h2>
                            <p className="text-gray-600">
                                Add, edit, and manage your beer inventory
                            </p>
                        </div>
                    </Link>

                    {/* Orders Management Card */}
                    <Link
                        href="/admin/orders"
                        className="bg-white p-8 border-2 border-black hover:border-brewery-green transition-all group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-brewery-dark p-6 mb-6 group-hover:bg-brewery-green transition-colors">
                                <Package className="h-16 w-16 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-brewery-dark mb-3">
                                Orders Management
                            </h2>
                            <p className="text-gray-600">
                                View and manage customer orders
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
