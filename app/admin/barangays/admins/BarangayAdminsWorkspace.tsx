"use client";

import { useState } from "react";
import { Plus, MapPin, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AddBarangayAdminModal } from "./components/AddBarangayAdminModal";

interface BarangayAdminsWorkspaceProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialAdmins: any[];
    barangays: string[];
}

export function BarangayAdminsWorkspace({ initialAdmins, barangays }: BarangayAdminsWorkspaceProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <MapPin size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Infrastructure</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Barangay Admins</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Barangay Admin Accounts</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Register and manage admin accounts for each barangay.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs px-6 py-6 rounded-2xl shadow-xl shadow-blue-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Register Barangay Admin
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-500/20 rounded-2xl">
                        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Total Barangay Admins</h3>
                        <p className="text-3xl font-black">{initialAdmins.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-2xl">
                        <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Available Barangays</h3>
                        <p className="text-3xl font-black">{barangays.length}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1f2e] border-b border-slate-200 dark:border-[#2a3040]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold py-5">Admin Details</TableHead>
                            <TableHead className="font-bold">Managed Barangay</TableHead>
                            <TableHead className="font-bold">Registered On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialAdmins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-40 text-center text-slate-500">
                                    No Barangay admins registered yet. Click &quot;Register Barangay Admin&quot; to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialAdmins.map((admin) => (
                                <TableRow key={admin.id} className="border-b border-slate-100 dark:border-[#2a3040]/50 hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e]/50">
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white uppercase leading-tight">
                                                {admin.name || "Unnamed"}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Mail className="w-3 h-3 text-blue-500" /> {admin.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 font-black uppercase text-[10px] italic tracking-tighter">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {admin.managedBarangay || "Not Assigned"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-bold text-xs uppercase">
                                        {format(new Date(admin.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {isModalOpen && (
                <AddBarangayAdminModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    barangays={barangays}
                />
            )}
        </div>
    );
}
