"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Dining Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage all local restaurants and eateries in Mapandan.</p>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-4 py-2 flex items-center"
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
                style={{ boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--primary-theme) 10%, transparent)' }}
                className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] overflow-hidden ring-1 ring-slate-200 dark:ring-white/5"
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
