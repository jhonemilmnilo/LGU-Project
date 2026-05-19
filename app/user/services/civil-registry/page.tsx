"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    User,
    ChevronRight,
    Loader2,
    Check,
    AlertCircle,
    Home,
    Sparkles,
    Baby,
    Heart,
    Skull,
    Search,
    ArrowRight,
    CreditCard,
    Truck,
    Info,
    Upload,
    CheckCircle2,
    Users
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    getCurrentUserResident,
    getTransactionTypes,
    ensureCivilRegistryTransactionTypes,
    submitCivilRegistryTransaction
} from "@/app/admin/transactions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TYPES ---

type Step = "SELECT" | "IDENTITY" | "DETAILS" | "PARENTS" | "CONFIRM";

const STEPS: { id: Step; label: string; icon: any }[] = [
    { id: "SELECT", label: "Select Document", icon: FileText },
    { id: "IDENTITY", label: "Identity", icon: User },
    { id: "DETAILS", label: "Certificate Details", icon: Search },
    { id: "PARENTS", label: "Parental Info", icon: Users },
    { id: "CONFIRM", label: "Verification", icon: CheckCircle2 },
];

interface FormState {
    typeId: string;
    registryType: "BIRTH" | "MARRIAGE" | "DEATH" | "MARRIAGE_LICENSE";
    // Fields for the specific certificate
    fullName: string;
    certFirstName: string;
    certMiddleName: string;
    certLastName: string;
    certSuffix: string;
    certDocType: "Birth Certificate" | "Copy" | "Certified True Copy" | "Authenticated Copy";
    dateOfEvent: string;
    placeOfEvent: string;
    fatherName: string;
    motherName: string;
    spouseName: string; // For marriage
    // Shared
    deliveryType: "PICK_UP" | "DELIVERY" | "E_COPY";
    paymentType: "E_PAYMENT" | "WALK_IN";
    files: Record<string, File | null>;
    email: string;
    contactNumber: string;
    relationship: string;
}

const REGISTRY_TYPES = [
    { 
        id: "BIRTH", 
        label: "Birth Registration", 
        icon: Baby, 
        description: "Apply for a new Birth Registration or Request a Certified Copy.", 
        color: "blue",
        requirements: ["Hospital/Birth Details", "Affidavit (if late)"]
    },
    { 
        id: "DEATH", 
        label: "Death Registration", 
        icon: Skull, 
        description: "Register a Death or Request a Certified Death Certificate.", 
        color: "slate",
        requirements: ["Death Certificate Draft", "Burial Permit"]
    },
    { 
        id: "MARRIAGE", 
        label: "Marriage Registration", 
        icon: Heart, 
        description: "Request a certified copy of a Marriage Certificate.", 
        color: "rose",
        requirements: ["Marriage Details"]
    },
    { 
        id: "MARRIAGE_LICENSE", 
        label: "Marriage License Application", 
        icon: FileText, 
        description: "Apply for a legal license to be married in the Philippines.", 
        color: "amber",
        requirements: ["CENOMAR", "Birth Certificates", "Pre-Marriage Counseling Cert"]
    },
];

