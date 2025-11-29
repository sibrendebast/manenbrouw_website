"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const login = useAdminStore((state) => state.login);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === "admin" && password === "beer123") {
            login();
            router.push("/admin/dashboard");
        } else {
            setError("Invalid credentials");
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
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                            placeholder="Enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-brewery-dark text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
