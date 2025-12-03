"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n-context";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
    const { t } = useI18n();

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
                        <h3 className="text-xl font-bold mb-4 text-brewery-green">{t("footer.quickLinks")}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/shop" className="hover:text-brewery-green transition-colors">
                                    {t("nav.shop")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-brewery-green transition-colors">
                                    {t("nav.about")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/events" className="hover:text-brewery-green transition-colors">
                                    {t("nav.events")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/delivery/home" className="hover:text-brewery-green transition-colors">
                                    {t("footer.deliveryHome")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/delivery/pickup" className="hover:text-brewery-green transition-colors">
                                    {t("footer.breweryPickup")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-brewery-green transition-colors">
                                    {t("footer.terms")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter & Socials */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-brewery-green">{t("footer.stayUpdated")}</h3>
                        <p className="mb-4 text-sm text-gray-300">
                            {t("footer.newsletterText")}
                        </p>
                        <div className="mb-6">
                            <NewsletterForm variant="footer" />
                        </div>
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
                    <p>&copy; {new Date().getFullYear()} Man & Brouw. {t("footer.rights")}</p>
                </div>
            </div>
        </footer>
    );
}
