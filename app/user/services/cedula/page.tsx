"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2, 
    Calculator, 
    User,
    Info,
    ChevronRight,
    Loader2,
    Check,
    AlertCircle,
    Home,
    Upload,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
/**
 * multi-step form for Cedula Application.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    getCurrentUserResident,
    getTransactionTypes,
    submitTransaction,
    ensureCedulaTransactionTypes
} from "@/app/admin/transactions/actions";
import { calculateCedula, CedulaResult, isPastCedulaDeadline, getCedulaPenaltyRate } from "@/lib/cedula";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TYPES ---

type Step = "STATUS" | "RESIDENT" | "DECLARATION" | "CONFIRM";



interface FormState {
    typeId: string;
    applicantType: "INDIVIDUAL" | "JURIDICAL";
    residentData: any;
    income: string;
    propertyValue: string;
    idFile: File | null;
    proofFile: File | null;
    businessName: string;
}

// --- CONSTANTS ---

const STEPS: { id: Step; label: string; icon: any }[] = [
    { id: "STATUS", label: "Status", icon: Sparkles },
    { id: "RESIDENT", label: "Identity", icon: User },
    { id: "DECLARATION", label: "Declaration", icon: Calculator },
    { id: "CONFIRM", label: "Submit", icon: CheckCircle2 },
];

export default function CedulaApplicationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("STATUS");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [calcResult, setCalcResult] = useState<CedulaResult | null>(null);
    const [initialResident, setInitialResident] = useState<any>(null);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [existingIdUrl, setExistingIdUrl] = useState<string | null>(null);
    const incomeInputRef = useRef<HTMLInputElement>(null);
    const contactInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormState>({
        typeId: "",
        applicantType: "INDIVIDUAL",
        residentData: {},
        income: "",
        propertyValue: "",
        idFile: null,
        proofFile: null,
        businessName: ""
    });



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
                    if (cedulaTypes.length > 0) {
                        // We store the types but wait for user to pick in Step 1
                        (window as any)._cedulaTypes = cedulaTypes;
                        const individualType = cedulaTypes.find((t: any) => t.code === "CEDULA_IND") || cedulaTypes[0];
                        setFormData(prev => ({ ...prev, typeId: individualType.id }));
                    }
                }

                // Fetch Resident
                const residentRes = await getCurrentUserResident();
                const resident = residentRes.data;
                if (residentRes.success && resident) {
                    setInitialResident(resident);
                    if (resident.idFrontUrl) setExistingIdUrl(resident.idFrontUrl);
                    setFormData(prev => ({
                        ...prev,
                        residentData: resident,
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
        const result = calculateCedula({
            type: formData.applicantType,
            income: parseFloat(formData.income) || 0,
            propertyValue: parseFloat(formData.propertyValue) || 0,
            fulfillmentType: "PICK_UP", // Base amount only during initial app
            deliveryFee: 0
        });
        setCalcResult(result);
    }, [formData.income, formData.propertyValue, formData.applicantType]);

    useEffect(() => {
        updateCalc();
    }, [updateCalc]);

    const isStepValid = (stepId: Step) => {
        switch (stepId) {
            case "STATUS":
                return !!formData.typeId;
            case "RESIDENT":
                const r = formData.residentData;
                return !!(r?.firstName && r?.lastName && r?.dateOfBirth && r?.email && r?.contactNumber);
            case "DECLARATION":
                // Require either Annual Gross Income OR Real Property Assessed Value to be > 0
                return (parseFloat(formData.income) > 0 || parseFloat(formData.propertyValue) > 0);
            case "CONFIRM":
                // Final submission requires Data Privacy acceptance AND either a new upload or an existing ID
                return privacyAccepted && (!!formData.idFile || !!existingIdUrl) && !!formData.proofFile;
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
            if (currentStep === "STATUS") {
                toast.error("Please identify your status first.");
            } else if (currentStep === "RESIDENT") {
                contactInputRef.current?.focus();
                toast.error("Please provide your contact number for better coordination.");
            } else if (currentStep === "DECLARATION") {
                incomeInputRef.current?.focus();
                toast.error("Please declare at least one of the required financial fields.");
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
            if (existingIdUrl) submitData.append("existingIdUrl", existingIdUrl);

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
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">Cedula Service Portal</BreadcrumbPage>
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
            <div className="grid grid-cols-4 gap-2 md:gap-4 relative px-2">
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
                                    if (currentStep === "RESIDENT") {
                                        contactInputRef.current?.focus();
                                        toast.error("Please complete your identity details first.");
                                    } else if (currentStep === "DECLARATION") {
                                        incomeInputRef.current?.focus();
                                        toast.error("Please complete the declaration first.");
                                    } else {
                                        toast.error("Please complete the current phase first.");
                                    }
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
                                {currentStep === "STATUS" && (
                                    <div className="space-y-12">
                                        <div className="space-y-4 text-center">
                                            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">Identify Your <span className="text-primary italic">Status</span></h2>
                                            <p className="text-slate-500 font-medium italic text-lg uppercase tracking-widest max-w-2xl mx-auto">Select the appropriate category for this Community Tax assessment.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                            {[
                                                { 
                                                    id: "INDIVIDUAL", 
                                                    label: "Individual Citizen", 
                                                    desc: "For private citizens, professionals, and employees.", 
                                                    icon: User,
                                                    code: "CEDULA_IND"
                                                },
                                                { 
                                                    id: "JURIDICAL", 
                                                    label: "Juridical Entity", 
                                                    desc: "For corporations, partnerships, and business firms.", 
                                                    icon: Sparkles,
                                                    code: "CEDULA_JUR"
                                                }
                                            ].map(opt => {
                                                const Icon = opt.icon;
                                                const isSelected = formData.applicantType === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => {
                                                            const types = (window as any)._cedulaTypes || [];
                                                            const t = types.find((x: any) => x.code === opt.code) || types[0];
                                                            setFormData(p => ({ ...p, applicantType: opt.id as any, typeId: t.id }));
                                                        }}
                                                        className={cn(
                                                            "p-10 rounded-[3rem] border-4 transition-all duration-500 text-left relative group select-none overflow-hidden",
                                                            isSelected ? "bg-primary text-white border-primary shadow-2xl scale-[1.03]" : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 hover:border-primary/30"
                                                        )}
                                                    >
                                                        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-transform group-hover:scale-110", isSelected ? "bg-white/20" : "bg-primary/5 text-primary")}>
                                                            <Icon className={cn("w-10 h-10", isSelected ? "animate-pulse" : "")} />
                                                        </div>
                                                        <div className="space-y-2 relative z-10">
                                                            <h4 className="text-2xl font-black uppercase italic tracking-tighter">
                                                                {opt.label}
                                                            </h4>
                                                            <p className={cn("text-[11px] font-bold uppercase italic tracking-widest leading-relaxed", isSelected ? "text-white/70" : "text-slate-400")}>
                                                                {opt.desc}
                                                            </p>
                                                        </div>
                                                        {isSelected && (
                                                            <motion.div layoutId="check" className="absolute top-8 right-8 w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
                                                                <Check className="w-6 h-6 stroke-[4]" />
                                                            </motion.div>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

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
                                                <Input
                                                    value={formData.residentData?.civilStatus || "N/A"}
                                                    readOnly
                                                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold"
                                                />
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
                                                    ref={contactInputRef}
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
                                                        ref={incomeInputRef}
                                                        type="number"
                                                        value={formData.income}
                                                        onChange={(e) => setFormData(p => ({ ...p, income: e.target.value }))}
                                                        placeholder="0.00"
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
                                                        placeholder="0.00"
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
                                                    <span className="flex items-center gap-2">
                                                        Penalty ({Math.round(getCedulaPenaltyRate() * 100)}% Int.)
                                                        {isPastCedulaDeadline() && (
                                                            <TooltipProvider delayDuration={0}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button type="button" className="cursor-help">
                                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="bg-slate-900 text-white border-slate-800 p-4 rounded-xl shadow-2xl max-w-[280px]">
                                                                        <div className="space-y-2">
                                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic">Penalty Rule</h4>
                                                                            <p className="text-[9px] font-medium leading-relaxed uppercase tracking-tighter">
                                                                                Starting March 1st, a 2% monthly interest is imposed on the unpaid community tax, increasing by 2% each month up to a maximum of 24%.
                                                                            </p>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </span>
                                                    <span>₱{calcResult?.penalty.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-between items-end relative z-10">
                                                <div className="space-y-1 mb-2 text-left">
                                                    <span className="block text-[10px] font-black uppercase tracking-widest text-primary italic">Estimated Total Due</span>
                                                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter italic leading-none max-w-[120px]">
                                                        * Final assessment is subject to administrative evaluation.
                                                    </p>
                                                </div>
                                                <span className="text-5xl font-black italic italic tracking-tighter text-white">₱{calcResult?.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: CONFIRMATION PHASE */}
                            {currentStep === "CONFIRM" && (
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">Review <span className="text-primary italic">& Finalize</span></h2>
                                        <p className="text-slate-500 font-medium italic text-lg leading-relaxed">Please review your declaration carefully before submitting your application for evaluation.</p>
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

                                                {/* Preview Logic: Prioritize new upload, then existing ID */}
                                                {formData.idFile && formData.idFile.type.startsWith("image/") ? (
                                                    <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg group/preview mt-1">
                                                        <Image
                                                            src={URL.createObjectURL(formData.idFile)}
                                                            alt="ID Preview"
                                                            fill
                                                            unoptimized
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[7px] font-black text-white uppercase tracking-widest border border-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">New Upload Preview</span>
                                                        </div>
                                                    </div>
                                                ) : existingIdUrl ? (
                                                    <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border-2 border-primary/10 shadow-lg group/preview mt-1">
                                                        <Image
                                                            src={existingIdUrl}
                                                            alt="Existing ID Preview"
                                                            fill
                                                            unoptimized
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[7px] font-black text-white uppercase tracking-widest border border-white/40 px-2 py-0.5 rounded-full backdrop-blur-md">Pre-filled from Profile</span>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                <div className="flex items-center justify-between w-full gap-3 mt-1">
                                                    <input type="file" onChange={(e) => handleFileChange(e, "idFile")} className="hidden" id="id-upload" />
                                                    <Button asChild variant={(formData.idFile || existingIdUrl) ? "outline" : "default"} className="font-black italic uppercase tracking-widest text-[9px] px-6 h-8 rounded-full active:scale-95 transition-transform flex-1">
                                                        <label htmlFor="id-upload" className="cursor-pointer">
                                                            {formData.idFile ? "Change Upload" : existingIdUrl ? "Change ID Photo" : "Upload File"}
                                                        </label>
                                                    </Button>
                                                    {formData.idFile && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black italic text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 h-8 rounded-full flex-1 line-clamp-1 truncate">
                                                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{formData.idFile.name}</span>
                                                        </div>
                                                    )}
                                                    {!formData.idFile && existingIdUrl && (
                                                        <div className="flex items-center gap-1.5 text-[9px] font-black italic text-primary/60 uppercase tracking-widest bg-primary/5 px-3 h-8 rounded-full flex-1 line-clamp-1 truncate text-center leading-none">
                                                            Using Profile ID
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
                                                        <Image
                                                            src={URL.createObjectURL(formData.proofFile)}
                                                            alt="Proof Preview"
                                                            fill
                                                            unoptimized
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
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

                                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-6">
                                        <div
                                            onClick={() => setPrivacyAccepted(!privacyAccepted)}
                                            className={cn(
                                                "p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none",
                                                privacyAccepted ? "bg-primary/5 border-primary shadow-sm" : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-primary/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                                                privacyAccepted ? "bg-primary border-primary text-white" : "border-slate-300 dark:border-white/10"
                                            )}>
                                                {privacyAccepted && <Check className="w-4 h-4" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Data Privacy Agreement</p>
                                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic uppercase tracking-widest">
                                                    I hereby authorize the Local Government Unit to collect and process my personal information for the purpose of this service request in accordance with the Data Privacy Act of 2012. I also confirm that all information declared above is true and correct.
                                                </p>
                                            </div>
                                        </div>
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
                        disabled={submitting || !isStepValid(currentStep)}
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
                    Phase {STEPS.findIndex(s => s.id === currentStep) + 1} of {STEPS.length}
                </div>
            </div>
        </div>
    );
}
