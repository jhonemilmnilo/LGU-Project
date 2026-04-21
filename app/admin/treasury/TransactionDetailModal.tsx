"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    User, MapPin, Calculator, CreditCard, CheckCircle2, 
    FileText, ExternalLink, Camera,
    AlertCircle, BadgeCheck
} from "lucide-react";
import { toast } from "sonner";
import { 
    evaluateCedulaTransaction, 
    confirmTransactionPayment, 
    releaseCedula,
    rejectTransaction 
} from "@/app/admin/transactions/actions";
import { cn } from "@/lib/utils";
import { calculateCedula, getCedulaPenaltyRateLabel } from "@/lib/cedula";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TransactionDetailModalProps {
    transaction: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose, onRefresh }: TransactionDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const remarksRef = useRef<HTMLTextAreaElement>(null);
    const [ctcNumber] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    // Live Calculator State
    const additional = (transaction as any).additionalData || {};
    
    const [income] = useState(Number(additional.income || 0));
    const [propertyValue] = useState(Number(additional.propertyValue || 0));
    const [deliveryFee, setDeliveryFee] = useState(
        transaction.fulfillmentType === "DELIVERY" ? 
        (transaction.totalAmount > 0 ? (transaction as any).deliveryFee || transaction.type.deliveryFee : transaction.type.deliveryFee) : 0
    );

    const calcResult = calculateCedula({
        type: additional.applicantType || "INDIVIDUAL",
        income,
        propertyValue,
        fulfillmentType: transaction.fulfillmentType,
        deliveryFee
    });

    useEffect(() => {
        if (isRejecting) {
            remarksRef.current?.focus();
        }
    }, [isRejecting]);

    if (!transaction) return null;

    const resident = transaction.residentSnapshot || {};

    const handleEvaluate = async () => {
        setLoading(true);
        try {
            const res = await evaluateCedulaTransaction(transaction.id, deliveryFee, remarks);
            if (res.success) {
                toast.success("Transaction evaluated and fees computed.");
                onRefresh();
                onClose();
            } else {
                toast.error(res.error || "Evaluation failed.");
            }
        } catch {
            toast.error("An error occurred during evaluation.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        setLoading(true);
        try {
            const res = await confirmTransactionPayment(transaction.id);
            if (res.success) {
                toast.success("Payment confirmed!");
                onRefresh();
            } else {
                toast.error(res.error || "Payment confirmation failed");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async () => {
        /* 
        if (!ctcNumber) {
            toast.error("Please enter the CTC Serial Number");
            return;
        } 
        */
        setLoading(true);
        try {
            const res = await releaseCedula(transaction.id, ctcNumber);
            if (res.success) {
                toast.success("Document released officially!");
                onRefresh();
                onClose();
            } else {
                toast.error(res.error || "Release failed");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!remarks) {
            toast.error("Please provide rejection remarks");
            return;
        }
        setLoading(true);
        try {
            const res = await rejectTransaction(transaction.id, remarks);
            if (res.success) {
                toast.success("Transaction rejected");
                onRefresh();
                onClose();
            } else {
                toast.error(res.error || "Rejection failed");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };


    const steps = [
        { id: "FOR_REQUESTING", label: "Evaluation", icon: Calculator },
        { id: "EVALUATED", label: "Payment", icon: CreditCard },
        { id: "FOR_CLAIM", label: "Release", icon: CheckCircle2 },
        { id: "PAID", label: "Release", icon: CheckCircle2 },
        { id: "RELEASED", label: "Completed", icon: BadgeCheck },
    ];

    const currentStepIdx = steps.findIndex(s => s.id === transaction.status);
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1400px] w-[95vw] max-h-[92vh] overflow-hidden border-none shadow-[0_0_100px_rgba(0,0,0,0.2)] p-0 bg-white dark:bg-[#0c111d] rounded-[2rem] transition-all duration-500 ring-1 ring-slate-200/50 dark:ring-white/5">
                <div className="h-full max-h-[92vh] overflow-y-auto custom-scrollbar">
                    <div className="p-10 md:p-14 space-y-12">
                    {/* Top Control Bar */}
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-white/5 -m-10 md:-m-14 mb-12 p-8 border-b border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-[1.25rem] text-primary">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="space-y-0.5">
                                <DialogTitle className="text-sm font-black uppercase text-slate-400 tracking-widest italic leading-none">Governance Control</DialogTitle>
                                <p className="text-[10px] font-bold text-slate-500 italic uppercase tracking-tighter">Treasury Application Portfolio</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Hub */}
                    <div className="relative flex justify-between w-full max-w-6xl mx-auto py-8">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-white/5 -translate-y-1/2" />
                        {steps.map((step, idx) => {
                            const isPast = idx < currentStepIdx;
                            const isCurrent = idx === currentStepIdx;
                            const Icon = step.icon;
                            return (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-4 group">
                                    <div className={cn(
                                        "w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-700 shadow-2xl relative",
                                        isPast ? "bg-primary text-white scale-90 opacity-40" : 
                                        isCurrent ? "bg-white dark:bg-slate-900 border-2 border-primary text-primary scale-125 ring-[12px] ring-primary/5" : 
                                        "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 text-slate-300"
                                    )}>
                                        <Icon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] italic block",
                                            isCurrent ? "text-primary" : "text-slate-400"
                                        )}>{step.label}</span>
                                        {isCurrent && <span className="text-[8px] font-bold text-emerald-500 uppercase">Input Required</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Column 1: Identity & Logistics */}
                        <div className="space-y-10">
                            {/* Applicant Identity */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <User className="text-primary w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-400">Applicant Identity</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-8 shadow-sm">
                                    <div className="space-y-6">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Legal Full Name</Label>
                                            <p className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">
                                                {resident.firstName} {resident.lastName}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase italic">Status</Label>
                                                <p className="text-sm font-bold uppercase italic text-slate-700 dark:text-slate-300">{resident.civilStatus}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase italic">Citizenship</Label>
                                                <p className="text-sm font-bold uppercase italic text-slate-700 dark:text-slate-300">{resident.citizenship}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase italic">Primary Contact</Label>
                                            <p className="text-lg font-black font-mono tracking-[0.2em] text-primary">{resident.contactNumber}</p>
                                        </div>
                                        <div className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-white/5">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-primary mt-1 shrink-0" />
                                                <p className="text-xs font-medium italic text-slate-500 leading-relaxed">
                                                    {resident.houseNumber} {resident.street}, {resident.barangay}, Agno, Pangasinan
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Logistics */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="text-primary w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-400">Service Logistics</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black uppercase text-slate-400 italic tracking-[0.2em]">Fulfillment</span>
                                        <Badge variant="outline" className={cn("italic font-bold uppercase rounded-xl px-4", !transaction.fulfillmentType && "text-slate-300 border-dashed")}>
                                            {transaction.fulfillmentType || "Selection Pending"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center pb-6 border-b border-slate-200/50 dark:border-white/5">
                                        <span className="text-[9px] font-black uppercase text-slate-400 italic tracking-[0.2em]">Payment Channel</span>
                                        <Badge variant="outline" className={cn("italic font-bold uppercase rounded-xl px-4", !transaction.paymentType && "text-slate-300 border-dashed")}>
                                            {transaction.paymentType?.replace("_", " ") || "Selection Pending"}
                                        </Badge>
                                    </div>
                                     {transaction.fulfillmentType === "DELIVERY" && (
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black text-slate-400 uppercase italic">Target Delivery Point</Label>
                                            <p className="text-xs font-black italic text-primary leading-relaxed uppercase tracking-tighter">
                                                {(() => {
                                                    const addr = transaction.deliveryAddress;
                                                    if (!addr) return "No address specified";
                                                    if (typeof addr === "string") return addr;
                                                    return `${addr.houseNumber || ""} ${addr.street || ""}, ${addr.barangay}, ${addr.municipality}`.trim();
                                                })()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Assessment Inputs & Authenticators */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Calculator className="text-primary w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-400">Financial Declaration</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Inputs (Read-only) */}
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">Total Annual Gross Income</Label>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black italic">₱</span>
                                                    <Input 
                                                        type="number"
                                                        value={income}
                                                        readOnly
                                                        className="pl-10 h-14 rounded-2xl bg-white dark:bg-white/5 cursor-not-allowed border-slate-100 dark:border-white/5 text-lg font-black italic tracking-tighter opacity-70 shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">Real Property Assessed Value</Label>
                                                <div className="relative group">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black italic">₱</span>
                                                    <Input 
                                                        type="number"
                                                        value={propertyValue}
                                                        readOnly
                                                        className="pl-10 h-14 rounded-2xl bg-white dark:bg-white/5 cursor-not-allowed border-slate-100 dark:border-white/5 text-lg font-black italic tracking-tighter opacity-70 shadow-inner"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Authenticators */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-400">Authenticators</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: "Valid Government ID", url: additional.validIdUrl },
                                            { label: "Financial Evidence / 2316", url: additional.proofOfIncomeUrl }
                                        ].map((doc, i) => (
                                            <div key={i}>
                                                {doc.url ? (
                                                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm group">
                                                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50 dark:border-white/10">
                                                            <Image 
                                                                src={doc.url} 
                                                                alt={doc.label}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            <a 
                                                                href={doc.url} 
                                                                target="_blank" 
                                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                            >
                                                                <ExternalLink className="w-4 h-4 text-white" />
                                                            </a>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black uppercase italic tracking-widest text-slate-400 block leading-none">Registered</span>
                                                            <span className="text-[10px] font-black uppercase italic text-slate-700 dark:text-slate-300 leading-tight">{doc.label}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 rounded-[1.5rem] border border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-2 opacity-50 grayscale">
                                                        <AlertCircle className="w-5 h-5 text-slate-300" />
                                                        <span className="text-[8px] font-black uppercase tracking-widest italic text-slate-400">Not Provided</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Final Computation Breakdown */}
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <BadgeCheck className="text-primary w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic text-slate-400">Compensation Breakdown</h3>
                                </div>
                                
                                {/* Calculator Card */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative shadow-2xl overflow-hidden border border-white/5 space-y-6">
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 italic">Basic Community Tax</span>
                                            <span className="font-black italic tracking-tighter text-slate-200">₱{calcResult.basicTax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 italic">Additional Tax</span>
                                            <span className="font-black italic tracking-tighter text-slate-200">₱{calcResult.additionalTax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center group">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold uppercase text-orange-500 italic">Penalty ({getCedulaPenaltyRateLabel()} Int.)</span>
                                                <AlertCircle className="w-3 h-3 text-orange-500/50" />
                                            </div>
                                            <span className="font-black italic tracking-tighter text-orange-500">₱{calcResult.penalty.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center group border-t border-white/5 pt-4">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 italic">Delivery Fee</span>
                                            <div className="relative w-24">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black italic text-primary">₱</span>
                                                <Input 
                                                    type="number"
                                                    value={deliveryFee}
                                                    disabled={transaction.fulfillmentType !== "DELIVERY"}
                                                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                                    className="h-8 pl-6 pr-2 rounded-lg bg-white/10 border-white/5 text-right font-black italic text-xs text-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 pt-6 border-t border-white/10 flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black uppercase text-emerald-500 tracking-[0.2em] italic">Estimated Total Due</p>
                                            <p className="text-[7px] font-medium text-slate-500 uppercase leading-none">* Final assessment is subject to administrative evaluation</p>
                                        </div>
                                        <p className="text-4xl font-black italic tracking-tighter text-white">₱{calcResult.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <Calculator className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                                </div>

                                {/* Proof of Payment Image - Relocated for Treasury convenience */}
                                {transaction.paymentReference && transaction.paymentReference.startsWith("/uploads/") && (
                                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Camera className="w-4 h-4 text-primary" />
                                                <Label className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Visual Payment Proof</Label>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-emerald-500 border-emerald-500/20 italic">Screenshot Attached</Badge>
                                        </div>

                                        <div className="group relative aspect-video rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 cursor-pointer">
                                            <Image 
                                                src={transaction.paymentReference} 
                                                alt="Payment Proof" 
                                                fill 
                                                className="object-cover group-hover:scale-[1.05] transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                                                <a href={transaction.paymentReference} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] italic tracking-widest shadow-2xl hover:scale-105 transition-transform">
                                                    <ExternalLink className="w-4 h-4" />
                                                    Inspect Full Image
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Official Document Record Section (Commented out for now) */}
                                {/* 
                                {["PAID", "FOR_CLAIM", "RELEASED"].includes(transaction.status) && (
                                    <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                                <Archive className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-widest italic text-slate-400">Official Issuance Record</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center transition-colors group-focus-within:bg-orange-500/10">
                                                    <span className="text-[10px] font-black text-slate-400 group-focus-within:text-orange-600">NO.</span>
                                                </div>
                                                <Input 
                                                    value={ctcNumber}
                                                    onChange={(e) => setCtcNumber(e.target.value)}
                                                    placeholder="Enter CTC Serial Number..."
                                                    disabled={transaction.status === "RELEASED"}
                                                    className="h-14 pl-16 pr-6 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-bold text-sm tracking-widest focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all shadow-sm"
                                                />
                                            </div>
                                            <p className="text-[8px] font-medium text-slate-400 italic px-2">
                                                * This serial number will be permanently recorded on the physical document and in our blockchain-verified ledger.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                */}
                            </div>
                        </div>
                    </div>

                    {/* Decision Center Console */}
                    <div className="pt-10 border-t border-slate-100 dark:border-white/5 space-y-6">
                        {!isRejecting ? (
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-end">
                                {/* Dynamic Status Action */}
                                <div className="flex-1 md:max-w-md w-full">
                                    {transaction.status === "FOR_REQUESTING" && (
                                        <Button 
                                            onClick={handleEvaluate}
                                            disabled={loading}
                                            className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] active:scale-95 hover:scale-[1.02] transition-all text-xs"
                                        >
                                            {loading ? <Calculator className="animate-spin" /> : "Approve & Compute Fees"}
                                        </Button>
                                    )}
                                    {transaction.status === "EVALUATED" && transaction.paymentType && transaction.paymentType !== "CASH" && (
                                        <Button 
                                            onClick={handleConfirmPayment}
                                            disabled={loading}
                                            className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black italic uppercase tracking-[0.1em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] active:scale-95 hover:scale-[1.02] transition-all text-xs"
                                        >
                                            {loading ? <CreditCard className="animate-spin" /> : "Confirm Online Payment"}
                                        </Button>
                                    )}
                                    {transaction.status === "EVALUATED" && !transaction.paymentType && (
                                        <div className="h-16 px-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10 group">
                                            <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.3em] group-hover:text-primary transition-colors">Awaiting Resident Fulfillment Selection</p>
                                        </div>
                                    )}
                                    {["PAID", "FOR_CLAIM"].includes(transaction.status) && (
                                        <Button 
                                            onClick={handleRelease}
                                            disabled={loading}
                                            className="w-full h-16 rounded-2xl bg-orange-600 text-white font-black italic uppercase tracking-widest active:scale-95 hover:scale-[1.02] shadow-[0_10px_30px_rgba(249,115,22,0.3)] transition-all text-xs"
                                        >
                                            {loading ? <CheckCircle2 className="animate-spin" /> : 
                                                transaction.status === "FOR_CLAIM" ? "Claimed & Released" : "Release Document"}
                                        </Button>
                                    )}
                                    
                                    {["RELEASED", "REJECTED"].includes(transaction.status) && (
                                        <div className="h-16 px-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-dashed border-slate-200 dark:border-white/10">
                                            <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.3em]">Transaction Locked • Entry Official</p>
                                        </div>
                                    )}
                                </div>

                                {/* Common Reject Button */}
                                {!["RELEASED", "REJECTED"].includes(transaction.status) && (
                                    <Button 
                                        onClick={() => setIsRejecting(true)}
                                        variant="outline"
                                        className="h-16 px-12 border-2 border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white font-black italic uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all w-full md:w-auto shadow-sm"
                                    >
                                        Reject Transaction
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-red-50 dark:bg-red-950/20 p-10 rounded-[2rem] border border-red-100 dark:border-red-900/50 space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <h4 className="text-sm font-black text-red-600 uppercase italic tracking-widest">Provide Rejection Remarks</h4>
                                    </div>
                                    <Textarea 
                                        ref={remarksRef}
                                        placeholder="Type the official reason for rejection here... This will be sent to the resident."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="min-h-[120px] rounded-2xl border-red-200 dark:border-white/10 dark:bg-white/5 italic font-medium p-6 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <Button 
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="flex-1 h-16 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95"
                                    >
                                        {loading ? "Processing..." : "Confirm Final Rejection"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsRejecting(false)}
                                        className="h-16 px-12 font-black italic uppercase tracking-widest rounded-2xl border-2"
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DialogContent>
        </Dialog>
    );
}
