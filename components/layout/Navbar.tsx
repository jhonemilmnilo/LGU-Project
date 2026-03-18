"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
    
    Shield, Menu, X, LogIn, LogOut, 
    ChevronDown, Bell, Briefcase, 
    
    Map, Newspaper, PhoneCall, LayoutGrid, 
    
    Compass, HeartPulse, Users,
    Utensils, Bed, FolderKanban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

interface NavbarProps {
    logoUrl?: string;
}

export function Navbar({ logoUrl }: NavbarProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();
    
    const backgroundColor = useTransform(
        scrollY,
        [0, 60],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.95)"]
    );

    const darkBackgroundColor = useTransform(
        scrollY,
        [0, 60],
        ["rgba(10, 12, 16, 0)", "rgba(10, 12, 16, 0.95)"]
    );
    
    const backdropBlur = useTransform(
        scrollY,
        [0, 60],
        ["blur(0px)", "blur(20px)"]
    );

    const color = useTransform(
        scrollY,
        [0, 60],
        ["rgba(255, 255, 255, 1)", "rgba(15, 23, 42, 1)"]
    );

    const darkColor = useTransform(
        scrollY,
        [0, 60],
        ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)"]
    );

    const shadow = useTransform(
        scrollY,
        [0, 60],
        ["none", "0 4px 30px -10px rgba(0, 0, 0, 0.1)"]
    );

    const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);

    const isAuth = status === "authenticated";
     



    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;; // eslint-disable-line @typescript-eslint/no-unused-vars
    
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Standard public links
    const publicLinks = [
        { name: "Services", href: "/#services", icon: Briefcase },
        { name: "Gallery", href: "/#tourism", icon: Compass },
        { name: "Updates", href: "/#news", icon: Newspaper },
        { name: "Careers", href: "/#careers", icon: Briefcase },
        { name: "Safety", href: "/#hotlines", icon: PhoneCall },
    ];

    // Authenticated hub links
    const hubLinks = [
        { name: "Maps", href: "/user/maps", icon: Map },
        { name: "Updates", href: "/#updates", icon: Bell },
        { name: "Dining Hub", href: "/user/dining", icon: Utensils },
        { name: "Accommodations", href: "/user/accommodation", icon: Bed },
        { name: "Gallery", href: "/user/tourism", icon: Compass },
        { name: "Projects", href: "/user/projects", icon: FolderKanban },
        { name: "Services", href: "/user/services", icon: HeartPulse },
        { name: "Leadership", href: "/user/leadership", icon: Users },
    ];

    const currentLinks = isAuth ? hubLinks : publicLinks;

    // Determine effective theme safely for hydration
    const activeTheme = mounted ? resolvedTheme : "light";

    return (
        <motion.header 
            style={{ 
                backgroundColor: activeTheme === "dark" ? darkBackgroundColor : backgroundColor,
                backdropFilter: backdropBlur, 
                boxShadow: shadow,
            }}
            className="fixed top-0 left-0 right-0 z-[100] transition-colors duration-300"
        >
            <motion.div 
                style={{ opacity: borderOpacity }}
                className="absolute inset-x-0 bottom-0 h-px bg-slate-200/50 dark:bg-white/5"
            />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-20 md:h-24 flex items-center justify-between gap-4">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden"
                    >
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                                src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        )}
                    </motion.div>
                    <div className="flex flex-col">
                        <motion.span 
                            style={{ color: activeTheme === "dark" ? darkColor : color }}
                            className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic leading-none"
                        >
                            E<span className="text-blue-600">Mapandan</span>
                        </motion.span>
                        <motion.span 
                            style={{ opacity: useTransform(scrollY, [0, 80], [0.7, 0.4]) }}
                            className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.2em] mt-1 hidden sm:block text-white"
                        >
                            Digital Municipality
                        </motion.span>
                    </div>
                </Link>

                {/* Desktop Navigation - Responsive Breakpoints */}
                <nav className="hidden xl:flex items-center gap-1 bg-white/5 dark:bg-black/5 p-1 rounded-full backdrop-blur-sm">
                    {currentLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className="relative px-4 py-2 group overflow-hidden"
                            >
                                <motion.div 
                                    style={{ color: activeTheme === "dark" ? darkColor : color }}
                                    className={cn(
                                        "relative z-10 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors group-hover:text-blue-600",
                                        isActive && "text-blue-600 font-extrabold italic"
                                    )}
                                >
                                    <link.icon className={cn("w-3.5 h-3.5", isActive ? "text-blue-600" : "opacity-70 group-hover:opacity-100")} />
                                    <span>{link.name}</span>
                                </motion.div>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-full -z-0"
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden min-[1100px]:flex items-center gap-3">
                    <ThemeToggle />
                    
                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                    {isAuth ? (
                        <div className="flex items-center gap-4">
                            <Button 
                                onClick={() => signOut({ callbackUrl: "/" })}
                                variant="ghost" 
                                className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold uppercase tracking-widest h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="xl:inline lg:hidden">Sign Out</span>
                            </Button>
                        </div>
                    ) : (
                        <Link href="/auth/login">
                            <Button 
                                style={{ backgroundColor: pathname === "/auth/login" ? "rgba(37, 99, 235, 1)" : undefined }}
                                className="bg-blue-600 text-white font-black uppercase tracking-widest px-8 rounded-2xl h-12 shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 text-[10px]"
                            >
                                <LogIn className="w-4 h-4" />
                                Access Hub
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Small Screen Controls (Desktop layout but smaller window) */}
                <div className="flex min-[1100px]:hidden items-center gap-4">
                    <ThemeToggle />
                    <button 
                        className="p-3 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <motion.div style={{ color: activeTheme === "dark" ? darkColor : color }}>
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </motion.div>
                    </button>
                </div>
            </div>

            {/* Premium Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className="lg:hidden absolute top-full left-0 right-0 h-screen bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-100 dark:border-white/5 shadow-2xl overflow-y-auto"
                    >
                        <div className="px-6 py-12 flex flex-col gap-8 max-w-lg mx-auto">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Main Navigation</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {currentLinks.map((link) => (
                                        <Link 
                                            key={link.name} 
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "p-5 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-between group h-20 transition-all active:scale-[0.98]",
                                                pathname === link.href && "bg-blue-600/10 border border-blue-600/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                    pathname === link.href ? "bg-blue-600 text-white" : "bg-white dark:bg-white/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                                                )}>
                                                    <link.icon className="w-6 h-6" />
                                                </div>
                                                <span className={cn(
                                                    "text-lg font-black uppercase italic tracking-tight transition-colors",
                                                    pathname === link.href ? "text-blue-600" : "text-slate-900 dark:text-white"
                                                )}>{link.name}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300">
                                                <ChevronDown className="w-5 h-5 -rotate-90" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="h-px bg-slate-100 dark:bg-white/5 mx-2" />
                            
                            {isAuth ? (
                                <div className="space-y-6">
                                    <Button 
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white h-16 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-red-500/20"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Sign Out
                                    </Button>
                                </div>
                            ) : (
                                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full bg-blue-600 h-20 rounded-[2.5rem] font-black uppercase tracking-[0.2em] italic text-sm shadow-2xl shadow-blue-500/20 active:scale-95 transition-all">
                                        Access Member Hub
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
