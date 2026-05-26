"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    FileText,
    Trash2,
    CheckCircle,
    Truck,
    Store,
    MessageSquare,
    Package,
    Ticket,
} from "lucide-react";

interface OrderCardProps {
    order: any;
    onUpdateStatus: (orderId: string, status: string) => Promise<void>;
    onDelete: (orderId: string) => Promise<void>;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    pending_payment: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Payment" },
    paid:            { bg: "bg-green-100",  text: "text-green-800",  label: "Paid" },
    shipped:         { bg: "bg-blue-100",   text: "text-blue-800",   label: "Shipped" },
    completed:       { bg: "bg-gray-200",   text: "text-gray-700",   label: "Completed" },
    cancelled:       { bg: "bg-red-100",    text: "text-red-800",    label: "Cancelled" },
};

export default function OrderCard({ order, onUpdateStatus, onDelete }: OrderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        await onUpdateStatus(order.id, newStatus);
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

    const status = STATUS_STYLES[order.status] || { bg: "bg-gray-100", text: "text-gray-700", label: order.status };
    const itemCount = (order.items?.length || 0) + (order.tickets?.length || 0);
    const isDelivery = order.shippingMethod === "shipment";
    const isPaid = order.status === "paid";

    const orderDate = new Date(order.createdAt).toLocaleDateString("nl-BE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className="bg-white border-2 border-black overflow-hidden shadow-sm">
            {/* Card Header — always visible, tappable to expand */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-4 cursor-pointer select-none active:bg-gray-50"
            >
                {/* Row 1: Order number + date + status badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            #{order.orderNumber || order.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">{orderDate}</span>
                    </div>
                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                        {status.label}
                    </span>
                </div>

                {/* Row 2: Customer name */}
                <p className="text-base font-black text-brewery-dark leading-tight mb-1">
                    {order.customerName}
                </p>

                {/* Row 3: Shipping method + item count + total */}
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        {isDelivery
                            ? <Truck className="h-3.5 w-3.5" />
                            : <Store className="h-3.5 w-3.5" />}
                        {isDelivery ? "Delivery" : "Pickup"}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </span>
                    {order.comment && (
                        <>
                            <span className="text-gray-300">·</span>
                            <span className="flex items-center gap-1 text-yellow-600">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Note
                            </span>
                        </>
                    )}
                    <span className="ml-auto font-black text-brewery-dark text-base">
                        €{order.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Quick-action: Mark as Completed (only when status is "paid") */}
            {isPaid && !isExpanded && (
                <div className="px-4 pb-4 -mt-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange("completed"); }}
                        disabled={isUpdating}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-brewery-dark text-white font-bold text-sm border-2 border-black hover:bg-brewery-green transition-colors disabled:opacity-50"
                    >
                        <CheckCircle className="h-4 w-4" />
                        {isUpdating ? "Updating..." : "Mark as Completed"}
                    </button>
                </div>
            )}

            {/* Expand toggle indicator */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center py-1.5 border-t border-gray-100 cursor-pointer hover:bg-gray-50 text-gray-400"
            >
                {isExpanded
                    ? <ChevronUp className="h-4 w-4" />
                    : <ChevronDown className="h-4 w-4" />}
            </div>

            {/* Expanded detail panel */}
            {isExpanded && (
                <div className="border-t-2 border-black bg-gray-50 p-4 space-y-5">

                    {/* Customer */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Customer</h4>
                        <p className="font-bold text-sm text-brewery-dark">{order.customerName}</p>
                        <a href={`mailto:${order.customerEmail}`} className="text-sm text-blue-600 underline">
                            {order.customerEmail}
                        </a>
                        {order.customerPhone && (
                            <p className="text-sm text-gray-600">{order.customerPhone}</p>
                        )}
                    </div>

                    {/* Shipping address */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                            {isDelivery ? "Delivery Address" : "Pickup at Brewery"}
                        </h4>
                        {shippingAddress ? (
                            <div className="text-sm text-gray-700 space-y-0.5">
                                <p>{shippingAddress.street}</p>
                                <p>{shippingAddress.zip} {shippingAddress.city}</p>
                                <p>{shippingAddress.country}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Aarschotsesteenweg 179, 3012 Wilsele</p>
                        )}
                    </div>

                    {/* Customer comment */}
                    {order.comment && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                            <p className="text-xs font-black uppercase tracking-wider text-yellow-700 mb-1">Customer Note</p>
                            <p className="text-sm text-gray-700 italic">"{order.comment}"</p>
                        </div>
                    )}

                    {/* Order items */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                            Items ({itemCount})
                        </h4>
                        <div className="space-y-2">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-2 text-sm">
                                    <span className="flex-1 font-medium text-gray-900">{item.product.name}</span>
                                    <span className="text-gray-400 text-xs">×{item.quantity}</span>
                                    <span className="font-bold w-16 text-right">€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            {order.tickets?.map((ticket: any) => (
                                <div key={ticket.id} className="flex items-start gap-2 text-sm">
                                    <Ticket className="h-3.5 w-3.5 mt-0.5 text-brewery-green shrink-0" />
                                    <span className="flex-1 font-medium text-gray-900">
                                        {ticket.event.title}
                                        <span className="block text-xs text-gray-400">
                                            {new Date(ticket.event.date).toLocaleDateString("nl-BE")}
                                        </span>
                                    </span>
                                    <span className="text-gray-400 text-xs">×{ticket.quantity}</span>
                                    <span className="font-bold w-16 text-right">€{ticket.totalPrice.toFixed(2)}</span>
                                </div>
                            ))}
                            {isDelivery && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-gray-200 pt-2 mt-1">
                                    <Truck className="h-3.5 w-3.5" />
                                    <span className="flex-1">Shipping</span>
                                    <span className="font-bold w-16 text-right">€10.00</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-base font-black text-brewery-dark border-t-2 border-black pt-2 mt-2">
                                <span className="flex-1">Total</span>
                                <span>€{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Actions</h4>
                        <div className="space-y-2">
                            {/* Status selector */}
                            <select
                                value={order.status}
                                onChange={(e) => { e.stopPropagation(); handleStatusChange(e.target.value); }}
                                disabled={isUpdating}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold bg-white focus:outline-none focus:border-brewery-green disabled:opacity-50"
                            >
                                <option value="pending_payment">⏳ Pending Payment</option>
                                <option value="paid">✅ Paid</option>
                                <option value="shipped">🚚 Shipped</option>
                                <option value="completed">✔️ Completed</option>
                                <option value="cancelled">❌ Cancelled</option>
                            </select>

                            <div className="flex gap-2">
                                {order.invoiceUrl && (
                                    <a
                                        href={order.invoiceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-black text-sm font-bold bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Invoice
                                    </a>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-red-300 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
