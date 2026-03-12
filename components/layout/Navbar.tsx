"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
    Shield, Menu, X, LogIn, LogOut, UserCircle, 
    ChevronDown, Bell, Search, Layers, Briefcase, 
    Calendar, Map, Newspaper, PhoneCall, LayoutGrid, 
    Coffee, Bed, Compass, HeartPulse, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
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

    const isAuth = status === "authenticated";
    const userRole = (session?.user as any)?.role;

    // Standard public links
    const publicLinks = [
        { name: "Public Services", href: "/#services", icon: Briefcase },
        { name: "Tourism", href: "/#tourism", icon: Compass },
        { name: "News", href: "/#news", icon: Newspaper },
        { name: "Careers", href: "/#careers", icon: Briefcase },
        { name: "Emergency Hub", href: "/#hotlines", icon: PhoneCall },
    ];

    // Authenticated hub links
    const hubLinks = [
        { name: "Live Maps", href: "/user/maps", icon: Map },
        { name: "Portal Updates", href: "/user/updates", icon: Bell },
        { name: "Kainan at Tuluyan", href: "/user/experience", icon: Coffee },
        { name: "Places to Visit", href: "/user/tourism", icon: Compass },
        { name: "LGU Initiatives", href: "/user/initiatives", icon: LayoutGrid },
        { name: "Public Services", href: "/user/services", icon: HeartPulse },
        { name: "Leadership Hub", href: "/user/leadership", icon: Users },
    ];

    const currentLinks = isAuth ? hubLinks : publicLinks;

    return (
        <motion.header 
            style={{ backgroundColor, backdropFilter: backdropBlur, boxShadow: shadow }}
            className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300"
        >
            <div className="max-w-[1500px] mx-auto px-6 h-24 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <div className="flex flex-col">
                        <motion.span 
                            style={{ color }}
                            className="text-lg sm:text-xl font-black uppercase tracking-tighter italic leading-none"
                        >
                            Agno<span className="text-blue-600">Portal</span>
                        </motion.span>
                    </div>
                </Link>

                {/* Desktop Nav - Authenticated users get a compact, icon-based view or a dropdown */}
                <nav className="hidden lg:flex items-center gap-1">
                    {currentLinks.map((link) => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className="px-3 xl:px-4 py-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/5 group"
                        >
                            <motion.span 
                                style={{ color }}
                                className={cn(
                                    "text-[10px] xl:text-[11px] font-black uppercase tracking-[0.1em] transition-opacity group-hover:opacity-70 flex items-center gap-2",
                                    pathname === link.href && "text-blue-600 font-black italic underline underline-offset-4 decoration-2"
                                )}
                            >
                                {isAuth && <link.icon className="w-3.5 h-3.5" />}
                                {link.name}
                            </motion.span>
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden lg:flex items-center gap-2 xl:gap-4">
                    <ThemeToggle />
                    
                    {isAuth ? (
                        <div className="flex items-center gap-2 xl:gap-4 pl-2 xl:pl-4 border-l border-slate-200 dark:border-white/10">
                            <div className="flex flex-col items-end mr-1 xl:mr-2 hidden 2xl:flex">
                                <p className="text-[8px] xl:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed as</p>
                                <p className="text-xs xl:text-sm font-black text-blue-600 italic leading-none">{session.user?.name}</p>
                            </div>
                            
                            <Button 
                                onClick={() => signOut({ callbackUrl: "/" })}
                                variant="outline" 
                                className="border-red-500/10 text-red-500 font-black uppercase tracking-widest px-4 xl:px-6 rounded-full h-10 xl:h-11 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2 text-[10px]"
                            >
                                <LogOut className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                                <span className="hidden sm:inline">Exit</span>
                            </Button>

                            {userRole === "ADMIN" && (
                                <Link href="/admin/dashboard">
                                    <Button className="bg-slate-900 text-white font-black uppercase tracking-widest px-4 xl:px-6 rounded-full h-10 xl:h-11 text-[10px]">
                                        Admin
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Link href="/auth/login">
                            <Button 
                                variant="default" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-6 xl:px-8 rounded-full h-10 xl:h-11 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 text-[10px]"
                            >
                                <LogIn className="w-4 h-4" />
                                Access Hub
                            </Button>
                        </Link>
                    )}
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
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl"
                    >
                        <div className="px-6 py-10 flex flex-col gap-6">
                            {currentLinks.map((link) => (
                                <Link 
                                    key={link.name} 
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white flex items-center gap-4 group"
                                >
                                    {isAuth && <link.icon className="w-5 h-5 text-blue-600" />}
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                            
                            <hr className="border-slate-100 dark:border-white/5" />
                            
                            {isAuth ? (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                            <UserCircle className="w-7 h-7 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{session.user?.name}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Resident Persona</p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full bg-red-500 h-16 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-blue-600 h-16 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                                        Sign In to Portal
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
