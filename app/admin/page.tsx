"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";

export default function AdminPage() {
    const router = useRouter();
    const { isAuthenticated } = useAdminStore();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/admin/dashboard");
        } else {
            router.push("/admin/login");
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brewery-green mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
}
