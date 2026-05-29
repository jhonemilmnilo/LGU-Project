"use client";

import React, { useState, useRef, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Image from "next/image";
import { isValidUrl } from "@/utils/image";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";
import {
    FileText,
    ArrowLeft,
    Upload,
    RotateCw,
    RefreshCcw,
    ZoomIn,
    ZoomOut,
    Plus,
    Camera,
    Check,
    Hash,
    Trash2,
    ChevronDown,
    ChevronUp
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface PageProps {
    params: Promise<{ id: string }>;
}

function LightboxView({ src, alt, label }: { src: string; alt: string; label: string }) {
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const reset = () => {
        setScale(1);
        setRotate(0);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex flex-col items-center justify-center gap-6 outline-none">
            <DialogHeader className="sr-only">
                <DialogTitle>{label}</DialogTitle>
            </DialogHeader>

            <div
                className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                >
                    <Image
                        src={isValidUrl(src) ? src : "/placeholder.png"}
                        alt={alt}
                        fill
                        className="object-contain"
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-1 pr-4 border-r border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic whitespace-nowrap">{label}</p>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 text-white" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}>
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="w-12 text-center text-[10px] font-black text-white/50 italic">{Math.round(scale * 100)}%</div>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 text-white" onClick={() => setScale(s => Math.min(s + 0.2, 5))}>
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>
                <div className="w-px h-4 bg-white/10 mx-2" />
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 text-white" onClick={() => setRotate(r => (r + 90) % 360)}>
                    <RotateCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/10 text-white" onClick={reset}>
                    <RefreshCcw className="w-4 h-4" />
                </Button>
            </div>
        </DialogContent>
    );
}

export default function BploDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();


    const [transaction, setTransaction] = useState<any>(null);
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
    const [isDossierExpanded, setIsDossierExpanded] = useState(false);
    const [isBusinessRecordExpanded, setIsBusinessRecordExpanded] = useState(false);

    const [feeLineItems, setFeeLineItems] = useState<{ label: string; amount: string }[]>([
        { label: "Mayor's Permit Fee", amount: "" }
    ]);

    const addFeeLineItem = () => {
        setFeeLineItems([...feeLineItems, { label: "", amount: "" }]);
    };

    const removeFeeLineItem = (index: number) => {
        const updated = [...feeLineItems];
        updated.splice(index, 1);
        setFeeLineItems(updated);
    };

    const updateFeeLineItem = (index: number, field: 'label' | 'amount', value: string) => {
        const updated = [...feeLineItems];
        updated[index][field] = value;
        setFeeLineItems(updated);
    };

    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTransactionById(id);
            if (res.success && res.data) {
                setTransaction(res.data);
                if (res.data.businessPermit?.permitNumber) {
                    setPermitNumberInput(res.data.businessPermit.permitNumber);
                }
                
                // Pre-populate feeLineItems with default fees structure if transaction is not yet evaluated
                const defaultFees = res.data.type?.defaultFees;
                if (Array.isArray(defaultFees) && defaultFees.length > 0 && (!res.data.fiscalSnapshot || Object.keys(res.data.fiscalSnapshot).length === 0)) {
                    const mappedFees = defaultFees.map((fee: any) => ({
                        label: fee.label,
                        amount: ""
                    }));
                    setFeeLineItems(mappedFees);
                }
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
        const validatedItems = feeLineItems.filter(item => item.label && item.amount);
        if (validatedItems.length === 0) {
            toast.error("Please provide at least one assessment fee item.");
            return;
        }
        setActionLoading(true);
        try {
            const deliveryFee = transaction.fulfillmentType === "DELIVERY" ? (transaction.type.deliveryFee || 0) : 0;
            const itemsToSend = validatedItems.map(item => ({
                label: item.label,
                amount: parseFloat(item.amount) || 0
            }));

            const res = await evaluateCedulaTransaction(transaction.id, deliveryFee, remarks || "Business Permit Assessment", itemsToSend);
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
        { id: "FOR_PROCESSING", label: "PROCESSING" },
        { id: "FOR_REINSPECTION", label: "PROCESS" },
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
    const hasVerification = !!((transaction.paymentType === "E_PAYMENT" || transaction.paymentType === "BANK_TRANSFER") || (transaction.status === "DELIVERED" && transaction.podUrl));
    const hasDispute = !!(transaction.status?.includes("RETURN") || transaction.status?.includes("REFUND") || transaction.status === "DISPUTE_REJECTED");
    const isRequirementsAlone = !hasVerification && !hasDispute;

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
                    {/* REGISTERED BUSINESS NAME CARD */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-4 animate-in fade-in duration-300">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                                    {transaction.type?.requiresBusinessName
                                        ? "Registered Business Name"
                                        : "Primary Applicant Profile"}
                                </span>
                                {transaction.revisionCount > 0 ? (
                                    <Badge className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border border-orange-500/20 text-[9px] font-black italic uppercase tracking-widest px-3 py-0.5 rounded-full">
                                        Revision Count: {transaction.revisionCount}
                                    </Badge>
                                ) : (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black italic uppercase tracking-widest px-3 py-0.5 rounded-full">
                                        First Submission
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    {transaction.type?.requiresBusinessName
                                        ? (transaction.businessName || additional?.businessName || "UNNAMED ENTITY")
                                        : `${resident?.firstName || ''} ${resident?.lastName || ''}`}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* ASSESSMENT CARD CONTAINER (Unifying Declared Gross, Payment Mode, Total Assessment & Fee Breakdown) */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-12 animate-in fade-in duration-300">
                        {/* TOP METRICS GRID (Rendered beautifully inside the unified card) */}
                        {(() => {
                            const declaredValue = Number(additional?.grossSales || additional?.capitalInvestment || 0);
                            const declaredLabel = additional?.businessType === "NEW" ? "CAPITAL INVESTMENT" : "DECLARED GROSS";
                            const declaredSubLabel = additional?.businessType === "NEW" ? "CAPITAL" : "SALES";
                            const paymentType = transaction.paymentType?.replace(/_/g, " ") || "—";
                            
                            let totalAmountAssessed = 0;
                            if (transaction.status === "FOR_INSPECTION" || transaction.status === "FOR_REINSPECTION") {
                                totalAmountAssessed = feeLineItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                            } else {
                                const fiscalSnapshot = transaction.fiscalSnapshot as any || {};
                                totalAmountAssessed = Number(fiscalSnapshot.totalAmount) || 0;
                            }

                            return (
                                <div className="grid grid-cols-3 gap-6">
                                    {/* Card 1 */}
                                    <div className="bg-[#1e2533] p-8 rounded-[2rem] border border-slate-700/30 space-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.15)] flex flex-col justify-between min-h-[140px]">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#6f7f98]">{declaredLabel}</span>
                                            <div className="text-[11px] font-black uppercase text-slate-400 mt-0.5">{declaredSubLabel}</div>
                                        </div>
                                        <p className="text-3xl font-black italic tracking-tighter text-white mt-4">
                                            ₱{declaredValue.toLocaleString()}
                                        </p>
                                    </div>
                                    {/* Card 2 */}
                                    <div className="bg-[#1e2533] p-8 rounded-[2rem] border border-slate-700/30 space-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.15)] flex flex-col justify-between min-h-[140px]">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#6f7f98]">PAYMENT MODE</span>
                                        </div>
                                        <div className="mt-4">
                                            {paymentType === "—" ? (
                                                <div className="w-8 h-2.5 bg-slate-300/80 rounded-sm"></div>
                                            ) : (
                                                <p className="text-2xl font-black italic tracking-tighter text-white uppercase">{paymentType}</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Card 3 */}
                                    <div className="bg-[#1e2533] p-8 rounded-[2rem] border border-slate-700/30 space-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.15)] flex flex-col justify-between min-h-[140px]">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/90">TOTAL ASSESSMENT</span>
                                        </div>
                                        <p className="text-3xl font-black italic tracking-tighter text-[#10b981] mt-4">
                                            ₱{totalAmountAssessed.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Divider */}
                        <div className="border-t border-slate-100 dark:border-white/5 w-full"></div>

                        {/* FEE ASSESSMENT BREAKDOWN SECTION */}
                        {(transaction.status === "FOR_INSPECTION" || transaction.status === "FOR_REINSPECTION") ? (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                        Permit <span className="text-primary">Assessment</span>
                                    </h2>
                                    <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                        Add Assessment Line Items
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Fee Assessment Breakdown
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-3">
                                        {feeLineItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 items-center group bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 px-3 py-1.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                                <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 w-6 h-6 flex items-center justify-center rounded-lg select-none shrink-0">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </span>
                                                <input
                                                    type="text"
                                                    placeholder="Fee Description"
                                                    value={item.label}
                                                    onChange={(e) => updateFeeLineItem(idx, 'label', e.target.value)}
                                                    className="flex-1 h-9 bg-transparent text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0"
                                                />
                                                <div className="relative w-28 shrink-0 flex items-center border-l border-slate-100 dark:border-white/5 pl-3">
                                                    <span className="text-xs font-black text-slate-400 mr-1 select-none">₱</span>
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={item.amount}
                                                        onChange={(e) => updateFeeLineItem(idx, 'amount', e.target.value)}
                                                        className="w-full bg-transparent text-sm font-black text-right text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>
                                                {feeLineItems.length > 1 ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeFeeLineItem(idx)}
                                                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                ) : (
                                                    <div className="w-8 h-8 shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={addFeeLineItem}
                                            className="h-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 font-black italic text-[10px] tracking-widest gap-2 text-slate-400 hover:text-primary hover:border-primary/50 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all w-full mt-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> ADD FEE LINE ITEM
                                        </Button>
                                    </div>

                                    {(() => {
                                        const totalAmountAssessed = feeLineItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                                        return (
                                            <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-white/5 mt-6">
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 italic">Total Amount Due</span>
                                                <span className="text-3xl font-black text-emerald-500 italic">₱{totalAmountAssessed.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ) : (
                            (() => {
                                const fiscalSnapshot = transaction.fiscalSnapshot as any || {};
                                const lineItems = fiscalSnapshot.lineItems || [];
                                if (fiscalSnapshot.totalAmount === undefined) return null;
                                return (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <div>
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                                Permit <span className="text-primary">Assessment Breakdown</span>
                                            </h2>
                                            <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                                Approved and Assessed Fees
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            {lineItems.length > 0 ? (
                                                lineItems.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                        <span>{item.label}</span>
                                                        <span className="dark:text-slate-200">₱{(Number(item.amount) || 0).toFixed(2)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                    <span>Mayors Permit Fee</span>
                                                    <span className="dark:text-slate-200">₱{(Number(fiscalSnapshot.basicTax) || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            {fiscalSnapshot.deliveryFee > 0 && (
                                                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5 text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                    <span>Delivery Fee</span>
                                                    <span className="dark:text-slate-200">₱{(Number(fiscalSnapshot.deliveryFee) || 0).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-white/10 text-base font-black text-primary italic">
                                                <span>Total Amount Assessed</span>
                                                <span>₱{(Number(fiscalSnapshot.totalAmount) || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    {/* RESIDENT IDENTITY PROFILE ACCORDION */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 animate-in fade-in duration-300">
                        <button
                            type="button"
                            onClick={() => setIsDossierExpanded(!isDossierExpanded)}
                            className="flex items-center justify-between w-full text-left focus:outline-none"
                        >
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    Resident <span className="text-primary">Identity Profile</span>
                                </h2>
                                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                    Verified Citizen Data Dossier
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                                {isDossierExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </button>

                        {isDossierExpanded && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                                {/* Citizen Profile Grid */}
                                <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                                    <div className="col-span-12 md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">First Name</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.firstName || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Middle Name</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.middleName || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Last Name</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.lastName || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Suffix</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.suffix || "--"}
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Birth Date</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.dateOfBirth ? format(new Date(resident.dateOfBirth), "MMM d, yyyy") : "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-2 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Age</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.age ?? (resident?.dateOfBirth ? differenceInYears(new Date(), new Date(resident.dateOfBirth)) : "--")}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Civil Status</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 uppercase">
                                            {resident?.civilStatus || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-4 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Contact Number</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.contactNumber || "--"}
                                        </div>
                                    </div>

                                    <div className="col-span-12 md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Occupation</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                            {resident?.occupation || "--"}
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Barangay & Complete Address</label>
                                        <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                                            {resident?.houseNumber || ""} {resident?.street || ""} {resident?.barangay ? `${resident.barangay}, Mapandan, Pangasinan` : "--"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BUSINESS RECORD ACCORDION */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 animate-in fade-in duration-300">
                        <button
                            type="button"
                            onClick={() => setIsBusinessRecordExpanded(!isBusinessRecordExpanded)}
                            className="flex items-center justify-between w-full text-left focus:outline-none"
                        >
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    Business <span className="text-primary">Record</span>
                                </h2>
                                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                    BPLO Registration Details
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                                {isBusinessRecordExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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

                    {/* IDENTITY & AUTHENTICATION (Evidence Vault) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className={cn(
                            "bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6 transition-all duration-500",
                            isRequirementsAlone ? "md:col-span-2" : ""
                        )}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg"><FileText className="text-primary w-4 h-4" /></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">All the Requirements</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {evidenceDocs.map((doc, i) => (
                                    <Dialog key={i}>
                                        <DialogTrigger asChild>
                                            <div className={cn(
                                                "group relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center cursor-zoom-in transition-all duration-500",
                                                isRequirementsAlone ? "aspect-[4/3]" : "aspect-video"
                                            )}>
                                                {doc.url ? (
                                                    <>
                                                        <Image src={isValidUrl(doc.url) ? doc.url : "/placeholder.png"} alt={doc.label} fill className="object-cover group-hover:scale-105 transition-transform animate-in fade-in duration-300" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                                                <ZoomIn className="w-5 h-5 text-white" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute bottom-2 left-2 right-2 z-10">
                                                            <span className="text-[8px] font-black uppercase tracking-wider text-white bg-slate-950/80 px-2.5 py-1 rounded-lg backdrop-blur-md truncate block max-w-full text-center italic shadow-sm">
                                                                {doc.label}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Camera className="w-6 h-6 text-slate-200 dark:text-slate-700" />
                                                )}
                                            </div>
                                        </DialogTrigger>
                                        {doc.url && (
                                            <LightboxView src={doc.url} alt={doc.label} label={doc.label} />
                                        )}
                                    </Dialog>
                                ))}
                            </div>
                        </div>

                        {/* Verification Vault: Payment Proof */}
                        {!isRequirementsAlone && (
                            <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Camera className="text-primary w-4 h-4" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Verification</span>
                                </div>

                                <div className="grid gap-4 grid-cols-1">
                                    <div className="space-y-3">
                                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic ml-1">Payment Proof</p>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className={cn(
                                                    "group relative aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center",
                                                    transaction.paymentReference ? "cursor-zoom-in" : ""
                                                )}>
                                                    {transaction.paymentReference ? (
                                                        <>
                                                            <Image src={isValidUrl(transaction.paymentReference) ? transaction.paymentReference : "/placeholder.png"} alt="Payment" fill className="object-cover group-hover:scale-105 transition-transform" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                                                    <ZoomIn className="w-4 h-4 text-white" />
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center opacity-30 italic font-black text-[9px] uppercase tracking-widest dark:text-slate-500">Awaiting Proof</div>
                                                    )}
                                                </div>
                                            </DialogTrigger>
                                            {transaction.paymentReference && (
                                                <LightboxView src={transaction.paymentReference} alt="Payment Proof" label="Payment Verification Proof" />
                                            )}
                                        </Dialog>

                                        {((transaction.additionalData as any)?.gcashReferenceNo) && (
                                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 mt-2 group/ref relative overflow-hidden transition-all hover:border-primary/20 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <Hash className="w-3.5 h-3.5 text-primary" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Reference Number</span>
                                                </div>
                                                <p className="text-sm font-black italic tracking-tighter text-slate-700 dark:text-slate-200">
                                                    {(transaction.additionalData as any).gcashReferenceNo}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Workflow Tracking & Executive Controls */}
                <div className="col-span-12 lg:col-span-4 space-y-8 sticky top-16 self-start">
                    {/* WORKFLOW TRACKING */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-50 dark:border-white/5 space-y-10">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 italic">Workflow Tracking</span>

                        <div className="space-y-12 relative">
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

                    {/* EXECUTIVE OPERATIONS */}
                    <div className="space-y-4 pt-4">
                        {/* Dispute resolution options */}
                        {hasDispute && (
                            <div className="space-y-3 pt-2">
                                <Button 
                                    onClick={() => { setDisputeAction('APPROVE'); setDisputeModalOpen(true); setRemarks(""); }}
                                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                >
                                    Approve Dispute
                                </Button>
                                <Button 
                                    onClick={() => { setDisputeAction('REJECT'); setDisputeModalOpen(true); setRemarks(""); }}
                                    className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                                >
                                    Decline Dispute
                                </Button>
                            </div>
                        )}

                        {/* Remarks inputs for revision or rejects */}
                        {(isRejecting || isRequestingRevision) ? (
                            <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                <Label className="text-xs font-black uppercase text-rose-500">Remarks / Feedback Reason</Label>
                                <Textarea
                                    ref={remarksRef}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Provide detailed reasons..."
                                    className="min-h-[100px] rounded-xl border-slate-200"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={isRejecting ? handleReject : handleRequestRevision}
                                        disabled={actionLoading}
                                        className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
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
                                            Approve & Send Assessment
                                        </Button>

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
        </div>
    );
}
