"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Calculator,
    ChevronRight,
    Loader2,
    Check,
    AlertCircle,
    Home,
    Upload,
    Sparkles,
    TrendingUp,
    Lock,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { calculateBusinessPermit, BusinessPermitResult } from "@/lib/business-permit";
import { getCurrentUserResident, getTransactionTypes, submitBusinessPermitTransaction, getBarangaysList } from "@/app/admin/transactions/actions";

// --- TYPES ---
type Step = "PATHWAY" | "PROFILE" | "CHECKLIST" | "SUBMIT";

interface FormState {
    typeId: string;
    businessType: "NEW" | "RENEWAL";
    businessName: string;
    tradeName: string;
    orgType: string;
    dtiSecNumber: string;
    permitNumber: string; // Used for renewals
    lineOfBusiness: string;
    barangay: string; // Barangay location of the business
    capitalInvestment: string; // Declared Capitalization for new
    grossSales: string; // Declared gross sales for renewals
    employeeCount: string;
    businessArea: string;
    fulfillmentType: "PICK_UP" | "DELIVERY" | "E_COPY";
    deliveryAddress: string;
    deliveryPhone: string;
    
    // Files
    ctcFile: File | null;
    dtiSecFile: File | null;
    brgyClearanceFile: File | null;
    ownerIdFile: File | null;
    locationPhotoFile: File | null;
    sanitaryPermitFile: File | null;
    fireSafetyFile: File | null;
    birCorFile: File | null;
}

const STEPS: { id: Step; label: string; icon: any }[] = [
    { id: "PATHWAY", label: "Status", icon: Sparkles },
    { id: "PROFILE", label: "Identity", icon: User },
    { id: "CHECKLIST", label: "Documents", icon: Upload },
    { id: "SUBMIT", label: "Submit", icon: CheckCircle2 },
];

const MAPANDAN_BARANGAYS = [
    "Amanoaoac",
    "Apaya",
    "Aserda",
    "Baloling",
    "Coral",
    "Golden",
    "Lanas",
    "Nilombot",
    "Patland",
    "Pias",
    "Poblacion",
    "Primicias",
    "Santa Maria",
    "Torres",
    "Valenzuela"
];

