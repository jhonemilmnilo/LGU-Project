"use client";

import { useHousehold } from "./providers";
import {
    HouseholdCards,
    HouseholdFilters,
    HouseholdTable,
    AddHouseholdModal,
    HouseholdMapView
} from "./components";
import { Button } from "@/components/ui/button";
import { Plus, Home, Map } from "lucide-react";

export function HouseholdsPage() {
    const { setIsAddModalOpen, viewMode } = useHousehold();

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <Home size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Management</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Household Registry</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                        <Map className="mr-3 text-blue-600 w-10 h-10" />
                        Household Map
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl">
                        Manage and visualize every household in Mapandan for resource distribution, risk assessment, and census tracking.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 h-12 px-6 rounded-xl font-bold transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add Household
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
                <HouseholdCards />

                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                    <HouseholdFilters />

                    {viewMode === "map" ? (
                        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
                            <HouseholdMapView />
                        </div>
                    ) : (
                        <div className="mt-6 animate-in fade-in duration-500">
                            <HouseholdTable />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AddHouseholdModal />
        </div>
    );
}
