"use client";

import { motion } from "framer-motion";
import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiningProvider, useDining, Dining } from "./providers/DiningProvider";
import { DiningCards } from "./components/cards";
import { DiningFilters } from "./components/filters";
import { DiningTable } from "./components/table";
import { AddDiningModal } from "./components/AddDiningModal";

function DiningDashboard() {
    const { setIsAddModalOpen } = useDining();

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-2">
                            <Home size={12} className="text-blue-500" />
                            <span className="opacity-50">/</span>
                            <span>Content</span>
                            <span className="opacity-50">/</span>
                            <span className="text-blue-600 dark:text-blue-400 font-bold">Kainan (Dining)</span>
                        </motion.div>
                    </div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Dining Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage all local restaurants and eateries in Mapandan.</p>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-4 py-2 flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Kainan
                    </Button>
                </motion.div>
            </div>

            <DiningCards />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
            >
                <DiningFilters />
                <DiningTable />
            </motion.div>

            <AddDiningModal />
        </div>
    );
}

export default function DiningPage({ diningData, currentBarangay }: { diningData: Dining[]; currentBarangay?: string }) {
    return (
        <DiningProvider initialData={diningData} currentBarangay={currentBarangay}>
            <DiningDashboard />
        </DiningProvider>
    );
}
