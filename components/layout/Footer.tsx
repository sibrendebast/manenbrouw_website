import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-brewery-dark text-white pt-10 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-brewery-green">Man & Brouw</h3>
                        <p className="mb-2">Aarschotsesteenweg 179</p>
                        <p className="mb-4">3012 Wilsele</p>
                        <div className="flex items-center mb-2">
                            <Mail className="h-4 w-4 mr-2 text-brewery-green" />
                            <a href="mailto:info@manenbrouw.be" className="hover:text-brewery-green transition-colors">
                                info@manenbrouw.be
                            </a>
                        </div>
                        <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-brewery-green" />
                            <a href="tel:+32472766499" className="hover:text-brewery-green transition-colors">
                                +32 4 72 766 499
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-brewery-green">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/shop" className="hover:text-brewery-green transition-colors">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-brewery-green transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="hover:text-brewery-green transition-colors">
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-brewery-green transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter & Socials */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-brewery-green">Stay Updated</h3>
                        <p className="mb-4 text-sm text-gray-300">
                            Subscribe to our newsletter for the latest brews and events.
                        </p>
                        <form className="flex flex-col space-y-2 mb-6">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 bg-white/10 border border-white/20 focus:outline-none focus:border-brewery-green text-white"
                            />
                            <button
                                type="submit"
                                className="bg-brewery-green text-white px-4 py-2 font-bold hover:bg-opacity-90 transition-colors border border-white"
                            >
                                Subscribe
                            </button>
                        </form>
                        <div className="flex space-x-4">
                            <a
                                href="https://www.facebook.com/profile.php?id=61559618724445"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-brewery-green transition-colors"
                            >
                                <Facebook className="h-6 w-6" />
                            </a>
                            <a
                                href="https://www.instagram.com/man_en_brouw/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-brewery-green transition-colors"
                            >
                                <Instagram className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Man & Brouw. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
