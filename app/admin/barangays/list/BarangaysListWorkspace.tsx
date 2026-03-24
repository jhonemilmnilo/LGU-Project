"use client";

import { useState } from "react";
import { Plus, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddBarangayModal } from "./components/AddBarangayModal";

// Define the type since Prisma auto-gen might be lagging for the client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BarangaysListWorkspace({ initialData }: { initialData: any[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingItem, setEditingItem] = useState<any | null>(null);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <MapPin size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Infrastructure</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Barangays Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Manage Barangays</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Add and update the official list of Barangays setup in the municipality.</p>
                </div>
                <Button 
                    onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-6 rounded-2xl shadow-xl shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Register New Barangay
                </Button>
            </div>

            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1f2e] border-b border-slate-200 dark:border-[#2a3040]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold py-5">Barangay Name</TableHead>
                            <TableHead className="font-bold text-right w-[150px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                                    No Barangays found. Click "Register New Barangay" to add one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialData.map((item) => (
                                <TableRow key={item.id} className="border-b border-slate-100 dark:border-[#2a3040]/50 hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e]/50">
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-slate-900 dark:text-white uppercase leading-tight">
                                                {item.name}
                                            </span>
                                            <span className="text-xs text-slate-500 mt-1">
                                                ID: {item.id}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                                            onClick={() => { setEditingItem(item); setIsAddModalOpen(true); }}
                                        >
                                            Edit Name
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isAddModalOpen && (
                <AddBarangayModal 
                    isOpen={isAddModalOpen} 
                    onClose={() => setIsAddModalOpen(false)} 
                    editingItem={editingItem}
                />
            )}
        </div>
    );
}
