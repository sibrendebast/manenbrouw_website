"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { createAdminUser, deleteAdminUser, getAdminUsers } from "@/app/actions/authActions";
import { Users, ArrowLeft, Trash2, Plus, Shield } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
    const { isAuthenticated } = useAdminStore();
    const [users, setUsers] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Form State
    const [newUser, setNewUser] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadUsers = async () => {
        const data = await getAdminUsers();
        setUsers(data);
    };

    useEffect(() => {
        setMounted(true);
        if (!isAuthenticated) {
            router.push("/admin/login");
        } else {
            loadUsers();
        }
    }, [isAuthenticated, router]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Client-side validation
        if (newUser.password !== newUser.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (newUser.password.length < 8) {
            setError("Password must be at least 8 characters long");
            setLoading(false);
            return;
        }

        // Basic complexity check (optional but recommended)
        const hasUpperCase = /[A-Z]/.test(newUser.password);
        const hasLowerCase = /[a-z]/.test(newUser.password);
        const hasNumbers = /[0-9]/.test(newUser.password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("username", newUser.username);
        formData.append("password", newUser.password);

        const result = await createAdminUser(null, formData);

        if (result.success) {
            setNewUser({ username: "", password: "", confirmPassword: "" });
            loadUsers();
        } else {
            setError(result.error || "Failed to create user");
        }
        setLoading(false);
    };

    const handleDeleteUser = async (id: string, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

        const result = await deleteAdminUser(id);
        if (result.success) {
            loadUsers();
        } else {
            alert(result.error || "Failed to delete user");
        }
    };

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
                            User Management
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add User Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 border-2 border-black shadow-lg sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center">
                                <Plus className="h-6 w-6 mr-2" /> Add New Admin
                            </h2>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Username</label>
                                    <input
                                        required
                                        type="text"
                                        value={newUser.username}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, username: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        placeholder="Username"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, password: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        placeholder="Min. 8 chars, 1 upper, 1 lower, 1 number"
                                        minLength={8}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Confirm Password</label>
                                    <input
                                        required
                                        type="password"
                                        value={newUser.confirmPassword}
                                        onChange={(e) =>
                                            setNewUser({ ...newUser, confirmPassword: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:border-brewery-green"
                                        placeholder="Repeat password"
                                        minLength={8}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brewery-dark text-white font-bold py-3 px-4 hover:bg-opacity-90 transition-colors border-2 border-black disabled:opacity-50"
                                >
                                    {loading ? "Creating..." : "Create User"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Current Admins</h2>
                        {users.length === 0 ? (
                            <div className="bg-white p-8 border-2 border-black text-center">
                                <p className="text-gray-500">No users found.</p>
                            </div>
                        ) : (
                            users.map((user: any) => (
                                <div
                                    key={user.id}
                                    className="bg-white p-6 border-2 border-black flex flex-col sm:flex-row justify-between items-center"
                                >
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <div className="bg-gray-100 p-3 rounded-full mr-4 border-2 border-black">
                                            <Shield className="h-6 w-6 text-brewery-dark" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-brewery-dark">
                                                {user.username}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Created: {new Date(user.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                        className="p-3 text-red-600 hover:bg-red-50 border-2 border-transparent hover:border-red-600 transition-all rounded-none flex items-center justify-center"
                                        title="Remove User"
                                        disabled={users.length <= 1} // Prevent deleting last user
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
