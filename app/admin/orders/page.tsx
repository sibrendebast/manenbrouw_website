"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { getOrders, updateOrderStatus, deleteOrder } from "@/app/actions/orderActions";
import { Package, ArrowLeft, FileText, Trash2 } from "lucide-react";
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
                                                    Order #{order.orderNumber || order.id.slice(0, 8)}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                                    {new Date(order.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
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
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
                                                                await deleteOrder(order.id);
                                                                loadOrders();
                                                            }
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all rounded-none"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                                {order.invoiceUrl && (
                                                    <a
                                                        href={order.invoiceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center px-4 py-2 border-2 border-black bg-white hover:bg-gray-100"
                                                    >
                                                        <FileText className="h-5 w-5 mr-2" />
                                                        Invoice
                                                    </a>
                                                )}
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

                                            {/* Column Headers */}
                                            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 mb-2 uppercase border-b border-gray-100 pb-2">
                                                <div className="col-span-7">Item</div>
                                                <div className="col-span-2 text-center">Qty</div>
                                                <div className="col-span-3 text-right">Total</div>
                                            </div>

                                            <div className="space-y-2">
                                                {order.items.map((item: any) => (
                                                    <div
                                                        key={item.id}
                                                        className="grid grid-cols-12 gap-2 items-center text-sm"
                                                    >
                                                        <div className="col-span-7">
                                                            {item.product.name}
                                                        </div>
                                                        <div className="col-span-2 text-center">
                                                            <span className="inline-block bg-gray-100 font-bold px-2 py-0.5 rounded text-gray-800">
                                                                {item.quantity}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-3 text-right font-semibold">
                                                            €{(item.price * item.quantity).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                                {order.shippingMethod === "shipment" && (
                                                    <div className="grid grid-cols-12 gap-2 items-center text-sm text-gray-600">
                                                        <div className="col-span-7">Shipping</div>
                                                        <div className="col-span-2 text-center">1</div>
                                                        <div className="col-span-3 text-right font-semibold">€10.00</div>
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
