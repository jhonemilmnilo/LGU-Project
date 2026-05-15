"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator,
    Truck,
    Building2,
    CreditCard,
    MapPin,
    FileText,
    Wallet,
    Info,
    CheckCircle2,
    Home,
    Loader2,
    Camera,
    Upload,
    Check,
    XCircle,
    Activity,
    DollarSign,
    Clock,
    Download,
    ExternalLink,
    AlertCircle,
    QrCode,
    Search,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
    getTransactionById, 
    finalizeTransactionFulfillment, 
    getSystemSettingAction,
    getPublicBarangayLogistics,
    cancelTransaction,
    requestReturnOrRefund
} from "@/app/admin/transactions/actions";
import { getCedulaPenaltyRateLabel } from "@/lib/cedula";
import Link from "next/link";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Precision Map...</div>
});

export default function RequestHubPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isDisputing, setIsDisputing] = useState(false);

    // Dispute States
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [disputeType, setDisputeType] = useState<"RETURN" | "REFUND">("RETURN");
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeFile, setDisputeFile] = useState<File | null>(null);
    const [disputePreview, setDisputePreview] = useState<string | null>(null);

    // Logistics & Payment States
    const [localFulfillment, setLocalFulfillment] = useState<"PICK_UP" | "DELIVERY" | "E_COPY">("PICK_UP");
    const [localPayment, setLocalPayment] = useState("E_PAYMENT");
    const [localLat, setLocalLat] = useState<number | null>(null);
    const [localLng, setLocalLng] = useState<number | null>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);

    // Delivery Address States
    const [address, setAddress] = useState({
        houseNumber: "",
        street: "",
        sitio: "",
        purok: "",
        barangay: "",
        municipality: "",
        province: "",
        contactNumber: "",
        landmark: ""
    });

    // Treasury / Payment Details (Dynamic from settings)
    const [gcashDetails, setGcashDetails] = useState({
        qr: "",
        name: "OFFICIAL TREASURY ACCOUNT",
        number: "SCAN TO VIEW"
    });
    const [themeColor, setThemeColor] = useState("");
    const [availableBarangays, setAvailableBarangays] = useState<any[]>([]);
    const [brgySearch, setBrgySearch] = useState("");
    const [isBrgyOpen, setIsBrgyOpen] = useState(false);

    useEffect(() => {
        async function fetchRequest() {
            try {
                const res = await getTransactionById(id);
                if (res.success && res.data) {
                    const req = res.data;
                    setRequest(req);

                    // Pre-fill logic correctly
                    if (req.residentSnapshot) {
                        const r = req.residentSnapshot as any;
                        const finalAddr = (typeof req.deliveryAddress === 'string' ? JSON.parse(req.deliveryAddress || '{}') : req.deliveryAddress) || {};

                        setAddress({
                            houseNumber: finalAddr.houseNumber || r.houseNumber || "",
                            street: finalAddr.street || r.street || "",
                            sitio: finalAddr.sitio || r.sitio || "",
                            purok: finalAddr.purok || r.purok || "",
                            barangay: finalAddr.barangay || r.barangay || "",
                            municipality: finalAddr.municipality || r.municipality || "",
                            province: finalAddr.province || r.province || "",
                            contactNumber: r.contactNumber || "",
                            landmark: req.deliveryLandmark || ""
                        });

                        const lat = req.deliveryLat ? Number(req.deliveryLat) : r.latitude;
                        const lng = req.deliveryLng ? Number(req.deliveryLng) : r.longitude;

                        if (lat && lng) {
                            setLocalLat(lat);
                            setLocalLng(lng);
                        } else {
                            setLocalLat(16.026);
                            setLocalLng(120.454);
                        }
                    }

                    if (req.fulfillmentType) setLocalFulfillment(req.fulfillmentType);
                    if (req.paymentType) setLocalPayment(req.paymentType);

                } else {
                    toast.error("Request not found");
                    router.push("/user/services/requests");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error("Failed to load request details");
            }
        }

        async function fetchSettings() {
            try {
                const qrRes = await getSystemSettingAction("gcash_qr_url", "");
                const nameRes = await getSystemSettingAction("gcash_account_name", "ADMIN ACCOUNT");
                const numRes = await getSystemSettingAction("gcash_account_number", "0000 000 0000");
                const themeRes = await getSystemSettingAction("theme_color", "#2563eb");

                setGcashDetails({
                    qr: qrRes.data,
                    name: nameRes.data,
                    number: numRes.data
                });
                setThemeColor(themeRes.data);
            } catch (err) {
                console.error("Fetch settings error:", err);
            }
        }

        async function fetchLogistics() {
            try {
                const res = await getPublicBarangayLogistics();
                if (res.success) setAvailableBarangays(res.data || []);
            } catch (err) {
                console.error("Fetch logistics error:", err);
            }
        }

        async function initialize() {
            setLoading(true);
            await Promise.all([
                fetchRequest(),
                fetchSettings(),
                fetchLogistics()
            ]);
            setLoading(false);
        }

        initialize();
    }, [id, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentProofFile(file);
            setPaymentProofPreview(URL.createObjectURL(file));
        }
    };

    const handleClearPaymentProof = () => {
        setPaymentProofFile(null);
        setPaymentProofPreview(null);
    };

    // Reset payment proof when changing payment methods to maintain data consistency
    useEffect(() => {
        handleClearPaymentProof();
    }, [localPayment]);

    const handleDownloadQR = async () => {
        if (!gcashDetails.qr) return;
        try {
            const response = await fetch(gcashDetails.qr);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Mapandan_Treasury_QR_${id.slice(-6).toUpperCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("QR Code downloaded successfully.");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download QR code.");
        }
    };

    const handleFinalize = async () => {
        if ((localPayment === "E_PAYMENT" || localPayment === "BANK_TRANSFER") && !paymentProofFile) {
            toast.error("Please upload your proof of payment first.");
            return;
        }

        setIsFinalizing(true);
        try {
            const formData = new FormData();
            formData.append("transactionId", id);
            formData.append("fulfillmentType", localFulfillment);
            formData.append("paymentType", localPayment);
            formData.append("deliveryAddress", JSON.stringify(address));
            formData.append("deliveryLat", String(localLat || ""));
            formData.append("deliveryLng", String(localLng || ""));
            formData.append("deliveryLandmark", address.landmark);

            if (paymentProofFile) {
                formData.append("paymentFile", paymentProofFile);
            }

            const res = await finalizeTransactionFulfillment(formData);
            if (res.success) {
                toast.success("Logistics secured! Processing started.");
                window.location.reload();
            } else {
                toast.error(res.error || "Failed to finalize selection");
            }
        } catch (error) {
            console.error("Finalization error:", error);
            toast.error("Network error during finalization");
        } finally {
            setIsFinalizing(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this request? This action cannot be undone.")) return;
        
        setIsCancelling(true);
        try {
            const res = await cancelTransaction(id);
            if (res.success) {
                toast.success("Request cancelled successfully.");
                window.location.reload();
            } else {
                toast.error(res.error || "Failed to cancel request");
            }
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error("Network error during cancellation");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleDisputeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setDisputeFile(file);
            setDisputePreview(URL.createObjectURL(file));
        }
    };

    const handleDispute = async () => {
        if (!disputeReason) {
            toast.error("Please provide a reason for your request.");
            return;
        }

        setIsDisputing(true);
        try {
            const formData = new FormData();
            formData.append("id", id);
            formData.append("type", disputeType);
            formData.append("reason", disputeReason);
            if (disputeFile) {
                formData.append("proofFile", disputeFile);
            }

            const res = await requestReturnOrRefund(formData);
            if (res.success) {
                toast.success(`${disputeType === "RETURN" ? "Return" : "Refund"} request submitted successfully.`);
                setDisputeOpen(false);
                window.location.reload();
            } else {
                toast.error(res.error || "Failed to submit request");
            }
        } catch (error) {
            console.error("Dispute error:", error);
            toast.error("Network error during submission");
        } finally {
            setIsDisputing(false);
        }
    };

    const getStatusConfig = (status: string) => {
        if (request?.isCancelled) {
            return { label: "CANCELLED", color: "bg-red-600 text-white border-transparent shadow-red-500/20", icon: XCircle };
        }
        switch (status) {
            case "DRAFT":
                return { label: "DRAFT", color: "bg-slate-100 text-slate-600 border-slate-200", icon: FileText };
            case "FOR_REQUESTING":
                return { label: "PENDING", color: "bg-primary text-white border-transparent", icon: Clock };
            case "FOR_PROCESSING":
                return { label: "PROCESSING", color: "bg-primary text-white border-primary", icon: Activity };
            case "FOR_CLAIM":
                return { label: "FOR CLAIM", color: "bg-blue-600 text-white border-blue-600 shadow-blue-500/20", icon: Clock };
            case "EVALUATED":
                return { label: "EVALUATED", color: "bg-primary text-white border-primary shadow-primary/20", icon: DollarSign };
            case "PAID":
                return { label: "PAID", color: "bg-primary text-white border-primary shadow-primary/20", icon: Clock };
            case "FOR_PICKING":
                return { label: "FOR DELIVERY", color: "bg-amber-500 text-white border-amber-500 shadow-amber-500/20", icon: Clock };
            case "IN_ROUTE":
                return { label: "IN ROUTE", color: "bg-blue-500 text-white border-blue-500 shadow-blue-500/20", icon: Truck };
            case "DELIVERED":
                return { label: "DELIVERED", color: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20", icon: CheckCircle2 };
            case "RELEASED":
                return { label: "RELEASED", color: "bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20", icon: CheckCircle2 };
            case "REJECTED":
                return { label: "REJECTED", color: "bg-red-500 text-white border-red-500 shadow-red-500/20", icon: XCircle };
            
            // Dispute Lifecycle
            case "RETURN_REQUESTED":
                return { label: "RETURN REQUESTED", color: "bg-orange-500 text-white border-orange-500 shadow-orange-500/20", icon: Activity };
            case "REFUND_REQUESTED":
                return { label: "REFUND REQUESTED", color: "bg-orange-500 text-white border-orange-500 shadow-orange-500/20", icon: DollarSign };
            case "RETURNED":
                return { label: "RETURNED", color: "bg-slate-600 text-white border-slate-600 shadow-slate-600/20", icon: Package };
            case "REFUNDED":
                return { label: "REFUNDED", color: "bg-slate-600 text-white border-slate-600 shadow-slate-600/20", icon: DollarSign };
            case "DISPUTE_REJECTED":
                return { label: "DISPUTE REJECTED", color: "bg-red-600 text-white border-red-600 shadow-red-600/20", icon: XCircle };
                
            default:
                return { label: status.replace(/_/g, " "), color: "bg-slate-900 text-white border-slate-900", icon: Clock };
        }
    };

    const additionalData = request?.additionalData || {};
    const residentData = request?.residentSnapshot || {};
    const statusConfig = request ? getStatusConfig(request.status) : null;
    const isActionable = request?.status === "EVALUATED" && !request.paymentType;

    const computation = useMemo(() => {
        if (!request) return null;
        const fiscal = request.fiscalSnapshot as any;
        const addData = request.additionalData || {};
        
        const selectedBrgy = availableBarangays.find(b => b.name === address.barangay);
        const dFee = localFulfillment === "DELIVERY" 
            ? (selectedBrgy?.deliveryFee ?? request.type?.deliveryFee ?? 0) 
            : 0;
            
        const cedulaType = (addData.applicantType === "JURIDICAL" || addData.applicantType === "COMPANY") ? "JURIDICAL" : "INDIVIDUAL";

        // If snapshot exists (evaluated), use it. Otherwise, calculate on fly (pre-evaluation)
        if (fiscal) {
            return {
                basicTax: fiscal.basicTax,
                additionalTax: fiscal.additionalTax,
                penaltyAmount: fiscal.penaltyCharge,
                deliveryFee: dFee,
                finalTotal: fiscal.totalAmount + dFee,
                cedulaType
            };
        }

        const income = addData.income || 0;
        const propertyValue = addData.propertyValue || 0;
        const totalBasis = income + propertyValue;
        const basicTax = cedulaType === "JURIDICAL" ? 500.00 : 5.00;
        const additionalTax = cedulaType === "JURIDICAL"
            ? Math.floor(totalBasis / 5000) * 2.00
            : Math.floor(totalBasis / 1000) * 1.00;

        const subtotal = basicTax + additionalTax;
        const totalWithPenalty = Number(request.totalAmount) || subtotal;
        const penaltyAmount = totalWithPenalty - subtotal;
        const finalTotal = totalWithPenalty + dFee;

        return { basicTax, additionalTax, penaltyAmount, deliveryFee: dFee, finalTotal, cedulaType };
    }, [request, localFulfillment, address.barangay, availableBarangays]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Initializing Request Hub...</p>
            </div>
        );
    }

    return (
        <div 
            className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-12 pb-32"
            style={{ "--primary-theme": themeColor } as React.CSSProperties}
        >
            {/* Nav & Header */}
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList className="bg-white/40 dark:bg-black/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/20 dark:border-white/5 w-fit shadow-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary transition-colors italic">
                                    <Home className="w-3.5 h-3.5 mb-0.5" /> Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/services/requests" className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary transition-colors italic border-b border-transparent hover:border-primary/30">
                                    My Requests
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">
                                {isActionable ? "Provisioning" : "Status Tracker"}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                {request.type?.name || "Service Request"}
                            </h1>
                            <div className="flex items-center gap-3 ml-2">
                                <Badge 
                                    className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest italic rounded-full border shadow-lg")}
                                    style={{ 
                                        backgroundColor: statusConfig?.color.includes("bg-primary") ? themeColor : undefined,
                                        borderColor: statusConfig?.color.includes("bg-primary") ? themeColor : undefined,
                                        color: statusConfig?.color.includes("bg-primary") ? "white" : undefined
                                    }}
                                >
                                    {statusConfig?.label}
                                </Badge>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] italic opacity-70">
                                    Official Record ID: {request.id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>

                        {/* Cancellation Trigger */}
                        {!request.isCancelled && !["FOR_PROCESSING", "EVALUATED", "FOR_CLAIM", "FOR_PICKING", "IN_ROUTE", "DELIVERED", "UNPAID", "PAID", "RELEASED", "REJECTED"].includes(request.status) && (
                            <Button 
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="h-12 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 group border-none"
                            >
                                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                Cancel Request
                            </Button>
                        )}
                    </div>
            </div>

            {isActionable && !request.isCancelled ? (
                /* Actionable View: Logistics & Payment */
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-5 space-y-8 xl:sticky xl:top-8 h-fit">
                        <Card className="p-8 sm:p-10 border-none bg-slate-950 text-white shadow-[0_40px_100px_-15px_rgba(0,0,0,0.4)] rounded-[3rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-12 opacity-10">
                                <Calculator className="w-48 h-48 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                            </div>
                            <div className="relative z-10 space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic flex items-center gap-3">
                                        <Calculator className="w-4 h-4 text-primary" />
                                        Treasury Final Assessment
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                                        Admin evaluation complete. Review the breakdown to proceed.
                                    </p>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center group/item pb-4 border-b border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Initial Request Amount</span>
                                        <span className="text-2xl font-black italic tracking-tighter">₱{(additionalData.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center group/item pb-4 border-b border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Basic Tax ({computation?.cedulaType})</span>
                                        <span className="text-2xl font-black italic tracking-tighter">₱{computation?.basicTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center group/item pb-4 border-b border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Financial Additional Tax</span>
                                        <span className="text-2xl font-black italic tracking-tighter">₱{computation?.additionalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {computation && computation.penaltyAmount > 0 && (
                                        <div className="flex justify-between items-center group/item pb-4 border-b border-white/5 text-orange-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                                Penalty charge ({getCedulaPenaltyRateLabel()} INT.)
                                                <TooltipProvider delayDuration={0}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button type="button" className="cursor-help transition-transform hover:scale-110 active:scale-95">
                                                                <AlertCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-slate-900 text-white border-slate-800 p-4 rounded-xl shadow-2xl max-w-[280px]">
                                                            <div className="space-y-2">
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-500 italic">Penalty Rule</h4>
                                                                <p className="text-[9px] font-medium leading-relaxed uppercase tracking-tighter">
                                                                    Starting March 1st, a 2% monthly interest is imposed on the unpaid community tax, increasing by 2% each month up to a maximum of 24%.
                                                                </p>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </span>
                                            <span className="text-2xl font-black italic tracking-tighter">₱{computation.penaltyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    {localFulfillment === "DELIVERY" && (
                                        <div className="flex justify-between items-center pb-4 border-b border-white/5 text-emerald-400">
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Delivery Fee</span>
                                            <span className="text-2xl font-black italic tracking-tighter">₱{computation?.deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[12px] font-black uppercase text-emerald-400 tracking-[0.3em] italic">Total</p>
                                            <p className="text-[9px] font-bold text-white/20 uppercase italic">Payable via selected channel</p>
                                        </div>
                                        <span className="text-6xl font-black italic tracking-tighter text-white">₱{computation?.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="xl:col-span-7 space-y-10">
                        <div className="bg-white dark:bg-[#0d0f14] rounded-[3rem] border border-slate-200 dark:border-white/5 p-8 md:p-12 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_-15px_rgba(0,0,0,0.4)] relative overflow-hidden group/container">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0001_1px,transparent_1px),linear-gradient(to_bottom,#0001_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
                            <div className="relative z-10 space-y-12">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Logistics <span className="text-primary">Configuration</span></h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic">Select deployment strategy</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            { id: "PICK_UP", label: "Office Pickup", icon: Building2 },
                                            { id: "DELIVERY", label: " Delivery", icon: Truck }
                                        ].map(opt => (
                                            <button key={opt.id} onClick={() => {
                                                setLocalFulfillment(opt.id as any);
                                                if (opt.id === "PICK_UP") setLocalPayment("CASH");
                                                else setLocalPayment("E_PAYMENT");
                                            }} className={cn("flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all group select-none active:scale-[0.95] text-center relative", localFulfillment === opt.id ? "bg-primary text-white border-primary shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.4)] scale-[1.02]" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-md hover:border-primary/40 hover:shadow-xl")}>
                                                <opt.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                                <span className="block text-[10px] font-black uppercase tracking-widest italic">{opt.label}</span>
                                                {localFulfillment === opt.id && <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-950"><Check className="w-3 h-3 text-white" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {localFulfillment === "DELIVERY" && (
                                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10 pt-10 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-emerald-500" /></div><Label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Delivery Manifest</Label></div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Building / House #</Label><Input value={address.houseNumber} onChange={e => setAddress(p => ({ ...p, houseNumber: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Street Lane</Label><Input value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Sitio</Label><Input value={address.sitio} onChange={e => setAddress(p => ({ ...p, sitio: e.target.value }))} placeholder="Optional" className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Purok</Label><Input value={address.purok} onChange={e => setAddress(p => ({ ...p, purok: e.target.value }))} placeholder="Optional" className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                                <div className="space-y-3 relative">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Barangay</Label>
                                                    <div className="relative">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setIsBrgyOpen(!isBrgyOpen)}
                                                            className="h-12 w-full px-5 bg-white dark:bg-black/20 border-2 border-transparent focus:border-primary/30 rounded-xl font-bold italic text-left flex items-center justify-between group transition-all"
                                                        >
                                                            <span className={cn(address.barangay ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                                                                {address.barangay || "Select Registered Barangay"}
                                                            </span>
                                                            <Search className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                        </button>

                                                        <AnimatePresence>
                                                            {isBrgyOpen && (
                                                                <>
                                                                    {/* Invisible Overlay to close on click outside */}
                                                                    <div 
                                                                        className="fixed inset-0 z-[60]" 
                                                                        onClick={() => setIsBrgyOpen(false)} 
                                                                    />
                                                                    <motion.div 
                                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                        className="absolute top-14 left-0 right-0 bg-white dark:bg-[#12141a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden backdrop-blur-xl"
                                                                    >
                                                                        <div className="p-3 border-b border-slate-100 dark:border-white/5">
                                                                            <div className="relative">
                                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                                                <Input 
                                                                                    placeholder="Search barangay..."
                                                                                    value={brgySearch}
                                                                                    onChange={(e) => setBrgySearch(e.target.value)}
                                                                                    className="h-9 pl-9 text-[11px] font-bold italic bg-slate-50 dark:bg-black/20 border-transparent rounded-lg"
                                                                                    autoFocus
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                                                                            {availableBarangays
                                                                                .filter(b => b.name.toLowerCase().includes(brgySearch.toLowerCase()))
                                                                                .map(b => (
                                                                                    <button
                                                                                        key={b.name}
                                                                                        onClick={() => {
                                                                                            setAddress(p => ({ ...p, barangay: b.name }));
                                                                                            setIsBrgyOpen(false);
                                                                                            setBrgySearch("");
                                                                                        }}
                                                                                        className={cn(
                                                                                            "w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase italic tracking-widest transition-all",
                                                                                            address.barangay === b.name 
                                                                                                ? "bg-primary text-white" 
                                                                                                : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                                                                                        )}
                                                                                    >
                                                                                        {b.name}
                                                                                    </button>
                                                                                ))
                                                                            }
                                                                            {availableBarangays.filter(b => b.name.toLowerCase().includes(brgySearch.toLowerCase())).length === 0 && (
                                                                                <div className="p-8 text-center">
                                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">No results found</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Municipality / City</Label><Input value={address.municipality} onChange={e => setAddress(p => ({ ...p, municipality: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Province</Label><Input value={address.province} onChange={e => setAddress(p => ({ ...p, province: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                                <div className="lg:col-span-2 space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Landmark / Instructions</Label><Input value={address.landmark} onChange={e => setAddress(p => ({ ...p, landmark: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
                                            </div>
                                            <div className="space-y-4">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Precision Destination Pin</Label>
                                                <div className="h-[300px] w-full rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 relative group shadow-inner">
                                                    <LocationPicker lat={localLat} lng={localLng} onChange={(lat, lng) => { setLocalLat(lat); setLocalLng(lng); }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20"><CreditCard className="w-6 h-6" /></div>
                                        <div><h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Payment <span className="text-primary italic">Method</span></h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic mt-1">Select secure payment channel</p></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(localFulfillment === "E_COPY" ? [
                                            { id: "E_PAYMENT", label: "GCash (Scan & Pay)", icon: CreditCard },
                                            { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 }
                                        ] : localFulfillment === "PICK_UP" ? [
                                            { id: "CASH", label: "Cash on Counter", icon: Wallet },
                                            { id: "E_PAYMENT", label: "GCash (Scan & Pay)", icon: CreditCard },
                                            { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 }
                                        ] : [
                                            { id: "E_PAYMENT", label: "GCash (Scan & Pay)", icon: CreditCard },
                                            { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2 }
                                        ]).map(opt => (
                                            <button key={opt.id} onClick={() => setLocalPayment(opt.id as any)} className={cn("flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all group select-none active:scale-[0.98] text-left relative", localPayment === opt.id ? "bg-slate-900 text-white border-slate-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 shadow-md hover:border-primary/40 hover:shadow-xl")}>
                                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", localPayment === opt.id ? "bg-primary text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400")}><opt.icon className="w-6 h-6" /></div>
                                                <span className="block text-[11px] font-black uppercase tracking-widest italic">{opt.label}</span>
                                                {localPayment === opt.id && <div className="absolute top-1/2 -translate-y-1/2 right-6"><CheckCircle2 className="w-6 h-6 text-primary" /></div>}
                                            </button>
                                        ))}
                                    </div>

                                    {(localPayment === "E_PAYMENT" || localPayment === "BANK_TRANSFER") && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            {/* GCash / Manual Payment Instruction Card */}
                                            {localPayment === "E_PAYMENT" && (
                                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group/qr shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)]">
                                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/qr:opacity-10 transition-opacity">
                                                    <QrCode className="w-48 h-48 rotate-12" />
                                                </div>
                                                
                                                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                                    <div className="space-y-6">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Manual Payment Instruction</h4>
                                                            </div>
                                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Scan to <span className="text-primary italic">Settle Payment</span></h3>
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-black italic text-[10px]">01</div>
                                                                <p className="text-[11px] font-medium opacity-70 leading-relaxed uppercase tracking-tight">Scan the QR code or send amount to our official GCash / Bank details.</p>
                                                            </div>
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-black italic text-[10px]">02</div>
                                                                <p className="text-[11px] font-medium opacity-70 leading-relaxed uppercase tracking-tight">Take a screenshot or save the transaction receipt as <span className="text-primary">Proof of Payment</span>.</p>
                                                            </div>
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-black italic text-[10px]">03</div>
                                                                <p className="text-[11px] font-medium opacity-70 leading-relaxed uppercase tracking-tight">Upload the receipt below and click <span className="text-primary italic">&quot;Secure Application&quot;</span> to finalize.</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative group/img cursor-zoom-in">
                                                            <div className="w-40 h-40 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                                                                {gcashDetails.qr ? (
                                                                    <Image 
                                                                        src={gcashDetails.qr} 
                                                                        alt="Official GCash QR" 
                                                                        width={160} 
                                                                        height={160} 
                                                                        className="object-contain"
                                                                    />
                                                                ) : (
                                                                    <Image 
                                                                        src="/branding/gcash_qr_sample.png" 
                                                                        alt="Placeholder QR" 
                                                                        width={160} 
                                                                        height={160} 
                                                                        className="object-contain opacity-20 grayscale"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-[2rem] flex flex-col items-center justify-center gap-3">
                                                                <Search className="w-8 h-8 text-white drop-shadow-lg" />
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }} 
                                                                    className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                                                >
                                                                    <Download className="w-3 h-3 text-primary" /> Save Image
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">{gcashDetails.name}</p>
                                                            <p className="text-[9px] font-bold text-white/40 uppercase italic tracking-tighter">{gcashDetails.number}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                            <div className="p-5 bg-slate-50 dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-4">
                                                <div className="flex items-center gap-3 px-1"><Camera className="w-4 h-4 text-primary" /><Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Proof of Transaction Upload</Label></div>
                                            <div className="w-full">
                                                <div className="w-full aspect-[25/7] bg-white dark:bg-black rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group shadow-lg transition-all">
                                                    {paymentProofPreview ? (
                                                        <>
                                                            <Image src={paymentProofPreview} alt="Proof" fill className="object-cover" />
                                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3 flex items-center justify-center gap-4 backdrop-blur-md border-t border-white/10 rounded-b-[1.9rem]">
                                                                <div className="relative">
                                                                    <Button variant="secondary" size="sm" className="h-8 px-4 font-black italic uppercase text-[9px] tracking-widest rounded-xl bg-white text-slate-900 pointer-events-none">
                                                                        <Camera className="w-3 h-3 mr-2 text-primary" /> Change
                                                                    </Button>
                                                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                                </div>
                                                                <Button onClick={(e) => { e.stopPropagation(); handleClearPaymentProof(); }} variant="destructive" size="sm" className="h-8 px-4 font-black italic uppercase text-[9px] tracking-widest rounded-xl bg-red-600 hover:bg-red-700">
                                                                    <XCircle className="w-3 h-3 mr-2" /> Remove
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="relative w-full h-full flex items-center justify-center cursor-pointer group/upload">
                                                            <div className="text-center p-4">
                                                                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover/upload:bg-primary/20 transition-colors">
                                                                    <Upload className="w-5 h-5 text-primary" />
                                                                </div>
                                                                <p className="text-[9px] font-black uppercase text-slate-400 italic tracking-[0.2em] group-hover/upload:text-primary transition-colors">Upload Receipt Snapshot</p>
                                                            </div>
                                                            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </div>

                            <div className="mt-16 pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div><div className="text-left"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 italic leading-none">Ready for Issuance</p><p className="text-[9px] font-bold text-slate-400 uppercase italic mt-1 opacity-60">Verified Admin Evaluation</p></div></div>
                                <Button 
                                    onClick={handleFinalize} 
                                    disabled={isFinalizing || ((localPayment === "E_PAYMENT" || localPayment === "BANK_TRANSFER") && !paymentProofFile)} 
                                    className="w-full sm:w-[300px] h-16 bg-primary hover:opacity-90 text-white rounded-[1.5rem] shadow-2xl shadow-primary/20 text-xs font-black uppercase tracking-[0.3em] italic transition-all active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {isFinalizing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Secure Application"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Lifecycle Hub View: Detailed Tracking & Records */
                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl h-auto sm:h-16 w-full sm:w-fit border border-slate-200 dark:border-white/5 shadow-md">
                        <TabsTrigger value="overview" className="flex-1 sm:flex-none rounded-xl px-12 py-3 sm:py-0 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-md">Overview</TabsTrigger>
                        <TabsTrigger value="records" className="flex-1 sm:flex-none rounded-xl px-12 py-3 sm:py-0 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-md">Records</TabsTrigger>
                        <TabsTrigger value="logistics" className="flex-1 sm:flex-none rounded-xl px-12 py-3 sm:py-0 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-md">Logistics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <Card className="p-10 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] rounded-3xl lg:col-span-2">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-3 italic"><FileText className="w-5 h-5 text-primary" /> Application Summary</h3>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Last Update: {format(new Date(request.updatedAt), "MMM d, HH:mm")}</span></div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10">
                                    <div className="space-y-2"><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic">Applicant Status</p><p className="text-2xl font-black text-slate-900 dark:text-white italic">{additionalData.applicantType}</p></div>
                                    <div className="space-y-2"><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic">Submission Date</p><p className="text-2xl font-black text-slate-900 dark:text-white italic">{format(new Date(request.createdAt), "MMMM d, yyyy")}</p></div>
                                    <div className="space-y-2"><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic">Fulfillment Phase</p><p className="text-2xl font-black text-slate-900 dark:text-white italic flex items-center gap-2">{request.fulfillmentType?.replace(/_/g, " ") || "PENDING EVALUATION"}</p></div>
                                    <div className="space-y-2"><p className="text-[10px] uppercase font-black text-slate-400 tracking-widest italic">Payment Method</p><p className="text-2xl font-black text-primary italic uppercase">{request.paymentType?.replace(/_/g, " ") || "PENDING ASSESSMENT"}</p></div>
                                </div>
                            </Card>

                            <Card className="p-10 border-none bg-slate-900 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] rounded-[3rem] relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Info className="w-24 h-24 rotate-12" /></div>
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic mb-10">Admin Assessment</h3>
                                    <p className="text-lg font-bold italic opacity-90 leading-relaxed">
                                        &quot;{(request.status === "RELEASED" || request.status === "DELIVERED")
                                            ? "Registry Process Complete. Thank you for utilizing Mapandan's digital governance portal. Your official records have been successfully finalized, verified, and archived for your use."
                                            : (request.rejectionRemarks || `Standard professional assessment concludes within ${request.type?.slaDays || 3} business days. Our team is currently validating your documentary evidence for final issuance.`)}&quot;
                                    </p>
                                </div>
                                <div className="space-y-4 pt-10"><Separator className="bg-white/10" /><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-widest text-primary/50 italic">Evaluated Amount</p><p className="text-3xl font-black text-primary italic">₱{(request.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div></div></div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="records" className="mt-0">
                        <Card className="p-8 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-3xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="space-y-12">
                                    <div className="space-y-6"><h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-4 border-primary pl-4">Personal Identity</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-400">Legal Name</p><p className="text-lg font-bold">{residentData.firstName} {residentData.lastName}</p></div>
                                            <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-400">Citizenship</p><p className="text-lg font-bold">{residentData.citizenship || "Filipino"}</p></div>
                                            <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-400">Birth Date</p><p className="text-lg font-bold">{format(new Date(residentData.dateOfBirth), "MMM d, yyyy")}</p></div>
                                            <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-400">Civil Status</p><p className="text-lg font-bold">{residentData.civilStatus || "Single"}</p></div>
                                        </div>
                                    </div>
                                    <div className="space-y-6"><h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-4 border-primary pl-4">Financial Declarations</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-400">Annual Gross Income</p><p className="text-xl font-black text-slate-900 dark:text-white">₱{(additionalData.income || 0).toLocaleString()}</p></div>
                                            {request.cedula?.expiryDate && (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-black text-slate-400">Validity Protocol</p>
                                                    <p className="text-xl font-black italic flex items-center gap-2" style={{ color: themeColor }}>
                                                        <Clock className="w-4 h-4" /> Expires {format(new Date(request.cedula.expiryDate), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8"><h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-4 border-primary pl-4">Resident Hub Address</h4>
                                    <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 relative">
                                        <MapPin className="absolute top-8 right-8 w-12 h-12 text-primary/10" />
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6"><div><p className="text-[10px] uppercase font-black text-slate-400">H# / Street</p><p className="text-md font-bold">{residentData.houseNumber} {residentData.street}</p></div><div><p className="text-[10px] uppercase font-black text-slate-400">Sitio / Purok</p><p className="text-md font-bold">{residentData.sitio} {residentData.purok}</p></div></div>
                                            <div><p className="text-[10px] uppercase font-black text-slate-400">Barangay</p><p className="text-md font-bold">{residentData.barangay}</p></div>
                                            <div className="grid grid-cols-2 gap-6"><div><p className="text-[10px] uppercase font-black text-slate-400">Municipality</p><p className="text-md font-bold">{residentData.municipality || "Agno"}</p></div><div><p className="text-[10px] uppercase font-black text-slate-400">Province</p><p className="text-md font-bold">{residentData.province || "Pangasinan"}</p></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="logistics" className="mt-0">
                        <div className="grid grid-cols-1 items-start">

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic px-4">Documentary Clearance</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { label: "Government State ID", url: additionalData.validIdUrl },
                                        { label: "Income Evidence / Assets", url: additionalData.proofOfIncomeUrl }
                                    ].map((doc, i) => (
                                        doc.url ? (
                                            <a 
                                                key={i} 
                                                href={doc.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="relative aspect-[3/4] rounded-2xl border-2 border-slate-100 dark:border-white/5 overflow-hidden group/doc hover:scale-[1.02] transition-all shadow-sm block"
                                            >
                                                <Image src={doc.url} alt={doc.label} fill className="object-cover transition-transform group-hover/doc:scale-110 duration-700" unoptimized />
                                                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover/doc:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                        <ExternalLink className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <Badge className="text-[7px] bg-white/95 dark:bg-slate-950/95 text-slate-900 dark:text-white border-none font-black italic tracking-widest uppercase w-full block text-center py-0.5 truncate shadow-sm">
                                                        {doc.label}
                                                    </Badge>
                                                </div>
                                            </a>
                                        ) : (
                                            <div key={i} className="relative aspect-[3/4] rounded-2xl border-2 border-slate-100 dark:border-white/5 overflow-hidden bg-slate-50 dark:bg-white/5 flex flex-col items-center justify-center text-slate-200">
                                                <XCircle className="w-8 h-8 mb-1 opacity-50" />
                                                <p className="text-[7px] font-black uppercase text-slate-300 italic">Not Required</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {(request.status === "RELEASED" || request.status === "DELIVERED") && (request.eCopyUrl || request.cedula?.documentUrl) && (
                                    <div className="bg-slate-900 dark:bg-[#0d1117] p-8 md:p-10 rounded-[2.5rem] text-white space-y-8 shadow-2xl border border-white/5 animate-in slide-in-from-right-8 duration-700">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><Download className="w-5 h-5 text-white" /></div>
                                            <div>
                                                <p className="text-[8px] font-black uppercase text-primary tracking-widest italic opacity-70">E-Copy</p>
                                                <p className="text-xs font-bold italic tracking-tight">Your official document is stored here.</p>
                                            </div>
                                        </div>
                                        <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest text-[9px] rounded-xl group">
                                            <a href={request.eCopyUrl || request.cedula?.documentUrl} target="_blank" rel="noopener noreferrer">
                                                Download Official Record <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </div>
                                )}

                                {request.status === "DELIVERED" && request.podUrl && (
                                    <div className="bg-emerald-500/5 p-8 md:p-10 rounded-[2.5rem] border border-emerald-500/20 space-y-8 animate-in slide-in-from-right-8 duration-700 delay-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                    <Camera className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-emerald-500 tracking-widest italic opacity-70">Delivery Validation</p>
                                                    <p className="text-xs font-bold italic tracking-tight text-slate-900 dark:text-white">Proof of Delivery (POD)</p>
                                                </div>
                                            </div>
                                            
                                            {/* Return/Refund Trigger */}
                                            <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" className="h-10 px-4 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Return or Refund
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md bg-white dark:bg-slate-950 border-none rounded-[2rem] shadow-2xl p-8">
                                                    <DialogHeader className="space-y-4">
                                                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                                                            Dispute <span className="text-orange-500">Resolution</span>
                                                        </DialogTitle>
                                                        <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                                                            Submit a formal request for document issues
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="space-y-8 py-6">
                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Resolution Type</Label>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {["RETURN", "REFUND"].map((type) => (
                                                                    <button
                                                                        key={type}
                                                                        onClick={() => setDisputeType(type as any)}
                                                                        className={cn(
                                                                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border-2",
                                                                            disputeType === type 
                                                                                ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" 
                                                                                : "bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-white/10"
                                                                        )}
                                                                    >
                                                                        {type}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Reason for Request</Label>
                                                            <Textarea 
                                                                placeholder="Please describe the issue in detail (e.g., Damaged, Incorrect Details, etc.)"
                                                                className="min-h-[120px] bg-slate-50 dark:bg-white/5 border-none rounded-2xl font-bold italic text-sm p-5 focus:ring-2 focus:ring-orange-500/20"
                                                                value={disputeReason}
                                                                onChange={(e) => setDisputeReason(e.target.value)}
                                                            />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Proof of Issue (Image)</Label>
                                                            <div className="w-full aspect-[16/9] bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                                                                {disputePreview ? (
                                                                    <>
                                                                        <Image src={disputePreview} alt="Dispute Proof" fill className="object-cover" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                            <Button variant="secondary" size="sm" className="h-8 px-4 font-black italic uppercase text-[9px] tracking-widest rounded-xl relative overflow-hidden">
                                                                                <Camera className="w-3 h-3 mr-2" /> Change Photo
                                                                                <input type="file" onChange={handleDisputeFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                                            </Button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                                                        <Upload className="w-6 h-6 text-slate-300 mb-2" />
                                                                        <p className="text-[9px] font-black uppercase text-slate-400 italic">Upload Photo Evidence</p>
                                                                        <input type="file" onChange={handleDisputeFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <DialogFooter>
                                                        <Button 
                                                            onClick={handleDispute} 
                                                            disabled={isDisputing || !disputeReason}
                                                            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/20 text-[10px] font-black uppercase tracking-widest italic transition-all active:scale-95 flex items-center gap-2"
                                                        >
                                                            {isDisputing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            Submit Dispute Request
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                        <Button asChild variant="outline" className="w-full h-12 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black italic uppercase tracking-widest text-[9px] rounded-xl hover:bg-emerald-500/10 transition-all group">
                                            <a href={request.podUrl} target="_blank" rel="noopener noreferrer">
                                                View Delivery Snapshot <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
