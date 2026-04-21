"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Fingerprint,
    User,
    Building2,
    MapPin,
    CreditCard,
    Truck,
    Upload,
    CheckCircle2,
    ChevronRight,
    AlertCircle,
    Info,
    Wallet,
    Home,
    Calculator,
    Package,
    Loader2,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { 
    ssr: false,
    loading: () => <div className="h-[350px] w-full rounded-3xl bg-slate-100 animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading Map...</div>
});
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    getCurrentUserResident,
    getTransactionTypes,
    submitTransaction,
    ensureCedulaTransactionTypes
} from "@/app/admin/transactions/actions";
import { calculateCedula, CedulaResult, isPastCedulaDeadline } from "@/lib/cedula";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TYPES ---

type Step = "TYPE" | "RESIDENT" | "DECLARATION" | "DELIVERY" | "CONFIRM";

interface DeliveryAddress {
    houseNumber: string;
    street: string;
    sitio: string;
    purok: string;
    barangay: string;
    municipality: string;
    province: string;
    region: string;
}

interface FormState {
    typeId: string;
    applicantType: "INDIVIDUAL" | "JURIDICAL";
    residentData: any;
    income: string;
    propertyValue: string;
    fulfillmentType: "PICK_UP" | "DELIVERY";
    paymentType: "CASH" | "CASH_ON_DELIVERY" | "E_PAYMENT" | "BANK_TRANSFER";
    deliveryAddress: DeliveryAddress;
    deliveryLandmark: string;
    deliveryLat: number | null;
    deliveryLng: number | null;
    idFile: File | null;
    proofFile: File | null;
    businessName: string;
}

// --- CONSTANTS ---

const STEPS: { id: Step; label: string; icon: any }[] = [
    { id: "TYPE", label: "Select Service", icon: Fingerprint },
    { id: "RESIDENT", label: "Identity", icon: User },
    { id: "DELIVERY", label: "Logistics", icon: Package },
    { id: "DECLARATION", label: "Declaration", icon: Calculator },
    { id: "CONFIRM", label: "Submit", icon: CheckCircle2 },
];

