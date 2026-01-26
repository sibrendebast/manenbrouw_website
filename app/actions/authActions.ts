"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { success: false, error: "Missing credentials" };
    }

    try {
        const user = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (!user) {
            return { success: false, error: "Invalid credentials" };
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return { success: false, error: "Invalid credentials" };
        }

        return { success: true };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function createAdminUser(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password || password.length < 6) {
        return { success: false, error: "Invalid input. Password must be at least 6 characters." };
    }

    try {
        const existingUser = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (existingUser) {
            return { success: false, error: "Username already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.adminUser.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Create user error:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function deleteAdminUser(id: string) {
    try {
        // Prevent deleting the last user or specific implementation if needed
        const count = await prisma.adminUser.count();
        if (count <= 1) {
            return { success: false, error: "Cannot delete the last admin user" };
        }

        await prisma.adminUser.delete({
            where: { id },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Delete user error:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

export async function getAdminUsers() {
    try {
        const users = await prisma.adminUser.findMany({
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return users;
    } catch (error) {
        console.error("Fetch users error:", error);
        return [];
    }
}
