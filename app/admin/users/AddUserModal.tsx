"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createUser, getBarangaysList } from "../actions";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";
import { Loader2, UserPlus } from "lucide-react";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [barangays, setBarangays] = useState<{ id: string; name: string }[]>([]);
    const [role, setRole] = useState<UserRole>("USER");

    useEffect(() => {
        if (isOpen) {
            getBarangaysList().then(res => {
                if (res.success) setBarangays(res.data || []);
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await createUser(formData);
            if (res.success) {
                toast.success("User created successfully!");
                onClose();
            } else {
                toast.error(res.error || "Failed to create user");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-slate-100 dark:border-white/5 bg-white dark:bg-[#0c111d] p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-slate-50 dark:bg-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <UserPlus className="w-5 h-5" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Provision <span className="text-primary">Account</span></DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic">
                        Create a new administrative or resident account. All admin-created accounts are auto-verified.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Full Name</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                placeholder="e.g. Juan Dela Cruz" 
                                required 
                                className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Email Address</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                placeholder="juan@example.com" 
                                required 
                                className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Account Role</Label>
                                <Select name="role" defaultValue="USER" onValueChange={(v) => setRole(v as UserRole)}>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 dark:border-white/10 bg-white dark:bg-[#151b2b]">
                                        <SelectItem value="USER">Resident / User</SelectItem>
                                        <SelectItem value="ADMIN">System Admin</SelectItem>
                                        <SelectItem value="CONTENT_ADMIN">Content Admin</SelectItem>
                                        <SelectItem value="BARANGAY_ADMIN">Barangay Admin</SelectItem>
                                        <SelectItem value="TREASURY_STAFF">Treasury Staff</SelectItem>
                                        <SelectItem value="ADMIN_AIDE">Admin Aide</SelectItem>
                                        <SelectItem value="RIDER">Logistics Rider</SelectItem>
                                        <SelectItem value="ENGINEER">Municipal Engineer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Account Password</Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    required 
                                    className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium"
                                />
                            </div>
                        </div>

                        {role === "BARANGAY_ADMIN" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="managedBarangay" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Managed Barangay</Label>
                                <Select name="managedBarangay" required>
                                    <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium">
                                        <SelectValue placeholder="Select Barangay" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 dark:border-white/10 bg-white dark:bg-[#151b2b]">
                                        {barangays.map(b => (
                                            <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create User Account"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
