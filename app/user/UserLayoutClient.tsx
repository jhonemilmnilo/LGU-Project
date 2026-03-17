"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";

interface UserLayoutClientProps {
    children: React.ReactNode;
    logoUrl?: string;
}

export default function UserLayoutClient({ children, logoUrl }: UserLayoutClientProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#06080a] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500 flex flex-col">
            <Navbar logoUrl={logoUrl} />

            <main className="flex-1 pt-28 md:pt-36 pb-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
