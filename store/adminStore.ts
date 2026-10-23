import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logoutAction } from "@/app/actions/authActions";

interface AdminState {
    isAuthenticated: boolean;
    login: () => void;
    logout: () => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            login: () => set({ isAuthenticated: true }),
            logout: async () => {
                try {
                    await logoutAction();
                } catch (e) {
                    console.error("Error during logout action:", e);
                }
                set({ isAuthenticated: false });
            },
        }),
        {
            name: "admin-storage",
        }
    )
);
