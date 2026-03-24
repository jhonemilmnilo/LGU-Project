"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
    
    Shield, Menu, X, LogIn, LogOut, 
    ChevronDown, Briefcase, 
    
    Newspaper, PhoneCall, Info,
    
    Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { BarangaySelector } from "./BarangaySelector";

interface NavbarProps {
    logoUrl?: string;
    brandWord1?: string;
    brandWord2?: string;
    themeColor?: string;
    barangays?: string[];
}

export function Navbar({ 
    logoUrl, 
    brandWord1 = "E", 
    brandWord2 = "Mapandan", 
    themeColor = "#2563eb",
    barangays = []
}: NavbarProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const { scrollY } = useScroll();
    const isTransparentNavPage = pathname === "/";
    
    const backgroundColor = useTransform(
        scrollY,
        [0, 60],
        [isTransparentNavPage ? "rgba(255, 255, 255, 0)" : "rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.95)"]
    );

    const darkBackgroundColor = useTransform(
        scrollY,
        [0, 60],
        [isTransparentNavPage ? "rgba(10, 12, 16, 0)" : "rgba(10, 12, 16, 0.95)", "rgba(10, 12, 16, 0.95)"]
    );
    
    const backdropBlur = useTransform(
        scrollY,
        [0, 60],
        [isTransparentNavPage ? "blur(0px)" : "blur(20px)", "blur(20px)"]
    );

    const color = useTransform(
        scrollY,
        [0, 60],
        [isTransparentNavPage ? "rgba(255, 255, 255, 1)" : "rgba(15, 23, 42, 1)", "rgba(15, 23, 42, 1)"]
    );

    const darkColor = useTransform(
        scrollY,
        [0, 60],
        ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 1)"]
    );

    const shadow = useTransform(
        scrollY,
        [0, 60],
        [isTransparentNavPage ? "none" : "0 4px 30px -10px rgba(0, 0, 0, 0.1)", "0 4px 30px -10px rgba(0, 0, 0, 0.1)"]
    );

    const borderOpacity = useTransform(scrollY, [0, 60], [isTransparentNavPage ? 0 : 1, 1]);

    const isAuth = status === "authenticated";
     

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userRole = (session?.user as { role?: string })?.role;
    const userName = session?.user?.name || "Member";
    
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Unified main navigation links for all users
    const mainLinks = [
        { name: "About", href: "/about", icon: Info },
        { name: "Services", href: "/#services", icon: Briefcase },
        { name: "Gallery", href: "/#tourism", icon: Compass },
        { name: "Updates", href: "/#news", icon: Newspaper },
        { name: "Careers", href: "/#careers", icon: Briefcase },
        { name: "Safety", href: "/#hotlines", icon: PhoneCall },
    ];

    const currentLinks = mainLinks;

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
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden relative"
                        style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}33` }}
                    >
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                                src={logoUrl} alt="Logo" className="w-full h-full object-cover p-2" />
                        ) : (
                            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        )}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                    <div className="flex flex-col">
                        <motion.span 
                            style={{ color: activeTheme === "dark" ? darkColor : color }}
                            className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic leading-none"
                        >
                            {brandWord1}<span style={{ color: themeColor }}>{brandWord2}</span>
                        </motion.span>
                        <motion.span 
                            style={{ opacity: useTransform(scrollY, [0, 80], [0.7, 0.4]) }}
                            className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.2em] mt-1 hidden sm:block text-slate-400 dark:text-slate-500"
                        >
                            Smart Municipality
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
                                         "relative z-10 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors group-hover:text-[var(--primary-theme)]",
                                     )}
                                 >
                                     <link.icon 
                                         className={cn("w-3.5 h-3.5", isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100")} 
                                         style={{ color: isActive ? themeColor : undefined }}
                                     />
                                     <span style={{ color: isActive ? themeColor : undefined }}>{link.name}</span>
                                 </motion.div>
                                 {isActive && (
                                     <motion.div 
                                         layoutId="activeTab"
                                         className="absolute inset-0 rounded-full -z-0"
                                         style={{ backgroundColor: `${themeColor}15` }}
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
                    
                    <BarangaySelector barangays={barangays} themeColor={themeColor} />
                    
                    <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />

                    {isAuth ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 pl-2 pr-4 py-1.5 rounded-2xl">
                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[10px] font-black uppercase">
                                    {userName.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Authenticated</span>
                                    <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[80px] leading-tight">{userName}</span>
                                </div>
                            </div>
                            <Button 
                                onClick={() => signOut({ callbackUrl: "/" })}
                                variant="ghost" 
                                size="icon"
                                className="h-10 w-10 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <Link href="/auth/login" className="active:scale-95 transition-all">
                            <Button 
                                style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}33` }}
                                className="text-white font-black uppercase tracking-widest px-8 rounded-2xl h-12 flex items-center gap-2 text-[10px] border-none"
                            >
                                <LogIn className="w-4 h-4" />
                                Access Resident Hub
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Small Screen Controls (Desktop layout but smaller window) */}
                <div className="flex min-[1100px]:hidden items-center gap-2 sm:gap-4">
                    <BarangaySelector barangays={barangays} themeColor={themeColor} />
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
                                                pathname === link.href && "bg-primary/10 border border-primary/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                                    pathname === link.href ? "bg-primary text-white" : "bg-white dark:bg-white/10 text-primary group-hover:bg-primary group-hover:text-white"
                                                )}>
                                                    <link.icon className="w-6 h-6" />
                                                </div>
                                                <span className={cn(
                                                    "text-lg font-black uppercase italic tracking-tight transition-colors",
                                                    pathname === link.href ? "text-primary" : "text-slate-900 dark:text-white"
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
                                    <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-500/20">
                                            {userName.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Welcome Back</span>
                                            <span className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight uppercase">{userName}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white h-20 rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all border border-red-500/20"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout from Hub
                                    </Button>
                                </div>
                            ) : (
                                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                    <Button 
                                        style={{ backgroundColor: themeColor, boxShadow: `0 20px 25px -5px ${themeColor}33` }}
                                        className="w-full text-white h-20 rounded-[2.5rem] font-black uppercase tracking-[0.2em] italic text-sm shadow-2xl active:scale-95 transition-all outline-none border-none"
                                    >
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
