"use client";

import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Calculator,
    Clock, 
    CheckCircle2, 
    XCircle, 
    Activity,
    X as XIcon,
    CreditCard, 
    Truck, 
    FileText, 
    Wallet,
    Info,
    Calendar,
    ChevronRight,
    MapPin,
    Building2,
    DollarSign,
    Upload,
    Camera,
    Check,
    MapPinIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { finalizeTransactionFulfillment } from "@/app/admin/transactions/actions";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[250px] w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Map...</div>
});

interface RequestDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: any;
}

export default function RequestDetailModal({ isOpen, onClose, request }: RequestDetailModalProps) {
    const [localFulfillment, setLocalFulfillment] = React.useState<"PICK_UP" | "DELIVERY" | "E_COPY">("PICK_UP");
    const [localPayment, setLocalPayment] = React.useState("CASH");
    const [localLat, setLocalLat] = React.useState<number | null>(null);
    const [localLng, setLocalLng] = React.useState<number | null>(null);
    const [isFinalizing, setIsFinalizing] = React.useState(false);
    const [paymentProofFile, setPaymentProofFile] = React.useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = React.useState<string | null>(null);

    // Detailed Delivery Address States
    const [localHouseNumber, setLocalHouseNumber] = React.useState("");
    const [localStreet, setLocalStreet] = React.useState("");
    const [localSitio, setLocalSitio] = React.useState("");
    const [localPurok, setLocalPurok] = React.useState("");
    const [localBarangay, setLocalBarangay] = React.useState("");
    const [localMunicipality, setLocalMunicipality] = React.useState("");
    const [localProvince, setLocalProvince] = React.useState("");
    const [localContactNumber, setLocalContactNumber] = React.useState("");
    const [localLandmark, setLocalLandmark] = React.useState("");

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Initialization Effect
    React.useEffect(() => {
        if (request?.residentSnapshot) {
            const res = request.residentSnapshot;
            setLocalHouseNumber(res.houseNumber || "");
            setLocalStreet(res.street || "");
            setLocalSitio(res.sitio || "");
            setLocalPurok(res.purok || "");
            setLocalBarangay(res.barangay || "");
            setLocalMunicipality(res.municipality || "Mapandan");
            setLocalProvince(res.province || "Pangasinan");
            setLocalContactNumber(res.contactNumber || "");
            
            // Map Centering logic
            if (res.latitude && res.longitude) {
                setLocalLat(res.latitude);
                setLocalLng(res.longitude);
            } else {
                // Fallback to Mapandan center
                setLocalLat(16.026);
                setLocalLng(120.454);
            }
        }
    }, [request]);

    if (!request) return null;

    const handleFinalize = async () => {
        if ((localPayment === "E_PAYMENT" || localPayment === "BANK_TRANSFER") && !paymentProofFile) {
            toast.error("Please upload your proof of payment (screenshot) first.");
            return;
        }

        setIsFinalizing(true);
        try {
            const formData = new FormData();
            formData.append("transactionId", request.id);
            formData.append("fulfillmentType", localFulfillment);
            formData.append("paymentType", localPayment);
            
            // Structured Delivery Address
            const fullAddress = {
                houseNumber: localHouseNumber,
                street: localStreet,
                sitio: localSitio,
                purok: localPurok,
                barangay: localBarangay,
                municipality: localMunicipality,
                province: localProvince,
                contactNumber: localContactNumber
            };
            
            formData.append("deliveryAddress", JSON.stringify(fullAddress));
            formData.append("deliveryLat", String(localLat || ""));
            formData.append("deliveryLng", String(localLng || ""));
            formData.append("deliveryLandmark", localLandmark);
            
            if (paymentProofFile) {
                formData.append("paymentFile", paymentProofFile);
            }

            const res = await finalizeTransactionFulfillment(formData);

            if (res.success) {
                toast.success("Fulfillment configuration secured! Official processing started.");
                onClose();
                window.location.reload(); // Refresh to show updated status
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
                return { label: "DRAFT", color: "bg-slate-100 text-slate-600 border-slate-200", icon: FileText, progress: 10 };
            case "FOR_REQUESTING":
                return { label: "PENDING", color: "bg-[var(--primary-theme)] text-white border-transparent", icon: Clock, progress: 25 };
            case "FOR_PROCESSING":
                return { label: "FOR_PROCESSING", color: "bg-[var(--primary-theme)] text-white border-transparent", icon: Activity, progress: 40 };
            case "E_COPY":
                return { label: "E-COPY", color: "bg-purple-100 text-purple-700 border-purple-200", icon: FileText, progress: 50 };
            case "EVALUATED":
                return { label: "EVALUATED", color: "bg-[var(--primary-theme)] text-white border-transparent", icon: DollarSign, progress: 50 };
            case "UNPAID":
                return { label: "UNPAID", color: "bg-red-50 text-red-600 border-red-100", icon: Wallet, progress: 55 };
            case "PAID":
                return { label: "PAID", color: "bg-[var(--primary-theme)] text-white border-transparent", icon: Clock, progress: 75 };
            case "RELEASED":
                return { label: "RELEASED", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, progress: 100 };
            case "REJECTED":
                return { label: "REJECTED", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, progress: 0 };
            default:
                return { label: status, color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock, progress: 0 };
        }
    };

    const statusConfig = getStatusConfig(request.status);
    const additionalData = request.additionalData || {};
    const residentData = request.residentSnapshot || {};

    const showSetupTab = request.status === "EVALUATED" && !request.paymentType;

    // Detailed breakdown calculation for Cedula
    const income = additionalData.income || 0;
    const propertyValue = additionalData.propertyValue || 0;
    const totalBasis = income + propertyValue;
    const cedulaType = (additionalData.applicantType === "JURIDICAL" || additionalData.applicantType === "COMPANY") ? "JURIDICAL" : "INDIVIDUAL";
    const basicTax = cedulaType === "JURIDICAL" ? 500.00 : 5.00;
    const additionalTax = cedulaType === "JURIDICAL" 
        ? Math.floor(totalBasis / 5000) * 2.00 
        : Math.floor(totalBasis / 1000) * 1.00;
    
    // Penalties check (simplified for display)
    const subtotal = basicTax + additionalTax;
    const totalWithPenalty = Number(request.totalAmount) || subtotal;
    const penaltyAmount = totalWithPenalty - subtotal;
    const deliveryFee = localFulfillment === "DELIVERY" ? (request.type?.deliveryFee || 0) : 0;
    const finalTotal = totalWithPenalty + deliveryFee;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                showCloseButton={false}
                className="w-full h-full max-h-screen sm:max-w-[1100px] sm:w-[94vw] sm:h-[80vh] sm:top-[80px] sm:translate-y-0 p-0 overflow-hidden bg-white dark:bg-[#0a0c10] rounded-none sm:rounded-3xl border-none shadow-2xl flex flex-col"
            >
                {/* Large Modern Close Action */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 bg-slate-100/50 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-all rounded-xl group border border-transparent hover:border-red-500/20"
                >
                    <XIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                {/* Clean Header Section - Compacted for better content ratio */}
                <div className="bg-slate-50 dark:bg-white/[0.02] p-4 sm:p-8 border-b border-slate-200 dark:border-white/5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-1.5 flex-1 text-center lg:text-left">
                            <DialogTitle className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                {request.type?.name || "Service Request"}
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-medium text-slate-500 italic max-w-xl">
                                Official records and real-time tracking for your service request.
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Content Section - Flex-1 ensures it takes all available room between header and footer */}
                <div className="flex-1 min-h-0 bg-slate-50/30 dark:bg-transparent relative">
                    <ScrollArea className="h-full">
                        <div className="p-4 sm:p-8"> 
                             {showSetupTab ? (
                                 <motion.div 
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                                 >
                                     {/* Breakdown Section - Overhauled to match high-fidelity premium design */}
                                     <Card className="p-6 sm:p-8 border-none bg-slate-900 text-white shadow-2xl rounded-3xl overflow-hidden relative group">
                                         {/* Background Decorative Element */}
                                         <Calculator className="absolute -bottom-6 -right-6 w-48 h-48 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                                         
                                         <div className="relative z-10 space-y-8">
                                             <div className="space-y-5">
                                                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic border-b border-white/10 pb-3 flex items-center gap-2">
                                                     <Calculator className="w-3.5 h-3.5 text-primary" />
                                                     Tax Computation Breakdown
                                                 </h3>
                                                 
                                                 <div className="space-y-5">
                                                     <div className="flex justify-between items-center group/item text-xs sm:text-sm">
                                                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic transition-colors group-hover/item:text-white">Basic Community Tax ({cedulaType})</span>
                                                         <span className="text-lg font-black italic tracking-tighter">₱{basicTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                     </div>
                                                     
                                                     <div className="flex justify-between items-center group/item text-xs sm:text-sm">
                                                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic transition-colors group-hover/item:text-white">Additional Tax (₱1)</span>
                                                         <span className="text-lg font-black italic tracking-tighter">₱{additionalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                     </div>

                                                     {penaltyAmount > 0 && (
                                                         <div className="flex justify-between items-center group/item text-orange-500 text-xs sm:text-sm">
                                                             <div className="flex items-center gap-2">
                                                                 <span className="text-[10px] font-black uppercase tracking-widest italic group-hover/item:text-orange-400">Penalty</span>
                                                                 <Info className="w-3 h-3 opacity-50" />
                                                             </div>
                                                             <span className="text-lg font-black italic tracking-tighter">₱{penaltyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                         </div>
                                                     )}

                                                     {localFulfillment === "DELIVERY" && (
                                                         <motion.div 
                                                             initial={{ opacity: 0, x: -20 }}
                                                             animate={{ opacity: 1, x: 0 }}
                                                             className="flex justify-between items-center pt-4 border-t border-white/5"
                                                         >
                                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Delivery Fee</span>
                                                             <div className="flex items-center">
                                                                 <span className="text-lg font-black italic tracking-tighter text-primary">₱{deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                             </div>
                                                         </motion.div>
                                                     )}

                                                     <div className="relative pt-8 border-t border-white/10 flex flex-col justify-between items-start gap-4">
                                                         <div className="space-y-1">
                                                             <p className="text-[11px] font-black uppercase text-emerald-400 tracking-[0.2em] italic leading-none">Estimated Total Due</p>
                                                             <p className="text-[7px] font-bold text-white/30 uppercase italic leading-none tracking-tight">
                                                                 * Final assessment is subject to administrative evaluation
                             </p>
                                                         </div>
                                                         <div className="flex items-baseline gap-1">
                                                             <span className="text-4xl font-black italic tracking-tighter text-white">₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </Card>


                                     {/* Logistics & Payment Section - Separated into its own card */}
                                     <Card className="p-6 sm:p-8 border-none bg-white dark:bg-white/5 shadow-2xl rounded-3xl">
                                         <div className="space-y-8 shrink-0">
                                             <div className="space-y-3">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                         <Truck className="w-5 h-5" />
                                                     </div>
                                                     <div>
                                                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">Fulfillment & <span className="text-primary italic">Logistics</span></h3>
                                                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic mt-0.5 opacity-70">Step 2: Choose Method & Pay</p>
                                                     </div>
                                                 </div>
                                             </div>
                                             
                                             <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                                                 {/* Logistics Side */}
                                                 <div className="space-y-8">
                                                     <div className="space-y-3">
                                                         <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic ml-1 flex items-center gap-2">
                                                             <Building2 className="w-3 h-3" />
                                                             1. Receiving Method
                                                         </Label>
                                                         <div className="grid grid-cols-3 gap-3">
                                                             {[
                                                                 { id: "E_COPY", label: "E-Copy", icon: FileText, desc: "Digital" },
                                                                 { id: "PICK_UP", label: "Pickup", icon: MapPin, desc: "Office" },
                                                                 { id: "DELIVERY", label: "Delivery", icon: Truck, desc: "Doorstep" }
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
                                                                         "flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all group select-none active:scale-[0.95] text-center",
                                                                         localFulfillment === opt.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/40"
                                                                     )}
                                                                 >
                                                                     <opt.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                                     <span className="block text-[9px] font-black uppercase tracking-widest italic leading-none">{opt.label}</span>
                                                                 </button>
                                                             ))}
                                                         </div>
                                                     </div>

                                                     {localFulfillment === "DELIVERY" && (
                                                         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5">
                                                             <div className="flex items-center gap-2 mb-2">
                                                                 <MapPinIcon className="w-4 h-4 text-primary" />
                                                                 <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Verify Delivery Details</Label>
                                                             </div>
                                                             
                                                             <div className="grid grid-cols-2 gap-4">
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">House Number</Label>
                                                                     <Input value={localHouseNumber} onChange={e => setLocalHouseNumber(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Street / Block</Label>
                                                                     <Input value={localStreet} onChange={e => setLocalStreet(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Sitio</Label>
                                                                     <Input value={localSitio} onChange={e => setLocalSitio(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Purok</Label>
                                                                     <Input value={localPurok} onChange={e => setLocalPurok(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Barangay</Label>
                                                                     <Input value={localBarangay} onChange={e => setLocalBarangay(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Municipality</Label>
                                                                     <Input value={localMunicipality} onChange={e => setLocalMunicipality(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Province</Label>
                                                                     <Input value={localProvince} onChange={e => setLocalProvince(e.target.value)} className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                                 <div className="space-y-1.5">
                                                                     <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Coordination Contact</Label>
                                                                     <Input value={localContactNumber} onChange={e => setLocalContactNumber(e.target.value)} placeholder="09XX XXX XXXX" className="bg-white rounded-xl text-xs font-bold border-slate-100" />
                                                                 </div>
                                                             </div>

                                                             <div className="space-y-1.5">
                                                                 <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Landmark / Remarks</Label>
                                                                 <Textarea 
                                                                     placeholder="Subdivision, Landmark, or House Details..."
                                                                     className="bg-white rounded-2xl border-slate-100 resize-none h-16 text-xs font-bold"
                                                                     value={localLandmark}
                                                                     onChange={(e) => setLocalLandmark(e.target.value)}
                                                                 />
                                                             </div>

                                                             <div className="space-y-1.5 mt-2">
                                                                 <Label className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-1">Precision Map Pin</Label>
                                                                 <div className="h-[200px] w-full rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-white/5 bg-slate-100 relative group">
                                                                     <LocationPicker
                                                                         lat={localLat}
                                                                         lng={localLng}
                                                                         onChange={(lat, lng) => { setLocalLat(lat); setLocalLng(lng); }}
                                                                     />
                                                                 </div>
                                                                 <p className="text-[7px] font-bold text-slate-400 uppercase italic mt-1 ml-1 text-center opacity-60">Drag the map to specify exact destination point</p>
                                                             </div>
                                                         </motion.div>
                                                     )}
                                                 </div>

                                                 {/* Payment Side */}
                                                 <div className="space-y-8">
                                                     <div className="space-y-3">
                                                         <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic ml-1 flex items-center gap-2">
                                                             <CreditCard className="w-3 h-3" />
                                                             2. Payment Channel
                                                         </Label>
                                                         <div className="grid grid-cols-1 gap-2.5">
                                                             {(localFulfillment === "E_COPY" ? [
                                                                 { id: "E_PAYMENT", label: "E-Payment", icon: CreditCard, desc: "GCash, Maya, Cards" },
                                                                 { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Direct Bank Deposit" }
                                                             ] : localFulfillment === "PICK_UP" ? [
                                                                 { id: "CASH", label: "Cash on Counter", icon: Wallet, desc: "Pay at LGU Office" },
                                                                 { id: "E_PAYMENT", label: "E-Payment", icon: CreditCard, desc: "GCash, Maya, Cards" },
                                                                 { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Direct Bank Deposit" }
                                                             ] : [
                                                                 { id: "CASH_ON_DELIVERY", label: "Cash on Delivery", icon: Truck, desc: "Pay on arrival" },
                                                                 { id: "E_PAYMENT", label: "E-Payment", icon: CreditCard, desc: "GCash, Maya, Cards" },
                                                                 { id: "BANK_TRANSFER", label: "Bank Transfer", icon: Building2, desc: "Direct Bank Deposit" }
                                                             ]).map(opt => (
                                                                 <button
                                                                     key={opt.id}
                                                                     onClick={() => setLocalPayment(opt.id as any)}
                                                                     className={cn(
                                                                         "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group select-none active:scale-[0.98] text-left",
                                                                         localPayment === opt.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/20"
                                                                     )}
                                                                 >
                                                                     <div className={cn(
                                                                         "w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-xs",
                                                                         localPayment === opt.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:text-primary"
                                                                     )}>
                                                                         <opt.icon className="w-5 h-5" />
                                                                     </div>
                                                                     <div>
                                                                         <span className={cn("block text-[10px] font-black uppercase tracking-widest italic leading-none transition-colors", localPayment === opt.id ? "text-primary" : "text-slate-600 dark:text-slate-300")}>{opt.label}</span>
                                                                         <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-400 block mt-0.5">{opt.desc}</span>
                                                                     </div>
                                                                 </button>
                                                             ))}
                                                         </div>
                                                     </div>

                                                     {/* Virtual Proof of Payment Upload */}
                                                     {(localPayment === "E_PAYMENT" || localPayment === "BANK_TRANSFER") && (
                                                         <motion.div 
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="space-y-4"
                                                         >
                                                             <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic ml-1 flex items-center gap-2">
                                                                 <Camera className="w-3 h-3" />
                                                                 3. Upload Proof (Screenshot)
                                                             </Label>
                                                             
                                                             <input 
                                                                 type="file" 
                                                                 ref={fileInputRef}
                                                                 onChange={(e) => {
                                                                     const file = e.target.files?.[0];
                                                                     if (file) {
                                                                        setPaymentProofFile(file);
                                                                        const reader = new FileReader();
                                                                        reader.onloadend = () => setPaymentProofPreview(reader.result as string);
                                                                        reader.readAsDataURL(file);
                                                                     }
                                                                 }}
                                                                 accept="image/*"
                                                                 className="hidden"
                                                             />

                                                             {paymentProofPreview ? (
                                                                 <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-primary shadow-xl group">
                                                                     <Image src={paymentProofPreview} alt="Proof" fill className="object-cover" />
                                                                     <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                         <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-black uppercase text-[8px] italic tracking-widest">Replace Image</Button>
                                                                     </div>
                                                                     <div className="absolute top-2 right-2 p-2 bg-emerald-500 text-white rounded-full">
                                                                         <Check className="w-4 h-4" />
                                                                     </div>
                                                                 </div>
                                                             ) : (
                                                                 <button 
                                                                     onClick={() => fileInputRef.current?.click()}
                                                                     className="w-full aspect-video rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
                                                                 >
                                                                     <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                                                         <Upload className="w-6 h-6" />
                                                                     </div>
                                                                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic group-hover:text-primary transition-colors">Click to Upload Statement</span>
                                                                 </button>
                                                             )}
                                                         </motion.div>
                                                     )}
                                                     
                                                     {/* Final Totals & Action */}
                                                     <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-5">
                                                         <div className="flex justify-between items-center border-b border-white/10 pb-5">
                                                             <div>
                                                                 <p className="text-[9px] font-black uppercase tracking-widest text-primary/70 italic">Final Payable</p>
                                                                 <p className="text-2xl font-black italic tracking-tighter">₱{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                                             </div>
                                                             <Button 
                                                                 disabled={isFinalizing || (localFulfillment === "DELIVERY" && (!localLat || !localLng))}
                                                                 onClick={handleFinalize}
                                                                 className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest italic rounded-xl shadow-lg shadow-primary/30 group/btn text-[10px]"
                                                             >
                                                                 {isFinalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm & Pay <ChevronRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                                                             </Button>
                                                         </div>
                                                         <p className="text-[7px] font-bold text-white/20 uppercase italic leading-none tracking-tight">
                                                             * Secure transaction enabled. Your document will proceed immediately after finalization.
                                                         </p>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </Card>
                                 </motion.div>
                             ) : (
                                <Tabs defaultValue="overview" className="space-y-8">
                                    <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl h-auto sm:h-16 w-full sm:w-fit border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row focus-within:border-[var(--primary-theme)]/30 transition-all shadow-sm">
                                        <TabsTrigger value="overview" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-12 py-3 sm:py-0 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:!bg-primary data-[state=active]:!text-white transition-all shadow-sm data-[state=active]:shadow-primary/20">Overview</TabsTrigger>
                                        <TabsTrigger value="declarations" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-12 py-3 sm:py-0 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:!bg-primary data-[state=active]:!text-white transition-all shadow-sm data-[state=active]:shadow-primary/20">Application Records</TabsTrigger>
                                        <TabsTrigger value="logistics" className="flex-1 sm:flex-none rounded-xl px-4 sm:px-12 py-3 sm:py-0 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:!bg-primary data-[state=active]:!text-white transition-all shadow-sm data-[state=active]:shadow-primary/20">Logistics & Proof</TabsTrigger>
                                    </TabsList>

                            <TabsContent value="overview" className="mt-0">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <Card className="p-6 sm:p-10 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm rounded-3xl lg:col-span-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white flex items-center gap-3 italic">
                                                <FileText className="w-5 h-5 text-primary" />
                                                Application Summary
                                            </h3>
                                            <Badge variant="outline" className={cn("inline-flex items-center gap-2 w-fit px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] italic rounded-full border-2", statusConfig.color)}>
                                                REQUEST STATUS: {statusConfig.label}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-16">
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Applicant Classification</p>
                                                <p className="text-xl font-black text-slate-700 dark:text-slate-200 italic">{additionalData.applicantType || "INDIVIDUAL"}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Submission Date</p>
                                                <p className="text-xl font-black text-slate-700 dark:text-slate-200 italic">{format(new Date(request.createdAt), "MMMM d, yyyy")}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Fulfillment Strategy</p>
                                                <div className="flex items-center gap-3 text-xl font-black text-slate-700 dark:text-slate-200 italic">
                                                    {request.fulfillmentType === "DELIVERY" ? <Truck className="w-6 h-6 text-primary" /> : <MapPin className="w-6 h-6 text-primary" />}
                                                    {request.fulfillmentType?.replace("_", " ")}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Payment Channel</p>
                                                <div className="flex items-center gap-3 text-xl font-black text-slate-700 dark:text-slate-200 italic">
                                                    <CreditCard className="w-6 h-6 text-primary" />
                                                    {request.paymentType?.replace("_", " ")}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-6 sm:p-10 border-none bg-slate-900 text-white shadow-2xl rounded-[3rem] relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Info className="w-24 h-24 rotate-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic mb-10">Administrative Remarks</h3>
                                            <div className="space-y-6">
                                                <p className="text-lg font-bold italic opacity-90 leading-relaxed">
                                                    &quot;{request.rejectionRemarks || `The administration is currently evaluating your request records. Please expect an update within ${request.type?.slaDays || 3} business days.`}&quot;
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 pt-10">
                                            <Separator className="bg-white/10" />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/50 italic">Total Amount Due</p>
                                                    <p className="text-2xl font-black text-primary italic leading-none">
                                                        ₱{request.totalAmount ? (request.totalAmount as number).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                                    </p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 italic text-right">Last Movement</p>
                                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/60 italic">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(request.updatedAt), "MMM d, HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="declarations" className="mt-0">
                                <Card className="p-4 sm:p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Personal Records</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Legal Full Name</p>
                                                        <p className="text-sm font-bold">{residentData.firstName} {residentData.lastName}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Citizenship</p>
                                                        <p className="text-sm font-bold">{residentData.citizenship || "Filipino"}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Birth Date</p>
                                                        <p className="text-sm font-bold">{residentData.dateOfBirth ? format(new Date(residentData.dateOfBirth), "MMM d, yyyy") : "N/A"}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Civil Status</p>
                                                        <p className="text-sm font-bold">{residentData.civilStatus || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator className="opacity-50" />
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Financial Self-Declaration</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Annual Gross Income</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">₱{(additionalData.income || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Property Value</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">₱{(additionalData.propertyValue || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Residential Address</h4>
                                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 relative group">
                                                <MapPin className="absolute top-6 right-6 w-8 h-8 text-slate-200 dark:text-slate-800 transition-colors group-hover:text-primary/20" />
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">House No.</p>
                                                            <p className="text-sm font-bold">{residentData.houseNumber || "N/A"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Street</p>
                                                            <p className="text-sm font-bold">{residentData.street || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Sitio</p>
                                                            <p className="text-sm font-bold">{residentData.sitio || "N/A"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Purok</p>
                                                            <p className="text-sm font-bold">{residentData.purok || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400">Barangay</p>
                                                        <p className="text-sm font-bold">{residentData.barangay}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Municipality</p>
                                                            <p className="text-sm font-bold">{residentData.municipality || "Agno"}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Province</p>
                                                            <p className="text-sm font-bold">{residentData.province || "Pangasinan"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="logistics" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Fulfillment Logistics</h4>
                                        {request.fulfillmentType === "DELIVERY" ? (
                                            <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl flex items-start gap-5">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h5 className="font-black uppercase tracking-widest text-xs mb-1">Doorstep Delivery</h5>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic mb-2">Specified Address:</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white underline decoration-primary/40 decoration-2 mb-4">
                                                        {(() => {
                                                            const addr = request.deliveryAddress;
                                                            if (!addr) return "No address specified";
                                                            if (typeof addr === "string") return addr;
                                                            return `${addr.houseNumber || ""} ${addr.street || ""}, ${addr.sitio ? `Sitio ${addr.sitio}, ` : ""}${addr.purok ? `Purok ${addr.purok}, ` : ""}${addr.barangay}, ${addr.municipality}, ${addr.province}`.trim().replace(/^,/, "").replace(/ ,/, " ");
                                                        })()}
                                                    </p>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter italic">Recipient Contact:</p>
                                                        <p className="text-sm font-black text-primary italic">{residentData.contactNumber || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-start gap-5">
                                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h5 className="font-black uppercase tracking-widest text-xs mb-1">LGU Office Pickup</h5>
                                                    <p className="text-[11px] text-slate-500 font-medium italic">
                                                        Please present a valid ID at the Municipal Treasury Office once status is &quot;RELEASED&quot;.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Documentary Evidence</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { label: "Valid ID", url: additionalData.validIdUrl },
                                                { label: "Proof of Income", url: additionalData.proofOfIncomeUrl }
                                            ].map((doc, i) => (
                                                <div key={i} className="group cursor-pointer">
                                                    {doc.url ? (
                                                        <a href={doc.url} target="_blank" className="block relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 overflow-hidden group-hover:border-primary transition-all shadow-sm">
                                                            {/* Image Preview */}
                                                            <Image 
                                                                src={doc.url} 
                                                                alt={doc.label}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                                                                unoptimized
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                                    <ChevronRight className="w-6 h-6 text-white" />
                                                                </div>
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Click to Expand</span>
                                                            </div>
                                                            <div className="absolute top-2 left-2 z-10">
                                                                <Badge className="text-[8px] font-black uppercase tracking-widest bg-white/90 text-slate-900 border-none px-2 py-0.5">{doc.label}</Badge>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="aspect-video rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-300">
                                                            <XCircle className="w-5 h-5" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">{doc.label} Empty</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            </Tabs>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