export default function CivilRegistryPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("SELECT");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [availableTypes, setAvailableTypes] = useState<any[]>([]);
    const [resident, setResident] = useState<any>(null);

    const [form, setForm] = useState<FormState>({
        typeId: "",
        registryType: "BIRTH",
        fullName: "",
        dateOfEvent: "",
        placeOfEvent: "",
        fatherName: "",
        motherName: "",
        spouseName: "",
        certFirstName: "",
        certMiddleName: "",
        certLastName: "",
        certSuffix: "",
        certDocType: "Birth Certificate",
        deliveryType: "PICK_UP",
        paymentType: "E_PAYMENT",
        files: {},
        email: "",
        contactNumber: "",
        relationship: ""
    });

    // Persist progress to session storage
    useEffect(() => {
        const savedStep = sessionStorage.getItem("civil-registry-step");
        const savedForm = sessionStorage.getItem("civil-registry-form");
        
        if (savedStep) setCurrentStep(savedStep as Step);
        if (savedForm) {
            try {
                const parsed = JSON.parse(savedForm);
                setForm(prev => ({
                    ...prev,
                    ...parsed,
                    files: {} // Ensure files are empty as they can't be stringified
                }));
            } catch (e) {
                console.error("Failed to parse saved form", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!loading) {
            sessionStorage.setItem("civil-registry-step", currentStep);
            sessionStorage.setItem("civil-registry-form", JSON.stringify({
                ...form,
                files: {} // Don't store File objects
            }));
        }
    }, [currentStep, form, loading]);

    useEffect(() => {
        if (form.relationship === "SELF" && resident) {
            setForm(prev => ({
                ...prev,
                fullName: `${resident.firstName || ""} ${resident.lastName || ""}`.trim(),
                certFirstName: resident.firstName || "",
                certMiddleName: resident.middleName || "",
                certLastName: resident.lastName || "",
                certSuffix: resident.suffix || "",
                fatherName: resident.fatherName || prev.fatherName,
                motherName: resident.motherName || prev.motherName,
            }));
        } else if (form.relationship && form.relationship !== "SELF") {
            setForm(prev => ({
                ...prev,
                fullName: "",
                certFirstName: "",
                certMiddleName: "",
                certLastName: "",
                certSuffix: "",
                fatherName: "",
                motherName: "",
            }));
        }
    }, [form.relationship, resident]);

    useEffect(() => {
        async function init() {
            try {
                await ensureCivilRegistryTransactionTypes();
                const [resResult, typesResult] = await Promise.all([
                    getCurrentUserResident(),
                    getTransactionTypes()
                ]);

                if (resResult.success && resResult.data) {
                    setResident(resResult.data);
                    // Pre-fill some data if available
                    if (resResult.data) {
                        setForm(prev => ({
                            ...prev,
                            fullName: `${resResult.data?.firstName || ""} ${resResult.data?.lastName || ""}`.trim(),
                            email: resResult.data?.email || "",
                            contactNumber: resResult.data?.contactNumber || ""
                        }));
                    }
                }
                if (typesResult.success && typesResult.data) {
                    const lcrTypes = typesResult.data.filter((t: any) => t.category === "Civil Registry");
                    setAvailableTypes(lcrTypes);
                    
                    // Set initial typeId if not already set by session storage
                    setForm(prev => {
                        if (prev.typeId) return prev;
                        const currentDbType = lcrTypes.find((t: any) => t.code === `LCR_${prev.registryType}`);
                        return { ...prev, typeId: currentDbType?.id || "" };
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("Initialization Failed");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const selectedType = REGISTRY_TYPES.find(t => t.id === form.registryType);
    const dbType = availableTypes.find(t => t.code === `LCR_${form.registryType}`);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setForm(prev => ({
                ...prev,
                files: { ...prev.files, [key]: e.target.files![0] }
            }));
        }
    };

    const handleSubmit = async () => {
        if (!resident) {
            toast.error("User profile required");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("typeId", form.typeId);
            formData.append("registryType", form.registryType);
            formData.append("residentSnapshot", JSON.stringify({
                firstName: resident.firstName,
                lastName: resident.lastName,
                middleName: resident.middleName,
                suffix: resident.suffix,
                contactNumber: resident.contactNumber,
                email: resident.email,
                gender: resident.gender,
                barangay: resident.barangay,
                municipality: resident.municipality,
                province: resident.province
            }));

            const additionalData = {
                subjectName: form.fullName,
                dateOfEvent: form.dateOfEvent,
                placeOfEvent: form.placeOfEvent,
                fatherName: form.fatherName,
                motherName: form.motherName,
                spouseName: form.spouseName,
                relationship: form.relationship,
                fulfillmentType: form.deliveryType,
                paymentType: form.paymentType,
                email: form.email,
                contactNumber: form.contactNumber,
                totalAmount: (dbType?.baseFee || 150) + (form.deliveryType === "DELIVERY" ? (dbType?.deliveryFee || 100) : 0)
            };

            formData.append("additionalData", JSON.stringify(additionalData));

            // Append files
            Object.entries(form.files).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });

            const res = await submitCivilRegistryTransaction(formData);
            if (res.success && res.data) {
                toast.success("Request submitted successfully!");
                sessionStorage.removeItem("civil-registry-step");
                sessionStorage.removeItem("civil-registry-form");
                router.push(`/user/services/requests/${res.data.id}`);
            } else {
                toast.error(res.error || "Submission failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during submission");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Syncing Registry Matrix...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] pb-20 pt-24 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="space-y-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbLink href="/user/services">Services</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Civil Registry</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl">
                                    <FileText className="w-6 h-6 text-blue-500" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Local Civil Registry</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                Registry <span className="text-blue-500">Hub</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm italic">Certified true copy requests for civil registry documents.</p>
                        </div>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative px-2 py-4">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-white/5 -translate-y-1/2" />
                    
                    {/* Animated Progress Line */}
                    <motion.div 
                        className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0"
                        initial={{ width: 0 }}
                        animate={{ 
                            width: `${(STEPS.findIndex(s => s.id === currentStep) / (STEPS.length - 1)) * 100}%` 
                        }}
                    />

                    <div className="flex justify-between items-center relative z-10">
                        {STEPS.map((step, idx) => {
                            const isActive = currentStep === step.id;
                            const stepIdx = STEPS.findIndex(s => s.id === currentStep);
                            const isCompleted = stepIdx > idx;
                            const Icon = step.icon;
                            
                            // Navigation logic for the progress bar
                            const canNavigate = (targetStep: Step) => {
                                const targetIdx = STEPS.findIndex(s => s.id === targetStep);
                                if (targetIdx <= stepIdx) return true; // Always allow back
                                
                                // Forward navigation validation
                                if (targetStep === "IDENTITY") return !!form.registryType;
                                if (targetStep === "DETAILS") return !!resident && !!form.relationship;
                                if (targetStep === "PARENTS") return !!form.certFirstName && !!form.certLastName && !!form.dateOfEvent && !!form.placeOfEvent;
                                if (targetStep === "CONFIRM") {
                                    const isMarriage = form.registryType === "MARRIAGE" || form.registryType === "MARRIAGE_LICENSE";
                                    const basicInfoOk = !!form.certFirstName && !!form.certLastName && !!form.dateOfEvent && !!form.placeOfEvent;
                                    const parentsOk = (isMarriage) ? true : (!!form.fatherName && !!form.motherName);
                                    return basicInfoOk && parentsOk;
                                }
                                return false;
                            };

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
                                        "flex flex-col items-center gap-2 group transition-all duration-300",
                                        (!canNavigate(step.id) && !isActive) && "cursor-not-allowed opacity-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 bg-white dark:bg-[#08090d]",
                                        isActive ? "border-blue-600 text-blue-600 shadow-lg shadow-blue-500/20 scale-110" :
                                            isCompleted ? "bg-blue-600 border-blue-600 text-white" :
                                                "border-slate-200 dark:border-white/10 text-slate-400"
                                    )}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Icon className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest italic hidden md:block",
                                        isActive ? "text-blue-600" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white/70 dark:bg-[#06080a]/70 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 z-50 p-2.5 flex flex-col items-center">
                    <div className="w-full max-w-5xl flex items-center justify-center gap-4">
                        <div className="h-1.5 flex-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-blue-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${((STEPS.findIndex(s => s.id === currentStep) + 1) / STEPS.length) * 100}%` }}
                            />
                        </div>
                        <span className="font-black uppercase tracking-widest italic text-[8px] md:text-[10px] text-slate-400 whitespace-nowrap">
                            Phase {STEPS.findIndex(s => s.id === currentStep) + 1} / {STEPS.length}
                        </span>
                    </div>
                </div>

                {/* Step Selection */}
                <Card className="p-8 rounded-[2.5rem] border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0f1117] shadow-xl shadow-slate-200/40 dark:shadow-none min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {currentStep === "SELECT" && (
                            <motion.div
                                key="select-step"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="text-center space-y-2 mb-8">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Select Document Type</h2>
                                    <p className="text-sm text-slate-500 font-medium italic">What type of certificate do you need today?</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {REGISTRY_TYPES.map((type) => {
                                        const isSelected = form.registryType === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => {
                                                    const dbType = availableTypes.find(t => t.code === `LCR_${type.id}`);
                                                    setForm(prev => ({ 
                                                        ...prev, 
                                                        registryType: type.id as any, 
                                                        typeId: dbType?.id || prev.typeId,
                                                        deliveryType: type.id === "MARRIAGE_LICENSE" ? "PICK_UP" : prev.deliveryType
                                                    }));
                                                }}
                                                className={cn(
                                                    "group p-6 rounded-[2rem] border-2 transition-all text-left space-y-4",
                                                    isSelected 
                                                        ? "bg-blue-600 border-blue-600 shadow-xl shadow-blue-500/20" 
                                                        : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-blue-500/50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-3 rounded-2xl w-fit transition-colors",
                                                    isSelected ? "bg-white/20" : "bg-white dark:bg-white/5"
                                                )}>
                                                    <type.icon className={cn(
                                                        "w-6 h-6",
                                                        isSelected ? "text-white" : `text-${type.color}-500`
                                                    )} />
                                                </div>
                                                <div>
                                                    <h3 className={cn(
                                                        "font-black uppercase tracking-tight italic",
                                                        isSelected ? "text-white" : "text-slate-900 dark:text-white"
                                                    )}>{type.label}</h3>
                                                    <p className={cn(
                                                        "text-[10px] font-medium italic mt-1",
                                                        isSelected ? "text-blue-100" : "text-slate-500"
                                                    )}>{type.description}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center pt-8">
                                    <Button 
                                        onClick={() => setCurrentStep("IDENTITY")}
                                        className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl shadow-blue-500/20"
                                    >
                                        Next Phase
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "IDENTITY" && (
                            <motion.div
                                key="identity-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 md:space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">Identity <span className="text-blue-500 italic">Confirmation</span></h2>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">Verify and refine your personal records for this request.</p>
                                </div>

                                <div className="space-y-4 md:space-y-6">
                                    {/* Row 1: Names */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                                            <Input
                                                value={resident?.firstName || ""}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Middle Name</Label>
                                            <Input
                                                value={resident?.middleName || ""}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                                            <Input
                                                value={resident?.lastName || ""}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Suffix</Label>
                                            <Input
                                                value={resident?.suffix || ""}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 text-xs md:text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Separator className="opacity-50" />

                                    {/* Row 2: Personal */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</Label>
                                            <Input
                                                type="date"
                                                value={resident?.dateOfBirth ? new Date(resident.dateOfBirth).toISOString().split('T')[0] : ""}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Age</Label>
                                            <Input
                                                value={(() => {
                                                    if (!resident?.dateOfBirth) return "";
                                                    const today = new Date();
                                                    const birthDate = new Date(resident.dateOfBirth);
                                                    let age = today.getFullYear() - birthDate.getFullYear();
                                                    const m = today.getMonth() - birthDate.getMonth();
                                                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                                                    return age;
                                                })()}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Civil Status</Label>
                                            <Input
                                                value={resident?.civilStatus || "N/A"}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Barangay</Label>
                                            <Input
                                                value={resident?.barangay || "N/A"}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Personal Details & Contact */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-end">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender</Label>
                                            <Input
                                                value={resident?.gender || "N/A"}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Occupation</Label>
                                            <Input
                                                value={resident?.occupation || "N/A"}
                                                readOnly
                                                className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-500/70 ml-1">Contact Number <span className="text-red-500">*</span></Label>
                                            <div className="relative group">
                                                <Input
                                                    value={form.contactNumber}
                                                    onChange={(e) => setForm(p => ({ ...p, contactNumber: e.target.value }))}
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 focus:ring-blue-500 shadow-sm text-xs md:text-sm transition-all duration-300",
                                                        form.contactNumber.length >= 11 && "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/20"
                                                    )}
                                                    placeholder="09xx xxx xxxx"
                                                />
                                                {form.contactNumber.length >= 11 && (
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        <Check className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 4: Relationship */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-500/70 ml-1">Relationship to Document Owner <span className="text-red-500">*</span></Label>
                                            <p className="text-xs md:text-sm text-slate-900 dark:text-blue-50 font-black italic ml-1 mb-2">I am requesting the certificate of my:</p>
                                            <Select 
                                                value={form.relationship} 
                                                onValueChange={(value) => setForm({...form, relationship: value})}
                                            >
                                                <SelectTrigger className={cn(
                                                    "h-10 rounded-xl border-slate-200 focus:ring-blue-500 shadow-sm text-xs md:text-sm bg-white dark:bg-slate-900 transition-all",
                                                    (showErrors && !form.relationship) && "border-red-500/50 bg-red-50/10"
                                                )}>
                                                    <SelectValue placeholder="Select relationship" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 dark:border-white/10">
                                                    <SelectItem value="SELF">SELF</SelectItem>
                                                    <SelectItem value="SPOUSE">SPOUSE</SelectItem>
                                                    <SelectItem value="SON">SON</SelectItem>
                                                    <SelectItem value="DAUGHTER">DAUGHTER</SelectItem>
                                                    <SelectItem value="MOTHER">MOTHER</SelectItem>
                                                    <SelectItem value="FATHER">FATHER</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {(showErrors && !form.relationship) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse mt-1.5">Required field</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-500/5 border border-blue-500/10 p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-3">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <p className="text-[8px] md:text-[10px] text-blue-500 font-black italic leading-tight uppercase tracking-widest">
                                        Verified Resident Profile. This information will be used for your official registry request.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-8">
                                    <Button 
                                        variant="ghost"
                                        onClick={() => setCurrentStep("SELECT")}
                                        className="rounded-full px-8 border-slate-200 dark:border-white/10 font-black uppercase tracking-widest italic text-[10px] h-12"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Back
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            if (!form.relationship) {
                                                setShowErrors(true);
                                                toast.error("Please select your relationship to the document owner.");
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("DETAILS");
                                        }}
                                        className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl shadow-blue-500/20"
                                    >
                                        Proceed to Certificate Details
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "DETAILS" && (
                            <motion.div
                                key="details-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="md:hidden">
                                        <Button variant="ghost" className="rounded-full" onClick={() => setCurrentStep("SELECT")}>
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </Button>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Certificate Details</h2>
                                        <p className="text-xs text-slate-500 font-medium italic">Certified copy for {selectedType?.label}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-4 p-8 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 italic mb-4">Primary Subject Information</h3>
                                        
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Certificate Type</Label>
                                                <Input 
                                                    value={form.registryType === "BIRTH" ? "Birth Certificate" : 
                                                           form.registryType === "MARRIAGE" ? "Marriage Certificate" : 
                                                           form.registryType === "DEATH" ? "Death Certificate" : 
                                                           form.registryType === "MARRIAGE_LICENSE" ? "Marriage License Application" : ""}
                                                    readOnly
                                                    className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 text-slate-500 font-bold italic"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">First Name <span className="text-red-500">*</span></Label>
                                                    <Input 
                                                        className={cn(
                                                            "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-10 transition-all uppercase font-medium",
                                                            (showErrors && !form.certFirstName) && "border-red-500/50 bg-red-50/10",
                                                            form.relationship === "SELF" && "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                        )}
                                                        placeholder="First name"
                                                        value={form.certFirstName}
                                                        onChange={(e) => form.relationship !== "SELF" && setForm({...form, certFirstName: e.target.value.toUpperCase()})}
                                                        readOnly={form.relationship === "SELF"}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Middle Name</Label>
                                                    <Input 
                                                        className={cn(
                                                            "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-10 transition-all uppercase font-medium",
                                                            form.relationship === "SELF" && "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                        )}
                                                        placeholder="Middle name"
                                                        value={form.certMiddleName}
                                                        onChange={(e) => form.relationship !== "SELF" && setForm({...form, certMiddleName: e.target.value.toUpperCase()})}
                                                        readOnly={form.relationship === "SELF"}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="md:col-span-3 space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Last Name <span className="text-red-500">*</span></Label>
                                                    <Input 
                                                        className={cn(
                                                            "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-10 transition-all uppercase font-medium",
                                                            (showErrors && !form.certLastName) && "border-red-500/50 bg-red-50/10",
                                                            form.relationship === "SELF" && "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                        )}
                                                        placeholder="Last name"
                                                        value={form.certLastName}
                                                        onChange={(e) => form.relationship !== "SELF" && setForm({...form, certLastName: e.target.value.toUpperCase()})}
                                                        readOnly={form.relationship === "SELF"}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Suffix</Label>
                                                    <Input 
                                                        className={cn(
                                                            "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-10 transition-all uppercase font-medium",
                                                            form.relationship === "SELF" && "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                        )}
                                                        placeholder="e.g. Jr."
                                                        value={form.certSuffix}
                                                        onChange={(e) => form.relationship !== "SELF" && setForm({...form, certSuffix: e.target.value.toUpperCase()})}
                                                        readOnly={form.relationship === "SELF"}
                                                    />
                                                </div>
                                            </div>

                                            {(form.registryType === "MARRIAGE" || form.registryType === "MARRIAGE_LICENSE") && (
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Wife's Full Name (Maiden) <span className="text-red-500">*</span></Label>
                                                    <Input 
                                                        className={cn(
                                                            "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium",
                                                            (showErrors && !form.spouseName) && "border-red-500/50 bg-red-50/10"
                                                        )}
                                                        placeholder="Enter complete maiden name"
                                                        value={form.spouseName}
                                                        onChange={(e) => setForm({...form, spouseName: e.target.value.toUpperCase()})}
                                                    />
                                                    {(showErrors && !form.spouseName) && (
                                                        <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required field</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                                                    {form.registryType === "BIRTH" ? "Date of Birth" : 
                                                     form.registryType === "DEATH" ? "Date of Death" : 
                                                     form.registryType === "MARRIAGE" ? "Date of Marriage" : 
                                                     "Target Marriage Date"} <span className="text-red-500">*</span>
                                                </Label>
                                                <Input 
                                                    type="date"
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all",
                                                        (showErrors && !form.dateOfEvent) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    value={form.dateOfEvent}
                                                    onChange={(e) => setForm({...form, dateOfEvent: e.target.value})}
                                                />
                                                {(showErrors && !form.dateOfEvent) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required field</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Place of Occurrence <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all",
                                                        (showErrors && !form.placeOfEvent) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="Hospital / Municipality / Church"
                                                    value={form.placeOfEvent}
                                                    onChange={(e) => setForm({...form, placeOfEvent: e.target.value})}
                                                />
                                                {(showErrors && !form.placeOfEvent) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required field</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <Button 
                                        variant="ghost"
                                        onClick={() => setCurrentStep("IDENTITY")}
                                        className="rounded-full px-8 border-slate-200 dark:border-white/10 font-black uppercase tracking-widest italic text-[10px] h-12"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Back
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            const isMarriage = form.registryType === "MARRIAGE" || form.registryType === "MARRIAGE_LICENSE";
                                            if (!form.certFirstName || !form.certLastName || !form.dateOfEvent || !form.placeOfEvent || (isMarriage && !form.spouseName)) {
                                                setShowErrors(true);
                                                if (!form.certFirstName) toast.error("First Name is required.");
                                                else if (!form.certLastName) toast.error("Last Name is required.");
                                                else if (isMarriage && !form.spouseName) toast.error("Spouse Name is required.");
                                                else if (!form.dateOfEvent) toast.error("Date of Occurrence is required.");
                                                else if (!form.placeOfEvent) toast.error("Place of Occurrence is required.");
                                                return;
                                            }
                                            setShowErrors(false);
                                            // Auto-sync fullName for the API
                                            const full = `${form.certFirstName} ${form.certMiddleName} ${form.certLastName} ${form.certSuffix}`.replace(/\s+/g, ' ').trim();
                                            setForm(prev => ({ ...prev, fullName: full }));
                                            
                                            // Skip parents info for marriage requests as it's less standard for CTCs or handled elsewhere
                                            if (isMarriage) {
                                                setCurrentStep("CONFIRM");
                                            } else {
                                                setCurrentStep("PARENTS");
                                            }
                                        }}
                                        className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl shadow-blue-500/20"
                                    >
                                        {form.registryType === "MARRIAGE" || form.registryType === "MARRIAGE_LICENSE" ? "Proceed to Review" : "Proceed to Parental Info"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "PARENTS" && (
                            <motion.div
                                key="parents-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">Parental <span className="text-blue-500 italic">Information</span></h2>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">Required details for verifying the registry record.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-2">Father's Details</h3>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Full Name <span className="text-red-500">*</span></Label>
                                            <Input 
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium",
                                                    (showErrors && !form.fatherName) && "border-red-500/50 bg-red-50/10",
                                                    form.relationship === "SELF" && "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                )}
                                                placeholder="Last Name, First Name Middle Name"
                                                value={form.fatherName}
                                                onChange={(e) => form.relationship !== "SELF" && setForm({...form, fatherName: e.target.value.toUpperCase()})}
                                                readOnly={form.relationship === "SELF"}
                                            />
                                            {(showErrors && !form.fatherName) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required field</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic mb-2">Mother's Details</h3>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Maiden Name <span className="text-red-500">*</span></Label>
                                            <Input 
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium",
                                                    (showErrors && !form.motherName) && "border-red-500/50 bg-red-50/10",
                                                    form.relationship === "SELF" && "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                )}
                                                placeholder="Last Name, First Name Middle Name"
                                                value={form.motherName}
                                                onChange={(e) => form.relationship !== "SELF" && setForm({...form, motherName: e.target.value.toUpperCase()})}
                                                readOnly={form.relationship === "SELF"}
                                            />
                                            {(showErrors && !form.motherName) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required field</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-center gap-3">
                                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                                    <p className="text-[10px] text-blue-500 font-bold italic uppercase tracking-widest">
                                        Please provide the names as they appear on the original registry document to avoid discrepancies.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-6">
                                    <Button 
                                        variant="ghost"
                                        onClick={() => setCurrentStep("DETAILS")}
                                        className="rounded-full px-8 border-slate-200 dark:border-white/10 font-black uppercase tracking-widest italic text-[10px] h-12"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Back
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            if (!form.fatherName || !form.motherName) {
                                                setShowErrors(true);
                                                toast.error("Please provide both parents' information.");
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("CONFIRM");
                                        }}
                                        className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl shadow-blue-500/20"
                                    >
                                        Proceed to Review
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "CONFIRM" && (
                            <motion.div
                                key="confirm-step"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="md:hidden">
                                        <Button variant="ghost" className="rounded-full" onClick={() => setCurrentStep("DETAILS")}>
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </Button>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Final Confirmation</h2>
                                        <p className="text-xs text-slate-500 font-medium italic">Verify your request details before submission</p>
                                    </div>
                                </div>

                                <Card className="bg-slate-50 dark:bg-white/5 border-none p-6 rounded-[2rem] space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Certificate Type</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">
                                                {form.registryType === "BIRTH" ? "Birth Certificate" : 
                                                 form.registryType === "MARRIAGE" ? "Marriage Certificate" : 
                                                 form.registryType === "DEATH" ? "Death Certificate" : 
                                                 "Marriage License Application"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Subject Name</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{`${form.certFirstName} ${form.certMiddleName} ${form.certLastName} ${form.certSuffix}`.trim()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Relationship</span>
                                            <Badge variant="outline" className="text-blue-500 border-blue-500/30 font-black italic rounded-full text-[9px]">{form.relationship}</Badge>
                                        </div>
                                        {form.spouseName && (
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Spouse Name</span>
                                                <p className="font-black text-slate-900 dark:text-white italic">{form.spouseName}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Occurrence Date</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{form.dateOfEvent}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Occupation</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{resident?.occupation || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Target Contact</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{form.contactNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Gender</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{resident?.gender || "N/A"}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Civil Status</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{resident?.civilStatus || "N/A"}</p>
                                        </div>
                                        {/* Parents Info Summary */}
                                        {form.registryType !== "MARRIAGE" && form.registryType !== "MARRIAGE_LICENSE" && (
                                            <>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Father's Name</span>
                                                    <p className="font-black text-slate-900 dark:text-white italic">{form.fatherName || "N/A"}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Mother's Name</span>
                                                    <p className="font-black text-slate-900 dark:text-white italic">{form.motherName || "N/A"}</p>
                                                </div>
                                            </>
                                        )}
                                        <div className="space-y-1 text-right">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Process Fee</span>
                                            <p className="text-2xl font-black text-blue-500 italic">₱{(dbType?.baseFee || 150).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Card>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold italic">
                                            By submitting, I certify that all information provided is true and correct. I am aware of the data privacy policy of Mapandan.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <Button 
                                            variant="ghost"
                                            onClick={() => setCurrentStep(form.registryType === "MARRIAGE" || form.registryType === "MARRIAGE_LICENSE" ? "DETAILS" : "PARENTS")}
                                            className="h-14 rounded-full border-slate-200 dark:border-white/10 font-black uppercase tracking-widest italic text-[11px]"
                                        >
                                            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                            Modify
                                        </Button>
                                        <Button 
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="md:col-span-3 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[11px] shadow-xl shadow-blue-500/20"
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            ) : (
                                                <>
                                                    Submit Civil Registry Request
                                                    <CheckCircle2 className="w-5 h-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>

                {/* Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 rounded-[2rem] border-slate-200/50 dark:border-white/5 bg-blue-500/5 border-l-4 border-l-blue-500">
                        <div className="flex gap-4">
                            <Info className="w-5 h-5 text-blue-500 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">Requirements</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">Certified true copies require a valid government ID and an authorization letter if the applicant is not the document owner.</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 rounded-[2rem] border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                        <div className="flex gap-4">
                            <CreditCard className="w-5 h-5 text-slate-400 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Standard Fee</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">PHP 150.00 per certified copy. Additional delivery fees apply for off-site requests.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
