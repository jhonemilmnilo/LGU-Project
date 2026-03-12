"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Menu, X, LogIn, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "Services", href: "#services" },
    { name: "Tourism", href: "#tourism" },
    { name: "News", href: "#news" },
    { name: "Careers", href: "#careers" },
    { name: "Hotlines", href: "#hotlines" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();
    
    const backgroundColor = useTransform(
        scrollY,
        [0, 100],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]
    );
    
    const backdropBlur = useTransform(
        scrollY,
        [0, 100],
        ["blur(0px)", "blur(12px)"]
    );

    const color = useTransform(
        scrollY,
        [0, 100],
        ["rgba(255, 255, 255, 1)", "rgba(15, 23, 42, 1)"]
    );

    const shadow = useTransform(
        scrollY,
        [0, 100],
        ["none", "0 10px 30px -10px rgba(0, 0, 0, 0.1)"]
    );

    return (
        <motion.header 
            style={{ backgroundColor, backdropFilter: backdropBlur, shadow }}
            className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 sm:h-24 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                        <Shield className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex flex-col">
                        <motion.span 
                            style={{ color }}
                            className="text-xl font-black uppercase tracking-tighter italic"
                        >
                            Agno<span className="text-blue-600">Municipality</span>
                        </motion.span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className="group relative"
                        >
                            <motion.span 
                                style={{ color }}
                                className="text-xs font-black uppercase tracking-[0.2em] transition-opacity group-hover:opacity-70"
                            >
                                {link.name}
                            </motion.span>
                            <motion.div 
                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 origin-left"
                                initial={{ scaleX: 0 }}
                                whileHover={{ scaleX: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link href="/auth/login">
                        <Button 
                            variant="default" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-8 rounded-full h-11 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Trigger */}
                <button 
                    className="lg:hidden p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <motion.div style={{ color }}>
                        {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                    </motion.div>
                </button>
            </div>

            {/* Mobile Menu */}
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
                className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 overflow-hidden"
            >
                <div className="px-6 py-8 flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-blue-600 h-14 rounded-2xl font-black uppercase tracking-widest">
                            Access Portal
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </motion.header>
    );
}
