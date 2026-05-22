"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, QrCode, ShieldAlert, Save, RefreshCcw, Building2 } from "lucide-react";
import { updateTreasurySettings } from "@/app/admin/settings/actions";

interface PaymentSettingsClientProps {
    initialSettings: any;
    role?: string;
}

export default function PaymentSettingsClient({ initialSettings, role }: PaymentSettingsClientProps) {
    const isTreasuryStaff = role === "TREASURY_STAFF";

    const [gcashQrUrl, setGcashQrUrl] = useState(initialSettings.gcash_qr_url || "");
    const [gcashAccountName, setGcashAccountName] = useState(initialSettings.gcash_account_name || "");
    const [gcashAccountNumber, setGcashAccountNumber] = useState(initialSettings.gcash_account_number || "");
    
    const [bankName, setBankName] = useState(initialSettings.bank_name || "");
    const [bankAccountName, setBankAccountName] = useState(initialSettings.bank_account_name || "");
    const [bankAccountNumber, setBankAccountNumber] = useState(initialSettings.bank_account_number || "");

    const [gcashFile, setGcashFile] = useState<File | null>(null);
    const [gcashPreview, setGcashPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleGcashQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setGcashFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setGcashPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            if (gcashFile) {
                formData.append("gcashQr", gcashFile);
            }
            formData.append("imageUrl", gcashQrUrl);
            formData.append("gcashAccountName", gcashAccountName);
            formData.append("gcashAccountNumber", gcashAccountNumber);
            formData.append("bankName", bankName);
            formData.append("bankAccountName", bankAccountName);
            formData.append("bankAccountNumber", bankAccountNumber);

            const result = await updateTreasurySettings(formData);
            if (result.success) {
                if (result.qrUrl) setGcashQrUrl(result.qrUrl);
                setGcashFile(null);
                setGcashPreview(null);
                toast.success("Payment settings updated successfully!");
            } else {
                toast.error(result.error || "Failed to update settings");
            }
        } catch (error) {
            console.error("Save settings error:", error);
            toast.error("An error occurred while saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden rounded-[2.5rem] bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-10">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black italic uppercase tracking-tighter">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                Merchant Configuration
                            </CardTitle>
                            <CardDescription className="italic font-medium text-slate-500">
                                {isTreasuryStaff ? "Authorized Personnel Only: Secure financial gateway control." : "Administrative Oversight: Payment reception channels."}
                            </CardDescription>
                        </div>
                        <div className="hidden md:block">
                            <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-200">
                                Encrypted Secure
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Section 1: Merchant Identity */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                    <Label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] italic">Official Identity</Label>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Merchant Account Name</Label>
                                        <Input 
                                            value={gcashAccountName} 
                                            onChange={(e) => setGcashAccountName(e.target.value)} 
                                            placeholder="e.g. MUNICIPALITY OF MAPANDAN"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 font-bold italic text-lg shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Mobile Number</Label>
                                        <Input 
                                            value={gcashAccountNumber} 
                                            onChange={(e) => setGcashAccountNumber(e.target.value)} 
                                            placeholder="e.g. 0912 345 6789"
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 font-mono font-bold text-lg shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-4 relative overflow-hidden group hover:bg-primary/10 transition-colors duration-500">
                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="w-5 h-5 text-primary" />
                                    <span className="text-[11px] font-black uppercase text-primary italic tracking-widest">Protocol Check</span>
                                </div>
                                <p className="text-[12px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight italic">
                                    Final payouts are calculated based on these credentials. Misconfiguration may lead to payment reconciliation errors for municipality services.
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Visual Channels */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                <Label className="text-[11px] font-black uppercase text-slate-500 tracking-[0.2em] italic">Visual Gateway (QR)</Label>
                            </div>

                            <div className="flex flex-col items-center gap-8">
                                <div className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-500/10 rounded-[3rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                    <div className="relative w-64 h-64 bg-white dark:bg-slate-900 rounded-[2.8rem] border border-slate-100 dark:border-white/5 shadow-inner overflow-hidden flex items-center justify-center p-6 transition-transform duration-500 group-hover:scale-[1.02]">
                                        {(gcashPreview || gcashQrUrl) ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img 
                                                src={gcashPreview || gcashQrUrl} 
                                                alt="Payment QR" 
                                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 opacity-20">
                                                <QrCode className="w-20 h-20 text-slate-900 dark:text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">No QR Loaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full space-y-4 max-w-sm">
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleGcashQrChange}
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-[10px] file:text-[9px] file:font-black file:uppercase file:bg-primary file:text-white file:border-none file:h-full file:mr-4 file:px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        />
                                    </div>
                                    
                                    {(gcashPreview || gcashQrUrl) && (
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => { setGcashQrUrl(""); setGcashPreview(null); setGcashFile(null); }}
                                                className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 transition-colors italic tracking-[0.2em] flex items-center gap-2 group"
                                            >
                                                <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                                                Purge Current Image
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-white/10" />

                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Bank Transfer Configuration</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic">Configure the official Electronic Bank Transfer credentials for citizens.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Bank Name</Label>
                                <Input 
                                    value={bankName} 
                                    onChange={(e) => setBankName(e.target.value)} 
                                    placeholder="e.g. LANDBANK OF THE PHILIPPINES"
                                    className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 font-bold italic text-sm shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Holder Name</Label>
                                <Input 
                                    value={bankAccountName} 
                                    onChange={(e) => setBankAccountName(e.target.value)} 
                                    placeholder="e.g. MUNICIPALITY OF MAPANDAN"
                                    className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 font-bold italic text-sm shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Number</Label>
                                <Input 
                                    value={bankAccountNumber} 
                                    onChange={(e) => setBankAccountNumber(e.target.value)} 
                                    placeholder="e.g. 0541-2345-67"
                                    className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 font-mono font-bold text-sm shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-white/10" />

                    <div className="pt-4">
                        <Button
                            onClick={handleSaveSettings}
                            disabled={isSaving}
                            className="w-full h-20 bg-slate-950 dark:bg-white dark:text-slate-950 text-white hover:opacity-90 rounded-3xl font-black uppercase tracking-[0.4em] italic shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.05)] transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-4 group overflow-hidden relative"
                        >
                            <span className="relative z-10">{isSaving ? "Synchronizing Secure..." : "Lock Financial Identity"}</span>
                            {!isSaving && <Save className="w-5 h-5 relative z-10 group-hover:translate-y-1 transition-transform" />}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-100%] group-hover:translate-x-0 duration-700" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Info */}
            <div className="max-w-3xl mx-auto text-center space-y-2 opacity-40">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Mapandan Municipal Portal • Unified Treasury Services</p>
                <div className="h-0.5 w-12 bg-slate-300 dark:bg-white/10 mx-auto rounded-full" />
            </div>
        </div>
    );
}

