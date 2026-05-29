/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useRef, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { isValidUrl } from "@/utils/image";
import { format, differenceInYears } from "date-fns";
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
    ExternalLink,
    AlertCircle,
    Ban,
    Hash,
    Trash2,
    Plus,
    Coins
} from "lucide-react";
import { toast } from "sonner";
import {
    getTransactionById,
    evaluateCedulaTransaction,
    confirmTransactionPayment,
    releaseCedula,
    rejectTransaction,
    sendForRevision,
    uploadECopyAction,
    getSystemSettingAction,
    getDeliveryFeeByBarangay,
    resolveDispute,
    // scheduleBuildingInspection,
    addAdditionalBuildingPermitFee,
    removeAdditionalBuildingPermitFee,
    approveAndSendBuildingPermitBilling,
    declinePaymentProofAction
} from "@/app/admin/transactions/actions";
import { cn } from "@/lib/utils";
import { calculateCedula } from "@/lib/cedula";
import { calculateBusinessPermit } from "@/lib/business-permit";
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
    DialogTrigger
} from "@/components/ui/dialog";
import DocumentViewerModal from "@/components/shared/DocumentViewerModal";

const checkIsPdf = (url: string | null) => {
    if (!url) return false;
    return url.toLowerCase().endsWith(".pdf") || url.includes("application/pdf") || url.includes(".pdf?");
};

import BusinessPermitView from "./views/BusinessPermitView";
import BuildingPermitView from "./views/BuildingPermitView";
import CivilRegistryView from "./views/CivilRegistryView";
import GenericServiceView from "./views/GenericServiceView";

interface PageProps {
    params: Promise<{ id: string }>;
}

/**
 * High-Fidelity Lightbox View with Transform Controls
 */
function LightboxView({ src, alt, label }: { src: string; alt: string; label: string }) {
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        // Smooth zoom using scroll wheel
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

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    const handleTouchEnd = () => {
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
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

            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] italic">Scroll to Zoom • Drag to Pan Active</p>
        </DialogContent>
    );
}

