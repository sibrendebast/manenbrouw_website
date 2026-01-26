"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { loginAction } from "@/app/actions/authActions";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const login = useAdminStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const result = await loginAction(null, formData);

        if (result.success) {
            login();
            router.push("/admin/dashboard");
        } else {
            setError(result.error || "Login failed");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
            <div className="bg-white p-8 border-2 border-black shadow-xl w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="bg-brewery-green p-4 border-2 border-black">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center mb-6 text-brewery-dark">
                    Admin Login
                </h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            Username
                        </label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brewery-dark text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
