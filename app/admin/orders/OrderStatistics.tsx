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
import { TrendingUp, Calendar, Euro } from "lucide-react";

interface Order {
    id: string;
    totalAmount: number;
    createdAt: Date;
    status: string;
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

    const totalInView = statsData.reduce((sum, d) => sum + d.total, 0);

    return (
        <div className="bg-white border-2 border-black p-6 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-brewery-green" />
                        Sales Overview
                    </h2>
                    <p className="text-gray-500">Track your revenue performance</p>
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
                    <span className="text-4xl font-black">
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
    );
}
