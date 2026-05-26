"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getOrders, updateOrderStatus, deleteOrder } from "@/app/actions/orderActions";
import { Package, ArrowLeft, BarChart2, List } from "lucide-react";
import Link from "next/link";
import OrderCard from "./OrderRow";
import OrderStatistics from "./OrderStatistics";

const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "pending_payment", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
    all: "bg-gray-800 text-white",
    pending_payment: "bg-yellow-500 text-white",
    paid: "bg-green-600 text-white",
    shipped: "bg-blue-600 text-white",
    completed: "bg-gray-500 text-white",
    cancelled: "bg-red-600 text-white",
};

const STATUS_COLORS_INACTIVE: Record<string, string> = {
    all: "bg-white text-gray-700 border-gray-300",
    pending_payment: "bg-yellow-50 text-yellow-800 border-yellow-300",
    paid: "bg-green-50 text-green-800 border-green-300",
    shipped: "bg-blue-50 text-blue-800 border-blue-300",
    completed: "bg-gray-100 text-gray-700 border-gray-300",
    cancelled: "bg-red-50 text-red-700 border-red-300",
};

export default function AdminOrdersPage() {
    const { isAuthenticated } = useAdminStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"orders" | "analytics">("orders");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    const loadOrders = async () => {
        const data = await getOrders();
        setOrders(data);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            loadOrders();
        }
    }, [isAuthenticated, router]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        await updateOrderStatus(orderId, status);
        await loadOrders();
    };

    const handleDeleteOrder = async (orderId: string) => {
        await deleteOrder(orderId);
        await loadOrders();
    };

    if (!mounted || !isAuthenticated) return null;

    const filteredOrders = orders.filter(
        (order: any) => filterStatus === "all" || order.status === filterStatus
    );

    // Count per status for badges
    const countByStatus = orders.reduce((acc: Record<string, number>, o: any) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-100 text-black">
            {/* Sticky top bar */}
            <div className="sticky top-0 z-10 bg-white border-b-2 border-black shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3">
                    <Link
                        href="/admin/dashboard"
                        className="text-brewery-dark hover:text-brewery-green transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-black text-brewery-dark flex-1">Orders</h1>
                    <span className="text-sm text-gray-500 font-semibold">
                        {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Tab row */}
                <div className="flex border-t border-gray-200">
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                            activeTab === "orders"
                                ? "bg-black text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <List className="h-4 w-4" />
                        Orders
                    </button>
                    <button
                        onClick={() => setActiveTab("analytics")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                            activeTab === "analytics"
                                ? "bg-black text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        <BarChart2 className="h-4 w-4" />
                        Analytics
                    </button>
                </div>
            </div>

            {activeTab === "orders" ? (
                <div className="px-3 pt-4 pb-8 max-w-2xl mx-auto">
                    {/* Pill filter buttons — horizontally scrollable */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide snap-x">
                        {STATUS_FILTERS.map((f) => {
                            const isActive = filterStatus === f.value;
                            const count = f.value === "all"
                                ? orders.length
                                : (countByStatus[f.value] || 0);
                            return (
                                <button
                                    key={f.value}
                                    onClick={() => setFilterStatus(f.value)}
                                    className={`snap-start shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-bold transition-all ${
                                        isActive
                                            ? STATUS_COLORS[f.value]
                                            : STATUS_COLORS_INACTIVE[f.value]
                                    }`}
                                >
                                    {f.label}
                                    {count > 0 && (
                                        <span className={`text-xs rounded-full px-1.5 py-0.5 font-black ${
                                            isActive ? "bg-white/30" : "bg-black/10"
                                        }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Order cards */}
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Package className="h-14 w-14 text-gray-300 mb-4" />
                            <p className="text-gray-500 font-semibold text-lg">No orders found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {filterStatus !== "all" ? "Try a different filter" : "Orders will appear here"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredOrders.map((order: any) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onUpdateStatus={handleUpdateStatus}
                                    onDelete={handleDeleteOrder}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-3 pt-4 pb-8 max-w-2xl mx-auto">
                    <OrderStatistics orders={orders} />
                </div>
            )}
        </div>
    );
}
