"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Package, Beer, LogOut, Mail, Calendar, Users, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { subscribeUser } from "@/app/actions/notificationActions";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function AdminDashboard() {
    const { isAuthenticated, logout } = useAdminStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else if ("serviceWorker" in navigator) {
            // Check if already subscribed
            navigator.serviceWorker.ready.then(async (registration) => {
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            });
        }
    }, [isAuthenticated, router]);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
            });

            // Send subscription to backend
            // Cast to any because the web-push types on frontend might differ slightly or JSON serialization
            const result = await subscribeUser(subscription.toJSON() as any);
            if (result.success) {
                setIsSubscribed(true);
                alert("Notifications enabled!");
            } else {
                alert("Failed to save subscription: " + result.error);
            }

        } catch (error) {
            console.error("Subscription error", error);
            alert("Failed to subscribe. Make sure you accepted permissions.");
        }
        setLoading(false);
    };

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
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSubscribe}
                            disabled={isSubscribed || loading}
                            className={`flex items-center font-bold px-4 py-2 rounded-md transition-colors ${isSubscribed
                                    ? "bg-green-100 text-green-700 cursor-default"
                                    : "bg-brewery-dark text-white hover:opacity-90"
                                }`}
                        >
                            {isSubscribed ? <Bell className="h-5 w-5 mr-2" /> : <BellOff className="h-5 w-5 mr-2" />}
                            {loading ? "Enabling..." : isSubscribed ? "Notifications Active" : "Enable Notifications"}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-red-600 hover:text-red-800 font-bold"
                        >
                            <LogOut className="h-5 w-5 mr-2" /> Logout
                        </button>
                    </div>
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

                    {/* Newsletter Management Card */}
                    <Link
                        href="/admin/newsletter"
                        className="bg-white p-8 border-2 border-black hover:border-brewery-green transition-all group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-brewery-dark p-6 mb-6 group-hover:bg-brewery-green transition-colors">
                                <Mail className="h-16 w-16 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-brewery-dark mb-3">
                                Newsletter Subscribers
                            </h2>
                            <p className="text-gray-600">
                                View and manage newsletter subscribers
                            </p>
                        </div>
                    </Link>

                    {/* Events Management Card */}
                    <Link
                        href="/admin/events"
                        className="bg-white p-8 border-2 border-black hover:border-brewery-green transition-all group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-brewery-dark p-6 mb-6 group-hover:bg-brewery-green transition-colors">
                                <Calendar className="h-16 w-16 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-brewery-dark mb-3">
                                Events Management
                            </h2>
                            <p className="text-gray-600">
                                Create and manage brewery events
                            </p>
                        </div>
                    </Link>

                    {/* Users Management Card */}
                    <Link
                        href="/admin/users"
                        className="bg-white p-8 border-2 border-black hover:border-brewery-green transition-all group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-brewery-dark p-6 mb-6 group-hover:bg-brewery-green transition-colors">
                                <Users className="h-16 w-16 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-brewery-dark mb-3">
                                User Management
                            </h2>
                            <p className="text-gray-600">
                                Manage admin users and access
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