export default function TreasuryDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const rawUserRole = (session?.user as any)?.role;
    const userDepartment = (session?.user as any)?.department;
    // Map BPLO Admin to behave exactly like ADMIN_AIDE for Treasury pages
    const isBPLOAdmin = rawUserRole === "ADMIN" && userDepartment?.toUpperCase() === "BPLO";
    const userRole = isBPLOAdmin ? "ADMIN_AIDE" : rawUserRole;
    // Treasury Staff can only upload OR; Permit No., Sticker No., and Waybill are BPLO Admin only
    const isTreasuryStaff = rawUserRole === "TREASURY_STAFF";
    const backUrl = userRole === "ENGINEER" ? "/admin/engineer" : "/admin/treasury";
    const [transaction, setTransaction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [remarks, setRemarks] = useState("");
    const remarksRef = useRef<HTMLTextAreaElement>(null);
    const [ctcNumber, setCtcNumber] = useState("");
    const [stickerNumber, setStickerNumber] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);
    const [isRequestingRevision, setIsRequestingRevision] = useState(false);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [eCopyFile, setECopyFile] = useState<File | null>(null);
    const [eCopyPreview, setECopyPreview] = useState<string | null>(null);
    const [orFile, setOrFile] = useState<File | null>(null);
    const [orPreview, setOrPreview] = useState<string | null>(null);
    const [themeColor, setThemeColor] = useState<string>("#2563eb");

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerTitle, setViewerTitle] = useState("");

    const handleViewFile = (url: string | null, title: string) => {
        setViewerUrl(url);
        setViewerTitle(title);
        setViewerOpen(true);
    };
    const [branding, setBranding] = useState({
        word1: "Mapandan",
        word2: "Express",
        logo: ""
    });
    const [additionalFeeLabel, setAdditionalFeeLabel] = useState("");
    const [additionalFeeAmount, setAdditionalFeeAmount] = useState("");
    const [showAdditionalFeeForm, setShowAdditionalFeeForm] = useState(false);

    const handleAddAdditionalFee = async () => {
        if (!additionalFeeLabel.trim()) {
            toast.error("Please specify a fee type / description.");
            return;
        }
        if (!additionalFeeAmount || Number(additionalFeeAmount) <= 0) {
            toast.error("Please specify a valid fee amount.");
            return;
        }

        setActionLoading(true);
        try {
            const res = await addAdditionalBuildingPermitFee(id, {
                label: additionalFeeLabel.trim(),
                amount: Number(additionalFeeAmount)
            });

            if (res.success) {
                toast.success("Additional fee added successfully!");
                setAdditionalFeeLabel("");
                setAdditionalFeeAmount("");
                setShowAdditionalFeeForm(false);
                fetchTransaction();
            } else {
                toast.error(res.error || "Failed to add additional fee");
            }
        } catch {
            toast.error("An error occurred while adding fee");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveAdditionalFee = async (index: number) => {
        setActionLoading(true);
        try {
            const res = await removeAdditionalBuildingPermitFee(id, index);
            if (res.success) {
                toast.success("Additional fee removed successfully!");
                fetchTransaction();
            } else {
                toast.error(res.error || "Failed to remove fee");
            }
        } catch {
            toast.error("An error occurred while removing fee");
        } finally {
            setActionLoading(false);
        }
    };
    const handleApproveBilling = async () => {
        setActionLoading(true);
        try {
            const res = await approveAndSendBuildingPermitBilling(id);
            if (res.success) {
                toast.success("Billing approved and sent to citizen successfully!");
                fetchTransaction();
            } else {
                toast.error(res.error || "Failed to approve billing");
            }
        } catch {
            toast.error("An error occurred while approving billing");
        } finally {
            setActionLoading(false);
        }
    };
    const [_showAdditionalDebug, _setShowAdditionalDebug] = useState(false);
    const [isResolvingDispute, setIsResolvingDispute] = useState(false);
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [disputeAction, setDisputeAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
    const [showPreviousPhases, setShowPreviousPhases] = useState(false);
    
    /*
    // Schedule Inspection Form State
    const [isSchedulingInspection, setIsSchedulingInspection] = useState(false);
    const [inspectionType, setInspectionType] = useState("Structural Inspection");
    const [inspectionDate, setInspectionDate] = useState("");
    const [inspectionTime, setInspectionTime] = useState("");
    const [inspectorName, setInspectorName] = useState("");
    const [inspectionNotes, setInspectionNotes] = useState("");

    const handleScheduleInspection = async () => {
        if (!inspectionDate || !inspectionTime || !inspectorName) {
            toast.error("Please fill in all required fields (Date, Time, Inspector Name)");
            return;
        }

        setActionLoading(true);
        const res = await scheduleBuildingInspection(id, {
            type: inspectionType,
            date: inspectionDate,
            time: inspectionTime,
            inspectorName: inspectorName,
            notes: inspectionNotes
        });

        if (res.success) {
            toast.success("Inspection scheduled successfully!");
            setTransaction((prev: any) => ({ ...prev, ...res.data }));
            setIsSchedulingInspection(false);
        } else {
            toast.error(res.error || "Failed to schedule inspection");
        }
        setActionLoading(false);
    };
    */

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

    const isBusinessPermit = transaction?.type?.code?.startsWith("BUSINESS_PERMIT") ?? false;
    const isBusinessPermitRenewal = isBusinessPermit && (
        transaction?.type?.code === "BUSINESS_PERMIT_RENEW" ||
        (transaction?.additionalData as any)?.businessType === "RENEWAL" ||
        (transaction?.additionalData as any)?.businessType === "RENEW"
    );
    const isBuildingPermit = transaction?.type?.code?.startsWith("BUILDING_PERMIT") ?? false;
    const isLCR = (transaction?.type?.code?.startsWith("LCR_") ?? false) || (transaction?.type?.code?.startsWith("CIVIL_REGISTRY") ?? false);
    const typeCode = (transaction?.type?.code || "").toUpperCase();
    const _isBirth = typeCode.includes("BIRTH");
    const isDeath = typeCode.includes("DEATH");
    const isMarriage = typeCode.includes("MARRIAGE") || typeCode.includes("LICENSE");
    const safeFormatDate = (dateStr: any) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "N/A";
        return format(d, "MMM d, yyyy");
    };
    // RETURN_REQUESTED and REFUND_REQUESTED are also excluded so BPLO Admin can action disputes on Business Permits
    const isReadOnlyAide = userRole === "ADMIN_AIDE" && isBusinessPermit && !["FOR_INSPECTION", "FOR_REINSPECTION", "FOR_CLAIM", "FOR_PICKING", "RETURN_REQUESTED", "REFUND_REQUESTED"].includes(transaction?.status || "");

    const fetchTransaction = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getTransactionById(id);
            if (res.success && res.data) {
                const tx = res.data;
                setTransaction(tx);

                // Pre-populate feeLineItems for building permit if assessed by engineer
                if (tx && tx.type?.code?.startsWith("BUILDING_PERMIT")) {
                    const assessed = tx.additionalData?.feeAssessment;
                    if (assessed && assessed.endorsed) {
                        setFeeLineItems([
                            { label: "Building Permit Fee", amount: String(assessed.buildingPermitFee || 0) },
                            { label: "Electrical Permit Fee", amount: String(assessed.electricalPermitFee || 0) },
                            { label: "Sanitary Permit Fee", amount: String(assessed.sanitaryPermitFee || 0) },
                            { label: "Other Applicable Municipal Charges", amount: String(assessed.municipalCharges || 0) }
                        ]);
                    }
                } else if (tx) {
                    const fiscal = tx.fiscalSnapshot as any;
                    if (fiscal && Array.isArray(fiscal.lineItems) && fiscal.lineItems.length > 0) {
                        const mappedFees = fiscal.lineItems.map((item: any) => ({
                            label: item.label,
                            amount: String(item.amount)
                        }));
                        setFeeLineItems(mappedFees);
                    } else {
                        const defaultFees = tx.type?.defaultFees;
                        if (Array.isArray(defaultFees) && defaultFees.length > 0 && (!tx.fiscalSnapshot || Object.keys(tx.fiscalSnapshot).length === 0)) {
                            const mappedFees = defaultFees.map((fee: any) => ({
                                label: fee.label,
                                amount: ""
                            }));
                            setFeeLineItems(mappedFees);
                        }
                    }
                }

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
                            : tx.deliveryAddress) || tx.user?.residentProfile || tx.residentSnapshot;

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
        if (!session) return;
        const role = (session?.user as any)?.role;
        const dept = (session?.user as any)?.department;
        if (role === "ADMIN" && dept?.toUpperCase() === "BPLO") {
            router.push(`/admin/bplo/${id}`);
        }
    }, [session, id, router]);

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
            getSystemSettingAction("brand_word_1", "Mapandan"),
            getSystemSettingAction("brand_word_2", "Express"),
            getSystemSettingAction("site_logo", "")
        ]).then(([w1, w2, logo]) => {
            setBranding({
                word1: w1.data || "Mapandan",
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

    useEffect(() => {
        if (!orFile) {
            setOrPreview(null);
            return;
        }
        const url = URL.createObjectURL(orFile);
        setOrPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [orFile]);

    const handleReject = async () => {
        if (!remarks) { toast.error("Remarks required"); return; }
        setActionLoading(true);
        try {
            const res = await rejectTransaction(transaction.id, remarks);
            if (res.success) {
                toast.success("Rejected");
                setIsRejecting(false);
                router.push(backUrl);
            }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    const handleRequestRevision = async () => {
        if (!remarks) { toast.error("Remarks required"); return; }
        setActionLoading(true);
        try {
            const res = await sendForRevision(transaction.id, remarks);
            if (res.success) {
                toast.success("Sent back for revision");
                setIsRequestingRevision(false);
                router.push(backUrl);
            }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    };

    const handleRelease = useCallback(async () => {

        // CTC or Permit Number required for all initial processing phases (Only for non-Business Permits)
        const ctcRequired = !isBusinessPermit && !["FOR_CLAIM", "FOR_PICKING", "RELEASED"].includes(transaction?.status);
        if (ctcRequired && !ctcNumber && !transaction?.cedula?.ctcNumber) {
            toast.error("CTC Number Required");
            return;
        }
        setActionLoading(true);
        try {
            // Strict Validation for Business Permit: OR attachment is also required!
            const isInitialRelease = transaction?.status === "FOR_PROCESSING" ||
                (transaction?.status === "PAID" && (transaction?.fulfillmentType === "E_COPY" || transaction?.fulfillmentType === "DELIVERY"));
            if (isBusinessPermit && isInitialRelease && !orFile && !transaction.orUrl) {
                toast.error("Official Receipt (OR) copy is required for Business Permits before proceeding.");
                setActionLoading(false);
                return;
            }

            let eCopyUrl = "";
            if (eCopyFile) {
                const formData = new FormData();
                formData.append("file", eCopyFile);
                const uploadRes = await uploadECopyAction(formData);
                if (uploadRes.success) eCopyUrl = uploadRes.data as string;
                else { toast.error("E-Copy upload failed"); setActionLoading(false); return; }
            }

            let orUrl = "";
            if (orFile) {
                const formData = new FormData();
                formData.append("file", orFile);
                const uploadRes = await uploadECopyAction(formData);
                if (uploadRes.success) orUrl = uploadRes.data as string;
                else { toast.error("Official Receipt upload failed"); setActionLoading(false); return; }
            }

            const res = await releaseCedula(transaction.id, ctcNumber, eCopyUrl, orUrl, stickerNumber);
            if (res.success) {
                const status = res.data?.status;
                const message = status === "FOR_PICKING"
                    ? "Ready for Picking"
                    : status === "FOR_CLAIM"
                        ? "Marked as Ready for Claiming"
                        : status === "FOR_REINSPECTION"
                            ? "Successfully sent to BPLO for Re-Inspection"
                            : "Document Released";
                toast.success(message);
                setECopyFile(null);
                setOrFile(null);
                setStickerNumber("");
                router.push(backUrl);
            }
            else toast.error(res.error || "Failed");
        } finally { setActionLoading(false); }
    }, [transaction, ctcNumber, eCopyFile, orFile, stickerNumber, router, isBusinessPermit, backUrl]);

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
                <Link href={backUrl}>
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-2 font-black italic uppercase text-xs tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    const additional = transaction.additionalData || {};
    const resident = transaction.user?.residentProfile || transaction.residentSnapshot || {};
    const income = Number(additional.income || 0);
    const propertyValue = Number(additional.propertyValue || 0);

    const fiscal = (transaction.fiscalSnapshot as any) || null;
    const deliveryAddr = transaction.deliveryAddress
        ? (typeof transaction.deliveryAddress === 'string' ? JSON.parse(transaction.deliveryAddress) : transaction.deliveryAddress)
        : null;

    const calcResult = (() => {
        if (fiscal && !(isBusinessPermit && transaction.status === "FOR_REQUESTING") && !(isBuildingPermit && transaction.status === "EVALUATED")) {
            return {
                basicTax: fiscal.basicTax,
                additionalTax: fiscal.additionalTax,
                penalty: fiscal.penaltyCharge,
                deliveryFee: fiscal.deliveryFee || 0,
                totalAmount: fiscal.totalAmount,
                lineItems: fiscal.lineItems
            };
        }

        if (isBusinessPermit || isBuildingPermit) {
            if (transaction.status === "FOR_REQUESTING" || (isBuildingPermit && transaction.status === "EVALUATED" && !fiscal)) {
                const itemsSum = feeLineItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
                const dFee = transaction.fulfillmentType === "DELIVERY" ? deliveryFee : 0;
                return {
                    basicTax: itemsSum,
                    additionalTax: 0,
                    penalty: 0,
                    deliveryFee: dFee,
                    totalAmount: itemsSum + dFee,
                    lineItems: feeLineItems
                };
            }
            const cap = Number(additional.capitalInvestment || 0);
            const sales = Number(additional.grossSales || 0);
            const res = calculateBusinessPermit({
                type: additional.businessType === "NEW" ? "NEW" : "RENEWAL",
                capitalization: cap,
                grossSales: sales,
                fulfillmentType: transaction.fulfillmentType,
                deliveryFee
            });
            return {
                basicTax: res.baseFee,
                additionalTax: res.taxAmount,
                penalty: 0,
                deliveryFee: res.deliveryFee,
                totalAmount: res.totalAmount
            };
        }

        if (isLCR) {
            // For Civil Registry (LCR) services, prefer persisted transaction.totalAmount
            // (set at submission time) or fall back to type baseFee + delivery fee.
            const isLate = (additional.registrationType || "").toUpperCase() === "LATE";
            const isMarriageReg = typeCode === "LCR_MARRIAGE_REG";
            const baseFee = (isMarriageReg && !isLate)
                ? 0
                : Number(transaction.type?.baseFee || additional.totalAmount || transaction.totalAmount || 0);
            const typeDelivery = Number(transaction.type?.deliveryFee || 0);
            const deliveryFeeUsed = transaction.fulfillmentType === "DELIVERY"
                ? (fiscal?.deliveryFee ?? deliveryFee ?? typeDelivery)
                : 0;
            // Miscellaneous fee: Late registration = ₱300, Standard = ₱0
            const miscFee = isLate ? 300 : 0;
            const total = (transaction.totalAmount && Number(transaction.totalAmount) > 0)
                ? Number(transaction.totalAmount)
                : baseFee + deliveryFeeUsed + miscFee;
            return {
                basicTax: baseFee,
                additionalTax: 0,
                penalty: 0,
                deliveryFee: deliveryFeeUsed,
                miscFee,
                totalAmount: total
            };
        }

        return calculateCedula({
            type: additional.applicantType || "INDIVIDUAL",
            income,
            propertyValue,
            fulfillmentType: transaction.fulfillmentType,
            deliveryFee,
            baseFee: transaction.type?.baseFee
        });
    })();

    // Prefer persisted `transaction.totalAmount` when available (greater than 0); otherwise use calculated result
    const additionalFeesSum = (transaction.status === "FOR_REQUESTING")
        ? feeLineItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0)
        : 0;
    const displayTotal = Number((transaction.totalAmount && transaction.totalAmount > 0 && !(isBusinessPermit && transaction.status === "FOR_REQUESTING")) ? transaction.totalAmount : (calcResult.totalAmount ?? 0)) + additionalFeesSum;

    const declaredValue = isBusinessPermit
        ? (additional.businessType === "NEW" ? Number(additional.capitalInvestment || 0) : Number(additional.grossSales || 0))
        : income;

    const declaredLabel = isBusinessPermit
        ? (additional.businessType === "NEW" ? "Capital Investment" : "Declared Gross Sales")
        : "Declared Gross";

    const baseSteps = (() => {
        if (isBusinessPermit) {
            return [
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
        }
        return [
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
            }
        ];
    })();

    // Logic to add terminal or dispute steps
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
    } else if (status === "FOR_REINSPECTION" && !isBusinessPermit) {
        steps = [
            { id: "FOR_INSPECTION", label: "INSPECTION" },
            { id: "FOR_REINSPECTION", label: "RE-INSPECTION" }
        ];
    } else if (status.includes("RETURN") || status.includes("REFUND") || status === "DISPUTE_REJECTED") {
        const disputeLabel = status === "DISPUTE_REJECTED" ? "RETURN REJECTED" : status.replace(/_/g, " ");
        steps.push({ id: status, label: disputeLabel });
    }

    steps = steps.filter(step => {
        // Fast-track: Remove PROCESSING step for Digital Delivery (PAID phase skip)
        if (step.id === "FOR_PROCESSING" &&
            transaction.fulfillmentType === "DELIVERY" &&
            ["E_PAYMENT", "BANK_TRANSFER"].includes(transaction.paymentType)) {
            return false;
        }
        // Over-the-counter Cash on Pick Up: Remove PAID step from middle tracking
        if (step.id === "PAID" &&
            transaction.fulfillmentType === "PICK_UP" &&
            transaction.paymentType === "CASH") {
            return false;
        }
        return true;
    });

    const getEffectiveStatus = (s: string) => s;
    let currentStepIdx = steps.findIndex(s => s.id === getEffectiveStatus(transaction.status));

    if (isBuildingPermit) {
        steps = [
            { id: "EVALUATION", label: "EVALUATION" },
            { id: "ASSESSMENT", label: "ASSESSMENT" },
            { id: "PAYMENT_HISTORY", label: "PAYMENT HISTORY" }
        ];
        const getBuildingStepIndex = (status: string) => {
            if (status === "EVALUATED") return 0; // EVALUATION
            if (status === "UNPAID" || status === "PAID") return 1; // ASSESSMENT
            return 2; // PAYMENT HISTORY (FOR_PROCESSING, FOR_CLAIM, RELEASED)
        };
        currentStepIdx = getBuildingStepIndex(transaction.status);
    }

    // Build evidence documents list for the Evidence Vault UI
    const evidenceDocs: { url?: string | null; label: string }[] = (() => {
        if (isBusinessPermit) {
            const docs = [
                { url: additional.ownerIdUrl, label: "Owner's Valid ID" },
                { url: additional.ctcUrl, label: "Cedula (CTC) Copy" },
                { url: additional.dtiSecUrl, label: "DTI / SEC Registry" },
                { url: additional.brgyClearanceUrl, label: "Barangay Clearance" },
                { url: additional.locationPhotoUrl, label: "Location Photo" },
                { url: additional.sanitaryPermitUrl, label: "Sanitary Permit" },
                { url: additional.fireSafetyUrl, label: "Fire Safety Certificate" },
                { url: additional.birCorUrl, label: "BIR Certificate (COR)" },
            ];

            // For renewal requests, include the previous business permit document
            if (additional.businessType === "RENEWAL" || additional.previousPermitUrl) {
                docs.push({ url: additional.previousPermitUrl, label: "Previous Business Permit" });
            }

            return docs;
        }

        if (isLCR) {
            const regType = (additional.registrationType || "").toUpperCase();
            const typeCode = (transaction?.type?.code || "").toUpperCase();

            const docs: { url?: string | null; label: string }[] = [];

            // --- Birth Registration ---
            if (typeCode === "LCR_BIRTH_REG" || typeCode === "LCR_BIRTH") {
                if (regType === "LATE") {
                    docs.push({ url: additional.negativePSA, label: "Negative Certification from PSA" });
                    docs.push({ url: additional.colb, label: "Certificate of Live Birth (COLB)" });
                    docs.push({ url: additional.affidavitDelayed, label: "Affidavit of Delayed Registration" });
                    docs.push({ url: additional.supportingEvidence1, label: "Supporting Evidence 1" });
                    docs.push({ url: additional.supportingEvidence2, label: "Supporting Evidence 2" });
                } else {
                    const parentsMarried = additional.parentsMarried === true || additional.parentsMarried === "true";
                    if (parentsMarried) {
                        docs.push({ url: additional.marriageCertificate, label: "Marriage Certificate of Parents" });
                        docs.push({ url: additional.municipalForm102, label: "Municipal Form 102" });
                    } else {
                        docs.push({ url: additional.communityTaxCertificate, label: "Community Tax Certificate" });
                    }
                }
            }

            // --- Death Registration ---
            if (typeCode === "LCR_DEATH_REG" || typeCode === "LCR_DEATH") {
                if (regType === "LATE") {
                    docs.push({ url: additional.psaNegative, label: "PSA Negative Certification" });
                    docs.push({ url: additional.affidavitOfDelay, label: "Affidavit of Delayed Registration" });
                } else {
                    docs.push({ url: additional.municipalForm103, label: "Municipal Form No. 103" });
                }
            }

            // --- Marriage Registration ---
            if (typeCode === "LCR_MARRIAGE_REG" || typeCode === "LCR_MARRIAGE") {
                if (regType === "LATE") {
                    docs.push({ url: additional.psaNeg, label: "Negative Certificate from PSA" });
                    docs.push({ url: additional.affidavitDelay, label: "Affidavit of Delayed Registration" });
                    docs.push({ url: additional.marriageLicense, label: "Certified Copy of Marriage License" });
                } else {
                    docs.push({ url: additional.marriageCert, label: "Accomplished Certificate of Marriage" });
                }
            }

            // --- Marriage License Application ---
            if (typeCode === "LCR_MARRIAGE_LICENSE") {
                const licenseDocs = [
                    "Municipal Form No. 90",
                    "Community Tax Certificate",
                    "Parental Consent of the father/mother",
                    "Certificate of Family Planning",
                    "Certificate of Pre-Marriage Counseling",
                    "Birth Certificate of Applicant 1",
                    "Birth Certificate of Applicant 2",
                    "Government ID of Applicant 1",
                    "Government ID of Applicant 2",
                    "Seminar Attendance Proof",
                    "Legal Capacity (if one party is a foreigner)"
                ];
                for (const key of licenseDocs) {
                    if (additional[key]) {
                        docs.push({ url: additional[key], label: key });
                    }
                }
            }

            // Fallback: add commonly named LCR document keys
            const fallbackKeys = [
                { key: 'marriageCertificate', label: 'Marriage Certificate of Parents' },
                { key: 'municipalForm102', label: 'Municipal Form 102' },
                { key: 'communityTaxCertificate', label: 'Community Tax Certificate' },
                { key: 'negativePSA', label: 'Negative Certification from PSA' },
                { key: 'colb', label: 'Certificate of Live Birth (COLB)' },
                { key: 'affidavitDelayed', label: 'Affidavit of Delayed Registration' },
                { key: 'supportingEvidence1', label: 'Supporting Evidence 1' },
                { key: 'supportingEvidence2', label: 'Supporting Evidence 2' },
                { key: 'municipalForm103', label: 'Municipal Form No. 103' },
                { key: 'psaNegative', label: 'PSA Negative Certification' },
                { key: 'affidavitOfDelay', label: 'Affidavit of Delayed Registration' },
                { key: 'marriageCert', label: 'Accomplished Certificate of Marriage' },
                { key: 'psaNeg', label: 'Negative Certificate from PSA' },
                { key: 'affidavitDelay', label: 'Affidavit of Delayed Registration' },
                { key: 'marriageLicense', label: 'Certified Copy of Marriage License' }
            ];
            for (const fk of fallbackKeys) {
                if (additional[fk.key] && !docs.find(d => d.label === fk.label)) {
                    docs.push({ url: additional[fk.key], label: fk.label });
                }
            }
            // --- NEW: include any uploaded files whose keys match the transaction type's requiredDocs labels ---
            try {
                let reqDocs: string[] = [];
                if (Array.isArray(transaction.type?.requiredDocs)) reqDocs = transaction.type.requiredDocs as string[];
                else if (typeof transaction.type?.requiredDocs === 'string' && transaction.type.requiredDocs.length > 0) {
                    try { reqDocs = JSON.parse(transaction.type.requiredDocs as string); } catch { reqDocs = [] }
                }
                const normalize = (s?: any) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
                const additionalKeys = Object.keys(additional || {});
                for (const label of reqDocs) {
                    if (!label) continue;
                    let val = (additional as any)[label];
                    if (!val) {
                        // try to find a matching additionalData key by normalized comparison
                        const target = normalize(label);
                        for (const k of additionalKeys) {
                            if (!k) continue;
                            const v = (additional as any)[k];
                            if (!v || typeof v !== 'string') continue;
                            const nk = normalize(k);
                            if (!nk) continue;
                            if (nk === target || nk.includes(target) || target.includes(nk)) {
                                val = v;
                                break;
                            }
                        }
                    }
                    if (val && typeof val === 'string' && !docs.find(d => d.label === label)) {
                        docs.push({ url: val, label });
                    }
                }
            } catch {
                // ignore parsing errors
            }

            // --- ID & Document Uploads for Civil Registry Request/Registration ---
            const idFront = additional.validIdFront || additional.idFrontUrl || resident.idFrontUrl;
            const idBack = additional.validIdBack || additional.idBackUrl || resident.idBackUrl;

            if (idFront && !docs.find(d => d.url === idFront)) {
                docs.push({ url: idFront, label: "Government ID (Front)" });
            }
            if (idBack && !docs.find(d => d.url === idBack)) {
                docs.push({ url: idBack, label: "Government ID (Back)" });
            }

            // Also check for any other uploaded files in additionalData that are valid URLs
            Object.entries(additional).forEach(([key, val]) => {
                if (typeof val === 'string' && val.startsWith('http') && !docs.find(d => d.url === val)) {
                    // Avoid duplicating paymentReference, eCopyUrl, or orUrl in requirements vault
                    if (key !== 'paymentReference' && key !== 'eCopyUrl' && key !== 'orUrl') {
                        // Humanize the key for the label
                        const label = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .trim();
                        docs.push({ url: val, label });
                    }
                }
            });

            return docs;
        }

        // Default: generic user documents
        return [
            { url: additional.validIdUrl, label: "Valid ID Evidence" },
            { url: additional.proofOfIncomeUrl, label: "Income Verification" }
        ];
    })();

    const handleEvaluate = async () => {
        setActionLoading(true);
        try {
            let itemsToSend: { label: string; amount: number }[] | undefined = undefined;

            if (isBusinessPermit && userRole !== "ADMIN_AIDE") {
                // Business Permit: at least one valid fee is required
                const validItems = feeLineItems.filter(item => item.label.trim() !== "" && item.amount.trim() !== "");
                if (validItems.length === 0) {
                    toast.error("Please add at least one valid fee line item.");
                    setActionLoading(false);
                    return;
                }
                itemsToSend = validItems.map(item => ({
                    label: item.label.trim(),
                    amount: parseFloat(item.amount) || 0
                }));
            } else {
                // Cedula / Generic: additional fees are optional — only send if filled in
                const validItems = feeLineItems.filter(item => item.label.trim() !== "" && item.amount.trim() !== "");
                if (validItems.length > 0) {
                    itemsToSend = validItems.map(item => ({
                        label: item.label.trim(),
                        amount: parseFloat(item.amount) || 0
                    }));
                }
            }

            const res = await evaluateCedulaTransaction(transaction.id, deliveryFee, remarks, itemsToSend);
            if (res.success) {
                toast.success("Evaluated Successfully");
                router.push(backUrl);
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

    const handleDeclinePaymentProof = async () => {
        if (!remarks) { toast.error("Please specify a reason for declining the payment proof."); return; }
        setActionLoading(true);
        try {
            const res = await declinePaymentProofAction(transaction.id, remarks);
            if (res.success) {
                toast.success("Payment proof declined successfully.");
                setRemarks("");
                fetchTransaction();
            } else {
                toast.error(res.error || "Failed to decline payment proof");
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrintWaybill = () => {
        window.print();
    };

    const hasVerification = !!((transaction?.paymentType === "E_PAYMENT" || transaction?.paymentType === "BANK_TRANSFER") || (transaction?.status === "DELIVERED" && transaction?.podUrl));
    const hasDispute = !!(transaction?.status?.includes("RETURN") || transaction?.status?.includes("REFUND") || transaction?.status === "DISPUTE_REJECTED");
    const isRequirementsAlone = !hasVerification && !hasDispute;


    const viewProps = {
        transaction,
        session,
        userRole,
        rawUserRole,
        isTreasuryStaff,
        isBPLOAdmin,
        isReadOnlyAide,
        backUrl,
        actionLoading,
        setActionLoading,
        remarks,
        setRemarks,
        ctcNumber,
        setCtcNumber,
        stickerNumber,
        setStickerNumber,
        isRejecting,
        setIsRejecting,
        isRequestingRevision,
        setIsRequestingRevision,
        deliveryFee,
        setDeliveryFee,
        eCopyFile,
        setECopyFile,
        eCopyPreview,
        setECopyPreview,
        orFile,
        setOrFile,
        orPreview,
        setOrPreview,
        themeColor,
        branding,
        additionalFeeLabel,
        setAdditionalFeeLabel,
        additionalFeeAmount,
        setAdditionalFeeAmount,
        showAdditionalFeeForm,
        setShowAdditionalFeeForm,
        isResolvingDispute,
        setIsResolvingDispute,
        disputeModalOpen,
        setDisputeModalOpen,
        disputeAction,
        setDisputeAction,
        showPreviousPhases,
        setShowPreviousPhases,
        feeLineItems,
        setFeeLineItems,
        fetchTransaction,
        handleEvaluate,
        handleConfirmPayment,
        handleDeclinePaymentProof,
        handlePrintWaybill,
        handleRelease,
        handleResolveDispute,
        handleAddAdditionalFee,
        handleRemoveAdditionalFee,
        handleApproveBilling,
        handleReject,
        handleRequestRevision,
        addFeeLineItem,
        removeFeeLineItem,
        updateFeeLineItem,
        safeFormatDate,
        declaredValue,
        declaredLabel,
        calcResult,
        displayTotal,
        evidenceDocs,
        steps,
        currentStepIdx,
        hasVerification,
        hasDispute,
        isRequirementsAlone
    };

    if (isBusinessPermit) {
        return <BusinessPermitView {...viewProps} />;
    }
    if (isBuildingPermit) {
        return <BuildingPermitView {...viewProps} />;
    }
    if (isLCR) {
        return <CivilRegistryView {...viewProps} />;
    }
    return <GenericServiceView {...viewProps} />;
}