export default function BusinessPermitWizardPage() {
    const router = useRouter();
    
    const [currentStep, setCurrentStep] = useState<Step>("PATHWAY");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false); // 3-Strike Penalty Flag
    const [calcResult, setCalcResult] = useState<BusinessPermitResult | null>(null);
    const [initialResident, setInitialResident] = useState<any>(null);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [dbBarangays, setDbBarangays] = useState<string[]>([]);
    
    // Inactivity State
    const [idleTime, setIdleTime] = useState(0);
    const [showIdleModal, setShowIdleModal] = useState(false);
    
    const [formData, setFormData] = useState<FormState>({
        typeId: "",
        businessType: "NEW",
        businessName: "",
        tradeName: "",
        orgType: "SOLE_PROPRIETORSHIP",
        dtiSecNumber: "",
        permitNumber: "",
        lineOfBusiness: "",
        barangay: "",
        capitalInvestment: "",
        grossSales: "",
        employeeCount: "1",
        businessArea: "",
        fulfillmentType: "E_COPY",
        deliveryAddress: "",
        deliveryPhone: "",
        ctcFile: null,
        dtiSecFile: null,
        brgyClearanceFile: null,
        ownerIdFile: null,
        locationPhotoFile: null,
        sanitaryPermitFile: null,
        fireSafetyFile: null,
        birCorFile: null
    });

    // --- IDLE TIMER SECURE LOGOUT (2 Minutes) ---
    useEffect(() => {
        const interval = setInterval(() => {
            setIdleTime(prev => {
                const nextTime = prev + 1;
                // At 90 seconds, prompt 30-second warning modal
                if (nextTime === 90) {
                    setShowIdleModal(true);
                }
                // At 120 seconds (2 mins), force logout
                if (nextTime >= 120) {
                    clearInterval(interval);
                    signOut({ callbackUrl: "/auth/login" });
                    toast.warning("Securely signed out due to 2 minutes of inactivity.");
                }
                return nextTime;
            });
        }, 1000);

        const resetTimer = () => {
            setIdleTime(0);
            setShowIdleModal(false);
        };

        window.addEventListener("mousemove", resetTimer);
        window.addEventListener("keydown", resetTimer);
        window.addEventListener("scroll", resetTimer);
        window.addEventListener("click", resetTimer);

        return () => {
            clearInterval(interval);
            window.removeEventListener("mousemove", resetTimer);
            window.removeEventListener("keydown", resetTimer);
            window.removeEventListener("scroll", resetTimer);
            window.removeEventListener("click", resetTimer);
        };
    }, []);

    // --- INITIALIZATION & DRAFT HYDRATION ---
    useEffect(() => {
        async function init() {
            try {
                // Check user rejection count (rejection count strikes penalty check)
                const residentRes = await getCurrentUserResident();
                const resident = residentRes.data;
                
                if (residentRes.success && resident) {
                    setInitialResident(resident);
                    
                    // Validate strikes on load
                    const resWithUser = resident as any;
                    if (resWithUser.user && (resWithUser.user.rejectionCount ?? 0) >= 3) {
                        setIsSuspended(true);
                        setLoading(false);
                        return;
                    }

                    setFormData(prev => ({
                        ...prev,
                        barangay: resident.barangay || "",
                        deliveryPhone: resident.contactNumber || "",
                        deliveryAddress: resident.houseNumber 
                            ? `${resident.houseNumber} ${resident.street || ""}, Brgy. ${resident.barangay || ""}, Mapandan` 
                            : ""
                    }));
                }

                // Fetch database transaction types to map typeIds
                const typesRes = await getTransactionTypes();
                if (typesRes.success) {
                    const bpTypes = typesRes.data?.filter((t: any) => t.code.startsWith("BUSINESS_PERMIT")) || [];
                    if (bpTypes.length > 0) {
                        (window as any)._bpTypes = bpTypes;
                        // Select default NEW permit type ID
                        const newType = bpTypes.find((t: any) => t.code === "BUSINESS_PERMIT_NEW") || bpTypes[0];
                        setFormData(prev => ({ ...prev, typeId: newType.id }));
                    }
                }

                // Fetch active barangays from database
                const brgyRes = await getBarangaysList();
                if (brgyRes.success && brgyRes.data) {
                    setDbBarangays(brgyRes.data);
                }

                // Hydrate inputs draft from localStorage
                const savedDraft = localStorage.getItem("emapandan_bp_draft");
                if (savedDraft) {
                    const parsed = JSON.parse(savedDraft);
                    setFormData(prev => ({
                        ...prev,
                        ...parsed,
                        // Do not persist raw files in JSON draft
                        ctcFile: null,
                        dtiSecFile: null,
                        brgyClearanceFile: null,
                        ownerIdFile: null,
                        locationPhotoFile: null,
                        sanitaryPermitFile: null,
                        fireSafetyFile: null,
                        birCorFile: null
                    }));
                    toast.success("Draft application restored successfully!");
                }
            } catch (err) {
                console.error("Initialization error:", err);
                toast.error("Failed to initialize permits portal");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    // --- AUTO-SAVE ON FIELD CHANGES ---
    const persistDraft = (state: FormState) => {
        const textInputs = {
            businessType: state.businessType,
            businessName: state.businessName,
            tradeName: state.tradeName,
            barangay: state.barangay,
            dtiSecNumber: state.dtiSecNumber,
            permitNumber: state.permitNumber,
            lineOfBusiness: state.lineOfBusiness,
            capitalInvestment: state.capitalInvestment,
            grossSales: state.grossSales,
            employeeCount: state.employeeCount,
            businessArea: state.businessArea,
            fulfillmentType: state.fulfillmentType,
            deliveryAddress: state.deliveryAddress,
            deliveryPhone: state.deliveryPhone
        };
        localStorage.setItem("emapandan_bp_draft", JSON.stringify(textInputs));
    };

    const handleInputChange = (field: keyof FormState, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            
            // Auto-switch transaction type ID if changing pathway
            if (field === "businessType" && (window as any)._bpTypes) {
                const targetCode = value === "NEW" ? "BUSINESS_PERMIT_NEW" : "BUSINESS_PERMIT_RENEW";
                const matchedType = (window as any)._bpTypes.find((t: any) => t.code === targetCode);
                if (matchedType) {
                    updated.typeId = matchedType.id;
                }
            }

            persistDraft(updated);
            return updated;
        });
    };

    // --- REALTIME READ-ONLY COMPUTATION PREVIEW ---
    const updateCalc = useCallback(() => {
        const cap = parseFloat(formData.capitalInvestment.replace(/,/g, "")) || 0;
        const sales = parseFloat(formData.grossSales.replace(/,/g, "")) || 0;

        const result = calculateBusinessPermit({
            type: formData.businessType,
            capitalization: cap,
            grossSales: sales,
            fulfillmentType: formData.fulfillmentType,
            deliveryFee: 100.00 // Standard municipal dispatch logistics fee
        });
        setCalcResult(result);
    }, [formData.capitalInvestment, formData.grossSales, formData.businessType, formData.fulfillmentType]);

    useEffect(() => {
        updateCalc();
    }, [updateCalc]);

    // --- DYNAMIC STEP VALIDATIONS ---
    const isStepValid = (stepId: Step) => {
        switch (stepId) {
            case "PATHWAY":
                return !!formData.typeId;
            case "PROFILE":
                if (!formData.businessName || !formData.lineOfBusiness || !formData.barangay) return false;
                if (formData.businessType === "NEW") {
                    return parseFloat(formData.capitalInvestment) > 0 && !!formData.dtiSecNumber;
                } else {
                    return parseFloat(formData.grossSales) > 0 && !!formData.permitNumber;
                }
            case "CHECKLIST":
                // 7 Mandatory File uploads must all be loaded
                return !!(
                    formData.ctcFile &&
                    formData.dtiSecFile &&
                    formData.brgyClearanceFile &&
                    formData.ownerIdFile &&
                    formData.locationPhotoFile &&
                    formData.sanitaryPermitFile &&
                    formData.fireSafetyFile
                );
            case "SUBMIT":
                return privacyAccepted;
            default:
                return true;
        }
    };

    const canNavigate = (targetStep: Step) => {
        const targetIdx = STEPS.findIndex(s => s.id === targetStep);
        const currentIdx = STEPS.findIndex(s => s.id === currentStep);

        // Always allow going backwards
        if (targetIdx <= currentIdx) return true;

        // For forward navigation (clicking tab icons), ensure all PRECEDING steps are valid
        for (let i = 0; i < targetIdx; i++) {
            if (!isStepValid(STEPS[i].id)) return false;
        }
        return true;
    };

    const handleNext = () => {
        if (!isStepValid(currentStep)) {
            if (currentStep === "PROFILE") {
                toast.error("Please fill out all required business profile details.");
            } else if (currentStep === "CHECKLIST") {
                toast.error("All 7 checklist requirements are mandatory. Please upload all missing documents.");
            } else {
                toast.error("Please complete the required items in this step.");
            }
            return;
        }
        const idx = STEPS.findIndex(s => s.id === currentStep);
        if (idx < STEPS.length - 1) {
            setCurrentStep(STEPS[idx + 1].id);
            window.scrollTo(0, 0);
        }
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormState) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    // --- FORM ACTIONS SUBMISSION ---
    const onSubmit = async () => {
        setSubmitting(true);
        try {
            const submitData = new FormData();
            submitData.append("typeId", formData.typeId);
            submitData.append("residentSnapshot", JSON.stringify(initialResident));

            // Merge textual profiles into additionalData metadata
            submitData.append("additionalData", JSON.stringify({
                businessType: formData.businessType,
                businessName: formData.businessName,
                tradeName: formData.tradeName,
                orgType: formData.orgType,
                dtiSecNumber: formData.dtiSecNumber,
                permitNumber: formData.permitNumber,
                lineOfBusiness: formData.lineOfBusiness,
                barangay: formData.barangay,
                capitalInvestment: parseFloat(formData.capitalInvestment.replace(/,/g, "")) || 0,
                grossSales: parseFloat(formData.grossSales.replace(/,/g, "")) || 0,
                employeeCount: parseInt(formData.employeeCount) || 1,
                businessArea: parseFloat(formData.businessArea) || 0,
                fulfillmentType: null,
                deliveryAddress: null,
                deliveryPhone: null
            }));

            // Append BPLO checklist files
            if (formData.ctcFile) submitData.append("ctcFile", formData.ctcFile);
            if (formData.dtiSecFile) submitData.append("dtiSecFile", formData.dtiSecFile);
            if (formData.brgyClearanceFile) submitData.append("brgyClearanceFile", formData.brgyClearanceFile);
            if (formData.ownerIdFile) submitData.append("ownerIdFile", formData.ownerIdFile);
            if (formData.locationPhotoFile) submitData.append("locationPhotoFile", formData.locationPhotoFile);
            if (formData.sanitaryPermitFile) submitData.append("sanitaryPermitFile", formData.sanitaryPermitFile);
            if (formData.fireSafetyFile) submitData.append("fireSafetyFile", formData.fireSafetyFile);
            if (formData.birCorFile) submitData.append("birCorFile", formData.birCorFile);

            const res = await submitBusinessPermitTransaction(submitData);
            if (res.success) {
                localStorage.removeItem("emapandan_bp_draft"); // Purge draft upon successful submission
                toast.success("Business Permit application submitted successfully!");
                router.push("/user/services/requests");
            } else {
                toast.error(res.error || "Submission failed. Please check inputs.");
            }
        } catch (err) {
            console.error("Submit error:", err);
            toast.error("An error occurred during submission.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- UI LOADING STATE ---
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-500/20" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">Synchronizing Business Portal...</p>
            </div>
        );
    }

    // --- 3-STRIKE REJECTION BLOCK RENDER ---
    if (isSuspended) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 pb-32">
                <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500 rounded-[2rem] flex items-center justify-center mx-auto text-red-500 shadow-xl shadow-red-500/15">
                    <Lock className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Portal Suspended</h1>
                    <div className="max-w-xl mx-auto p-6 bg-red-500/5 dark:bg-red-500/10 rounded-3xl border border-red-500/30 text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed italic">
                        &quot;Your account has been suspended from submitting online applications due to acquiring 3 rejection strikes on your permit filings. To comply, please apply onsite directly at the Business Permit Department inside the Mapandan Municipal Hall.&quot;
                    </div>
                </div>
                <div className="pt-6">
                    <Link href="/">
                        <Button className="rounded-full px-12 py-5 font-black uppercase tracking-widest text-[10px] border-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 transition-all hover:opacity-90">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-32">
            {/* Header / Breadcrumb */}
            <div className="space-y-4 md:space-y-10">
                <div className="sticky top-[70px] z-40 md:static -mx-4 md:mx-0 px-4 md:px-0 pt-2 md:pt-0">
                    <Breadcrumb>
                        <BreadcrumbList className="bg-white/80 dark:bg-white/5 backdrop-blur-md px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 w-fit shadow-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic">
                                        <Home className="w-3.5 h-3.5 mb-0.5" />
                                        Home
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-slate-300 dark:text-white/10" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Permit Portal</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-1 md:px-0">
                    <div className="space-y-1 md:space-y-2">
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none select-none">
                            BUSINESS <span className="text-primary underline decoration-[6px] md:decoration-8 decoration-primary/20 underline-offset-[6px] md:underline-offset-[12px]">PERMIT</span>
                        </h1>
                        <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-1 md:ml-2 italic">Streamlined Permitting & Compliance Portal</p>
                    </div>
                </div>
            </div>

            {/* Progress Stepper */}
            <div className="grid grid-cols-4 gap-1.5 md:gap-4 relative px-1 md:px-2">
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
                                    if (currentStep === "PROFILE") {
                                        toast.error("Please complete your identity details first.");
                                    } else if (currentStep === "CHECKLIST") {
                                        toast.error("Please complete the checklist first.");
                                    } else {
                                        toast.error("Please complete the current phase first.");
                                    }
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center gap-2 md:gap-3 relative z-10 font-black cursor-pointer group",
                                (!canNavigate(step.id) && !isActive) && "cursor-not-allowed opacity-50"
                            )}
                        >
                            <div className={cn(
                                "w-11 h-11 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                                isActive ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-105 md:scale-110" :
                                    isCompleted ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                                        "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent group-hover:border-primary/30"
                            )}>
                                <Icon className="w-4 h-4 md:w-7 md:h-7" />
                            </div>
                            <span className={cn(
                                "text-[7px] md:text-[10px] uppercase tracking-widest text-center italic hidden sm:block",
                                isActive ? "text-primary opacity-100 font-black" : "opacity-40 group-hover:opacity-100 transition-opacity"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Inactivity Warning Modal */}
            <AnimatePresence>
                {showIdleModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white dark:bg-[#0c0d12] border border-slate-100 dark:border-white/10 rounded-[3rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500 rounded-[1.5rem] flex items-center justify-center mx-auto text-amber-500 animate-pulse">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Inactivity Warning</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                    Are you still there? You will be securely signed out in <span className="text-amber-500">{120 - idleTime}s</span> due to security compliance.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Step Content */}
            <div className="mt-4 md:mt-8 md:bg-white md:dark:bg-[#11131a] md:rounded-[2.5rem] md:border md:border-slate-200 md:dark:border-white/10 p-0 md:p-12 md:shadow-2xl relative md:overflow-hidden group/container min-h-[400px] md:min-h-[500px] flex flex-col">
                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                        {/* STEP 1: PATHWAY SELECTOR */}
                        {currentStep === "PATHWAY" && (
                            <div className="space-y-8 md:space-y-12">
                                <div className="space-y-3 md:space-y-4 text-center">
                                    <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">Choose Application <span className="text-primary italic">Pathway</span></h2>
                                    <p className="text-slate-500 font-medium italic text-xs md:text-lg uppercase tracking-widest max-w-2xl mx-auto">Select your current business permit status to proceed.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                                    {[
                                        { 
                                            id: "NEW", 
                                            label: "New Business Permit", 
                                            desc: "For newly registered businesses in Mapandan. Based on initial declared capitalization investment.", 
                                            icon: Sparkles
                                        },
                                        { 
                                            id: "RENEWAL", 
                                            label: "Permit Renewal", 
                                            desc: "For existing businesses renewing for the current year. Calculated on previous annual gross receipts/sales.", 
                                            icon: TrendingUp
                                        }
                                    ].map(opt => {
                                        const Icon = opt.icon;
                                        const isSelected = formData.businessType === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => handleInputChange("businessType", opt.id as any)}
                                                className={cn(
                                                    "p-6 md:p-10 rounded-2xl md:rounded-[3rem] border-2 md:border-4 transition-all duration-500 text-left relative group select-none overflow-hidden h-[240px] md:h-[300px] flex flex-col justify-between",
                                                    isSelected ? "bg-primary text-white border-primary shadow-2xl scale-[1.02]" : "bg-white/40 dark:bg-white/5 backdrop-blur-md border-slate-100 dark:border-white/10 hover:border-primary/30"
                                                )}
                                            >
                                                <div className={cn("w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110", isSelected ? "bg-white/20" : "bg-primary/5 text-primary")}>
                                                    <Icon className={cn("w-6 h-6 md:w-10 md:h-10", isSelected ? "animate-pulse" : "")} />
                                                </div>
                                                <div className="space-y-1 md:space-y-2 relative z-10">
                                                    <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter">
                                                        {opt.label}
                                                    </h4>
                                                    <p className={cn("text-[9px] md:text-[11px] font-bold uppercase italic tracking-widest leading-relaxed", isSelected ? "text-white/70" : "text-slate-400")}>
                                                        {opt.desc}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <motion.div layoutId="check" className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
                                                        <Check className="w-4 h-4 md:w-6 md:h-6 stroke-[4]" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PROFILE FORMS */}
                        {currentStep === "PROFILE" && (
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 dark:border-white/5 pb-4">
                                    <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">Business Details</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Provide legal and financial registration metrics</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Official Business Name (DTI/SEC) <span className="text-rose-500 ml-0.5">*</span></Label>
                                        <Input
                                            type="text"
                                            value={formData.businessName}
                                            onChange={e => handleInputChange("businessName", e.target.value)}
                                            placeholder="e.g. Mapandan Express Café Inc."
                                            className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Trade / Signage Name</Label>
                                        <Input
                                            type="text"
                                            value={formData.tradeName}
                                            onChange={e => handleInputChange("tradeName", e.target.value)}
                                            placeholder="e.g. Agno Express Café"
                                            className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Business Barangay Location <span className="text-rose-500 ml-0.5">*</span></Label>
                                        <select
                                            value={formData.barangay}
                                            onChange={e => handleInputChange("barangay", e.target.value)}
                                            className="w-full rounded-xl h-12 border border-slate-200 dark:border-white/10 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                                        >
                                            <option value="" disabled className="dark:bg-[#0c0d12] text-slate-400">Select Barangay...</option>
                                            {(dbBarangays.length > 0 ? dbBarangays : MAPANDAN_BARANGAYS).map((b) => (
                                                <option key={b} value={b} className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">{b}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Line of Business <span className="text-rose-500 ml-0.5">*</span></Label>
                                        <Input
                                            type="text"
                                            value={formData.lineOfBusiness}
                                            onChange={e => handleInputChange("lineOfBusiness", e.target.value)}
                                            placeholder="e.g. Food & Beverage / Coffee Shop"
                                            className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Employee Count</Label>
                                        <Input
                                            type="number"
                                            value={formData.employeeCount}
                                            onChange={e => handleInputChange("employeeCount", e.target.value)}
                                            min="1"
                                            className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Store Area (in Sqm)</Label>
                                        <Input
                                            type="number"
                                            value={formData.businessArea}
                                            onChange={e => handleInputChange("businessArea", e.target.value)}
                                            placeholder="e.g. 120"
                                            className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                        />
                                    </div>

                                    {/* Pathway Specific Inputs */}
                                    {formData.businessType === "NEW" ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">DTI / SEC Registration Number <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                    type="text"
                                                    value={formData.dtiSecNumber}
                                                    onChange={e => handleInputChange("dtiSecNumber", e.target.value)}
                                                    placeholder="e.g. DTI-123456789"
                                                    className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                                />
                                            </div>
                                            <div className="space-y-2 relative">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Initial Capitalization Investment (₱) <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                    type="text"
                                                    value={formData.capitalInvestment}
                                                    onChange={e => handleInputChange("capitalInvestment", e.target.value)}
                                                    placeholder="e.g. 250,000"
                                                    className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 pr-12 font-mono"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Existing Permit License Number <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                    type="text"
                                                    value={formData.permitNumber}
                                                    onChange={e => handleInputChange("permitNumber", e.target.value)}
                                                    placeholder="e.g. MP-2025-0816"
                                                    className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Previous Year&apos;s Annual Gross Sales (₱) <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                    type="text"
                                                    value={formData.grossSales}
                                                    onChange={e => handleInputChange("grossSales", e.target.value)}
                                                    placeholder="e.g. 1,200,000"
                                                    className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 pr-12 font-mono"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Math Calculator Realtime Preview Panel */}
                                {calcResult && (
                                    <div className="mt-8 p-6 bg-emerald-500/[0.02] border-2 border-dashed border-emerald-500/20 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                                <Calculator className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Tax Computation Simulated</h4>
                                                <p className="text-xs text-slate-400 leading-tight">Estimated base tax assessment.</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Simulated Base Bill</span>
                                            <span className="text-2xl font-black text-emerald-500 font-mono">₱{(calcResult.baseFee + calcResult.taxAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3: FILE UPLOAD CHECKLIST DROPS */}
                        {currentStep === "CHECKLIST" && (
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 dark:border-white/5 pb-4">
                                    <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">Required Document Checklist</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">All 7 uploads are strictly mandatory for compliance evaluation</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { label: "1. Unified Form CTC", field: "ctcFile" },
                                        { label: "2. DTI / SEC / CDA Registration", field: "dtiSecFile" },
                                        { label: "3. Barangay Clearance", field: "brgyClearanceFile" },
                                        { label: "4. Valid ID of Owner", field: "ownerIdFile" },
                                        { label: "5. Photo of Location Location", field: "locationPhotoFile" },
                                        { label: "6. Sanitary Permit", field: "sanitaryPermitFile" },
                                        { label: "7. Fire Safety Inspection Certificate", field: "fireSafetyFile" },
                                        { label: "8. BIR Certificate of Registration (Optional)", field: "birCorFile", optional: true }
                                    ].map(item => {
                                        const file = formData[item.field as keyof FormState] as File | null;
                                        return (
                                            <div key={item.field} className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic flex justify-between">
                                                    <span>{item.label}</span>
                                                    {item.optional && <span className="text-slate-400 font-medium tracking-normal lowercase">(optional)</span>}
                                                </Label>
                                                <div className={cn(
                                                    "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all relative overflow-hidden",
                                                    file 
                                                        ? "border-emerald-500 bg-emerald-500/[0.02]" 
                                                        : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
                                                )}>
                                                    <input 
                                                        type="file" 
                                                        onChange={e => handleFileChange(e, item.field as keyof FormState)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                                    />
                                                    <div className="flex items-center gap-3 text-left">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                            file ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-white/5 text-slate-400"
                                                        )}>
                                                            <Upload className="w-4 h-4" />
                                                        </div>
                                                        <div className="truncate max-w-[250px]">
                                                            {file ? (
                                                                <>
                                                                    <span className="block text-xs font-black text-slate-900 dark:text-white truncate">{file.name}</span>
                                                                    <span className="block text-[8px] font-mono text-emerald-500 uppercase tracking-widest">Uploaded ({(file.size / 1024).toFixed(1)} KB)</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="block text-xs font-black text-slate-400 italic">Choose or Drop File</span>
                                                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">PDF / PNG / JPG max 5MB</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: FINAL REVIEWS & FULFILLMENT */}
                        {currentStep === "SUBMIT" && calcResult && (
                            <div className="space-y-8">
                                <div className="border-b border-slate-100 dark:border-white/5 pb-4">
                                    <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">Final Assessment & Submission</h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Review your assessed bill and confirm your permit request</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Column A: Summary & Declarations */}
                                    <div className="space-y-6">
                                        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Filing Summary Review</h3>
                                            <div className="space-y-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                                                    <span>Official Name</span>
                                                    <span className="text-slate-900 dark:text-white font-mono text-right truncate max-w-[200px]">{formData.businessName}</span>
                                                </div>
                                                {formData.tradeName && (
                                                    <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                                                        <span>Trade Name</span>
                                                        <span className="text-slate-900 dark:text-white font-mono text-right truncate max-w-[200px]">{formData.tradeName}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                                                    <span>Barangay</span>
                                                    <span className="text-slate-900 dark:text-white font-mono">{formData.barangay}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                                                    <span>Line of Business</span>
                                                    <span className="text-slate-900 dark:text-white font-mono text-right truncate max-w-[200px]">{formData.lineOfBusiness}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>{formData.businessType === "NEW" ? "Capital Investment" : "Annual Gross Sales"}</span>
                                                    <span className="text-slate-900 dark:text-white font-mono">
                                                        ₱{formData.businessType === "NEW" 
                                                            ? (parseFloat(formData.capitalInvestment.replace(/,/g, "")) || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })
                                                            : (parseFloat(formData.grossSales.replace(/,/g, "")) || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Privacy Acceptance checkbox */}
                                        <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                                            <input 
                                                type="checkbox" 
                                                id="privacy" 
                                                checked={privacyAccepted}
                                                onChange={e => setPrivacyAccepted(e.target.checked)}
                                                className="mt-1 w-4.5 h-4.5 rounded border-slate-200 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                                            />
                                            <label htmlFor="privacy" className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed cursor-pointer select-none">
                                                I officially accept the EMapandan <span className="text-emerald-500 underline">Data Privacy Agreement</span>. I declare under penalty of perjury that all submitted capitalization metrics and checklist document drops are 100% legal, genuine, and correct.
                                            </label>
                                        </div>
                                    </div>

                                    {/* Column B: Billing Details */}
                                    <div className="space-y-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-[2rem] flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Assessed Tax Invoice</h3>
                                            
                                            <div className="space-y-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <div className="flex justify-between">
                                                    <span>Base Mayor&apos;s Permit Fee</span>
                                                    <span className="font-mono">₱{calcResult.baseFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Municipal Business Tax</span>
                                                    <span className="font-mono">₱{calcResult.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-dashed border-slate-200 dark:border-white/10">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Assessed Due</span>
                                                <span className="text-4xl font-black text-slate-900 dark:text-white font-mono leading-none">₱{calcResult.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Integrated Navigation Card Actions */}
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 dark:border-white/10 flex justify-end">
                <Button
                    onClick={currentStep === "SUBMIT" ? onSubmit : handleNext}
                    disabled={submitting || !isStepValid(currentStep)}
                    className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 text-[10px] md:text-xs rounded-xl md:rounded-2xl px-8 md:px-12 h-10 md:h-14 group transition-all duration-300 active:scale-95 font-black uppercase tracking-widest italic"
                >
                    {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <div className="flex items-center">
                            {currentStep === "SUBMIT" ? "Finalize Submission" : "Next Phase"}
                            <ChevronRight className={cn("w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform", submitting && "hidden")} />
                        </div>
                    )}
                </Button>
            </div>
        </div>

        {/* Sticky Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-[#06080a]/70 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 z-50 p-2.5 flex flex-col items-center">
            <div className="w-full max-w-5xl flex items-center justify-center gap-4">
                <div className="h-1.5 flex-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((STEPS.findIndex(s => s.id === currentStep) + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    </div>
);
}
