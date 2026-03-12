"use client";

import * as React from "react";
import Link from "next/link";
import { Shield, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 pt-16 md:pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-slate-100 dark:border-white/5">
                {/* Brand Column */}
                <div className="space-y-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">
                            Agno<span className="text-blue-600">Municipality</span>
                        </span>
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">
                        Official website of the Municipality of Agno. Dedicated to transparent governance and sustainable tourism.
                    </p>
                    <div className="flex items-center gap-4">
                        {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                            <Link key={idx} href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                <Icon className="w-5 h-5" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Quick Links</h4>
                    <ul className="space-y-4">
                        {["About Us", "Transparency Seal", "Citizens Charter", "Privacy Policy"].map((link) => (
                            <li key={link}>
                                <Link href="#" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest leading-none">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tourism */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tourism</h4>
                    <ul className="space-y-4">
                        {["Umbrella Rocks", "Agno River", "Local Festivals", "Where to Stay"].map((link) => (
                            <li key={link}>
                                <Link href="#" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest leading-none">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Contact Us</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">Municipal Hall, Poblacion, Agno</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">info@agnomun.gov.ph</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">(075) 123-4567</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <p>© 2026 Municipality of Agno. All rights reserved.</p>
                <div className="flex items-center gap-8">
                    <Link href="#" className="hover:text-blue-600">Privacy</Link>
                    <Link href="#" className="hover:text-blue-600">Terms</Link>
                    <Link href="#" className="hover:text-blue-600">Accessibility</Link>
                </div>
            </div>
        </footer>
    );
}
