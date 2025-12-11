"use client";

import { useAdminStore } from "@/store/adminStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Calendar, ShoppingCart, Mail, LogOut } from "lucide-react";

export default function AdminBanner() {
    const { isAuthenticated, logout } = useAdminStore();
    const pathname = usePathname();

    // Only show banner when authenticated
    if (!isAuthenticated) {
        return null;
    }

    const adminLinks = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/events", label: "Events", icon: Calendar },
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ];

    return (
        <div className="bg-brewery-dark text-white py-2 px-4 shadow-lg border-b-2 border-brewery-green">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold mr-3 hidden sm:inline">Admin:</span>
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-1 px-3 py-1 text-sm font-medium hover:bg-brewery-green transition-colors rounded"
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
                <button
                    onClick={logout}
                    className="flex items-center gap-1 px-3 py-1 text-sm font-medium hover:bg-red-600 transition-colors rounded"
                    title="Logout"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </div>
    );
}
