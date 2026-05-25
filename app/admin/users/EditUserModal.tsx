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
import { updateUser, getBarangaysList } from "../actions";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";
import { Loader2, Edit3 } from "lucide-react";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        role: UserRole;
        department?: string | null;
        managedBarangay?: string | null;
    } | null;
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
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

    useEffect(() => {
        if (user) {
            setRole(user.role);
        }
    }, [user]);

    if (!user) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = await updateUser(user.id, formData);
            if (res.success) {
                toast.success("User account updated successfully!");
                onClose();
            } else {
                toast.error(res.error || "Failed to update user");
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
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                            <Edit3 className="w-5 h-5" style={{ color: "var(--primary-theme)" }} />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Edit <span style={{ color: "var(--primary-theme)" }}>User Account</span></DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic">
                        Modify roles, departments, or set a new password for this user account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Full Name</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                defaultValue={user.name || ""}
                                readOnly
                                required 
                                className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-75"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Email Address</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email" 
                                defaultValue={user.email || ""}
                                readOnly
                                required 
                                className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium bg-slate-50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-75"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Account Role</Label>
                                <Select name="role" defaultValue={user.role} onValueChange={(v) => setRole(v as UserRole)}>
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
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">New Password (Optional)</Label>
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    placeholder="Leave blank to keep current" 
                                    className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium"
                                />
                            </div>
                        </div>

                        {role === "BARANGAY_ADMIN" && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="managedBarangay" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Managed Barangay</Label>
                                <Select name="managedBarangay" defaultValue={user.managedBarangay || undefined}>
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

                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400">Assigned Department</Label>
                            <Input 
                                id="department" 
                                name="department" 
                                defaultValue={user.department || ""}
                                placeholder="e.g. Treasury, BPLO, Civil Registry" 
                                className="h-12 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            style={{ backgroundColor: "var(--primary-theme)" }}
                            className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all shadow-xl hover:scale-[1.02] active:scale-95 text-white hover:opacity-90 border-0"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
