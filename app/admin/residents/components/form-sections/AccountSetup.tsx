"use client";

import { Mail, Lock, UserCheck } from "lucide-react";
import { Resident } from "../../providers/ResidentProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface AccountSetupSectionProps {
    data?: Resident;
}

export function AccountSetupSection({ data }: AccountSetupSectionProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handlePasswordChange = (val: string) => {
        setPassword(val);
        if (confirmPassword && val !== confirmPassword) {
            setError("Passwords do not match");
        } else {
            setError("");
        }
    };

    const handleConfirmChange = (val: string) => {
        setConfirmPassword(val);
        if (password && val !== password) {
            setError("Passwords do not match");
        } else {
            setError("");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                    <UserCheck className="w-8 h-8 text-blue-600" />
                    Account Creation
                </h3>
                <p className="text-slate-500 font-medium">Create login credentials for the resident to access the portal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-inner">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            name="email" 
                            type="email"
                            defaultValue={data?.email || ""}
                            className="h-12 pl-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                            placeholder="resident@example.com"
                        />
                    </div>
                </div>

                <div className="hidden md:block" />

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            name="password" 
                            type="password"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            className="h-12 pl-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                            placeholder="Minimum 8 characters"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Confirm Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => handleConfirmChange(e.target.value)}
                            className="h-12 pl-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all" 
                            placeholder="Re-type password"
                        />
                    </div>
                    {error && <p className="text-red-500 text-[10px] font-black uppercase italic mt-1">{error}</p>}
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/30">
                    <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-tight">Security Note</h4>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/60 font-medium">These credentials will allow the resident to log in to their personal dashboard. Please ensure the email is correct as it will be used for account recovery.</p>
                </div>
            </div>
        </div>
    );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
