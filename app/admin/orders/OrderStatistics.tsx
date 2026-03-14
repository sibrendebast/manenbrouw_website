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
import { TrendingUp, Calendar, Euro, Package } from "lucide-react";

interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

interface OrderTicket {
    id: string;
    quantity: number;
    totalPrice: number;
    event: {
        title: string;
    };
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

export default function OrderStatistics({ orders }: OrderStatisticsProps) {
    const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");

    const statsData = useMemo(() => {
        const now = new Date();
        const data: { name: string; total: number }[] = [];

        // Only count paid or completed orders for sales stats
        const relevantOrders = orders.filter(o => 
            o.status === "paid" || o.status === "completed" || o.status === "shipped"
        );

        if (timeframe === "week") {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('nl-BE', { weekday: 'short' });
                
                const total = relevantOrders
                    .filter(o => {
                        const orderDate = new Date(o.createdAt);
                        return orderDate.getDate() === date.getDate() &&
                               orderDate.getMonth() === date.getMonth() &&
                               orderDate.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

                data.push({ name: dateStr, total });
            }
        } else if (timeframe === "month") {
            // Last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' });

                const total = relevantOrders
                    .filter(o => {
                        const orderDate = new Date(o.createdAt);
                        return orderDate.getDate() === date.getDate() &&
                               orderDate.getMonth() === date.getMonth() &&
                               orderDate.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

                data.push({ name: dateStr, total });
            }
        } else if (timeframe === "year") {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                const dateStr = date.toLocaleDateString('nl-BE', { month: 'short' });

                const total = relevantOrders
                    .filter(o => {
                        const orderDate = new Date(o.createdAt);
                        return orderDate.getMonth() === date.getMonth() &&
                               orderDate.getFullYear() === date.getFullYear();
                    })
                    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

                data.push({ name: dateStr, total });
            }
        }

        return data;
    }, [orders, timeframe]);

    const productStats = useMemo(() => {
        const stats: Record<string, { name: string; sold: number; revenue: number }> = {};

        const relevantOrders = orders.filter(o => 
            o.status === "paid" || o.status === "completed" || o.status === "shipped"
        );

        relevantOrders.forEach(order => {
            // Products
            order.items?.forEach(item => {
                const productName = item.product.name;
                if (!stats[productName]) {
                    stats[productName] = { name: productName, sold: 0, revenue: 0 };
                }
                stats[productName].sold += item.quantity;
                stats[productName].revenue += item.quantity * item.price;
            });

            // Tickets
            order.tickets?.forEach(ticket => {
                const eventName = `Ticket: ${ticket.event.title}`;
                if (!stats[eventName]) {
                    stats[eventName] = { name: eventName, sold: 0, revenue: 0 };
                }
                stats[eventName].sold += ticket.quantity;
                stats[eventName].revenue += ticket.totalPrice;
            });
        });

        return Object.values(stats).sort((a, b) => b.revenue - a.revenue);
    }, [orders]);

    const totalInView = statsData.reduce((sum, d) => sum + d.total, 0);

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-white border-2 border-black p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2 text-brewery-dark">
                            <TrendingUp className="text-brewery-green" />
                            Revenue Statistics
                        </h2>
                        <p className="text-gray-500">Track your financial performance over time</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 border-2 border-black">
                        {(["week", "month", "year"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-4 py-2 font-bold transition-colors ${
                                    timeframe === t
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-200 text-gray-600"
                                }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    <div className="lg:col-span-1 p-6 bg-brewery-green/5 border-2 border-brewery-green flex flex-col justify-center">
                        <span className="text-sm font-bold text-brewery-green uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Euro className="h-4 w-4" /> Total Revenue
                        </span>
                        <span className="text-4xl font-black text-brewery-dark">
                            €{totalInView.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 mt-2">
                            for the selected period
                        </span>
                    </div>

                    <div className="lg:col-span-3 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12, fontWeight: 'bold' }}
                                    minTickGap={10}
                                />
                                <YAxis 
                                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12, fontWeight: 'bold' }}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ 
                                        border: '2px solid black', 
                                        borderRadius: '0px',
                                        fontWeight: 'bold'
                                    }}
                                    formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Revenue']}
                                />
                                <Bar 
                                    dataKey="total" 
                                    fill="#2D4C3E" 
                                    radius={[0, 0, 0, 0]}
                                >
                                    {statsData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.total > 0 ? "#2D4C3E" : "#e5e7eb"}
                                            className="hover:fill-brewery-green transition-colors cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Product Sales Section */}
            <div className="bg-white border-2 border-black p-6">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-brewery-dark">
                        <Package className="text-brewery-green" />
                        Product Performance
                    </h2>
                    <p className="text-gray-500">Units sold and revenue generated per item</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-black border-2 border-black">
                        <thead className="bg-brewery-dark text-white">
                            <tr>
                                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-sm">Product</th>
                                <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-sm">Units Sold</th>
                                <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-sm">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {productStats.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold italic">
                                        No sales data available yet.
                                    </td>
                                </tr>
                            ) : (
                                productStats.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-brewery-dark">{item.name}</td>
                                        <td className="px-6 py-4 text-right font-mono font-bold">{item.sold}</td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-brewery-green">€{item.revenue.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-gray-100 border-t-2 border-black">
                            <tr>
                                <td className="px-6 py-4 font-black">Total</td>
                                <td className="px-6 py-4 text-right font-black">
                                    {productStats.reduce((sum, item) => sum + item.sold, 0)}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-brewery-dark">
                                    €{productStats.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
