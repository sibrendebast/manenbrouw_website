"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, Beer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/shop", label: "Shop" },
        { href: "/about", label: "About" },
        { href: "/events", label: "Events" },
    ];

    const totalItems = useCartStore((state) => state.getTotalItems());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <nav className="bg-white text-brewery-dark sticky top-0 z-50 border-b-2 border-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-24">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <NextImage
                                src="/logo.png"
                                alt="Man & Brouw"
                                width={150}
                                height={40}
                                className="h-12 w-auto"
                                priority
                            />
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-6 py-3 text-lg font-bold border-2 border-black hover:bg-brewery-green hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/cart"
                                className="p-3 border-2 border-black hover:bg-brewery-green hover:text-white transition-colors relative flex items-center"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {mounted && totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold h-6 w-6 flex items-center justify-center border-2 border-white">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="bg-white inline-flex items-center justify-center p-2 text-brewery-dark hover:bg-gray-100 focus:outline-none border-2 border-black"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b-2 border-black"
                        id="mobile-menu"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block px-3 py-3 text-lg font-bold border-2 border-black hover:bg-brewery-green hover:text-white transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/cart"
                                className="block px-3 py-3 text-lg font-bold border-2 border-black hover:bg-brewery-green hover:text-white transition-colors flex items-center"
                                onClick={() => setIsOpen(false)}
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Cart
                                {mounted && totalItems > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold h-6 w-6 flex items-center justify-center border-2 border-white">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
