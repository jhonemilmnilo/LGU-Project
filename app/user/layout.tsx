"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion } from "framer-motion";
import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();

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
        <div className="min-h-screen bg-slate-50 dark:bg-[#06080a] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-12">
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
