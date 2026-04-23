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
    Search
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
import { getTransactionById, finalizeTransactionFulfillment, getSystemSettingAction } from "@/app/admin/transactions/actions";
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

    // Logistics & Payment States
    const [localFulfillment, setLocalFulfillment] = useState<"PICK_UP" | "DELIVERY" | "E_COPY">("PICK_UP");
    const [localPayment, setLocalPayment] = useState("CASH");
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
    const [themeColor, setThemeColor] = useState("#2563eb");

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
            } finally {
                setLoading(false);
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

        fetchRequest();
        fetchSettings();
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

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "DRAFT":
                return { label: "DRAFT", color: "bg-slate-100 text-slate-600 border-slate-200", icon: FileText };
            case "FOR_REQUESTING":
                return { label: "PENDING", color: "bg-primary text-white border-transparent", icon: Clock };
            case "FOR_PROCESSING":
                return { label: "PROCESSING", color: "bg-primary text-white border-primary", icon: Activity };
            case "FOR_CLAIM":
                return { label: "FOR CLAIM", color: "bg-blue-600 text-white border-blue-600", icon: Clock };
            case "EVALUATED":
                return { label: "EVALUATED", color: "bg-primary text-white border-primary", icon: DollarSign };
            case "PAID":
                return { label: "PAID", color: "bg-primary text-white border-primary", icon: Clock };
            case "RELEASED":
                return { label: "RELEASED", color: "bg-emerald-500 text-white border-emerald-500", icon: CheckCircle2 };
            case "REJECTED":
                return { label: "REJECTED", color: "bg-red-500 text-white border-red-500", icon: XCircle };
            default:
                return { label: status, color: "bg-slate-900 text-white border-slate-900", icon: Clock };
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
        const dFee = localFulfillment === "DELIVERY" ? (request.type?.deliveryFee || 0) : 0;
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
    }, [request, localFulfillment]);

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
                </div>
            </div>

            {isActionable ? (
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
                                            <span className="text-[10px] font-black uppercase tracking-widest italic">Logistics Service Fee</span>
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
                                            // { id: "E_COPY", label: "Digital E-Copy", icon: FileText },
                                            { id: "PICK_UP", label: "Office Pickup", icon: Building2 },
                                            { id: "DELIVERY", label: "Premium Delivery", icon: Truck }
                                        ].map(opt => (
                                            <button key={opt.id} onClick={() => {
                                                setLocalFulfillment(opt.id as any);
                                                if (opt.id === "PICK_UP") setLocalPayment("CASH");
                                                else if (opt.id === "E_COPY") setLocalPayment("E_PAYMENT");
                                                else setLocalPayment("CASH_ON_DELIVERY");
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
                                                <div className="space-y-3"><Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Barangay</Label><Input value={address.barangay} onChange={e => setAddress(p => ({ ...p, barangay: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" /></div>
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
                                            { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Truck },
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
                                        &quot;{request.status === "RELEASED"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                            {/* Fulfillment Strategy & Action */}
                            <Card className={cn(
                                "p-8 border-slate-200 dark:border-white/5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] relative overflow-hidden group",
                                request.status === "RELEASED" ? "bg-primary/5 dark:bg-primary/10 border-primary/20" : "bg-white dark:bg-slate-950/50"
                            )}>
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Truck className="w-32 h-32 rotate-12" />
                                </div>

                                <div className="relative z-10 space-y-8">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Service Deployment Strategy</h4>

                                    {request.fulfillmentType ? (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-6 p-6 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                                                    {request.fulfillmentType === "E_COPY" ? <FileText className="w-8 h-8" /> : <Truck className="w-8 h-8" />}
                                                </div>
                                                <div>
                                                    <h5 className="font-black uppercase tracking-widest text-lg leading-none italic">{request.fulfillmentType.replace("_", " ")}</h5>
                                                    <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest mt-1">Confirmed Mode</p>
                                                </div>
                                            </div>

                                            {request.fulfillmentType === "DELIVERY" && (
                                                <div className="space-y-4 pt-4">
                                                    <p className="text-[9px] uppercase font-black text-slate-400 italic tracking-[0.2em]">Deployment Destination</p>
                                                    <div className="flex items-start gap-3">
                                                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                                                            {(() => {
                                                                const addr = typeof request.deliveryAddress === 'string' ? JSON.parse(request.deliveryAddress || '{}') : request.deliveryAddress;
                                                                if (!addr) return residentData.barangay ? `${residentData.houseNumber || ""} ${residentData.street || ""}, ${residentData.barangay}, ${residentData.municipality}, ${residentData.province}` : "N/A";
                                                                return `${addr.houseNumber || ""} ${addr.street || ""}, ${addr.sitio ? `Sitio ${addr.sitio}, ` : ""}${addr.purok ? `Purok ${addr.purok}, ` : ""}${addr.barangay}, ${addr.municipality}, ${addr.province}`.trim().replace(/^,/, "").replace(/ ,/, " ");
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* LOGISTICS PROOF (For Delivery) */}
                                            {request.status === "RELEASED" && request.fulfillmentType === "DELIVERY" && request.deliveryProofUrl && (
                                                <div className="pt-6">
                                                    <div className="space-y-4">
                                                        <p className="text-[9px] uppercase font-black text-emerald-500 italic tracking-[0.2em]">Logistics Completion Evidence</p>
                                                        <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden border-4 border-white dark:border-white/5 shadow-2xl group/img">
                                                            <Image
                                                                src={request.deliveryProofUrl}
                                                                alt="Delivery Proof"
                                                                fill
                                                                className="object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                                unoptimized
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <a href={request.deliveryProofUrl} target="_blank" className="bg-white text-[9px] font-black uppercase text-slate-900 px-6 py-2.5 rounded-xl shadow-xl hover:scale-105 transition-all">Inspect Proof</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {request.status === "FOR_CLAIM" && (
                                                <div className="pt-6 animate-in slide-in-from-bottom-4 duration-500">
                                                    <div className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-[2rem] p-8 space-y-6 relative overflow-hidden group/claim">
                                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/claim:opacity-10 transition-opacity">
                                                            <Wallet className="w-24 h-24 rotate-12" />
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                                <Clock className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black italic uppercase tracking-widest text-primary">Ready for Claiming</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 italic uppercase">Visit the Treasury Office</p>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                                                                <p className="text-[9px] font-black uppercase text-slate-400 italic">Total Amount Due</p>
                                                                <p className="text-3xl font-black italic text-primary tracking-tighter">₱{request.totalAmount?.toLocaleString()}</p>
                                                            </div>

                                                            <div className="flex items-start gap-3 px-2">
                                                                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                                    Your request is ready for claim! Please make sure to bring a <span className="text-primary font-black">valid ID</span> and the <span className="text-primary font-black text-xs">exact amount</span> for your payment.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2">
                                                            <div className="flex items-center justify-between text-[8px] font-black uppercase italic text-slate-400 tracking-[0.2em]">
                                                                <span>Ref: {id.slice(-8).toUpperCase()}</span>
                                                                <span>LGU Mapandan</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-800 mx-auto border border-dashed border-slate-200">
                                                <Clock className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em]">Configuration Pending</p>
                                                <p className="text-[9px] font-bold text-slate-400/60 uppercase italic">Awaiting Administrative Evaluation</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card className="p-8 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] flex flex-col">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-8">Documentary Clearance Vault</h4>
                                <div className="grid grid-cols-2 gap-6 flex-1">
                                    {[
                                        { label: "Government State ID", url: additionalData.validIdUrl },
                                        { label: "Income Evidence / Assets", url: additionalData.proofOfIncomeUrl }
                                    ].map((doc, i) => (
                                        <div key={i} className="relative aspect-video rounded-3xl border-2 border-slate-100 dark:border-white/5 overflow-hidden group/doc">
                                            {doc.url ? <>
                                                <Image src={doc.url} alt={doc.label} fill className="object-cover transition-transform group-hover/doc:scale-110 duration-700" unoptimized />
                                                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center opacity-0 group-hover/doc:opacity-100 transition-opacity p-6 text-center">
                                                    <p className="text-[8px] font-black uppercase text-primary mb-2 italic">Stored Evidence</p>
                                                    <a href={doc.url} target="_blank" className="text-[9px] font-black uppercase text-white bg-white/10 hover:bg-primary px-5 py-2.5 rounded-xl italic shadow-lg border border-white/20 transition-all">Inspect File</a>
                                                </div>
                                                <div className="absolute top-4 left-4"><Badge className="text-[8px] bg-white/90 dark:bg-slate-950/90 text-slate-900 dark:text-white border-none font-black italic tracking-widest">{doc.label}</Badge></div>
                                            </> : (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-200 bg-slate-50 dark:bg-white/5">
                                                    <XCircle className="w-10 h-10 mb-2 opacity-50" />
                                                    <p className="text-[8px] font-black uppercase text-slate-300 italic">Not Required</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-8">
                                    {(request.status === "RELEASED" || request.status === "FOR_CLAIM") && (request.eCopyUrl || request.cedula?.documentUrl) && (
                                        <div className="bg-slate-900 dark:bg-black p-8 rounded-[2rem] text-white space-y-6 shadow-xl animate-in zoom-in-95 duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center"><Download className="w-5 h-5 text-white" /></div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase text-primary tracking-widest italic opacity-70">Electronic Registry</p>
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

                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                                        <p className="text-[9px] font-black uppercase italic text-slate-400">Authenticated Records Vault</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
