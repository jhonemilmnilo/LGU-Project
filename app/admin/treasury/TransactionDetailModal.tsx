"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    User, MapPin, Calculator, CreditCard, CheckCircle2, 
    FileText, ExternalLink,
    AlertCircle, Printer
} from "lucide-react";
import { toast } from "sonner";
import { 
    evaluateCedulaTransaction, 
    confirmTransactionPayment, 
    releaseCedula,
    rejectTransaction 
} from "@/app/admin/transactions/actions";

interface TransactionDetailModalProps {
    transaction: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose, onRefresh }: TransactionDetailModalProps) {
    const [loading, setLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [ctcNumber, setCtcNumber] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    if (!transaction) return null;

    const resident = transaction.residentSnapshot || {};
    const additional = transaction.additionalData || {};
    const isCedula = transaction.type?.code?.startsWith("CEDULA");

    const handleEvaluate = async () => {
        setLoading(true);
        try {
            const res = await evaluateCedulaTransaction(transaction.id, remarks);
            if (res.success) {
                toast.success("Transaction evaluated successfully!");
                onRefresh();
            } else {
                toast.error(res.error || "Evaluation failed");
            }
        } catch {
            toast.error("An error occurred during evaluation");
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
        if (!ctcNumber) {
            toast.error("Please enter the CTC Serial Number");
            return;
        }
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "FOR_REQUESTING": return <Badge className="bg-amber-500 italic uppercase">Pending Evaluation</Badge>;
            case "EVALUATED": return <Badge className="bg-blue-500 italic uppercase">Pending Payment</Badge>;
            case "PAID": return <Badge className="bg-emerald-500 italic uppercase">Ready for Release</Badge>;
            case "RELEASED": return <Badge className="bg-slate-900 italic uppercase">Completed</Badge>;
            case "REJECTED": return <Badge variant="destructive" className="italic uppercase">Rejected</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar border-none shadow-2xl p-0 bg-white dark:bg-slate-950 rounded-[2.5rem]">
                <div className="p-8 space-y-8">
                    {/* Header Side */}
                    <DialogHeader className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Transaction <span className="text-primary tracking-normal">#{transaction.id.slice(-6)}</span></DialogTitle>
                                {getStatusBadge(transaction.status)}
                            </div>
                            <p className="text-sm text-slate-500 font-medium italic">Applied on {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Service Type</span>
                            <span className="text-sm font-bold uppercase italic text-slate-900 dark:text-white px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full">{transaction.type?.name}</span>
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Identity & Financials */}
                        <div className="space-y-8">
                            {/* Resident Info Card */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <User className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Applicant Identity</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase italic">Full Name</Label>
                                            <p className="text-sm font-bold uppercase italic">{resident.firstName} {resident.middleName} {resident.lastName} {resident.suffix}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase italic">Civil Status</Label>
                                            <p className="text-sm font-bold uppercase italic">{resident.civilStatus}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase italic">Full Address</Label>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-1 shrink-0" />
                                            <p className="text-sm font-medium italic text-slate-600 dark:text-slate-400">
                                                {resident.houseNumber} {resident.street}, {resident.barangay}, Agno, Pangasinan
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase italic">Citizenship</Label>
                                            <p className="text-sm font-bold uppercase italic">{resident.citizenship}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase italic">Contact</Label>
                                            <p className="text-xs font-bold font-mono tracking-widest">{resident.contactNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Declaration (Only for Cedula) */}
                            {isCedula && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Calculator className="w-5 h-5" />
                                        <h3 className="text-xs font-black uppercase tracking-widest italic">Financial Declaration</h3>
                                    </div>
                                    <div className="bg-slate-900 dark:bg-black rounded-[2rem] p-6 text-white space-y-6 shadow-xl overflow-hidden relative">
                                        <div className="grid grid-cols-2 gap-6 relative z-10">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black text-primary uppercase italic tracking-widest">Annual Gross Income</Label>
                                                <p className="text-xl font-black italic italic">₱{Number(additional.income || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-black text-primary uppercase italic tracking-widest">Real Property AV</Label>
                                                <p className="text-xl font-black italic italic">₱{Number(additional.propertyValue || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {transaction.totalAmount > 0 && (
                                            <div className="pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
                                                <span className="text-[10px] font-black uppercase text-slate-400 italic">Total Computed Amount</span>
                                                <span className="text-3xl font-black italic italic text-primary tracking-tighter">₱{transaction.totalAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <Calculator className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 rotate-12" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Documents & Status */}
                        <div className="space-y-8">
                            {/* Attachments Card */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <FileText className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Verified Attachments</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {additional.validIdUrl ? (
                                        <a 
                                            href={additional.validIdUrl} 
                                            target="_blank" 
                                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group transition-colors hover:border-primary/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase italic italic text-slate-700 dark:text-slate-300">Valid Government ID</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                        </a>
                                    ) : (
                                        <div className="p-4 rounded-2xl border border-dashed text-center text-slate-400 text-[10px] font-black uppercase italic italic">No ID Attached</div>
                                    )}

                                    {additional.proofOfIncomeUrl ? (
                                        <a 
                                            href={additional.proofOfIncomeUrl} 
                                            target="_blank" 
                                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 group transition-colors hover:border-primary/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase italic italic text-slate-700 dark:text-slate-300">Proof of Income / 2316</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                        </a>
                                    ) : (
                                        <div className="p-4 rounded-2xl border border-dashed text-center text-slate-400 text-[10px] font-black uppercase italic italic">No Proof Attached</div>
                                    )}
                                </div>
                            </div>

                            {/* Logistics Card */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <CreditCard className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Logistics & Payment</h3>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-slate-400 italic">Method</span>
                                        <Badge variant="outline" className="italic font-bold uppercase">{transaction.fulfillmentType}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-slate-400 italic">Payment</span>
                                        <Badge variant="outline" className="italic font-bold uppercase">{transaction.paymentType?.replace("_", " ")}</Badge>
                                    </div>
                                    {transaction.fulfillmentType === "DELIVERY" && (
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black text-slate-400 uppercase italic">Delivery Address</Label>
                                            <p className="text-xs font-semibold italic text-primary">
                                                {(() => {
                                                    const addr = transaction.deliveryAddress;
                                                    if (!addr) return "No address specified";
                                                    if (typeof addr === "string") return addr;
                                                    return `${addr.houseNumber || ""} ${addr.street || ""}, ${addr.sitio ? `Sitio ${addr.sitio}, ` : ""}${addr.purok ? `Purok ${addr.purok}, ` : ""}${addr.barangay}, ${addr.municipality}, ${addr.province}`.trim().replace(/^,/, "").replace(/ ,/, " ");
                                                })()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Action Hub */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary">
                                    <AlertCircle className="w-5 h-5" />
                                    <h3 className="text-xs font-black uppercase tracking-widest italic">Treasury Actions</h3>
                        </div>

                        {!isRejecting ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Next Logical Action */}
                                {transaction.status === "FOR_REQUESTING" && (
                                    <Button 
                                        onClick={handleEvaluate}
                                        disabled={loading}
                                        className="h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] shadow-xl hover:shadow-primary/20 transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <Calculator className="animate-spin" /> : "Evaluate & Compute Tax"}
                                    </Button>
                                )}

                                {transaction.status === "EVALUATED" && (
                                    <Button 
                                        onClick={handleConfirmPayment}
                                        disabled={loading}
                                        className="h-16 rounded-2xl bg-emerald-600 text-white font-black italic uppercase tracking-[0.2em] shadow-xl hover:shadow-emerald/20 transition-all active:scale-[0.98]"
                                    >
                                        {loading ? <CreditCard className="animate-spin" /> : "Confirm Official Payment"}
                                    </Button>
                                )}

                                {transaction.status === "PAID" && (
                                    <div className="border-2 border-primary/20 rounded-[2rem] p-6 space-y-4">
                                        <div className="space-y-1.5 text-center">
                                            <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic">Input CTC Serial Number</Label>
                                            <Input 
                                                value={ctcNumber}
                                                onChange={(e) => setCtcNumber(e.target.value)}
                                                placeholder="e.g. 09182374"
                                                className="h-12 rounded-xl text-center text-xl font-black italic italic tracking-[0.3em] border-primary/20 focus:ring-primary"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleRelease}
                                            disabled={loading}
                                            className="w-full h-14 rounded-xl bg-orange-600 text-white font-black italic uppercase tracking-[0.1em] shadow-lg active:scale-[0.98]"
                                        >
                                            {loading ? <CheckCircle2 className="animate-spin" /> : "Issue & Release Cedula"}
                                        </Button>
                                    </div>
                                )}

                                {/* Rejected/Released View */}
                                {["RELEASED", "REJECTED"].includes(transaction.status) && (
                                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-dashed border-slate-300">
                                        <p className="text-[10px] font-black uppercase text-slate-500 italic">No Actions Available for {transaction.status} status</p>
                                    </div>
                                )}

                                {/* Always show Reject and Remarks */}
                                <div className="space-y-4">
                                    <Textarea 
                                        placeholder="Add internal remarks or rejection reason..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="min-h-[100px] rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 italic font-medium"
                                    />
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setIsRejecting(true)}
                                        className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-black italic uppercase tracking-widest text-[10px]"
                                    >
                                        Reject Transaction
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-[2rem] border border-red-100 dark:border-red-950/50 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <h4 className="text-sm font-black text-red-600 uppercase italic tracking-widest">Confirm Rejection</h4>
                                <p className="text-xs text-red-500 italic leading-relaxed">By rejecting this transaction, the applicant will be notified including the remarks provided above. This action is recorded.</p>
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase"
                                    >
                                        {loading ? "Rejecting..." : "Yes, Reject Transaction"}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setIsRejecting(false)}
                                        className="flex-1 font-black italic uppercase"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Final Status Info */}
                    {transaction.status === "RELEASED" && transaction.cedula && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500 p-3 rounded-[1.25rem] text-white">
                                    <Printer className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-emerald-600 italic">Issued Successfully</p>
                                    <p className="text-sm font-bold italic tracking-widest text-emerald-900 dark:text-emerald-400">CTC SN: {transaction.cedula.ctcNumber}</p>
                                </div>
                            </div>
                            <Button className="bg-emerald-600 text-white font-black italic uppercase tracking-widest rounded-xl">Print Preview</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
