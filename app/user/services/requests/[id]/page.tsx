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
    ChevronRight,
    Home,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Camera,
    Upload,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getTransactionById, finalizeTransactionFulfillment } from "@/app/admin/transactions/actions";
import Link from "next/link";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full rounded-2xl bg-white/5 animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Precision Map...</div>
});

export default function RequestFinalizationPage() {
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

    useEffect(() => {
        async function fetchRequest() {
            try {
                const res = await getTransactionById(id);
                if (res.success && res.data) {
                    const req = res.data;
                    setRequest(req);
                    
                    // Pre-fill from resident snapshot
                    if (req.residentSnapshot) {
                        const r = req.residentSnapshot as any;
                        setAddress(prev => ({
                            ...prev,
                            houseNumber: r.houseNumber || "",
                            street: r.street || "",
                            sitio: r.sitio || "",
                            purok: r.purok || "",
                            barangay: r.barangay || "",
                            municipality: r.municipality || "",
                            province: r.province || "",
                            contactNumber: r.contactNumber || ""
                        }));
                        if (r.latitude && r.longitude) {
                            setLocalLat(r.latitude);
                            setLocalLng(r.longitude);
                        } else {
                            setLocalLat(16.026);
                            setLocalLng(120.454);
                        }
                    }
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
        fetchRequest();
    }, [id, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentProofFile(file);
            setPaymentProofPreview(URL.createObjectURL(file));
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
                router.push("/user/services/requests");
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

    // Computation Logic (Ported from Modal)
    const computation = useMemo(() => {
        if (!request) return null;
        const additionalData = request.additionalData || {};
        const income = additionalData.income || 0;
        const propertyValue = additionalData.propertyValue || 0;
        const totalBasis = income + propertyValue;
        const cedulaType = (additionalData.applicantType === "JURIDICAL" || additionalData.applicantType === "COMPANY") ? "JURIDICAL" : "INDIVIDUAL";
        const basicTax = cedulaType === "JURIDICAL" ? 500.00 : 5.00;
        const additionalTax = cedulaType === "JURIDICAL" 
            ? Math.floor(totalBasis / 5000) * 2.00 
            : Math.floor(totalBasis / 1000) * 1.00;
        
        const subtotal = basicTax + additionalTax;
        const totalWithPenalty = Number(request.totalAmount) || subtotal;
        const penaltyAmount = totalWithPenalty - subtotal;
        const deliveryFee = localFulfillment === "DELIVERY" ? (request.type?.deliveryFee || 0) : 0;
        const finalTotal = totalWithPenalty + deliveryFee;

        return { basicTax, additionalTax, penaltyAmount, deliveryFee, finalTotal, cedulaType };
    }, [request, localFulfillment]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Initializing Premium Portal...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-12 pb-32 selection:bg-primary/20">
            {/* Header / Breadcrumb */}
            <div className="space-y-6">
                <Breadcrumb>
                    <BreadcrumbList className="bg-white/40 dark:bg-black/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/20 dark:border-white/5 w-fit shadow-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary transition-colors italic">
                                    <Home className="w-3.5 h-3.5 mb-0.5" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-slate-300 dark:text-white/10" />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/services/requests" className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary transition-colors italic border-b border-transparent hover:border-primary/30">
                                    My Requests
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-slate-300 dark:text-white/10" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Logistics Finalization</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none select-none">
                            Phase <span className="text-primary underline decoration-4 decoration-primary/20 underline-offset-8">Evaluation</span>
                        </h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-2 italic">Select fulfillment & Secure Payment</p>
                    </div>
                    <Link href="/user/services/requests">
                        <Button variant="ghost" className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-slate-100 dark:hover:bg-white/5 gap-2 transition-all group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to List
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Side: Computation Card */}
                <div className="xl:col-span-5 space-y-8 xl:sticky xl:top-8 h-fit">
                    <Card className="p-8 sm:p-10 border-none bg-slate-950 text-white shadow-2xl rounded-[3rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <Calculator className="w-48 h-48 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                        </div>

                        <div className="relative z-10 space-y-12">
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary italic flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                        <Calculator className="w-4 h-4 text-primary" />
                                    </div>
                                    Treasury Final Assessment
                                </h3>
                                <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                                    Your application has been evaluated. Please review the breakdown below before proceeding to payment.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center group/item pb-4 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic transition-colors group-hover/item:text-white">Basic Community Tax ({computation?.cedulaType})</span>
                                    <span className="text-2xl font-black italic tracking-tighter">₱{computation?.basicTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                
                                <div className="flex justify-between items-center group/item pb-4 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic transition-colors group-hover/item:text-white">Additional Internal Revenue Tax</span>
                                    <span className="text-2xl font-black italic tracking-tighter">₱{computation?.additionalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>

                                {computation && computation.penaltyAmount > 0 && (
                                    <div className="flex justify-between items-center group/item pb-4 border-b border-white/5 text-orange-500">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest italic group-hover/item:text-orange-400">Monthly Surcharge / Penalty</span>
                                            <Info className="w-3.5 h-3.5 opacity-50" />
                                        </div>
                                        <span className="text-2xl font-black italic tracking-tighter">₱{computation.penaltyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}

                                {localFulfillment === "DELIVERY" && (
                                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Official Delivery Fee</span>
                                        <span className="text-2xl font-black italic tracking-tighter text-teal-400">₱{computation?.deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </motion.div>
                                )}

                                <div className="pt-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                    <div className="space-y-2">
                                        <p className="text-[12px] font-black uppercase text-emerald-400 tracking-[0.3em] italic leading-none">Total Amount to Pay</p>
                                        <p className="text-[9px] font-bold text-white/20 uppercase italic leading-none tracking-tighter max-w-[200px]">
                                            * Secure payment is required to finalize the issuance of your digital/physical CTC.
                                        </p>
                                    </div>
                                    <span className="text-6xl font-black italic tracking-tighter text-white">₱{computation?.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex items-start gap-4 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[11px] text-primary font-black italic uppercase tracking-widest leading-none">Administrative Notice</p>
                            <p className="text-[10px] text-primary/60 font-medium leading-relaxed italic uppercase tracking-tighter">
                                The breakdown above followed the standard LGU computation based on your declared gross income and property assets.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Deployment & Payment Hub */}
                <div className="xl:col-span-7 space-y-10">
                    <div className="bg-white dark:bg-[#0d0f14] rounded-[3rem] border border-slate-200 dark:border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden group/container">
                        {/* Interactive Background Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0001_1px,transparent_1px),linear-gradient(to_bottom,#0001_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
                        
                        <div className="relative z-10 space-y-12">
                            {/* Fulfillment Selector */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Fulfillment <span className="text-primary italic">Strategy</span></h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic mt-1">Select your preferred receiving method</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: "E_COPY", label: "Digital E-Copy", icon: FileText, desc: "Instant Release" },
                                        { id: "PICK_UP", label: "Office Pickup", icon: Building2, desc: "Standard Protocol" },
                                        { id: "DELIVERY", label: "Doorstep Delivery", icon: Truck, desc: "Premium Logistics" }
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setLocalFulfillment(opt.id as any);
                                                if (opt.id === "PICK_UP") setLocalPayment("CASH");
                                                else if (opt.id === "E_COPY") setLocalPayment("E_PAYMENT");
                                                else setLocalPayment("CASH_ON_DELIVERY");
                                            }}
                                            className={cn(
                                                "flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all group select-none active:scale-[0.95] text-center relative",
                                                localFulfillment === opt.id ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/40"
                                            )}
                                        >
                                            <opt.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                            <div className="space-y-0.5">
                                                <span className="block text-[10px] font-black uppercase tracking-widest italic leading-none">{opt.label}</span>
                                                <p className={cn("text-[8px] font-bold uppercase italic tracking-tighter opacity-50", localFulfillment === opt.id && "text-white")}>{opt.desc}</p>
                                            </div>
                                            {localFulfillment === opt.id && (
                                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-950">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Conditional Delivery Settings */}
                            <AnimatePresence mode="wait">
                                {localFulfillment === "DELIVERY" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        className="space-y-10 pt-10 border-t border-slate-100 dark:border-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 italic">Delivery Manifest</Label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Building / House #</Label>
                                                <Input value={address.houseNumber} onChange={e => setAddress(p => ({ ...p, houseNumber: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Street Lane</Label>
                                                <Input value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Sitio</Label>
                                                <Input value={address.sitio} onChange={e => setAddress(p => ({ ...p, sitio: e.target.value }))} placeholder="Optional" className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Purok</Label>
                                                <Input value={address.purok} onChange={e => setAddress(p => ({ ...p, purok: e.target.value }))} placeholder="Optional" className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Barangay</Label>
                                                <Input value={address.barangay} onChange={e => setAddress(p => ({ ...p, barangay: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Municipality / City</Label>
                                                <Input value={address.municipality} onChange={e => setAddress(p => ({ ...p, municipality: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Province</Label>
                                                <Input value={address.province} onChange={e => setAddress(p => ({ ...p, province: e.target.value }))} className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                            <div className="lg:col-span-2 space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Destination Landmark / Instructions</Label>
                                                <Input value={address.landmark} onChange={e => setAddress(p => ({ ...p, landmark: e.target.value }))} placeholder="e.g. Near Brgy. Hall / Blue Gate / Specific Instructions" className="h-12 bg-white dark:bg-black/20 rounded-xl font-bold italic" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 italic">Precision Destination Pin</Label>
                                            <div className="h-[300px] w-full rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 relative group shadow-inner">
                                                <LocationPicker
                                                    lat={localLat}
                                                    lng={localLng}
                                                    onChange={(lat, lng) => { setLocalLat(lat); setLocalLng(lng); }}
                                                />
                                            </div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase italic text-center opacity-70 tracking-widest mt-2">Active precise pinpointing enabled for rapid courier routing</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Payment Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Fiscal <span className="text-primary italic">Clearance</span></h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic mt-1">Select your secure payment channel</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(localFulfillment === "E_COPY" ? [
                                        { id: "E_PAYMENT", label: "Electronic Payment", icon: CreditCard, desc: "GCash, Maya, Cards" },
                                        { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Direct Bank Deposit" }
                                    ] : localFulfillment === "PICK_UP" ? [
                                        { id: "CASH", label: "Cash on Counter", icon: Wallet, desc: "Pay at Treasury Office" },
                                        { id: "E_PAYMENT", label: "Electronic Payment", icon: CreditCard, desc: "GCash, Maya, Cards" },
                                        { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Direct Bank Deposit" }
                                    ] : [
                                        { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Truck, desc: "Pay upon arrival" },
                                        { id: "E_PAYMENT", label: "Electronic Payment", icon: CreditCard, desc: "GCash, Maya, Cards" },
                                        { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Direct Bank Deposit" }
                                    ]).map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setLocalPayment(opt.id as any)}
                                            className={cn(
                                                "flex items-center gap-5 p-6 rounded-[2rem] border-2 transition-all group select-none active:scale-[0.98] text-left relative",
                                                localPayment === opt.id ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/40"
                                            )}
                                        >
                                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm", localPayment === opt.id ? "bg-primary text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400")}>
                                                <opt.icon className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="block text-[11px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">{opt.label}</span>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase italic opacity-60 tracking-tighter">{opt.desc}</p>
                                            </div>
                                            {localPayment === opt.id && (
                                                <div className="absolute top-1/2 -translate-y-1/2 right-6">
                                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {(localPayment === "E_PAYMENT" || localPayment === "BANK_TRANSFER") && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-8 bg-slate-50 dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6 mt-4">
                                                <div className="flex items-center gap-3">
                                                    <Camera className="w-5 h-5 text-primary" />
                                                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Proof of Transaction</Label>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-8 items-center">
                                                    <div className="w-48 h-48 bg-white dark:bg-black rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group/upload shrink-0 shadow-lg">
                                                        {paymentProofPreview ? (
                                                            <Image src={paymentProofPreview} alt="Payment Proof" fill className="object-cover" />
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover/upload:text-primary transition-colors" />
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase italic">Screenshot Required</p>
                                                            </div>
                                                        )}
                                                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    </div>

                                                    <div className="space-y-4 text-center sm:text-left">
                                                        <h4 className="text-sm font-black italic uppercase text-slate-900 dark:text-white leading-tight">Secure Payment Channel</h4>
                                                        <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed uppercase tracking-widest max-w-[300px]">
                                                            Please transfer the exact amount to the LGU&apos;s official account and upload the transaction receipt for verification.
                                                        </p>
                                                        <Button asChild variant="outline" className="h-10 px-8 rounded-full text-[10px] font-black uppercase italic tracking-widest border-2 hover:bg-slate-100 transition-all">
                                                            <label className="cursor-pointer">Upload Receipt</label>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Sticky Action Footer inside Container */}
                        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 italic leading-none">Ready for Issuance</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest mt-1 opacity-60">Verified & Approved by Treasury</p>
                                </div>
                            </div>
                            
                            <Button
                                onClick={handleFinalize}
                                disabled={isFinalizing}
                                className="w-full sm:w-[300px] h-16 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] shadow-2xl shadow-primary/20 text-xs font-black uppercase tracking-[0.3em] italic transition-all active:scale-95 group"
                            >
                                {isFinalizing ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        Secure Application
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
