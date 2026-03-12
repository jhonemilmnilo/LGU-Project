"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UserSidebar } from "./components/UserSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Menu, MessageSquare } from "lucide-react";
import * as React from "react";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0c10] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#06080a] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <UserSidebar session={session} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Bar */}
                <header className="h-24 px-8 flex items-center justify-between bg-white/50 dark:bg-[#0a0c10]/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-[40]">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search services, news, or reports..." 
                                className="w-full h-12 pl-12 pr-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                            />
                        </div>
                        <button className="lg:hidden p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-white/10">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all hover:scale-105">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button className="relative w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all hover:scale-105">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            {children}
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
}
