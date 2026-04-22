"use client";

import React, { useState, useRef, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
    FileText,
    Camera,
    BadgeCheck, ArrowLeft,
    Upload,
    Check
} from "lucide-react";
import { toast } from "sonner";
import { 
    getTransactionById,
    evaluateCedulaTransaction, 
    confirmTransactionPayment, 
    releaseCedula,
    rejectTransaction,
    uploadECopyAction,
    getSystemSettingAction
} from "@/app/admin/transactions/actions";
import { cn } from "@/lib/utils";
import { calculateCedula } from "@/lib/cedula";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// No unused Dialog imports here anymore
import IdentityConfirmationVault from "@/components/admin/IdentityConfirmationVault";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function TreasuryDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const remarksRef = useRef<HTMLTextAreaElement>(null);
    const [ctcNumber, setCtcNumber] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [eCopyFile, setECopyFile] = useState<File | null>(null);
    const [themeColor, setThemeColor] = useState<string>("#2563eb");

    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTransactionById(id);
            if (res.success && res.data) {
                const tx = res.data;
                setTransaction(tx);
                if (tx && tx.fulfillmentType === "DELIVERY") {
                    setDeliveryFee(tx.totalAmount > 0 ? (tx as any).deliveryFee || tx.type.deliveryFee : tx.type.deliveryFee);
                }
            } else {
                toast.error(res.error || "Failed to load transaction");
            }
        } catch {
            toast.error("An error occurred while fetching details");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { 
        fetchTransaction(); 
        
        // Fetch theme color
        getSystemSettingAction("theme_color", "#2563eb").then(res => {
            if (res.success && res.data) {
                setThemeColor(res.data);
            }
        });
    }, [fetchTransaction]);

    useEffect(() => {
        if (isRejecting) {
            remarksRef.current?.focus();
        }
    }, [isRejecting]);

    const handleReject = async () => {
        if (!remarks) { toast.error("Remarks required"); return; }
        setActionLoading(true);
        try {
            const res = await rejectTransaction(transaction.id, remarks);
            if (res.success) { toast.success("Rejected"); fetchTransaction(); }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!transaction) return <div className="p-20 text-center dark:text-white">Protocol Error: Transaction Inaccessible</div>;

    const additional = transaction.additionalData || {};
    const resident = transaction.residentSnapshot || {};
    const income = Number(additional.income || 0);
    const propertyValue = Number(additional.propertyValue || 0);

    const fiscal = (transaction.fiscalSnapshot as any) || null;
    const calcResult = fiscal ? {
        basicTax: fiscal.basicTax,
        additionalTax: fiscal.additionalTax,
        penalty: fiscal.penaltyCharge,
        totalAmount: fiscal.totalAmount
    } : calculateCedula({
        type: additional.applicantType || "INDIVIDUAL",
        income,
        propertyValue,
        fulfillmentType: transaction.fulfillmentType,
        deliveryFee
    });

    const steps = [
        { id: "FOR_REQUESTING", label: "PENDING REVIEW" },
        { id: "EVALUATED", label: "FOR PAYMENT" },
        { id: "PAID", label: "VERIFYING" },
        { id: "RELEASED", label: "RELEASED" },
    ];

    const getEffectiveStatus = (s: string) => ["PAID", "FOR_CLAIM"].includes(s) ? "PAID" : s;
    const currentStepIdx = steps.findIndex(s => s.id === getEffectiveStatus(transaction.status));

    const handleEvaluate = async () => {
        setActionLoading(true);
        try {
            const res = await evaluateCedulaTransaction(transaction.id, deliveryFee, remarks);
            if (res.success) { 
                toast.success("Evaluated Successfully"); 
                router.push("/admin/treasury");
            }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    const handleConfirmPayment = async () => {
        setActionLoading(true);
        try {
            const res = await confirmTransactionPayment(transaction.id);
            if (res.success) { toast.success("Payment Confirmed"); fetchTransaction(); }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    const handleRelease = async () => {
        if (!ctcNumber) { toast.error("CTC Number Required"); return; }
        if (transaction.fulfillmentType === "E_COPY" && !eCopyFile) { toast.error("E-Copy Required"); return; }
        setActionLoading(true);
        try {
            let eCopyUrl = "";
            if (transaction.fulfillmentType === "E_COPY" && eCopyFile) {
                const formData = new FormData();
                formData.append("file", eCopyFile);
                const uploadRes = await uploadECopyAction(formData);
                if (uploadRes.success) eCopyUrl = uploadRes.data as string;
                else { toast.error("Upload failed"); setActionLoading(false); return; }
            }
            const res = await releaseCedula(transaction.id, ctcNumber, eCopyUrl);
            if (res.success) { toast.success("Document Released"); setECopyFile(null); fetchTransaction(); }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    return (
        <div 
            className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] text-[#0f172a] dark:text-[#f8fafc] pb-20 font-sans transition-colors duration-500"
            style={{ "--theme_color": themeColor, "--primary-theme": themeColor } as React.CSSProperties}
        >
            {/* Minimal Header */}
            <header className="h-16 px-8 flex items-center justify-between border-b border-transparent dark:border-white/5">
                <Link href="/admin/treasury">
                    <Button variant="ghost" className="gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-primary">
                        <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
                    </Button>
                </Link>
                <Badge variant="outline" className="font-black italic uppercase tracking-widest text-[10px] border-primary/20 text-primary bg-primary/5 px-4 py-1">
                    Type Of Request: {transaction.fulfillmentType?.replace("_", " ") || "STATIONARY"}
                </Badge>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 grid grid-cols-12 gap-8 mt-4">
                
                {/* LEFT COLUMN: Assessment & Identity */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* MAIN ASSESSMENT CARD */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-12">
                        
                        {/* IDENTIFIER */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                                    {transaction.type.requiresBusinessName ? "Registered Business Name" : "Primary Applicant Profile"}
                                </span>
                                <div className="flex items-center gap-4 group">
                                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                        {transaction.type.requiresBusinessName 
                                            ? (transaction.businessName || additional.businessName || "UNNAMED ENTITY")
                                            : `${resident.firstName} ${resident.lastName}`}
                                    </h1>
                                    
                                    <IdentityConfirmationVault resident={resident} themeColor={themeColor} />
                                </div>
                            </div>
                        </div>

                        {/* TOP METRICS GRID */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Declared Gross</span>
                                <p className="text-2xl font-black italic tracking-tighter dark:text-slate-200">₱{income.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Mode</span>
                                <p className="text-2xl font-black italic tracking-tighter dark:text-slate-200">{transaction.paymentType || "--"}</p>
                            </div>
                            <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Assessment</span>
                                <p className="text-2xl font-black italic tracking-tighter text-primary">₱{calcResult.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* COMPUTATION BREAKDOWN */}
                        <div className="space-y-6 pt-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tax Computation Breakdown</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                    <span>Basic Community Tax</span>
                                    <span className="dark:text-slate-200">₱{calcResult.basicTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                    <span>Additional Tax (₱1.00 per ₱1,000 gross)</span>
                                    <span className="dark:text-slate-200">₱{calcResult.additionalTax.toFixed(2)}</span>
                                </div>
                                {calcResult.penalty > 0 && (
                                    <div className="flex justify-between items-center text-sm font-bold text-orange-500 italic">
                                        <span>Penalty Charge</span>
                                        <span>₱{calcResult.penalty.toFixed(2)}</span>
                                    </div>
                                )}
                                {transaction.fulfillmentType === "DELIVERY" && (
                                    <div className="flex justify-between items-center pt-2 gap-4">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">Logistics & Delivery</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-primary">₱</span>
                                            <Input 
                                                type="number"
                                                value={deliveryFee}
                                                disabled={transaction.status === "RELEASED"}
                                                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                                className="h-8 w-24 rounded-lg bg-slate-50 dark:bg-white/5 border-none text-right font-black italic text-xs dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-dotted border-slate-300 dark:border-white/10 pt-8 mt-8 flex justify-between items-center">
                                    <span className="text-lg font-black uppercase italic tracking-widest text-slate-900 dark:text-white leading-none">Total Amount Due</span>
                                    <span className="text-4xl font-black italic tracking-tighter text-primary leading-none">
                                        ₱{calcResult.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* IDENTITY & AUTHENTICATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Evidence Vault */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="text-primary w-4 h-4" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Identity Evidences</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[additional.validIdUrl, additional.proofOfIncomeUrl].map((doc, i) => (
                                    <div key={i} className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center">
                                        {doc ? <Image src={doc} alt="Doc" fill className="object-cover group-hover:scale-105 transition-transform" /> : <Camera className="w-6 h-6 text-slate-200 dark:text-slate-700" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Verification */}
                        {(transaction.paymentType === "E_PAYMENT" || transaction.paymentType === "BANK_TRANSFER") && (
                            <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Camera className="text-primary w-4 h-4" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Verification</span>
                                </div>
                                <div className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center h-32">
                                    {transaction.paymentReference?.startsWith("/uploads/") 
                                        ? <Image src={transaction.paymentReference} alt="Payment" fill className="object-cover group-hover:scale-105 transition-transform" />
                                        : <div className="text-center opacity-30 italic font-black text-[9px] uppercase tracking-widest dark:text-slate-500">Awaiting Proof</div>
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Workflow Tracking & Actions */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    
                    {/* WORKFLOW TRACKING */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-50 dark:border-white/5 space-y-10">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 italic">Workflow Tracking</span>
                        
                        <div className="space-y-12 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-100 dark:bg-slate-800" />
                            
                            {steps.map((step, idx) => {
                                const isPast = idx < currentStepIdx;
                                const isCurrent = idx === currentStepIdx;
                                return (
                                    <div key={idx} className="flex items-center gap-6 relative z-10">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-black italic text-[11px] transition-all duration-500",
                                            isPast ? "bg-primary text-white shadow-lg shadow-primary/20" : 
                                            isCurrent ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] ring-[6px] ring-primary/10" : 
                                            "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 text-slate-300 dark:text-slate-600"
                                        )}>
                                            {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest italic transition-colors duration-500",
                                            isCurrent ? "text-[#1e293b] dark:text-white" : "text-slate-300 dark:text-slate-600"
                                        )}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DIGITAL ISSUANCE (E-COPY) */}
                    {transaction.fulfillmentType === "E_COPY" && (
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 italic block">Digital Record Protocol</span>
                            <div className="relative">
                                <input type="file" accept=".pdf,image/*" onChange={(e) => setECopyFile(e.target.files?.[0] || null)} className="hidden" id="main-ecopy-upload" />
                                <label htmlFor="main-ecopy-upload" className={cn(
                                    "flex flex-col items-center justify-center gap-3 p-10 rounded-3xl border-2 border-dashed transition-all cursor-pointer h-36 bg-[#f8fafd] dark:bg-white/5",
                                    eCopyFile || transaction.eCopyUrl ? "border-primary/30 bg-primary/5" : "border-slate-100 dark:border-white/5 hover:border-primary/30"
                                )}>
                                    <div className={cn("p-4 rounded-2xl transition-colors", (eCopyFile || transaction.eCopyUrl) ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600")}>
                                        {(eCopyFile || transaction.eCopyUrl) ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-400 dark:text-slate-500 text-center">
                                        {(eCopyFile || transaction.eCopyUrl) ? (eCopyFile?.name || "Archived") : "Attach E-Copy Registry"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* EXECUTIVE ACTIONS */}
                    <div className="space-y-4 pt-4">
                        {!isRejecting ? (
                            <>
                                {transaction.status === "FOR_REQUESTING" && (
                                    <Button onClick={handleEvaluate} disabled={actionLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                                        {actionLoading ? "Processing..." : "Confirm Assessment"}
                                    </Button>
                                )}
                                {/* 1. EVALUATION PHASE: Strictly Read-Only (Resident is choosing fulfillment/paying) */}
                                {transaction.status === "EVALUATED" && (
                                    <div className="bg-blue-50 dark:bg-blue-500/5 p-8 rounded-[2.5rem] border-2 border-blue-100 dark:border-blue-500/20 text-center space-y-4 animate-in zoom-in-95">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                                            <span className="text-2xl animate-pulse">⏳</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-500 italic">Financial Protocol Active</p>
                                            <p className="text-[11px] font-bold text-blue-900/60 dark:text-blue-400/60 leading-relaxed uppercase tracking-tight">Read-Only Mode: Waiting for Citizen to finalize fulfillment & upload payment proof.</p>
                                        </div>
                                    </div>
                                )}

                                {/* 2. VERIFICATION & RELEASE PHASE: Active Actions enabled here */}
                                {["PAID", "FOR_CLAIM"].includes(transaction.status) && (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                        {/* Financial Verification: Show if Online Payment AND not yet confirmed */}
                                        {(transaction.paymentType === "E_PAYMENT" || transaction.paymentType === "BANK_TRANSFER") && (
                                            <div className="space-y-3 p-1 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <Button 
                                                    onClick={handleConfirmPayment} 
                                                    disabled={actionLoading} 
                                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                >
                                                    {actionLoading ? "Processing Verification..." : "Verify Financial Record"}
                                                </Button>
                                                <Button 
                                                    onClick={() => setIsRejecting(true)} 
                                                    variant="ghost"
                                                    className="w-full h-10 text-red-600/60 hover:text-red-600 font-bold uppercase tracking-widest text-[8px] italic"
                                                >
                                                    Decline Registry Process
                                                </Button>
                                            </div>
                                        )}

                                        {/* Gated CTC Entry: For E-COPY, wait for digital record upload selection */}
                                        {transaction.fulfillmentType === "E_COPY" && !eCopyFile && !transaction.eCopyUrl ? (
                                            <div className="p-8 rounded-3xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-center space-y-2">
                                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 italic">Digital Copy Required</p>
                                                <p className="text-[11px] font-bold text-amber-900/60 dark:text-amber-500/60 leading-relaxed">Please attach the Digital Record to enable final release.</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-primary/20 space-y-3 animate-in zoom-in-95">
                                                <Label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 italic">Registry Serial Entry (CTC No.)</Label>
                                                <Input 
                                                    value={ctcNumber} 
                                                    onChange={(e) => setCtcNumber(e.target.value)} 
                                                    placeholder="ENTER SERIAL..." 
                                                    className="h-12 rounded-xl border-slate-100 dark:border-white/5 italic font-black text-sm tracking-[0.2em] focus:ring-primary/10 dark:bg-slate-900 dark:text-white uppercase" 
                                                />
                                            </div>
                                        )}

                                        <Button 
                                            onClick={handleRelease} 
                                            disabled={
                                                actionLoading || 
                                                !ctcNumber || 
                                                (transaction.fulfillmentType === "E_COPY" && !eCopyFile && !transaction.eCopyUrl)
                                            } 
                                            className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                                        >
                                            {actionLoading ? "Processing Release..." : "Confirm & Release Document"}
                                        </Button>
                                    </div>
                                )}
                                {transaction.status === "RELEASED" && (
                                    <div className="bg-primary p-8 rounded-[2.5rem] text-white text-center space-y-4 shadow-2xl shadow-primary/40 animate-in zoom-in-95">
                                        <BadgeCheck className="w-12 h-12 mx-auto" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase italic opacity-60">Success Registry Locked</p>
                                            <p className="text-3xl font-black italic font-mono tracking-tighter">{transaction.cedula?.ctcNumber}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-red-50 dark:bg-red-500/5 p-6 rounded-[2.5rem] border-2 border-red-100 dark:border-red-500/20 space-y-4 animate-in slide-in-from-right-4">
                                <Textarea ref={remarksRef} placeholder="Reason for decline..." value={remarks} onChange={(e) => setRemarks(e.target.value)} className="min-h-[100px] rounded-2xl border-none focus:ring-0 bg-white dark:bg-slate-900 font-bold p-6 text-sm italic dark:text-white" />
                                <div className="flex gap-2">
                                    <Button onClick={() => handleReject()} disabled={actionLoading} className="flex-1 h-12 bg-red-600 text-white font-black italic uppercase text-[9px] rounded-xl hover:bg-red-700">Decline Request</Button>
                                    <Button variant="outline" onClick={() => setIsRejecting(false)} className="h-12 px-6 rounded-xl border-2 font-black italic uppercase text-[9px] dark:border-white/5 dark:text-white">Cancel</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
