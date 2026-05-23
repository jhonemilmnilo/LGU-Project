"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, QrCode, ShieldAlert, RefreshCcw, Building2, Search } from "lucide-react";
import { updateTreasurySettings, updateTransactionBaseFees } from "@/app/admin/settings/actions";

interface PaymentSettingsClientProps {
    initialSettings: any;
    role?: string;
    transactionTypes: any[];
    themeColor?: string;
}

export default function PaymentSettingsClient({ 
    initialSettings, 
    role, 
    transactionTypes, 
    themeColor = "#2563eb" 
}: PaymentSettingsClientProps) {
    const isTreasuryStaff = role === "TREASURY_STAFF";
    const [activeTab, setActiveTab] = useState<"merchant" | "fees">("merchant");
    const [searchQuery, setSearchQuery] = useState("");

    // Merchant State
    const [gcashQrUrl, setGcashQrUrl] = useState(initialSettings.gcash_qr_url || "");
    const [gcashAccountName, setGcashAccountName] = useState(initialSettings.gcash_account_name || "");
    const [gcashAccountNumber, setGcashAccountNumber] = useState(initialSettings.gcash_account_number || "");
    const [bankName, setBankName] = useState(initialSettings.bank_name || "");
    const [bankAccountName, setBankAccountName] = useState(initialSettings.bank_account_name || "");
    const [bankAccountNumber, setBankAccountNumber] = useState(initialSettings.bank_account_number || "");

    const [gcashFile, setGcashFile] = useState<File | null>(null);
    const [gcashPreview, setGcashPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Service Fees State
    const [fees, setFees] = useState<Record<string, string>>(() => {
        return transactionTypes.reduce((acc, type) => {
            acc[type.id] = String(type.baseFee);
            return acc;
        }, {} as Record<string, string>);
    });
    const [isSavingFees, setIsSavingFees] = useState(false);

    // Sync state when props change (revalidation updates)
    React.useEffect(() => {
        setFees(transactionTypes.reduce((acc, type) => {
            acc[type.id] = String(type.baseFee);
            return acc;
        }, {} as Record<string, string>));
    }, [transactionTypes]);

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

    const handleFeeChange = (id: string, value: string) => {
        setFees(prev => ({
            ...prev,
            [id]: value
        }));
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
        } catch {
            toast.error("An error occurred while saving settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveFees = async () => {
        setIsSavingFees(true);
        try {
            const feesList = Object.entries(fees).map(([id, baseFee]) => ({
                id,
                baseFee: Number(baseFee) || 0
            }));
            const res = await updateTransactionBaseFees(feesList);
            if (res.success) {
                toast.success("Service transaction base fees updated successfully!");
            } else {
                toast.error(res.error || "Failed to update fees");
            }
        } catch {
            toast.error("An error occurred while saving fees");
        } finally {
            setIsSavingFees(false);
        }
    };

    const tabs = [
        { id: "merchant", label: "Merchant Gateways", icon: CreditCard },
        { id: "fees", label: "Service Fee Registry", icon: Building2 }
    ];

    const filteredTransactionTypes = transactionTypes.filter(type => 
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (type.category && type.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Symmetrical Premium Tabs Selector */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-black/40 rounded-[1.5rem] border border-slate-200/50 dark:border-[#2a3040]/50 max-w-2xl">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                                isActive 
                                    ? "bg-white dark:bg-[#1e2330] shadow-md scale-[1.02]" 
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                            }`}
                            style={isActive ? { color: themeColor } : undefined}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <Card className="border-slate-200 dark:border-[#2a3040] shadow-xl overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-white dark:bg-[#1e2330]">
                <CardHeader className="bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-[#2a3040] p-5 md:p-6 px-4 md:px-8">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black italic uppercase tracking-tighter">
                                {activeTab === "merchant" ? (
                                    <>
                                        <CreditCard className="w-6 h-6" style={{ color: themeColor }} />
                                        Merchant Configuration
                                    </>
                                ) : (
                                    <>
                                        <Building2 className="w-6 h-6" style={{ color: themeColor }} />
                                        Service Fee Registry
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
                                {activeTab === "merchant" 
                                  ? (isTreasuryStaff ? "Authorized Personnel Only: Secure financial gateway control." : "Administrative Oversight: Payment reception channels.")
                                  : "Configure official base service charges live for citizen applications."}
                            </CardDescription>
                        </div>
                        <div className="hidden md:block">
                            <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-200">
                                Encrypted Secure
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 lg:p-8 px-4 md:px-6 lg:px-8 space-y-8">
                    
                    {/* Tab 1: Merchant Gateways */}
                    {activeTab === "merchant" && (
                        <div className="space-y-8 transition-all duration-300 ease-out">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                {/* Left: Merchant Identity */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full shadow-md" style={{ backgroundColor: themeColor }} />
                                        <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Official Identity</Label>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Merchant Account Name</Label>
                                            <Input 
                                                value={gcashAccountName} 
                                                onChange={(e) => setGcashAccountName(e.target.value)} 
                                                placeholder="e.g. MUNICIPALITY OF MAPANDAN"
                                                className="h-16 rounded-[1.2rem] bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-bold text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-primary/20 text-base"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Mobile Number</Label>
                                            <Input 
                                                value={gcashAccountNumber} 
                                                onChange={(e) => setGcashAccountNumber(e.target.value)} 
                                                placeholder="e.g. 0912 345 6789"
                                                className="h-16 rounded-[1.2rem] bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-mono font-bold text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-primary/20 text-base"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-[1.5rem] border space-y-3 relative overflow-hidden group transition-colors duration-500" style={{ backgroundColor: `${themeColor}09`, borderColor: `${themeColor}20` }}>
                                        <div className="flex items-center gap-3">
                                            <ShieldAlert className="w-5 h-5" style={{ color: themeColor }} />
                                            <span className="text-[11px] font-black uppercase italic tracking-widest" style={{ color: themeColor }}>Protocol Check</span>
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed uppercase tracking-tight italic">
                                            Final payouts are calculated based on these credentials. Misconfiguration may lead to payment reconciliation errors for municipality services.
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Visual Channel (QR) */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full shadow-md" style={{ backgroundColor: themeColor }} />
                                        <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Visual Gateway (QR)</Label>
                                    </div>

                                    <div className="flex flex-col items-center gap-6">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000" style={{ background: `linear-gradient(to right, ${themeColor}20, #6366f120)` }} />
                                            <div className="relative w-56 h-56 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-inner overflow-hidden flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-[1.02]">
                                                {(gcashPreview || gcashQrUrl) ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img 
                                                        src={gcashPreview || gcashQrUrl} 
                                                        alt="Payment QR" 
                                                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                                        <QrCode className="w-16 h-16 text-slate-900 dark:text-white" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest italic">No QR Loaded</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full space-y-4 max-w-sm">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleGcashQrChange}
                                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 text-[10px] file:text-[9px] file:font-black file:uppercase file:bg-slate-900 dark:file:bg-white dark:file:text-slate-950 file:text-white file:border-none file:h-full file:mr-4 file:px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            />
                                            
                                            {(gcashPreview || gcashQrUrl) && (
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => { setGcashQrUrl(""); setGcashPreview(null); setGcashFile(null); }}
                                                        className="text-[10px] font-black uppercase text-red-500 hover:text-red-650 transition-colors italic tracking-[0.2em] flex items-center gap-2 group"
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

                            <Separator className="bg-slate-100 dark:bg-[#2a3040]" />

                            {/* Bank Configuration */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full shadow-md" style={{ backgroundColor: themeColor }} />
                                    <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Bank Transfer Configuration</Label>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Bank Name</Label>
                                        <Input 
                                            value={bankName} 
                                            onChange={(e) => setBankName(e.target.value)} 
                                            placeholder="e.g. LANDBANK OF THE PHILIPPINES"
                                            className="h-14 rounded-[1.2rem] bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-bold text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-primary/20 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Holder Name</Label>
                                        <Input 
                                            value={bankAccountName} 
                                            onChange={(e) => setBankAccountName(e.target.value)} 
                                            placeholder="e.g. MUNICIPALITY OF MAPANDAN"
                                            className="h-14 rounded-[1.2rem] bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-bold text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-primary/20 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Account Number</Label>
                                        <Input 
                                            value={bankAccountNumber} 
                                            onChange={(e) => setBankAccountNumber(e.target.value)} 
                                            placeholder="e.g. 0541-2345-67"
                                            className="h-14 rounded-[1.2rem] bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-mono font-bold text-slate-800 dark:text-white px-6 focus:ring-2 focus:ring-primary/20 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-100 dark:bg-[#2a3040]" />

                            {/* Save Merchant Settings Action */}
                            <div className="pt-2">
                                <Button
                                    onClick={handleSaveSettings}
                                    disabled={isSaving}
                                    className="w-full h-16 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-[0.98] transition-all hover:opacity-90 disabled:opacity-50 border-none"
                                    style={{ 
                                        backgroundColor: themeColor,
                                        boxShadow: `0 10px 25px -5px ${themeColor}40` 
                                    }}
                                >
                                    {isSaving ? "Synchronizing Secure..." : "Lock Financial Identity"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Service Fee Registry */}
                    {activeTab === "fees" && (
                        <div className="space-y-8 transition-all duration-300 ease-out animate-in fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full shadow-md" style={{ backgroundColor: themeColor }} />
                                    <Label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] italic">Official Service Fee Listing</Label>
                                </div>
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input 
                                        type="text"
                                        placeholder="Search services, codes, category..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-11 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] text-xs font-bold shadow-sm focus:ring-2 focus:ring-primary/20 w-full"
                                    />
                                </div>
                            </div>

                            {filteredTransactionTypes.length === 0 ? (
                                <div className="text-center p-12 bg-slate-50 dark:bg-black/20 rounded-[1.5rem] border border-slate-200 dark:border-[#2a3040]">
                                    <p className="text-slate-500 font-medium italic">No service transactions match your search filter.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 dark:border-[#2a3040] shadow-sm bg-white dark:bg-black/10">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-black/40 border-b border-slate-200 dark:border-[#2a3040] font-black uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400">
                                                <th className="p-4 pl-6">Service Code</th>
                                                <th className="p-4">Official Service Name</th>
                                                <th className="p-4">Department / Category</th>
                                                <th className="p-4 text-right pr-6">Base Fee (PHP)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTransactionTypes.map((type) => (
                                                <tr key={type.id} className="border-b border-slate-100 dark:border-[#2a3040] hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors font-medium">
                                                    <td className="p-4 pl-6">
                                                        <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md uppercase border border-slate-200/50 dark:border-[#2a3040]/50">
                                                            {type.code}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-slate-800 dark:text-slate-200 text-sm tracking-tight">{type.name}</span>
                                                            {type.description && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-sm xl:max-w-md">{type.description}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full border border-slate-200/50 dark:border-[#2a3040]/50 tracking-wider">
                                                            {type.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right pr-6">
                                                        <div className="relative inline-flex items-center max-w-[130px] ml-auto">
                                                            <span className="absolute left-3 text-slate-400 dark:text-slate-500 font-black text-sm">₱</span>
                                                            <Input 
                                                                type="number"
                                                                step="0.01"
                                                                value={fees[type.id] !== undefined ? fees[type.id] : ""}
                                                                onChange={(e) => handleFeeChange(type.id, e.target.value)}
                                                                className="h-11 pl-7 pr-3 text-right rounded-xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-bold text-sm shadow-inner focus:ring-2 focus:ring-primary/20 w-full"
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <Separator className="bg-slate-100 dark:bg-[#2a3040]" />

                            {/* Save Service Fees Action */}
                            <div className="pt-2">
                                <Button
                                    onClick={handleSaveFees}
                                    disabled={isSavingFees}
                                    className="w-full h-16 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-[0.98] transition-all hover:opacity-90 disabled:opacity-50 border-none"
                                    style={{ 
                                        backgroundColor: themeColor,
                                        boxShadow: `0 10px 25px -5px ${themeColor}40` 
                                    }}
                                >
                                    {isSavingFees ? "Publishing Fees..." : "Publish Service Fees"}
                                </Button>
                            </div>
                        </div>
                    )}
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
