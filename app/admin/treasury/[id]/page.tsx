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
    Check,
    RotateCw,
    RefreshCcw,
    ZoomIn,
    ZoomOut,
    ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { 
    getTransactionById,
    evaluateCedulaTransaction, 
    confirmTransactionPayment, 
    releaseCedula,
    rejectTransaction,
    uploadECopyAction,
    getSystemSettingAction,
    getDeliveryFeeByBarangay
} from "@/app/admin/transactions/actions";
import { cn } from "@/lib/utils";
import { calculateCedula } from "@/lib/cedula";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import IdentityConfirmationVault from "@/components/admin/IdentityConfirmationVault";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * High-Fidelity Lightbox View with Transform Controls
 */
function LightboxView({ src, alt, label }: { src: string; alt: string; label: string }) {
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    const handleWheel = (e: React.WheelEvent) => {
        // Smooth zoom using scroll wheel
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
    };

    const reset = () => {
        setScale(1);
        setRotate(0);
    };

    return (
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex flex-col items-center justify-center gap-6 outline-none">
            <DialogHeader className="sr-only">
                <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            
            <div 
                className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden cursor-move active:cursor-grabbing select-none"
                onWheel={handleWheel}
            >
                <div 
                    className="relative w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
                    style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                >
                    <Image 
                        src={src} 
                        alt={alt} 
                        fill 
                        className="object-contain" 
                        priority
                        draggable={false}
                    />
                </div>
            </div>

            {/* Premium Control Bar */}
            <div className="flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-1 pr-4 border-r border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic whitespace-nowrap">{label}</p>
                </div>
                
                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                        onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <div className="w-12 text-center text-[10px] font-black text-white/50 italic">
                        {Math.round(scale * 100)}%
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                        onClick={() => setScale(s => Math.min(s + 0.2, 5))}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>

                <div className="w-px h-4 bg-white/10 mx-2" />

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                    onClick={() => setRotate(r => (r + 90) % 360)}
                    title="Rotate 90°"
                >
                    <RotateCw className="w-4 h-4" />
                </Button>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                    onClick={reset}
                    title="Reset View"
                >
                    <RefreshCcw className="w-4 h-4" />
                </Button>
            </div>
            
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] italic">Scroll to Zoom • Drag to Pan coming soon</p>
        </DialogContent>
    );
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
    const [eCopyPreview, setECopyPreview] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState<string>("#2563eb");
    const [branding, setBranding] = useState({
        word1: "Mapandan",
        word2: "Express",
        logo: ""
    });

    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTransactionById(id);
            if (res.success && res.data) {
                const tx = res.data;
                setTransaction(tx);
                
                // Smart Delivery Fee Pre-fill Logic
                if (tx && tx.fulfillmentType === "DELIVERY") {
                    const fiscal = tx.fiscalSnapshot as any;
                    // 1. If already evaluated or has a snapshot, use the stored fee
                    if (fiscal && fiscal.deliveryFee !== undefined) {
                        setDeliveryFee(fiscal.deliveryFee);
                    } else if (tx.totalAmount > 0) {
                        setDeliveryFee(tx.type.deliveryFee);
                    } else {
                        // 2. If new evaluation, look up the Barangay-specific fee
                        const addr = (typeof tx.deliveryAddress === 'string' 
                            ? JSON.parse(tx.deliveryAddress || '{}') 
                            : tx.deliveryAddress) || tx.residentSnapshot;
                        
                        if (addr?.barangay) {
                            getDeliveryFeeByBarangay(addr.barangay).then(brgyRes => {
                                if (brgyRes.success && brgyRes.data) {
                                    setDeliveryFee(brgyRes.data.fee);
                                } else {
                                    setDeliveryFee(tx.type.deliveryFee);
                                }
                            });
                        } else {
                            setDeliveryFee(tx.type.deliveryFee);
                        }
                    }
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

        // Fetch branding settings
        Promise.all([
            getSystemSettingAction("brand_word_1", "Agno"),
            getSystemSettingAction("brand_word_2", "Express"),
            getSystemSettingAction("site_logo", "")
        ]).then(([w1, w2, logo]) => {
            setBranding({
                word1: w1.data || "Agno",
                word2: w2.data || "Express",
                logo: logo.data || ""
            });
        });
    }, [fetchTransaction]);

    useEffect(() => {
        if (!eCopyFile) {
            setECopyPreview(null);
            return;
        }
        const url = URL.createObjectURL(eCopyFile);
        setECopyPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [eCopyFile]);

    const handleReject = async () => {
        if (!remarks) { toast.error("Remarks required"); return; }
        setActionLoading(true);
        try {
            const res = await rejectTransaction(transaction.id, remarks);
            if (res.success) { 
                toast.success("Rejected"); 
                router.push("/admin/treasury");
            }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    const handleRelease = useCallback(async () => {
        const isPickupCash = transaction?.fulfillmentType === "PICK_UP" && transaction?.paymentType === "CASH";

        // CTC required for all initial processing phases
        const ctcRequired = !["FOR_CLAIM", "FOR_PICKING", "RELEASED"].includes(transaction?.status);
        if (!ctcNumber && ctcRequired && !transaction?.cedula?.ctcNumber) { toast.error("CTC Number Required"); return; }
        setActionLoading(true);
        try {
            // Strict Validation: E-Copy is REQUIRED for initial processing
            const eCopyRequired = transaction?.status === "FOR_PROCESSING" || 
                                 (transaction?.status === "PAID" && (transaction?.fulfillmentType === "E_COPY" || transaction?.fulfillmentType === "DELIVERY"));
            
            if (eCopyRequired && !eCopyFile && !transaction.eCopyUrl) {
                toast.error("Digital E-Copy is required before proceeding.");
                setActionLoading(false);
                return;
            }

            let eCopyUrl = "";
            if (eCopyFile) {
                const formData = new FormData();
                formData.append("file", eCopyFile);
                const uploadRes = await uploadECopyAction(formData);
                if (uploadRes.success) eCopyUrl = uploadRes.data as string;
                else { toast.error("Upload failed"); setActionLoading(false); return; }
            }
            const res = await releaseCedula(transaction.id, ctcNumber, eCopyUrl);
            if (res.success) { 
                const status = res.data?.status;
                const message = status === "FOR_PICKING" 
                    ? "Ready for Picking" 
                    : status === "FOR_CLAIM" 
                        ? "Marked as Ready for Claiming" 
                        : "Document Released";
                toast.success(message); 
                setECopyFile(null); 
                router.push("/admin/treasury");
            }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    }, [transaction, ctcNumber, eCopyFile, router]);

    useEffect(() => {
        if (isRejecting) {
            remarksRef.current?.focus();
        }
    }, [isRejecting]);

    // Handle QR Scan Landing: Auto-focus or Auto-release
    useEffect(() => {
        if (!transaction || loading) return; // Wait for data to be fully loaded

        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get("scan") === "true") {
            const timer = setTimeout(() => {
                if (transaction.status === "FOR_CLAIM") {
                    // AUTO-RELEASE for Claiming phase
                    toast.info("QR Pass Detected: Auto-releasing Document...");
                    handleRelease();
                } else {
                    // AUTO-FOCUS for Processing/Paid phase
                    const ctcInput = document.querySelector('input[placeholder="ENTER SERIAL..."]') as HTMLInputElement;
                    if (ctcInput) {
                        ctcInput.focus();
                        toast.success("Ready for Serial Entry");
                    }
                }
            }, 1500); // Slightly longer delay to ensure all components are ready
            return () => clearTimeout(timer);
        }
    }, [transaction, loading, handleRelease]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!transaction) return <div className="p-20 text-center dark:text-white">Protocol Error: Transaction Inaccessible</div>;

    if (transaction.isCancelled) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0c111d] flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in duration-700">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-[80px] rounded-full animate-pulse" />
                    <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl relative z-10 border border-red-500/20">
                        <span className="text-8xl">🚫</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Request Cancelled</h1>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-red-500 italic">User Retracted This Protocol</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic max-w-md">
                    This service request has been officially cancelled by the citizen. No further processing or evaluation is required for this record.
                </p>
                <Link href="/admin/treasury">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black italic uppercase text-xs tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    const additional = transaction.additionalData || {};
    const resident = transaction.residentSnapshot || {};
    const income = Number(additional.income || 0);
    const propertyValue = Number(additional.propertyValue || 0);

    const fiscal = (transaction.fiscalSnapshot as any) || null;
    const calcResult = fiscal ? {
        basicTax: fiscal.basicTax,
        additionalTax: fiscal.additionalTax,
        penalty: fiscal.penaltyCharge,
        deliveryFee: fiscal.deliveryFee || 0,
        totalAmount: fiscal.totalAmount
    } : calculateCedula({
        type: additional.applicantType || "INDIVIDUAL",
        income,
        propertyValue,
        fulfillmentType: transaction.fulfillmentType,
        deliveryFee
    });

    // Ensure total amount always includes delivery fee in display if calculated on the fly
    const displayTotal = fiscal ? calcResult.totalAmount : (calcResult.totalAmount + (transaction.fulfillmentType === "DELIVERY" ? deliveryFee : 0));

    const steps = [
        { id: "FOR_REQUESTING", label: "EVALUATION" },
        { id: "EVALUATED", label: "ASSESSMENT" },
        { id: "PAID", label: "PAID" },
        { id: "FOR_PROCESSING", label: "PROCESSING" },
        { 
            id: transaction.fulfillmentType === "DELIVERY" ? "FOR_PICKING" : "FOR_CLAIM", 
            label: transaction.fulfillmentType === "DELIVERY" ? "FOR PICKING" : "CLAIMING" 
        },
        { 
            id: transaction.fulfillmentType === "DELIVERY" ? "DELIVERED" : "RELEASED", 
            label: transaction.fulfillmentType === "DELIVERY" ? "DELIVERED" : "RELEASED" 
        },
    ].filter(step => {
        // Fast-track: Remove PROCESSING step for Digital Delivery (PAID phase skip)
        if (step.id === "FOR_PROCESSING" && 
            transaction.fulfillmentType === "DELIVERY" && 
            ["E_PAYMENT", "BANK_TRANSFER"].includes(transaction.paymentType)) {
            return false;
        }
        return true;
    });

    const getEffectiveStatus = (s: string) => {
        return s;
    };
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

    const handlePrintWaybill = () => {
        window.print();
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
                    Type Of Request: {transaction.fulfillmentType?.replace("_", " ") || "Processing"}
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
                                <p className={cn(
                                    "font-black italic tracking-tighter dark:text-slate-200 leading-none",
                                    (transaction.paymentType?.length || 0) > 12 ? "text-xl" : "text-2xl"
                                )}>
                                    {transaction.paymentType?.replace(/_/g, " ") || "--"}
                                </p>
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
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">Delivery Fee</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-primary">₱</span>
                                            <span className="text-xs font-black dark:text-white italic">
                                                {deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-dotted border-slate-300 dark:border-white/10 pt-8 mt-8 flex justify-between items-center">
                                    <span className="text-lg font-black uppercase italic tracking-widest text-slate-900 dark:text-white leading-none">Total Amount Due</span>
                                    <span className="text-4xl font-black italic tracking-tighter text-primary leading-none">
                                        ₱{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                                {[
                                    { url: additional.validIdUrl, label: "Valid ID Evidence" },
                                    { url: additional.proofOfIncomeUrl, label: "Income Verification" }
                                ].map((doc, i) => (
                                    <Dialog key={i}>
                                        <DialogTrigger asChild>
                                            <div className={cn(
                                                "group relative aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center",
                                                doc.url && "cursor-zoom-in"
                                            )}>
                                                {doc.url ? (
                                                    <>
                                                        <Image src={doc.url} alt="Doc" fill className="object-cover group-hover:scale-105 transition-transform" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                                                <ZoomIn className="w-5 h-5 text-white" />
                                                            </div>
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

                        {/* Payment Verification */}
                        {(transaction.paymentType === "E_PAYMENT" || transaction.paymentType === "BANK_TRANSFER") && (
                            <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Camera className="text-primary w-4 h-4" /></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Verification</span>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className={cn(
                                            "group relative aspect-video rounded-2xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center h-32",
                                            transaction.paymentReference?.startsWith("/uploads/") && "cursor-zoom-in"
                                        )}>
                                            {transaction.paymentReference?.startsWith("/uploads/") ? (
                                                <>
                                                    <Image src={transaction.paymentReference} alt="Payment" fill className="object-cover group-hover:scale-105 transition-transform" />
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
                                    {transaction.paymentReference?.startsWith("/uploads/") && (
                                        <LightboxView src={transaction.paymentReference} alt="Payment Proof" label="Payment Verification Proof" />
                                    )}
                                </Dialog>
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

                    {/* DIGITAL ISSUANCE (E-COPY) - Visible in FOR_PROCESSING, FOR_CLAIM (if not yet recorded), or for PAID digital deliveries */}
                    {(
                        transaction.status === "FOR_PROCESSING" || 
                        (transaction.status === "FOR_CLAIM" && 
                            !(transaction.fulfillmentType === "PICK_UP" && transaction.paymentType === "CASH") && 
                            !transaction.eCopyUrl
                        ) ||
                        (transaction.status === "PAID" && (
                            transaction.fulfillmentType === "E_COPY" || 
                            (transaction.fulfillmentType === "DELIVERY" && ["E_PAYMENT", "BANK_TRANSFER"].includes(transaction.paymentType))
                        ))
                    ) && (
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border-slate-50 dark:border-white/5 border space-y-6">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 italic block">Digital Record Protocol</span>
                            <div className="relative">
                                {transaction.status !== "RELEASED" && (
                                    <input type="file" accept=".pdf,image/*" onChange={(e) => setECopyFile(e.target.files?.[0] || null)} className="hidden" id="main-ecopy-upload" />
                                )}
                                
                                {transaction.status === "RELEASED" ? (
                                    <a 
                                        href={transaction.eCopyUrl || "#"} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center rounded-3xl border-2 border-primary/30 bg-primary/5 transition-all h-48 border-solid overflow-hidden group relative"
                                    >
                                        {transaction.eCopyUrl && (transaction.eCopyUrl.toLowerCase().endsWith(".jpg") || transaction.eCopyUrl.toLowerCase().endsWith(".png") || transaction.eCopyUrl.toLowerCase().endsWith(".jpeg") || transaction.eCopyUrl.includes("image")) ? (
                                            <Image 
                                                src={transaction.eCopyUrl} 
                                                fill 
                                                className="object-cover opacity-80 hover:opacity-100 transition-opacity" 
                                                alt="Official Registry" 
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 rounded-2xl bg-primary text-white shadow-lg">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest italic text-primary text-center">
                                                    View Registry (PDF)
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4"><ExternalLink className="w-4 h-4 text-primary" /></div>
                                    </a>
                                ) : (
                                    <label htmlFor="main-ecopy-upload" className={cn(
                                        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed transition-all cursor-pointer h-48 bg-[#f8fafd] dark:bg-white/5 overflow-hidden relative group",
                                        eCopyFile || transaction.eCopyUrl ? "border-primary/30 bg-primary/5 shadow-inner" : "border-slate-100 dark:border-white/5 hover:border-primary/30"
                                    )}>
                                        {(eCopyPreview || transaction.eCopyUrl) ? (
                                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                                                {/* Image Preview */}
                                                {((eCopyFile && eCopyFile.type.startsWith("image/")) || (!eCopyFile && transaction.eCopyUrl && (transaction.eCopyUrl.toLowerCase().endsWith(".jpg") || transaction.eCopyUrl.toLowerCase().endsWith(".png") || transaction.eCopyUrl.toLowerCase().endsWith(".jpeg")))) ? (
                                                    <Image 
                                                        src={eCopyPreview || transaction.eCopyUrl} 
                                                        fill 
                                                        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                                                        alt="Registry Preview"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                                                        <FileText className="w-12 h-12" />
                                                        <span className="text-[9px] font-black uppercase italic tracking-widest mt-2">PDF Document Ready</span>
                                                    </div>
                                                )}
                                                
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                                                        <Upload className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-white tracking-widest italic">Update Attachment</span>
                                                </div>

                                                {/* Info Bar */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <Check className="w-3.5 h-3.5 text-primary" />
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300 truncate">
                                                            {eCopyFile?.name || "Registry-Record-ID-" + transaction.id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500 scale-110">
                                                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400 dark:text-slate-500 block">
                                                        Attach E-Copy Registry
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase italic tracking-tighter">PDF or Image up to 5MB</span>
                                                </div>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* EXECUTIVE ACTIONS */}
                    <div className="space-y-4 pt-4">
                        {!isRejecting ? (
                            <>
                                {transaction.status === "FOR_REQUESTING" && (
                                    <div className="space-y-3">
                                        <Button onClick={handleEvaluate} disabled={actionLoading} className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                                            {actionLoading ? "Processing..." : "Confirm Assessment"}
                                        </Button>
                                        <Button 
                                            onClick={() => setIsRejecting(true)} 
                                            className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 transition-all active:scale-95"
                                        >
                                            Decline Initial Request
                                        </Button>
                                    </div>
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
                                {["PAID", "FOR_CLAIM", "FOR_PROCESSING"].includes(transaction.status) && (
                                    <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                        {/* Financial Verification: Show if Online Payment AND not yet confirmed. Bypassed for E-COPY and PICK_UP E-PAYMENT Fast-track */}
                                        {(transaction.paymentType === "E_PAYMENT" || transaction.paymentType === "BANK_TRANSFER") && 
                                         transaction.fulfillmentType !== "E_COPY" && 
                                         !(transaction.fulfillmentType === "PICK_UP" && (transaction.paymentType === "E_PAYMENT" || transaction.paymentType === "BANK_TRANSFER")) && 
                                         !(transaction.status === "PAID" && transaction.fulfillmentType === "DELIVERY") && (
                                            <div className="space-y-3 p-1 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                <Button 
                                                    onClick={handleConfirmPayment} 
                                                    disabled={actionLoading} 
                                                    className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                >
                                                    {actionLoading ? "Processing Verification..." : "Verify Financial Record"}
                                                </Button>
                                            </div>
                                        )}

                                        {/* Gated CTC Entry: Locked for processed digital/delivery flows. */}
                                        {((transaction.status === "FOR_CLAIM" || transaction.status === "FOR_PICKING")) ? (
                                            <div className="bg-emerald-50 dark:bg-emerald-500/5 p-6 rounded-3xl border-2 border-emerald-100 dark:border-emerald-500/20 text-center space-y-2 animate-in zoom-in-95">
                                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                                                    <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-500 italic">
                                                    {transaction.status === "FOR_PICKING" ? "Ready for Dispatch" : "Document Prepared"}
                                                </p>
                                                <p className="text-[11px] font-bold text-emerald-900/60 dark:text-emerald-500/60 tracking-tight italic leading-relaxed">
                                                    Registry Serial <span className="font-mono text-emerald-600 dark:text-emerald-400">#{transaction.cedula?.ctcNumber || "RECORDED"}</span> is locked and ready for release.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6 animate-in zoom-in-95">
                                                {/* Digital Copy Warning (Conditional) */}
                                                {(
                                                    transaction.status === "FOR_PROCESSING" || 
                                                    (transaction.status === "PAID" && (
                                                        transaction.fulfillmentType === "E_COPY" || 
                                                        (transaction.fulfillmentType === "DELIVERY" && ["E_PAYMENT", "BANK_TRANSFER"].includes(transaction.paymentType))
                                                    ))
                                                ) && !eCopyFile && !transaction.eCopyUrl && (
                                                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-center space-y-2">
                                                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                                                            <Upload className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 italic">Digital Copy Required</p>
                                                        <p className="text-[11px] font-bold text-amber-900/60 dark:text-amber-500/60 leading-relaxed">Please attach the Digital Record to enable document processing.</p>
                                                    </div>
                                                )}

                                                {/* Always show CTC Input for these phases */}
                                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-primary/20 space-y-3">
                                                    <Label className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 italic">Registry Serial Entry (CTC No.)</Label>
                                                    <Input 
                                                        value={ctcNumber} 
                                                        onChange={(e) => setCtcNumber(e.target.value)} 
                                                        placeholder="ENTER SERIAL..." 
                                                        className="h-12 rounded-xl border-slate-100 dark:border-white/5 italic font-black text-sm tracking-[0.2em] focus:ring-primary/10 dark:bg-slate-900 dark:text-white uppercase" 
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3 pt-2">
                                            {/* WAYBILL GENERATION: Required for Delivery Dispatch */}
                                            {transaction.fulfillmentType === "DELIVERY" && (transaction.status === "FOR_PROCESSING" || transaction.status === "PAID") && (
                                                <Button 
                                                    onClick={handlePrintWaybill}
                                                    variant="outline"
                                                    className="w-full h-14 rounded-2xl border-2 border-primary/20 text-primary font-black italic uppercase tracking-widest text-[10px] hover:bg-primary/5 transition-all mb-2"
                                                >
                                                    Generate & Print Waybill
                                                </Button>
                                            )}

                                            <Button 
                                                onClick={handleRelease} 
                                                disabled={
                                                    actionLoading || 
                                                    // Requirement: CTC needed for initial processing
                                                    (!["FOR_CLAIM", "FOR_PICKING", "RELEASED"].includes(transaction.status) && !ctcNumber && !transaction.cedula?.ctcNumber) ||
                                                    // Requirement: E-Copy needed for FOR_PROCESSING (including Cash Pickups) and specific digital/delivery PAID flows
                                                    ((transaction.status === "FOR_PROCESSING" || (transaction.status === "PAID" && (transaction.fulfillmentType === "E_COPY" || transaction.fulfillmentType === "DELIVERY"))) && !eCopyFile && !transaction.eCopyUrl)
                                                } 
                                                className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                                            >
                                                {actionLoading ? "Processing..." : (transaction.status === "FOR_PROCESSING" || transaction.status === "PAID") ? (transaction.fulfillmentType === "DELIVERY" ? "Ready for Picking" : "Mark Ready for Claiming") : "Confirm & Release Document"}
                                            </Button>

                                            <Button 
                                                onClick={() => setIsRejecting(true)} 
                                                className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 transition-all active:scale-95"
                                            >
                                                Decline Registry Process
                                            </Button>
                                        </div>
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

            {/* HIGH-FIDELITY MUNICIPAL WAYBILL (PRINT ONLY) */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 m-0 overflow-visible text-black font-sans leading-tight">
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        @page { size: 100mm 150mm; margin: 0; }
                        body { visibility: hidden; }
                        .print-only { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 5mm; }
                    }
                `}} />
                
                <div className="print-only flex flex-col h-full border-[3px] border-black rounded-sm">
                    {/* Header: Dynamic Branding */}
                    <div className="border-b-[3px] border-black p-3 flex items-center justify-between bg-black text-white">
                        <div className="flex items-center gap-3">
                            {branding.logo ? (
                                <Image src={branding.logo} alt="Logo" width={40} height={40} className="object-contain" unoptimized />
                            ) : (
                                <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center font-black text-[10px]">A</div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black italic tracking-tighter uppercase leading-none">
                                    {branding.word1} <span className="text-white/70 italic tracking-normal">{branding.word2}</span>
                                </span>
                                <span className="text-[6px] font-bold uppercase tracking-widest opacity-80 italic">Official Municipal Logistics</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase italic tracking-widest border border-white px-2 py-1">Waybill</div>
                    </div>

                    {/* QR Code Segment */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 border-b-[2px] border-black border-dashed">
                        <div className="relative w-40 h-40 bg-white p-2 border border-slate-100 shadow-sm">
                            <Image 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${transaction.id}`} 
                                alt="Tracking QR" 
                                fill
                                className="p-2"
                                unoptimized
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[12px] font-black italic tracking-[0.3em] font-mono leading-none">{transaction.id.slice(-12).toUpperCase()}</span>
                            <span className="text-[6px] font-bold uppercase text-slate-500 mt-1">Transaction Tracking Reference</span>
                        </div>
                    </div>

                    {/* Logistics Data Segment */}
                    <div className="p-4 grid grid-cols-2 gap-4 border-b-[3px] border-black">
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-[6px] font-bold uppercase text-slate-500">Recipient Name</span>
                                <span className="text-[11px] font-black uppercase italic leading-tight">{resident.firstName} {resident.lastName}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[6px] font-bold uppercase text-slate-500">Contact Number</span>
                                <span className="text-[10px] font-bold italic tracking-widest">{resident.contactNumber || "--"}</span>
                            </div>
                        </div>
                            <div className="flex flex-col">
                                <span className="text-[6px] font-bold uppercase text-slate-500">Delivery Address</span>
                                <span className="text-[9px] font-bold uppercase leading-tight italic">
                                    {resident.houseNumber && `${resident.houseNumber}, `}{resident.street}<br/>
                                    Barangay {resident.barangay},<br/>
                                    {resident.municipality}, {resident.province}
                                </span>
                                {transaction.deliveryLandmark && (
                                    <div className="mt-1 p-1 bg-black/5 rounded-sm">
                                        <span className="text-[5px] font-bold uppercase text-slate-400 block leading-none">Landmark</span>
                                        <span className="text-[7px] font-black italic uppercase leading-none">{transaction.deliveryLandmark}</span>
                                    </div>
                                )}
                            </div>
                    </div>

                    {/* Service & Payment Metadata */}
                    <div className="p-3 bg-slate-50 grid grid-cols-3 gap-2 border-b-[3px] border-black">
                        <div className="flex flex-col">
                            <span className="text-[5px] font-bold uppercase">Payment Type</span>
                            <span className="text-[7px] font-black uppercase italic tracking-tighter">{transaction.paymentType?.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[5px] font-bold uppercase">Service</span>
                            <span className="text-[7px] font-black uppercase italic tracking-tighter truncate">{transaction.type.name}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[5px] font-bold uppercase">Amount Due</span>
                            <span className="text-[9px] font-black italic tracking-tighter text-primary">₱{(fiscal?.totalAmount || transaction.totalAmount || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Instructions & Footnote */}
                    <div className="flex-1 p-3 flex flex-col justify-end italic">
                        <div className="border-t-[2px] border-black border-dotted pt-2">
                            <p className="text-[7px] font-bold uppercase leading-relaxed text-slate-600">
                                * Official document for municipal logistics use only. Handle with extreme care. 
                                If document is damaged, please report immediately to the Treasury Office.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
