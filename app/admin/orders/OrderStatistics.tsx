"use client";

import { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { TrendingUp, Euro, Package, ShoppingBag, Receipt } from "lucide-react";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
}

interface OrderTicket {
    id: string;
    quantity: number;
    totalPrice: number;
    event: { title: string };
}

interface Order {
    id: string;
    totalAmount: number;
    createdAt: Date;
    status: string;
    items?: OrderItem[];
    tickets?: OrderTicket[];
}

interface OrderStatisticsProps {
    orders: Order[];
}

const TIMEFRAMES = [
    { key: "week",  label: "7d"  },
    { key: "month", label: "30d" },
    { key: "year",  label: "12m" },
] as const;

export default function OrderStatistics({ orders }: OrderStatisticsProps) {
    const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

    const relevantOrders = useMemo(() =>
        orders.filter(o => o.status === "paid" || o.status === "completed" || o.status === "shipped"),
        [orders]
    );

    // --- Summary stats ---
    const totalRevenue = relevantOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders  = relevantOrders.length;
    const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pending      = orders.filter(o => o.status === "pending_payment").length;

    // --- Chart data ---
    const chartData = useMemo(() => {
        const now = new Date();
        const data: { name: string; total: number }[] = [];

        if (timeframe === "week") {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const name = date.toLocaleDateString("nl-BE", { weekday: "short" });
                const total = relevantOrders
                    .filter(o => {
                        const d = new Date(o.createdAt);
                        return d.getDate() === date.getDate() &&
                               d.getMonth() === date.getMonth() &&
                               d.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
                data.push({ name, total });
            }
        } else if (timeframe === "month") {
            // Only include days that actually have sales to keep chart readable
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const total = relevantOrders
                    .filter(o => {
                        const d = new Date(o.createdAt);
                        return d.getDate() === date.getDate() &&
                               d.getMonth() === date.getMonth() &&
                               d.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
                if (total > 0) {
                    const name = date.toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
                    data.push({ name, total });
                }
            }
            // If no sales in last 30 days, show an empty state marker
            if (data.length === 0) data.push({ name: "No sales", total: 0 });
        } else {
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                const name = date.toLocaleDateString("nl-BE", { month: "short" });
                const total = relevantOrders
                    .filter(o => {
                        const d = new Date(o.createdAt);
                        return d.getMonth() === date.getMonth() &&
                               d.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
                data.push({ name, total });
            }
        }
        return data;
    }, [relevantOrders, timeframe]);

    const totalInView = chartData.reduce((sum, d) => sum + d.total, 0);

    // --- Product stats ---
    const productStats = useMemo(() => {
        const stats: Record<string, { name: string; sold: number; revenue: number }> = {};
        relevantOrders.forEach(order => {
            order.items?.forEach(item => {
                const k = item.product.name;
                if (!stats[k]) stats[k] = { name: k, sold: 0, revenue: 0 };
                stats[k].sold    += item.quantity;
                stats[k].revenue += item.quantity * item.price;
            });
            order.tickets?.forEach(ticket => {
                const k = `Ticket: ${ticket.event.title}`;
                if (!stats[k]) stats[k] = { name: k, sold: 0, revenue: 0 };
                stats[k].sold    += ticket.quantity;
                stats[k].revenue += ticket.totalPrice;
            });
        });
        return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
    }, [relevantOrders]);

    const maxRevenue = productStats[0]?.revenue || 1;

    return (
        <div className="space-y-4 pb-12">

            {/* Summary stat cards — 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={<Euro className="h-4 w-4" />}
                    label="Total Revenue"
                    value={`€${totalRevenue.toFixed(2)}`}
                    accent
                />
                <StatCard
                    icon={<ShoppingBag className="h-4 w-4" />}
                    label="Orders"
                    value={String(totalOrders)}
                />
                <StatCard
                    icon={<Receipt className="h-4 w-4" />}
                    label="Avg Order"
                    value={`€${avgOrder.toFixed(2)}`}
                />
                <StatCard
                    icon={<Package className="h-4 w-4" />}
                    label="Pending"
                    value={String(pending)}
                    warn={pending > 0}
                />
            </div>

            {/* Revenue chart */}
            <div className="bg-white border-2 border-black p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-brewery-dark flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-brewery-green" />
                        Revenue
                    </h2>
                    {/* Timeframe pill selector */}
                    <div className="flex border-2 border-black overflow-hidden">
                        {TIMEFRAMES.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setTimeframe(key)}
                                className={`px-4 py-1.5 text-sm font-black transition-colors ${
                                    timeframe === key
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-2xl font-black text-brewery-dark mb-4">
                    €{totalInView.toFixed(2)}
                    <span className="text-sm font-semibold text-gray-400 ml-2">
                        {timeframe === "week" ? "this week" : timeframe === "month" ? "last 30d" : "this year"}
                    </span>
                </p>

                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={{ stroke: "#000", strokeWidth: 2 }}
                                tickLine={false}
                                tick={{ fill: "#888", fontSize: 10, fontWeight: "bold" }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#aaa", fontSize: 10 }}
                                tickFormatter={(v) => `€${v}`}
                                width={48}
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                contentStyle={{
                                    border: "2px solid black",
                                    borderRadius: 0,
                                    fontWeight: "bold",
                                    fontSize: 13,
                                }}
                                formatter={(value: any) => [`€${Number(value).toFixed(2)}`, "Revenue"]}
                            />
                            <Bar dataKey="total" radius={[2, 2, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <Cell
                                        key={`cell-${i}`}
                                        fill={entry.total > 0 ? "#2D4C3E" : "#e5e7eb"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Product performance — card list, no table */}
            <div className="bg-white border-2 border-black p-4">
                <h2 className="font-black text-brewery-dark flex items-center gap-2 mb-4">
                    <Package className="h-4 w-4 text-brewery-green" />
                    Best Sellers
                </h2>

                {productStats.length === 0 ? (
                    <p className="text-center text-gray-400 font-semibold italic py-8">
                        No sales data yet.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {productStats.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex items-baseline justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-black text-gray-400 w-4 shrink-0">
                                            {idx + 1}
                                        </span>
                                        <span className="font-bold text-brewery-dark text-sm truncate">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-gray-400 font-semibold">
                                            ×{item.sold}
                                        </span>
                                        <span className="font-black text-brewery-green text-sm">
                                            €{item.revenue.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                                {/* Revenue bar */}
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-6">
                                    <div
                                        className="h-full bg-brewery-green rounded-full transition-all"
                                        style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Totals row */}
                        <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-black font-black text-brewery-dark">
                            <span>Total</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    ×{productStats.reduce((s, i) => s + i.sold, 0)}
                                </span>
                                <span>
                                    €{productStats.reduce((s, i) => s + i.revenue, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    icon, label, value, accent = false, warn = false
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent?: boolean;
    warn?: boolean;
}) {
    return (
        <div className={`border-2 border-black p-4 ${accent ? "bg-brewery-dark text-white" : "bg-white"}`}>
            <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-2 ${
                accent ? "text-brewery-green" : warn ? "text-yellow-600" : "text-gray-400"
            }`}>
                {icon}
                {label}
            </div>
            <p className={`text-2xl font-black ${accent ? "text-white" : warn ? "text-yellow-600" : "text-brewery-dark"}`}>
                {value}
            </p>
        </div>
    );
}
