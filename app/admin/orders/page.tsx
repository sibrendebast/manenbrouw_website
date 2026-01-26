"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getOrders, updateOrderStatus, deleteOrder } from "@/app/actions/orderActions";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import OrderRow from "./OrderRow";

export default function AdminOrdersPage() {
    const { isAuthenticated } = useAdminStore();
    const [orders, setOrders] = useState<any[]>([]);
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

    const filteredOrders = orders.filter((order: any) => filterStatus === "all" || order.status === filterStatus);

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
                            Orders Management
                        </h1>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="mb-8">
                    <label className="mr-4 font-bold">Filter by Status:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green bg-white"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="bg-white border-2 border-black shadow-sm overflow-hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 font-semibold">No orders found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Order Details
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order: any) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            onUpdateStatus={handleUpdateStatus}
                                            onDelete={handleDeleteOrder}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
