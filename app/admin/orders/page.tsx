"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getOrders, updateOrderStatus } from "@/app/actions/orderActions";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

    if (!mounted || !isAuthenticated) return null;

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

                <div className="space-y-6">
                    {orders
                        .filter((order: any) => filterStatus === "all" || order.status === filterStatus)
                        .length === 0 ? (
                        <div className="bg-white p-12 border-2 border-black text-center">
                            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 font-semibold">No orders found</p>
                        </div>
                    ) : (
                        orders
                            .filter((order: any) => filterStatus === "all" || order.status === filterStatus)
                            .map((order: any) => {
                                const shippingAddress = order.shippingAddress
                                    ? JSON.parse(order.shippingAddress)
                                    : null;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white p-6 border-2 border-black"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-brewery-dark">
                                                    Order #{order.id.slice(0, 8)}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <select
                                                    value={order.status}
                                                    onChange={async (e) => {
                                                        await updateOrderStatus(order.id, e.target.value);
                                                        loadOrders();
                                                    }}
                                                    className={`px-4 py-2 border-2 border-black font-bold ${order.status === "paid"
                                                        ? "bg-green-100"
                                                        : order.status === "completed"
                                                            ? "bg-blue-100"
                                                            : order.status === "cancelled"
                                                                ? "bg-red-100"
                                                                : "bg-yellow-100"
                                                        }`}
                                                >
                                                    <option value="pending_payment">Pending Payment</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <h4 className="font-bold text-sm mb-2">Customer Details</h4>
                                                <p className="text-sm">{order.customerName}</p>
                                                <p className="text-sm text-gray-600">{order.customerEmail}</p>
                                                <p className="text-sm text-gray-600">{order.customerPhone}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm mb-2">Shipping</h4>
                                                <p className="text-sm font-semibold">
                                                    {order.shippingMethod === "shipment"
                                                        ? "Delivery"
                                                        : "Pickup at Brewery"}
                                                </p>
                                                {shippingAddress && (
                                                    <div className="text-sm text-gray-600">
                                                        <p>{shippingAddress.street}</p>
                                                        <p>
                                                            {shippingAddress.zip} {shippingAddress.city}
                                                        </p>
                                                        <p>{shippingAddress.country}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t-2 border-gray-200 pt-4">
                                            <h4 className="font-bold text-sm mb-3">Order Items</h4>
                                            <div className="space-y-2">
                                                {order.items.map((item: any) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-center text-sm"
                                                    >
                                                        <span>
                                                            {item.product.name} x {item.quantity}
                                                        </span>
                                                        <span className="font-semibold">
                                                            €{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {order.shippingMethod === "shipment" && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span>Shipping</span>
                                                        <span className="font-semibold">€10.00</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center font-bold text-lg mt-4 pt-4 border-t-2 border-gray-200">
                                                <span>Total</span>
                                                <span className="text-brewery-green">
                                                    €{order.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {order.paymentMethod && (
                                            <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                                <p className="text-sm text-gray-600">
                                                    Payment Method:{" "}
                                                    <span className="font-semibold capitalize">
                                                        {order.paymentMethod}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>
        </div>
    );
}
