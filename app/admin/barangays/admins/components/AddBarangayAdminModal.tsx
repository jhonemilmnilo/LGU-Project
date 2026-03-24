"use client";

import { useState } from "react";
import { X, Save, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createBarangayAdmin } from "../../../actions";

interface AddBarangayAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    barangays: string[];
}

export function AddBarangayAdminModal({ isOpen, onClose, barangays }: AddBarangayAdminModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const managedBarangay = formData.get("managedBarangay") as string;

        if (!name || !email || !password || !managedBarangay) {
            toast.error("All fields are required.");
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createBarangayAdmin(formData);
            if (result.success) {
                toast.success(`Admin for ${managedBarangay} created successfully!`);
                onClose();
            } else {
                toast.error(result.error || "Failed to create admin.");
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl w-full max-w-lg border border-slate-200 dark:border-[#2a3040] shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-[#2a3040] flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-2">
                            <Shield className="w-6 h-6 text-blue-500" />
                            Register Barangay Admin
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">
                            Create a new admin account for a barangay
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto custom-scrollbar p-6 flex-1">
                    <form id="adminForm" onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="name"
                                required
                                placeholder="E.g. Juan Dela Cruz"
                                className="font-bold h-12 rounded-xl"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="email"
                                type="email"
                                required
                                placeholder="admin@barangay.com"
                                className="font-bold h-12 rounded-xl"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Temporary Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Min. 6 characters"
                                    className="font-bold h-12 rounded-xl pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">The admin can change this password after their first login.</p>
                        </div>

                        {/* Barangay Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                Assign to Barangay <span className="text-red-500">*</span>
                            </label>
                            {barangays.length === 0 ? (
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm font-medium">
                                    No barangays found. Please add a barangay first in the &quot;Add/Edit Barangays&quot; section.
                                </div>
                            ) : (
                                <select
                                    name="managedBarangay"
                                    required
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-[#2a3040] bg-white dark:bg-[#1a1f2e] text-slate-900 dark:text-white font-bold px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select a Barangay</option>
                                    {barangays.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-[#2a3040] bg-slate-50 dark:bg-[#1a1f2e] rounded-b-3xl flex-shrink-0">
                    <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="adminForm"
                        disabled={isSubmitting || barangays.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs px-8 py-6 rounded-2xl shadow-xl shadow-blue-500/20"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Admin Account"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