export default function CedulaApplicationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("TYPE");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [transactionTypes, setTransactionTypes] = useState<any[]>([]);
    const [calcResult, setCalcResult] = useState<CedulaResult | null>(null);
    const [initialResident, setInitialResident] = useState<any>(null);

    const [formData, setFormData] = useState<FormState>({
        typeId: "",
        applicantType: "INDIVIDUAL",
        residentData: {},
        income: "0",
        propertyValue: "0",
        fulfillmentType: "PICK_UP",
        paymentType: "CASH",
        deliveryAddress: {
            houseNumber: "",
            street: "",
            sitio: "",
            purok: "",
            barangay: "",
            municipality: "Agno",
            province: "Pangasinan",
            region: "Ilocos Region"
        },
        deliveryLandmark: "",
        deliveryLat: null,
        deliveryLng: null,
        idFile: null,
        proofFile: null,
        businessName: ""
    });

    const [barangays, setBarangays] = useState<{ code: string; name: string }[]>([]);
    const [loadingBarangays, setLoadingBarangays] = useState(false);

    // --- INITIALIZATION ---

    useEffect(() => {
        async function init() {
            try {
                // Ensure service types exist in DB
                await ensureCedulaTransactionTypes();

                // Fetch Types
                const typesRes = await getTransactionTypes();
                if (typesRes.success) {
                    const cedulaTypes = typesRes.data?.filter((t: any) => t.code.startsWith("CEDULA")) || [];
                    setTransactionTypes(cedulaTypes);
                    if (cedulaTypes.length > 0) {
                        setFormData(prev => ({ ...prev, typeId: cedulaTypes[0].id }));
                    }
                }

                // Fetch Resident
                const residentRes = await getCurrentUserResident();
                const resident = residentRes.data;
                if (residentRes.success && resident) {
                    setInitialResident(resident);
                    setFormData(prev => ({
                        ...prev,
                        residentData: resident,
                        deliveryAddress: {
                            houseNumber: resident.houseNumber || "",
                            street: resident.street || "",
                            sitio: resident.sitio || "",
                            purok: resident.purok || "",
                            barangay: resident.barangay || "",
                            municipality: resident.municipality || "Agno",
                            province: resident.province || "Pangasinan",
                            region: "Ilocos Region"
                        },
                        deliveryLat: resident.latitude || null,
                        deliveryLng: resident.longitude || null
                    }));
                }
            } catch (err) {
                console.error("Init error:", err);
                toast.error("Failed to initialize application");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    // Remove PSGC fetch if not needed anymore

    // --- LOGIC ---
    const updateCalc = React.useCallback(() => {
        const selectedType = transactionTypes.find(t => t.id === formData.typeId);
        const result = calculateCedula({
            type: formData.applicantType,
            income: parseFloat(formData.income) || 0,
            propertyValue: parseFloat(formData.propertyValue) || 0,
            fulfillmentType: formData.fulfillmentType,
            deliveryFee: selectedType?.deliveryFee || 0
        });
        setCalcResult(result);
    }, [formData.income, formData.propertyValue, formData.fulfillmentType, formData.typeId, formData.applicantType, transactionTypes]);

    useEffect(() => {
        updateCalc();
    }, [updateCalc]);


    // --- AUTO-SYNC PAYMENT TYPE ---
    // If fulfillment is Delivery, we use CASH_ON_DELIVERY. If Pickup, we use CASH.
    // This keeps our database super accurate based on the user's choices.
    useEffect(() => {
        if (formData.fulfillmentType === "DELIVERY" && formData.paymentType as any === "CASH") {
            setFormData(p => ({ ...p, paymentType: "CASH_ON_DELIVERY" as any }));
        } else if (formData.fulfillmentType === "PICK_UP" && formData.paymentType as any === "CASH_ON_DELIVERY") {
            setFormData(p => ({ ...p, paymentType: "CASH" as any }));
        }
    }, [formData.fulfillmentType, formData.paymentType]);

    const isStepValid = (stepId: Step) => {
        switch (stepId) {
            case "TYPE":
                return !!formData.applicantType && !!formData.typeId;
            case "RESIDENT":
                const r = formData.residentData;
                return !!(r?.firstName && r?.lastName && r?.dateOfBirth && r?.email && r?.contactNumber);
            case "DECLARATION":
                return parseFloat(formData.income) >= 0 && parseFloat(formData.propertyValue) >= 0;
            case "DELIVERY":
                if (formData.fulfillmentType === "DELIVERY") {
                    const addr = formData.deliveryAddress;
                    return !!(addr.barangay && addr.municipality && formData.deliveryLat && formData.deliveryLng);
                }
                return true;
            case "CONFIRM":
                return !!formData.idFile && !!formData.proofFile;
            default:
                return true;
        }
    };

    const canNavigate = (targetStep: Step) => {
        const targetIdx = STEPS.findIndex(s => s.id === targetStep);
        const currentIdx = STEPS.findIndex(s => s.id === currentStep);

        // --- BEST PRACTICE: FORWARD NAVIGATION CONTROL ---
        // To ensure data integrity and a guided user experience, we strictly 
        // allow the stepper to navigate BACKWARDS only. 
        // Forward movement must go through the "Next Phase" button validations.
        return targetIdx < currentIdx;
    };

    const handleNext = () => {
        if (!isStepValid(currentStep)) {
            if (currentStep === "DELIVERY" && formData.fulfillmentType === "DELIVERY") {
                toast.error("Please provide a delivery address and pin your location on the map.");
            } else {
                toast.error("Please complete all required fields in this phase.");
            }
            return;
        }
        const stepIndex = STEPS.findIndex(s => s.id === currentStep);
        if (stepIndex < STEPS.length - 1) {
            setCurrentStep(STEPS[stepIndex + 1].id);
            window.scrollTo(0, 0);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "idFile" | "proofFile") => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const onSubmit = async () => {
        setSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append("typeId", formData.typeId);
            submitData.append("fulfillmentType", formData.fulfillmentType);
            submitData.append("paymentType", formData.paymentType);
            submitData.append("deliveryAddress", JSON.stringify(formData.deliveryAddress));
            if (formData.deliveryLat) submitData.append("deliveryLat", formData.deliveryLat.toString());
            if (formData.deliveryLng) submitData.append("deliveryLng", formData.deliveryLng.toString());
            submitData.append("deliveryLandmark", formData.deliveryLandmark);
            
            submitData.append("residentSnapshot", JSON.stringify(formData.residentData));
            submitData.append("additionalData", JSON.stringify({
                applicantType: formData.applicantType,
                income: parseFloat(formData.income),
                propertyValue: parseFloat(formData.propertyValue),
                businessName: formData.businessName
            }));

            if (formData.idFile) submitData.append("idFile", formData.idFile);
            if (formData.proofFile) submitData.append("proofFile", formData.proofFile);

            const res = await submitTransaction(submitData);
            if (res.success) {
                toast.success("Application submitted successfully!");
                router.push("/user/services/requests"); // Re-routing to tracking page
            } else {
                toast.error(res.error || "Submission failed");
            }
        } catch {
            toast.error("An error occurred during submission");
        } finally {
            setSubmitting(false);
        }
    };

    // --- UI COMPONENTS ---

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Initializing Portal...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-32">
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
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Online Cedula Service</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none select-none">
                            Online <span className="text-primary underline decoration-4 decoration-primary/20 underline-offset-8">Cedula</span>
                        </h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-2 italic">LGU Digital Governance Portal</p>
                    </div>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="grid grid-cols-5 gap-2 md:gap-4 relative px-2">
                {STEPS.map((step, idx) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = STEPS.findIndex(s => s.id === currentStep) > idx;
                    const Icon = step.icon;
                    return (
                        <div 
                            key={idx} 
                            onClick={() => {
                                if (canNavigate(step.id)) {
                                    setCurrentStep(step.id);
                                    window.scrollTo(0, 0);
                                } else {
                                    toast.error("Please complete the current phase first.");
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center gap-3 relative z-10 font-black cursor-pointer group",
                                (!canNavigate(step.id) && !isActive) && "cursor-not-allowed opacity-50"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                                isActive ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-110" :
                                    isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                                        "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent group-hover:border-primary/30"
                            )}>
                                <Icon className="w-5 h-5 md:w-7 md:h-7" />
                            </div>
                            <span className={cn(
                                "text-[8px] md:text-[10px] uppercase tracking-widest text-center italic hidden sm:block",
                                isActive ? "text-primary opacity-100 font-black" : "opacity-40 group-hover:opacity-100 transition-opacity"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <div className="mt-8 bg-white dark:bg-[#11131a] rounded-[3rem] border border-slate-200 dark:border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden group/container min-h-[500px] flex flex-col">
                <div className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Step 1: TYPE SELECTION */}
                        {currentStep === "TYPE" && (
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Identify Your <span className="text-primary italic">Status</span></h2>
                                    <p className="text-slate-500 font-medium italic text-lg leading-relaxed">Choose the appropriate category for your Community Tax Certificate application.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { id: "INDIVIDUAL", label: "Individual", icon: User, desc: "For employees, property owners, and private citizens." },
                                        { id: "JURIDICAL", label: "Juridical", icon: Building2, desc: "For businesses, corporations, and established entities." }
                                    ].map((opt) => (
                                        <Card
                                            key={opt.id}
                                            onClick={() => {
                                                const type = transactionTypes.find(t => t.code === (opt.id === "INDIVIDUAL" ? "CEDULA_IND" : "CEDULA_JUR"));
                                                setFormData(prev => ({
                                                    ...prev,
                                                    applicantType: opt.id as any,
                                                    typeId: type?.id || prev.typeId
                                                }));
                                            }}
                                            className={cn(
                                                "p-8 rounded-[2.5rem] cursor-pointer border-2 transition-all duration-500 relative group overflow-hidden select-none active:scale-[0.98]",
                                                formData.applicantType === opt.id ? "bg-primary/5 border-primary" : "bg-slate-50 shadow-sm dark:bg-white/5 border-transparent hover:border-primary/20"
                                            )}
                                        >
                                            <div className="space-y-6 relative z-10">
                                                <div className={cn(
                                                    "w-16 h-16 rounded-[1.25rem] flex items-center justify-center transition-colors shadow-sm",
                                                    formData.applicantType === opt.id ? "bg-primary text-white" : "bg-white dark:bg-black/20 text-slate-400 group-hover:text-primary"
                                                )}>
                                                    <opt.icon className="w-8 h-8" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-black uppercase italic italic group-hover:text-primary transition-colors">{opt.label}</h3>
                                                    <p className="text-sm text-slate-400 font-medium italic">{opt.desc}</p>
                                                </div>
                                            </div>
                                            {formData.applicantType === opt.id && (
                                                <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: IDENTITY VERIFICATION */}
                        {currentStep === "RESIDENT" && (
                            <div className="space-y-8">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">Identity <span className="text-primary italic">Confirmation</span></h2>
                                    <p className="text-xs text-slate-500 font-medium italic">Verify and refine your personal records for this certificate.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Row 1: Names */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                                            <Input
                                                value={formData.residentData?.firstName || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, firstName: e.target.value } }))}
                                                readOnly={!!initialResident?.firstName}
                                                className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm", !!initialResident?.firstName && "bg-slate-50 text-slate-400")}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Middle Name</Label>
                                            <Input
                                                value={formData.residentData?.middleName || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, middleName: e.target.value } }))}
                                                readOnly={!!initialResident?.middleName}
                                                className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm", !!initialResident?.middleName && "bg-slate-50 text-slate-400")}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                                            <Input
                                                value={formData.residentData?.lastName || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, lastName: e.target.value } }))}
                                                readOnly={!!initialResident?.lastName}
                                                className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm", !!initialResident?.lastName && "bg-slate-50 text-slate-400")}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Suffix</Label>
                                            <Input
                                                value={formData.residentData?.suffix || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, suffix: e.target.value } }))}
                                                readOnly={!!initialResident?.suffix}
                                                className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm", !!initialResident?.suffix && "bg-slate-50 text-slate-400")}
                                                placeholder="e.g. Jr."
                                            />
                                        </div>
                                    </div>

                                    <Separator className="opacity-50" />

                                    {/* Row 2: Personal */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</Label>
                                            <Input
                                                type="date"
                                                value={formData.residentData?.dateOfBirth ? new Date(formData.residentData.dateOfBirth).toISOString().split('T')[0] : ""}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, dateOfBirth: e.target.value } }))}
                                                readOnly={!!initialResident?.dateOfBirth}
                                                className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm", !!initialResident?.dateOfBirth && "bg-slate-50 text-slate-400")}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Age</Label>
                                            <Input
                                                value={(() => {
                                                    if (!formData.residentData?.dateOfBirth) return "";
                                                    const today = new Date();
                                                    const birthDate = new Date(formData.residentData.dateOfBirth);
                                                    let age = today.getFullYear() - birthDate.getFullYear();
                                                    const m = today.getMonth() - birthDate.getMonth();
                                                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                                                    return age;
                                                })()}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Civil Status</Label>
                                            <Select
                                                value={formData.residentData?.civilStatus?.toUpperCase()}
                                                onValueChange={(val) => setFormData(p => ({ ...p, residentData: { ...p.residentData, civilStatus: val } }))}
                                            >
                                                <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm">
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SINGLE">Single</SelectItem>
                                                    <SelectItem value="MARRIED">Married</SelectItem>
                                                    <SelectItem value="WIDOWED">Widowed</SelectItem>
                                                    <SelectItem value="SEPARATED">Separated</SelectItem>
                                                    <SelectItem value="ANNULLED">Annulled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Citizenship</Label>
                                            <Input
                                                value={formData.residentData?.citizenship || "Filipino"}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, citizenship: e.target.value } }))}
                                                readOnly={!!initialResident?.citizenship}
                                                className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm", !!initialResident?.citizenship && "bg-slate-50 text-slate-400")}
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Contact */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    value={formData.residentData?.email || ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, email: e.target.value } }))}
                                                    readOnly={!!initialResident?.email}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm pl-10", !!initialResident?.email && "bg-slate-50 text-slate-400")}
                                                />
                                                <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</Label>
                                            <Input
                                                value={formData.residentData?.contactNumber || ""}
                                                onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, contactNumber: e.target.value } }))}
                                                className="h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm"
                                                placeholder="09xx xxx xxxx"
                                            />
                                            <p className="text-[9px] text-slate-400 font-bold italic ml-1">
                                                * We will use this number to contact you about your request status.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-primary/5 border border-primary/10 p-4 rounded-3xl flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0" />
                                    <p className="text-[10px] text-primary font-black italic leading-tight uppercase tracking-widest">
                                        Note: Any changes you make here will automatically update your permanent Resident Profile upon successful transaction submission.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: FINANCIAL DECLARATION */}
                        {currentStep === "DECLARATION" && (
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Community Tax <span className="text-primary italic">Declaration</span></h2>
                                    <p className="text-slate-500 font-medium italic text-lg leading-relaxed">Declare your annual financial status for the computation of additional community tax.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        {formData.applicantType === "JURIDICAL" && (
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Business Registered Name</Label>
                                                <Input
                                                    value={formData.businessName}
                                                    onChange={(e) => setFormData(p => ({ ...p, businessName: e.target.value }))}
                                                    placeholder="Enter Business Name"
                                                    className="h-16 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 text-xl font-black italic italic bg-white"
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Total Annual Gross Income</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 italic">₱</span>
                                                <Input
                                                    type="number"
                                                    value={formData.income}
                                                    onChange={(e) => setFormData(p => ({ ...p, income: e.target.value }))}
                                                    className="h-16 pl-10 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 text-xl font-black italic italic bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Real Property Assessed Value</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 italic">₱</span>
                                                <Input
                                                    type="number"
                                                    value={formData.propertyValue}
                                                    onChange={(e) => setFormData(p => ({ ...p, propertyValue: e.target.value }))}
                                                    className="h-16 pl-10 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 text-xl font-black italic italic bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group/calc selection:bg-primary/30 active:scale-[0.99] transition-transform">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Calculator className="w-32 h-32 rotate-12" />
                                        </div>
                                        {/* <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic"></h3> */}
                                        <div className="space-y-4 border-b border-white/10 pb-6 relative z-10 font-bold">
                                            <div className="flex justify-between items-center text-xs uppercase tracking-widest italic opacity-70">
                                                <span>Basic Community Tax</span>
                                                <span>₱{calcResult?.basicTax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs uppercase tracking-widest italic opacity-70">
                                                <span>Additional Tax</span>
                                                <span>₱{calcResult?.additionalTax.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs uppercase tracking-widest italic text-amber-500">
                                                <span className="flex items-center gap-2">Penalty (24% Int.) {isPastCedulaDeadline() && <AlertCircle className="w-3.5 h-3.5" />}</span>
                                                <span>₱{calcResult?.penalty.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs uppercase tracking-widest italic opacity-70">
                                                <span>Delivery Fee</span>
                                                <span>₱{calcResult?.deliveryFee.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 flex justify-between items-end relative z-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic mb-2">Total Amount Due</span>
                                            <span className="text-5xl font-black italic italic tracking-tighter">₱{calcResult?.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: LOGISTICS & PAYMENT */}
                        {currentStep === "DELIVERY" && (
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Fulfillment <span className="text-primary italic">& Payment</span></h2>
                                    <p className="text-slate-500 font-medium italic text-lg leading-relaxed">Select how you want to receive your Cedula and your preferred mode of payment.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Fulfillment Mode</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { id: "PICK_UP", label: "For Pickup", icon: MapPin },
                                                { id: "DELIVERY", label: "For Deliver", icon: Truck }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData(p => ({ ...p, fulfillmentType: opt.id as any }))}
                                                    className={cn(
                                                        "flex flex-col items-center gap-4 p-8 rounded-3xl border-2 transition-all group select-none active:scale-[0.95]",
                                                        formData.fulfillmentType === opt.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/40"
                                                    )}
                                                >
                                                    <opt.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {formData.fulfillmentType === "DELIVERY" && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-6 pt-4"
                                            >
                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Pin Your Delivery Location</Label>
                                                    <LocationPicker 
                                                        lat={formData.deliveryLat}
                                                        lng={formData.deliveryLng}
                                                        onChange={(lat, lng) => setFormData(p => ({ ...p, deliveryLat: lat, deliveryLng: lng }))}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">House/Bldg No.</Label>
                                                        <Input
                                                            value={formData.deliveryAddress.houseNumber}
                                                            onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, houseNumber: e.target.value } }))}
                                                            placeholder="Floor/Unit/House #"
                                                            className="h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 font-bold italic"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Street / Block</Label>
                                                        <Input
                                                            value={formData.deliveryAddress.street}
                                                            onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, street: e.target.value } }))}
                                                            placeholder="Street Name"
                                                            className="h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 font-bold italic"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Sitio</Label>
                                                        <Input
                                                            value={formData.deliveryAddress.sitio}
                                                            onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, sitio: e.target.value } }))}
                                                            placeholder="Sitio"
                                                            className="h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 font-bold italic"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Purok</Label>
                                                        <Input
                                                            value={formData.deliveryAddress.purok}
                                                            onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, purok: e.target.value } }))}
                                                            placeholder="Purok"
                                                            className="h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 font-bold italic"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Barangay</Label>
                                                    <Input
                                                        value={formData.deliveryAddress.barangay}
                                                        onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, barangay: e.target.value } }))}
                                                        placeholder="Barangay"
                                                        className="h-14 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 font-bold italic"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Municipality</Label>
                                                        <Input 
                                                            value={formData.deliveryAddress.municipality} 
                                                            onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, municipality: e.target.value } }))}
                                                            placeholder="Municipality"
                                                            className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-[10px] font-black italic uppercase" 
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Province</Label>
                                                        <Input 
                                                            value={formData.deliveryAddress.province} 
                                                            onChange={(e) => setFormData(p => ({ ...p, deliveryAddress: { ...p.deliveryAddress, province: e.target.value } }))}
                                                            placeholder="Province"
                                                            className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-[10px] font-black italic uppercase" 
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Nearby Landmark</Label>
                                                    <Input
                                                        value={formData.deliveryLandmark}
                                                        onChange={(e) => setFormData(p => ({ ...p, deliveryLandmark: e.target.value }))}
                                                        placeholder="e.g. In front of Sari-sari store"
                                                        className="h-16 rounded-2xl border-slate-200 dark:border-white/10 dark:bg-white/5 text-md font-bold italic bg-white pr-4"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-8">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-1">Payment Method</Label>
                                        <div className="space-y-4">
                                            {[
                                                { 
                                                    id: formData.fulfillmentType === "DELIVERY" ? "CASH_ON_DELIVERY" : "CASH", 
                                                    label: formData.fulfillmentType === "DELIVERY" ? "Cash on Delivery" : "Cash Over-the-Counter", 
                                                    icon: Wallet, 
                                                    desc: formData.fulfillmentType === "DELIVERY" ? "Pay when your document arrives" : "Pay at the Treasury Office" 
                                                },
                                                { id: "E_PAYMENT", label: "Online E-Payment", icon: CreditCard, desc: "GCash, Maya, or Debit/Credit" },
                                                { id: "BANK_TRANSFER", label: "Direct Bank Transfer", icon: Building2, desc: "Landbank or Other Banks" }
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData(p => ({ ...p, paymentType: opt.id as any }))}
                                                    className={cn(
                                                        "w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all hover:scale-[1.01] group select-none relative overflow-hidden active:scale-[0.98]",
                                                        formData.paymentType === opt.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                                                        formData.paymentType === opt.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:text-primary"
                                                    )}>
                                                        <opt.icon className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left py-1">
                                                        <h4 className={cn("text-sm font-black uppercase italic tracking-widest transition-colors", formData.paymentType === opt.id ? "text-primary" : "text-slate-600 dark:text-slate-300")}>{opt.label}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold italic uppercase">{opt.desc}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: FINAL REVIEW & ATTACHMENTS */}
                        {currentStep === "CONFIRM" && (
                            <div className="space-y-12 pb-10">
                                <div className="space-y-4 text-center">
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Final <span className="text-primary italic">Review</span></h2>
                                    <p className="text-slate-500 font-medium italic text-lg leading-relaxed max-w-lg mx-auto">Upload required documents to verify your identity and finalize your application.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-4 transition-all hover:border-primary hover:bg-primary/[0.02]">
                                            <div className="flex items-center gap-4 w-full text-left">
                                                <div className="w-12 h-12 bg-white dark:bg-black/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                    <Upload className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-white italic">Valid Government ID</h4>
                                                    <p className="text-[9px] text-slate-400 font-bold italic uppercase tracking-tighter line-clamp-1">PDF or Image (Max 5MB)</p>
                                                </div>
                                            </div>

                                            {formData.idFile && formData.idFile.type.startsWith("image/") && (
                                                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg group/preview mt-1">
                                                    <img 
                                                        src={URL.createObjectURL(formData.idFile)} 
                                                        alt="ID Preview" 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[7px] font-black text-white uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">Live Preview</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between w-full gap-3 mt-1">
                                                <input type="file" onChange={(e) => handleFileChange(e, "idFile")} className="hidden" id="id-upload" />
                                                <Button asChild variant={formData.idFile ? "outline" : "default"} className="font-black italic uppercase tracking-widest text-[9px] px-6 h-8 rounded-full active:scale-95 transition-transform flex-1">
                                                    <label htmlFor="id-upload" className="cursor-pointer">
                                                        {formData.idFile ? "Change" : "Upload File"}
                                                    </label>
                                                </Button>
                                                {formData.idFile && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black italic text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 h-8 rounded-full flex-1 line-clamp-1 truncate">
                                                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{formData.idFile.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-4 transition-all hover:border-primary hover:bg-primary/[0.02]">
                                            <div className="flex items-center gap-4 w-full text-left">
                                                <div className="w-12 h-12 bg-white dark:bg-black/20 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                                    <Upload className="w-6 h-6 text-primary" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-white italic">Proof of Income</h4>
                                                    <p className="text-[9px] text-slate-400 font-bold italic uppercase tracking-tighter line-clamp-1">Payslip / BIR Form (Max 5MB)</p>
                                                </div>
                                            </div>

                                            {formData.proofFile && formData.proofFile.type.startsWith("image/") && (
                                                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg group/preview mt-1">
                                                    <img 
                                                        src={URL.createObjectURL(formData.proofFile)} 
                                                        alt="Proof Preview" 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[7px] font-black text-white uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">Live Preview</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between w-full gap-3 mt-1">
                                                <input type="file" onChange={(e) => handleFileChange(e, "proofFile")} className="hidden" id="proof-upload" />
                                                <Button asChild variant={formData.proofFile ? "outline" : "default"} className="font-black italic uppercase tracking-widest text-[9px] px-6 h-8 rounded-full active:scale-95 transition-transform flex-1">
                                                    <label htmlFor="proof-upload" className="cursor-pointer">
                                                        {formData.proofFile ? "Change" : "Upload File"}
                                                    </label>
                                                </Button>
                                                {formData.proofFile && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black italic text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 h-8 rounded-full flex-1 line-clamp-1 truncate">
                                                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{formData.proofFile.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                    </div>
                                    <p className="text-[10px] leading-relaxed font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
                                        By submitting this application, I confirm that all information declared above is true and correct. I authorize the Municipal Treasurer to verify the submitted documents for the computation of my Community Tax Certificate.
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
                </div>

                {/* Integrated Navigation Card Actions */}
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-end">
                    <Button
                        onClick={currentStep === "CONFIRM" ? onSubmit : handleNext}
                        disabled={submitting || (currentStep === "CONFIRM" && (!formData.idFile || !formData.proofFile))}
                        className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-[10px] md:text-xs rounded-2xl px-12 h-12 md:h-14 group transition-all duration-300 active:scale-95 font-black uppercase tracking-widest italic"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <div className="flex items-center">
                                {currentStep === "CONFIRM" ? "Finalize Submission" : "Next Phase"}
                                <ChevronRight className={cn("w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform", submitting && "hidden")} />
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Sticky Actions */}
            {/* Sticky Progress Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-[#06080a]/70 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10 z-50 p-4 flex flex-col items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1400px] w-full flex items-center justify-center font-black uppercase tracking-[0.3em] italic text-[9px] text-slate-400 select-none">
                    Phase {STEPS.findIndex(s => s.id === currentStep) + 1} of 5
                </div>
            </div>
        </div>
    );
}
