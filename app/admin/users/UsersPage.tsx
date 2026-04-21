"use client";

import React, { useState } from "react";
import { Home, User as UserIcon, Mail, Clock, BadgeCheck, XCircle, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AddUserModal } from "./AddUserModal";

import { UserRole } from "@prisma/client";

type UserWithProfile = {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    isEmailVerified: boolean;
    role: UserRole;
    createdAt: Date;
    residentProfile: {
        id: string;
        registrationStatus: string;
    } | null;
};

export function UsersPage({ users }: { users: UserWithProfile[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <Home size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Management</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">User Accounts</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Control and monitor user accounts, verification status, and linked profiles.</p>
                </div>

                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase italic tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Provision New User
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-500/20 rounded-2xl">
                        <UserIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Total Users</h3>
                        <p className="text-3xl font-black">{users.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-2xl">
                        <BadgeCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Verified</h3>
                        <p className="text-3xl font-black">{users.filter(u => u.isEmailVerified).length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#151b2b] p-6 rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-amber-100 dark:bg-amber-500/20 rounded-2xl">
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Pending Approval</h3>
                        <p className="text-3xl font-black">{users.filter(u => !u.isEmailVerified).length}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-[#1a1f2e] border-b border-slate-200 dark:border-[#2a3040]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-bold py-5">User Details</TableHead>
                            <TableHead className="font-bold">Verification Status</TableHead>
                            <TableHead className="font-bold">Resident Profile</TableHead>
                            <TableHead className="font-bold">Joined Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                                    No user accounts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="border-b border-slate-100 dark:border-[#2a3040]/50 hover:bg-slate-50/50 dark:hover:bg-[#1a1f2e]/50">
                                    <TableCell className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white uppercase leading-tight">
                                                {user.name || "Unnamed User"}
                                            </span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <Mail className="w-3 h-3 text-blue-500" /> {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {user.isEmailVerified ? (
                                                <Badge className="bg-green-500/10 text-green-600 border-green-200 font-black uppercase text-[10px] w-fit italic tracking-tighter">
                                                    <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-black uppercase text-[10px] w-fit italic tracking-tighter">
                                                    <XCircle className="w-3 h-3 mr-1" /> Unverified
                                                </Badge>
                                            )}
                                            {user.emailVerified && (
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    at {format(new Date(user.emailVerified), "PPP p")}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.residentProfile ? (
                                            <Badge variant="outline" className={`font-black uppercase text-[10px] italic tracking-tighter ${
                                                user.residentProfile.registrationStatus === 'APPROVED' 
                                                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                                                : 'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}>
                                                {user.residentProfile.registrationStatus} PROFILE
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic font-medium">No Resident Profile</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-500 font-bold text-xs uppercase">
                                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        <AddUserModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
        />
        </div>
    );
}
