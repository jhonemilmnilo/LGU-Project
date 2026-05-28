"use client";

import { motion } from "framer-motion";
import { useDining } from "../providers/DiningProvider";
import { Store, Eye, EyeOff } from "lucide-react";

export function DiningCards() {
    const { diningData } = useDining();

    const total = diningData.length;
    const active = diningData.filter((d) => d.isPublished).length;
    const hidden = total - active;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] shadow-sm dark:shadow-none flex items-center justify-between"
            >
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Restaurants</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{total}</h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/10 flex items-center justify-center">
                    <Store className="w-6 h-6 text-primary dark:text-primary" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] shadow-sm dark:shadow-none flex items-center justify-between"
            >
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active / Published</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{active}</h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] shadow-sm dark:shadow-none flex items-center justify-between"
            >
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Hidden</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{hidden}</h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </div>
            </motion.div>
        </div>
    );
}
