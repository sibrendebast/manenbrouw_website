"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Trash2 } from "lucide-react";

interface OrderRowProps {
    order: any;
    onUpdateStatus: (orderId: string, status: string) => Promise<void>;
    onDelete: (orderId: string) => Promise<void>;
}

export default function OrderRow({ order, onUpdateStatus, onDelete }: OrderRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setIsUpdating(true);
        await onUpdateStatus(order.id, e.target.value);
        setIsUpdating(false);
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
            await onDelete(order.id);
        }
    };

    const shippingAddress = order.shippingAddress
        ? JSON.parse(order.shippingAddress)
        : null;

    const statusColors: Record<string, string> = {
        pending_payment: "bg-yellow-100 text-yellow-800",
        paid: "bg-green-100 text-green-800",
        shipped: "bg-blue-100 text-blue-800",
        completed: "bg-gray-100 text-gray-800",
        cancelled: "bg-red-100 text-red-800",
    };

    const statusLabels: Record<string, string> = {
        pending_payment: "Pending Payment",
        paid: "Paid",
        shipped: "Shipped",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    return (
        <>
            <tr
                onClick={toggleExpand}
                className={`cursor-pointer transition-colors ${isExpanded ? "bg-gray-50" : "hover:bg-gray-50"} border-b border-gray-200`}
            >
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-start gap-2">
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 mt-1" />
                        ) : (
                            <ChevronRight className="h-4 w-4 mt-1" />
                        )}
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-gray-900">#{order.orderNumber || order.id.slice(0, 8)}</span>
                            <span className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.customerName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{order.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-800"
                            }`}
                    >
                        {statusLabels[order.status] || order.status}
                    </span>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={4} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                            {/* Left Column: Customer & Shipping */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-sm mb-2 text-brewery-dark border-b pb-1">Customer Details</h4>
                                    <p className="text-sm font-semibold">{order.customerName}</p>
                                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-2 text-brewery-dark border-b pb-1">Shipping</h4>
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
                                {order.comment && (
                                    <div className="bg-yellow-50 p-3 border border-yellow-200 rounded">
                                        <h4 className="font-bold text-sm mb-1 text-yellow-800">Customer Comment:</h4>
                                        <p className="text-sm text-gray-700 italic">"{order.comment}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Order Items & Actions */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-sm mb-2 text-brewery-dark border-b pb-1">
                                        Order Items ({order.items.length})
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1 last:border-0 last:pb-0">
                                                <span className="flex-1 mr-2">{item.product.name}</span>
                                                <span className="text-gray-500 mr-4">x{item.quantity}</span>
                                                <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        {order.shippingMethod === "shipment" && (
                                            <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-100 pt-2 mt-2">
                                                <span className="flex-1 mr-2">Shipping</span>
                                                <span className="mr-4"></span>
                                                <span className="font-semibold">€10.00</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-base font-bold text-brewery-dark mt-2 pt-2 border-t border-gray-200">
                                            <span>Total</span>
                                            <span>€{order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-bold text-sm mb-3 text-brewery-dark">Actions</h4>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="relative">
                                            <select
                                                onClick={(e) => e.stopPropagation()}
                                                value={order.status}
                                                onChange={handleStatusChange}
                                                disabled={isUpdating}
                                                className={`appearance-none pl-3 pr-8 py-2 text-sm font-bold border rounded focus:outline-none focus:ring-2 focus:ring-brewery-green ${statusColors[order.status] || "bg-gray-100"
                                                    }`}
                                            >
                                                <option value="pending_payment">Pending Payment</option>
                                                <option value="paid">Paid</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                                <ChevronDown className="h-4 w-4" />
                                            </div>
                                        </div>

                                        {order.invoiceUrl && (
                                            <a
                                                href={order.invoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 text-gray-700 bg-white"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Invoice
                                            </a>
                                        )}

                                        <button
                                            onClick={handleDelete}
                                            className="flex items-center px-3 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 hover:border-red-300 transition-colors ml-auto"
                                            title="Delete Order"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
