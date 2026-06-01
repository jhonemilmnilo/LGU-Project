"use client";

import React, { useState, useRef, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Image from "next/image";
import { isValidUrl } from "@/utils/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    FileText,
    ArrowLeft,
    Upload,
    Camera,
    Hash,
    ChevronDown,
    ChevronUp,
    Copy
} from "lucide-react";
import { toast } from "sonner";
import {
    getTransactionById,
    evaluateCedulaTransaction,
    releaseCedula,
    rejectTransaction,
    sendForRevision,
    uploadECopyAction,
    resolveDispute,
    getSystemSettingAction
} from "@/app/admin/transactions/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DocumentViewerModal from "@/components/shared/DocumentViewerModal";
import ResidentIdentityProfile from "../../treasury/[id]/components/ResidentIdentityProfile";
import TransactionInfoCard from "../../treasury/[id]/components/TransactionInfoCard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PageProps {
    params: Promise<{ id: string }>;
}



export default function BploDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();


    const [transaction, setTransaction] = useState<any>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerTitle, setViewerTitle] = useState("");
    const [viewerFile, setViewerFile] = useState<File | null>(null);

    const safeFormatDate = (dateStr: any) => {
        if (!dateStr) return "—";
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return "—";
            return format(d, "MMMM d, yyyy");
        } catch {
            return "—";
        }
    };
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const remarksRef = useRef<HTMLTextAreaElement>(null);
    const [permitNumberInput, setPermitNumberInput] = useState("");
    const [stickerNumber, setStickerNumber] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRequestingRevision, setIsRequestingRevision] = useState(false);
    const [eCopyFile, setECopyFile] = useState<File | null>(null);
    const [isResolvingDispute, setIsResolvingDispute] = useState(false);
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [disputeAction, setDisputeAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');

    const [themeColor, setThemeColor] = useState<string>("#2563eb");
    const [isBusinessRecordExpanded, setIsBusinessRecordExpanded] = useState(true);
    const [isRequirementsExpanded, setIsRequirementsExpanded] = useState(true);
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);
    const [feeItems, setFeeItems] = useState<{ label: string; amount: string }[]>([]);

    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTransactionById(id);
            if (res.success && res.data) {
                setTransaction(res.data);
                if (res.data.businessPermit?.permitNumber) {
                    setPermitNumberInput(res.data.businessPermit.permitNumber);
                }
                // Initialize editable fee items from fiscalSnapshot.lineItems first,
                // then fall back to transaction type defaultFees.
                const rawFiscal = res.data.fiscalSnapshot;
                const snap = (typeof rawFiscal === "string" ? JSON.parse(rawFiscal) : rawFiscal) as any || {};
                const existingItems: any[] = snap.lineItems || [];
                const defaults: any[] = res.data.type?.defaultFees || [];
                const initFees = existingItems.length > 0
                    ? existingItems.map((i: any) => ({ label: i.label, amount: String(i.amount ?? "") }))
                    : defaults.length > 0
                        ? defaults.map((f: any) => ({ label: f.label, amount: String(f.amount ?? "") }))
                        : [{ label: "Mayor's Permit Fee", amount: "" }];
                setFeeItems(initFees);
            } else {
                toast.error(res.error || "Failed to load transaction details.");
            }
        } catch {
            toast.error("Failed to load transaction.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTransaction();
        getSystemSettingAction("theme_color", "#2563eb").then(res => {
            if (res.success && res.data) {
                setThemeColor(res.data);
            }
        });
    }, [fetchTransaction]);

    const handleEvaluate = async () => {
        setActionLoading(true);
        try {
            const deliveryFee = transaction.fulfillmentType === "DELIVERY" ? (transaction.type.deliveryFee || 0) : 0;

            // Send only valid positive line items. If none exist, the server computes
            // the business permit assessment from the declared capital/gross sales.
            const itemsToSend = feeItems
                .filter(f => f.label.trim() && Number(f.amount) > 0)
                .map(f => ({ label: f.label.trim(), amount: Number(f.amount) || 0 }));

            const res = await evaluateCedulaTransaction(
                transaction.id,
                deliveryFee,
                remarks || "Business Permit Assessment",
                itemsToSend.length > 0 ? itemsToSend : undefined
            );
            if (res.success) {
                toast.success("Assessment details updated and submitted successfully!");
                router.push("/admin/bplo");
            } else {
                toast.error(res.error || "Evaluation failed.");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!remarks) { toast.error("Remarks required"); return; }
        setActionLoading(true);
        try {
            const res = await rejectTransaction(transaction.id, remarks);
            if (res.success) {
                toast.success("Permit request successfully declined.");
                router.push("/admin/bplo");
            } else toast.error(res.error || "Decline failed.");
        } finally { setActionLoading(false); }
    };

    const handleRequestRevision = async () => {
        if (!remarks) { toast.error("Remarks required"); return; }
        setActionLoading(true);
        try {
            const res = await sendForRevision(transaction.id, remarks);
            if (res.success) {
                toast.success("Permit application returned to citizen for revisions.");
                router.push("/admin/bplo");
            } else toast.error(res.error || "Revision request failed.");
        } finally { setActionLoading(false); }
    };

    const handleRelease = useCallback(async () => {
        const isNewPermit = (transaction?.additionalData as any)?.businessType === "NEW";
        if (isNewPermit && !permitNumberInput) {
            toast.error("Permit Number is required for brand new permits.");
            return;
        }

        setActionLoading(true);
        try {
            let eCopyUrl = transaction.eCopyUrl || "";
            if (eCopyFile) {
                const formData = new FormData();
                formData.append("file", eCopyFile);
                const uploadRes = await uploadECopyAction(formData);
                if (uploadRes.success) eCopyUrl = uploadRes.data as string;
                else { toast.error("E-Permit upload failed"); setActionLoading(false); return; }
            }

            const res = await releaseCedula(transaction.id, permitNumberInput, eCopyUrl, "", stickerNumber);
            if (res.success) {
                toast.success("Business Permit updated and released successfully!");
                setECopyFile(null);
                setStickerNumber("");
                router.push("/admin/bplo");
            } else toast.error(res.error || "Failed to release permit.");
        } finally { setActionLoading(false); }
    }, [transaction, permitNumberInput, eCopyFile, stickerNumber, router]);

    const handleResolveDispute = async () => {
        if (!remarks) { toast.error("Remarks required for resolution"); return; }
        setIsResolvingDispute(true);
        try {
            const res = await resolveDispute(transaction.id, disputeAction, remarks);
            if (res.success) {
                toast.success(`Dispute ${disputeAction === 'APPROVE' ? 'Approved' : 'Rejected'}`);
                setDisputeModalOpen(false);
                fetchTransaction();
            } else {
                toast.error(res.error || "Resolution failed");
            }
        } finally {
            setIsResolvingDispute(false);
        }
    };

    useEffect(() => {
        if (isRejecting || isRequestingRevision) {
            remarksRef.current?.focus();
        }
    }, [isRejecting, isRequestingRevision]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!transaction) return <div className="p-20 text-center dark:text-white">Transaction details unavailable.</div>;

    const additional = transaction.additionalData || {};
    const resident = transaction.user?.residentProfile || transaction.residentSnapshot || {};
    const isRenewal = additional.businessType === "RENEWAL" || additional.businessType === "RENEW";

    const evidenceDocs = [
        { url: additional.ownerIdUrl, label: "Owner's Valid ID" },
        { url: additional.ctcUrl, label: "Cedula (CTC) Copy" },
        { url: additional.dtiSecUrl, label: "DTI / SEC Registry" },
        { url: additional.brgyClearanceUrl, label: "Barangay Clearance" },
        { url: additional.locationPhotoUrl, label: "Location Photo" },
        { url: additional.sanitaryPermitUrl, label: "Sanitary Permit" },
        { url: additional.fireSafetyUrl, label: "Fire Safety Certificate" },
        { url: additional.birCorUrl, label: "BIR Certificate (COR)" },
        { url: additional.previousPermitUrl, label: "Previous Business Permit" }
    ].filter(doc => doc.url);

    const baseSteps = [
        { id: "FOR_INSPECTION", label: "INSPECTION" },
        { id: "FOR_REQUESTING", label: "EVALUATION" },
        { id: "EVALUATED", label: "ASSESSMENT" },
        { id: "PAID", label: "PAID" },
        { id: "FOR_REINSPECTION", label: "RE-INSPECTION" },
        { id: "FOR_PROCESSING", label: "PROCESSING" },
        {
            id: transaction.fulfillmentType === "DELIVERY" ? "FOR_PICKING" : "FOR_CLAIM",
            label: transaction.fulfillmentType === "DELIVERY" ? "FOR PICKING" : "CLAIMING"
        },
        {
            id: transaction.fulfillmentType === "DELIVERY" ? "DELIVERED" : "RELEASED",
            label: transaction.fulfillmentType === "DELIVERY" ? "DELIVERED" : "RELEASED"
        }
    ];

    let steps = [...baseSteps];
    const status = transaction.status as string;

    if (status === "REJECTED") {
        steps = [
            { id: "FOR_REQUESTING", label: "EVALUATION" },
            { id: "REJECTED", label: "REJECTED" }
        ];
    } else if (status === "FOR_REVISION") {
        steps = [
            { id: "FOR_REQUESTING", label: "EVALUATION" },
            { id: "FOR_REVISION", label: "REVISION REQ." }
        ];
    } else if (status.includes("RETURN") || status.includes("REFUND") || status === "DISPUTE_REJECTED") {
        const disputeLabel = status === "DISPUTE_REJECTED" ? "RETURN REJECTED" : status.replace(/_/g, " ");
        steps.push({ id: status, label: disputeLabel });
    }

    steps = steps.filter(step => {
        if (step.id === "FOR_PROCESSING" &&
            transaction.fulfillmentType === "DELIVERY" &&
            ["E_PAYMENT", "BANK_TRANSFER"].includes(transaction.paymentType)) {
            return false;
        }
        if (step.id === "PAID" &&
            transaction.fulfillmentType === "PICK_UP" &&
            transaction.paymentType === "CASH") {
            return false;
        }
        return true;
    });

    const currentStepIdx = steps.findIndex(s => s.id === transaction.status);
    const hasDispute = !!(transaction.status?.includes("RETURN") || transaction.status?.includes("REFUND") || transaction.status === "DISPUTE_REJECTED");

    return (
        <div
            className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] text-[#0f172a] dark:text-[#f8fafc] pb-20 font-sans transition-colors duration-500"
            style={{ "--theme_color": themeColor, "--primary-theme": themeColor } as React.CSSProperties}
        >
            {/* Minimal Header */}
            <header className="h-16 px-8 flex items-center justify-between border-b border-transparent dark:border-white/5">
                <Link href="/admin/bplo">
                    <Button variant="ghost" className="gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-primary">
                        <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
                    </Button>
                </Link>
                <Badge variant="outline" className="font-black italic uppercase tracking-widest text-[10px] border-primary/20 text-primary bg-primary/5 px-4 py-1">
                    Type Of Request: {transaction.fulfillmentType?.replace("_", " ") || "Processing"}
                </Badge>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 grid grid-cols-12 gap-8 mt-4">
                {/* LEFT COLUMN: Identity & Business Details */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* TRANSACTION INFORMATION CARD */}
                    <TransactionInfoCard
                        transactionName={transaction.type?.requiresBusinessName
                            ? (transaction.businessName || additional?.businessName || "UNNAMED ENTITY")
                            : `${resident?.firstName || ''} ${resident?.lastName || ''}`}
                        themeColor={themeColor}
                        categoryLabel={transaction.type?.name || "Business Permit"}
                    />

                    {/* METRICS + BREAKDOWN CARD */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                        {/* TOP METRICS — 4-col white/grey grid */}
                        {(() => {
                            const declaredValue = Number(additional?.grossSales || additional?.capitalInvestment || 0);
                            const declaredLabel = additional?.businessType === "NEW" ? "CAPITAL" : "DECLARED GROSS";
                            const paymentType = transaction.paymentType?.replace(/_/g, " ") || "—";
                            const fulfillment = transaction.fulfillmentType?.replace(/_/g, " ") || "—";
                            const rawFiscal = transaction.fiscalSnapshot;
                            const fiscalSnapshot = (typeof rawFiscal === "string" ? JSON.parse(rawFiscal) : rawFiscal) as any || {};

                            // Use transaction.totalAmount as the authoritative total — it is always
                            // written by evaluateCedulaTransaction regardless of fiscalSnapshot state.
                            const totalAmountAssessed =
                                Number(transaction.totalAmount) ||
                                Number(fiscalSnapshot.totalAmount) ||
                                (Array.isArray(transaction.type?.defaultFees)
                                    ? transaction.type.defaultFees.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0)
                                    : 0);
                            return (
                                <div className="grid grid-cols-4 gap-3">
                                    {/* Declared */}
                                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 flex flex-col justify-between min-h-[100px]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{declaredLabel}</span>
                                        <p className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white mt-2">
                                            ₱{declaredValue.toLocaleString()}
                                        </p>
                                    </div>
                                    {/* Payment Mode */}
                                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 flex flex-col justify-between min-h-[100px]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">PAYMENT MODE</span>
                                        <p className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase mt-2">
                                            {paymentType === "—" ? <span className="w-6 h-1.5 bg-slate-400 rounded-sm inline-block" /> : paymentType}
                                        </p>
                                    </div>
                                    {/* Fulfillment */}
                                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 flex flex-col justify-between min-h-[100px]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">FULFILLMENT</span>
                                        <p className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase mt-2">
                                            {fulfillment === "—" ? <span className="w-6 h-1.5 bg-slate-400 rounded-sm inline-block" /> : fulfillment}
                                        </p>
                                    </div>
                                    {/* Total Assessment */}
                                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/10 flex flex-col justify-between min-h-[100px]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">TOTAL ASSESSED</span>
                                        <p className="text-xl font-black italic tracking-tighter text-emerald-500 mt-2">
                                            ₱{totalAmountAssessed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* FEE ASSESSMENT BREAKDOWN — Accordion */}
                        <div className="border-t border-slate-100 dark:border-white/5 pt-6">
                            <button
                                type="button"
                                onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                                className="flex items-center justify-between w-full text-left focus:outline-none group"
                            >
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                        Permit <span className="text-primary">Assessment Breakdown</span>
                                    </h2>
                                    <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-1">
                                        Approved and Assessed Fees
                                    </p>
                                </div>
                                <div className="text-slate-400 group-hover:text-primary transition-colors">
                                    <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-primary/40 transition-all">
                                        {isBreakdownExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </div>
                            </button>

                            {isBreakdownExpanded && (() => {
                                const rawFiscal = transaction.fiscalSnapshot;
                                const fiscalSnapshot = (typeof rawFiscal === "string" ? JSON.parse(rawFiscal) : rawFiscal) as any || {};
                                const lineItems: any[] = fiscalSnapshot.lineItems || [];
                                const defaultFees: any[] = transaction.type?.defaultFees || [];
                                const positiveLineItems = lineItems.filter((i: any) => Number(i.amount) > 0);
                                const positiveDefaultFees = defaultFees.filter((f: any) => Number(f.amount) > 0);
                                const computedItems = [
                                    { label: "Mayor's Permit Fee", amount: Number(fiscalSnapshot.basicTax) || 0 },
                                    { label: "Business Tax", amount: Number(fiscalSnapshot.additionalTax) || 0 }
                                ].filter(item => item.amount > 0);

                                // Authoritative total: prefer transaction.totalAmount (always written by server),
                                // then fiscalSnapshot.totalAmount, then sum of line items / defaultFees.
                                const authTotal =
                                    Number(transaction.totalAmount) ||
                                    Number(fiscalSnapshot.totalAmount) ||
                                    (positiveLineItems.length > 0
                                        ? positiveLineItems.reduce((a: number, i: any) => a + (Number(i.amount) || 0), 0)
                                        : (computedItems.length > 0
                                            ? computedItems.reduce((a: number, item: any) => a + item.amount, 0)
                                            : positiveDefaultFees.reduce((a: number, f: any) => a + (Number(f.amount) || 0), 0)));

                                // Determine which set of line items to display
                                const displayItems: { label: string; amount: number }[] =
                                    positiveLineItems.length > 0
                                        ? positiveLineItems.map((i: any) => ({ label: i.label, amount: Number(i.amount) || 0 }))
                                        : computedItems.length > 0
                                            ? computedItems
                                            : positiveDefaultFees.map((f: any) => ({ label: f.label, amount: Number(f.amount) || 0 }));

                                return (
                                    <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {displayItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                <span>{item.label}</span>
                                                <span className="dark:text-slate-200">₱{item.amount.toFixed(2)}</span>
                                            </div>
                                        ))}

                                        {Number(fiscalSnapshot.deliveryFee) > 0 && (
                                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5 text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                <span>Delivery Fee</span>
                                                <span className="dark:text-slate-200">₱{Number(fiscalSnapshot.deliveryFee).toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/10 text-base font-black text-primary italic">
                                            <span>Total Amount Assessed</span>
                                            <span>₱{authTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* RESIDENT IDENTITY PROFILE */}
                    <ResidentIdentityProfile
                        resident={resident}
                        safeFormatDate={safeFormatDate}
                        themeColor={themeColor}
                    />

                    {/* BUSINESS RECORD ACCORDION */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 animate-in fade-in duration-300">
                        <button
                            type="button"
                            onClick={() => setIsBusinessRecordExpanded(!isBusinessRecordExpanded)}
                            className="flex items-center justify-between w-full text-left focus:outline-none group"
                        >
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    Business <span className="text-primary">Record</span>
                                </h2>
                                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                    BPLO Registration Details
                                </p>
                            </div>
                            <div className="text-slate-400 group-hover:text-primary transition-colors">
                                <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-primary/40 transition-all">
                                    {isBusinessRecordExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>
                        </button>

                        {isBusinessRecordExpanded && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Official Business Name</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-black text-sm text-primary uppercase truncate">
                                            {additional?.businessName || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Trade Signage Name</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                                            {additional?.tradeName || "Same as Business Name"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Organization Type</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 uppercase truncate">
                                            {additional?.orgType ? additional.orgType.replace(/_/g, " ") : "--"}
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Building / Unit</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                                            {additional?.building || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Street Address</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                                            {additional?.street || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Business Barangay</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 uppercase truncate">
                                            {additional?.businessBarangay || additional?.barangay || resident?.barangay || "--"}
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Line of Business</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                                            {additional?.lineOfBusiness || "General"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">
                                            {isRenewal ? "Existing Permit License" : "Registration / Permit No."}
                                        </label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-primary truncate">
                                            {transaction.businessPermit?.permitNumber || additional?.existingPermitNumber || additional?.permitNumber || additional?.dtiSecNumber || "--"}
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Employee Count</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {additional?.employeeCount ?? "0"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Store Area</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {additional?.businessArea ? `${additional.businessArea} sqm` : "0 sqm"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Capital / Declared Gross</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-black text-sm text-primary">
                                            ₱{Number(additional?.grossSales || additional?.capitalInvestment || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ALL REQUIREMENTS — Accordion */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border animate-in fade-in duration-300">
                        <button
                            type="button"
                            onClick={() => setIsRequirementsExpanded(!isRequirementsExpanded)}
                            className="flex items-center justify-between w-full text-left focus:outline-none group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="text-primary w-4 h-4" /></div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">All the Requirements</span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-600 italic font-bold">{evidenceDocs.length} document{evidenceDocs.length !== 1 ? 's' : ''} submitted</span>
                                </div>
                            </div>
                            <div className="text-slate-400 group-hover:text-primary transition-colors">
                                <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:border-primary/40 transition-all">
                                    {isRequirementsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </div>
                            </div>
                        </button>

                        {isRequirementsExpanded && (
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                {evidenceDocs.map((doc, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            if (doc.url) {
                                                setViewerUrl(doc.url);
                                                setViewerTitle(doc.label);
                                                setViewerOpen(true);
                                            }
                                        }}
                                        className="group relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 cursor-pointer hover:border-primary/50 transition-all select-none aspect-video text-left w-full block"
                                    >
                                        {doc.url ? (
                                            <>
                                                <Image src={isValidUrl(doc.url) ? doc.url : "/placeholder.png"} alt={doc.label} fill className="object-cover group-hover:scale-105 transition-all" />
                                                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white font-black italic uppercase tracking-wider text-[8px] truncate">
                                                    {doc.label}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <div
                                                        style={{ backgroundColor: themeColor }}
                                                        className="backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center justify-center text-white font-black italic uppercase tracking-widest text-[9px]"
                                                    >
                                                        <span>View</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-1.5 p-4">
                                                <Camera className="w-6 h-6 mx-auto" />
                                                <span className="text-[8px] font-black uppercase text-center tracking-widest leading-none block">{doc.label}</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Workflow Tracking & Executive Controls */}
                <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-16 self-start">
                    {/* WORKFLOW TRACKING */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2.5rem] p-10 border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 block italic leading-none">Status Tracking</span>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mt-1 leading-none">Timeline</h2>
                        </div>

                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-white/5 space-y-8">
                            {steps.map((step, idx) => {
                                const isCompleted = idx < currentStepIdx;
                                const isActive = idx === currentStepIdx;
                                return (
                                    <div key={idx} className="relative">
                                        <div className={cn(
                                            "absolute w-4 h-4 rounded-full -left-[33px] border-4 transition-all duration-500",
                                            isActive
                                                ? "bg-primary border-white dark:border-[#151b28] ring-4 ring-primary/20 scale-110"
                                                : isCompleted
                                                    ? "bg-emerald-500 border-white dark:border-[#151b28] scale-100"
                                                    : "bg-slate-200 dark:bg-slate-800 border-white dark:border-[#151b28] scale-95"
                                        )} />
                                        <div className="space-y-1">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                isActive
                                                    ? "text-primary"
                                                    : isCompleted
                                                        ? "text-emerald-500"
                                                        : "text-slate-400 dark:text-slate-600"
                                            )}>
                                                {step.label}
                                            </span>
                                            {isActive && (
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight italic">
                                                    Current processing status.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* END WORKFLOW TRACKING CARD */}

                    {/* PAYMENT PROOF CARD — separate card below status tracking */}
                    {transaction.paymentReference && (
                        <div className="bg-white dark:bg-[#151b28] rounded-[2.5rem] p-8 border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${themeColor}15` }}>
                                    <Camera className="w-4 h-4" style={{ color: themeColor }} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 block italic leading-none">Citizen Payment</span>
                                    <span className="text-sm font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Proof of Payment</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (transaction.paymentReference) {
                                        setViewerUrl(transaction.paymentReference);
                                        setViewerTitle("Proof of Payment");
                                        setViewerOpen(true);
                                    }
                                }}
                                className="relative aspect-[16/9] w-full rounded-2xl bg-slate-950 overflow-hidden border border-slate-100 dark:border-white/5 group hover:border-primary/50 transition-all text-left block cursor-zoom-in"
                            >
                                <Image
                                    src={isValidUrl(transaction.paymentReference) ? transaction.paymentReference : "/placeholder.png"}
                                    alt="Payment Proof"
                                    fill
                                    className="object-contain group-hover:scale-[1.02] transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-[2px]">
                                    <div
                                        style={{ backgroundColor: themeColor }}
                                        className="backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 flex items-center justify-center text-white font-black italic uppercase tracking-widest text-[9px]"
                                    >
                                        <span>View</span>
                                    </div>
                                </div>
                            </button>

                            {((transaction.additionalData as any)?.gcashReferenceNo) && (
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 mt-2 group/ref relative overflow-hidden transition-all hover:border-primary/20 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Hash className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">GCash Reference No.</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText((transaction.additionalData as any).gcashReferenceNo);
                                                toast.success("Reference number copied!");
                                            }}
                                            className="text-slate-400 hover:text-primary transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-sm font-black italic tracking-tighter text-slate-700 dark:text-slate-200 font-mono">
                                        {(transaction.additionalData as any).gcashReferenceNo}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EXECUTIVE ACTIONS */}
                    <div className="space-y-4 pt-4">
                        {isRejecting || isRequestingRevision ? (
                            <div className="bg-white dark:bg-[#151b28] p-8 rounded-[2.5rem] border border-slate-50 dark:border-white/5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Decision Rationale Remarks</Label>
                                <Textarea
                                    ref={remarksRef}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Explain decision detail..."
                                    className="min-h-[100px] rounded-2xl focus-visible:ring-primary border-slate-100 dark:border-white/10"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={isRejecting ? handleReject : handleRequestRevision}
                                        disabled={actionLoading}
                                        className={cn(
                                            "flex-1 h-11 text-white rounded-xl text-xs font-black uppercase italic tracking-wider",
                                            isRejecting ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600"
                                        )}
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setIsRejecting(false); setIsRequestingRevision(false); }}
                                        className="flex-1 h-11 rounded-xl text-xs font-bold"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Inspection phase actions */}
                                {(transaction.status === "FOR_INSPECTION" || transaction.status === "FOR_REINSPECTION") && (
                                    <div className="space-y-4">

                                        <Button
                                            onClick={handleEvaluate}
                                            disabled={actionLoading}
                                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg font-black uppercase text-xs tracking-wider"
                                        >
                                            Process The Request
                                        </Button>

                                        {transaction.status !== "FOR_REINSPECTION" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => { setIsRequestingRevision(true); setRemarks(""); }}
                                                    className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase"
                                                >
                                                    Request Revision
                                                </Button>
                                                <Button
                                                    onClick={() => { setIsRejecting(true); setRemarks(""); }}
                                                    className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase"
                                                >
                                                    Decline
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Process & Release phase actions */}
                                {["PAID", "FOR_CLAIM", "FOR_PICKING", "FOR_PROCESSING"].includes(transaction.status) && (
                                    <div className="space-y-4">
                                        {isRenewal ? (
                                            <div className="bg-emerald-50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300">
                                                <span className="font-bold">Renewal Auto-Carried:</span> Existing Permit Number <span className="font-mono font-black">#{additional.permitNumber || additional.existingPermitNumber || "—"}</span> carries over.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">License Business Permit Number</Label>
                                                <Input
                                                    value={permitNumberInput}
                                                    onChange={(e) => setPermitNumberInput(e.target.value)}
                                                    placeholder="Enter Permit Number..."
                                                    className="h-12 rounded-xl text-sm font-bold"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Digital Permit Upload (Optional)</Label>
                                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                                                <label className="cursor-pointer block space-y-2">
                                                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Select Digital PDF/Image</span>
                                                    <Input
                                                        type="file"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => setECopyFile(e.target.files?.[0] || null)}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {eCopyFile && <p className="text-[10px] font-mono text-emerald-500 mt-2">Selected: {eCopyFile.name}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sticker Number (Optional)</Label>
                                            <Input
                                                value={stickerNumber}
                                                onChange={(e) => setStickerNumber(e.target.value)}
                                                placeholder="Enter Sticker Number..."
                                                className="h-12 rounded-xl text-sm font-bold"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleRelease}
                                            disabled={actionLoading}
                                            className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg font-black uppercase text-xs tracking-wider"
                                        >
                                            Update & Release Permit
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Dispute Resolution Modal */}
            <Dialog open={disputeModalOpen} onOpenChange={setDisputeModalOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#0f1117] rounded-3xl border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black uppercase italic tracking-tight">
                            Resolve Dispute for Business Permit
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <Label className="text-xs font-black text-rose-500 uppercase">Resolution / Dispute Details</Label>
                        <Textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Provide resolution description..."
                            className="min-h-[100px] rounded-xl"
                        />
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleResolveDispute}
                                disabled={isResolvingDispute}
                                className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold"
                            >
                                Confirm Resolution
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={() => setDisputeModalOpen(false)}
                                className="flex-1 h-11 rounded-xl text-xs font-bold"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Document Viewer Modal for premium visual quality previews */}
            <DocumentViewerModal
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                file={null}
                fileUrl={viewerUrl}
                title={viewerTitle}
                themeColor={themeColor}
            />
        </div>
    );
}
