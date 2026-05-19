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
    ArrowRight,
    CreditCard,
    Info,
    Upload,
    Search,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
    getCurrentUserResident,
    getTransactionTypes,
    ensureCivilRegistryTransactionTypes,
    submitCivilRegistryTransaction
} from "@/app/admin/transactions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- TYPES ---

type Step = "IDENTITY" | "DETAILS" | "PARENTS" | "CONFIRM";

const STEPS: { id: Step; label: string; icon: any }[] = [
    { id: "IDENTITY", label: "Informant Info", icon: User },
    { id: "DETAILS", label: "Child Details", icon: Search },
    { id: "PARENTS", label: "Parental Info", icon: Users },
    { id: "CONFIRM", label: "Documents & Submit", icon: CheckCircle2 },
];

interface FormState {
    typeId: string;
    registryType: "BIRTH_REG";
    // Fields for the specific registration
    certFirstName: string;
    certMiddleName: string;
    certLastName: string;
    certSuffix: string;
    dateOfEvent: string;
    placeOfEvent: string;
    fatherFirstName: string;
    fatherMiddleName: string;
    fatherLastName: string;
    motherFirstName: string;
    motherMiddleName: string;
    motherLastName: string;
    // Shared
    deliveryType: "PICK_UP" | "DELIVERY" | "E_COPY";
    paymentType: "E_PAYMENT" | "WALK_IN";
    files: Record<string, File | null>;
    idTypeOverride?: string;
    email: string;
    contactNumber: string;
    relationship: string;
}

export default function BirthRegistrationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("IDENTITY");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [availableTypes, setAvailableTypes] = useState<any[]>([]);
    const [resident, setResident] = useState<any>(null);

    const [form, setForm] = useState<FormState>({
        typeId: "",
        registryType: "BIRTH_REG",
        certFirstName: "",
        certMiddleName: "",
        certLastName: "",
        certSuffix: "",
        dateOfEvent: "",
        placeOfEvent: "",
        fatherFirstName: "",
        fatherMiddleName: "",
        fatherLastName: "",
        motherFirstName: "",
        motherMiddleName: "",
        motherLastName: "",
        deliveryType: "PICK_UP",
        paymentType: "E_PAYMENT",
        files: {},
        idTypeOverride: "",
        email: "",
        contactNumber: "",
        relationship: ""
    });

    // Persist progress to session storage
    useEffect(() => {
        const savedStep = sessionStorage.getItem("birth-reg-step");
        const savedForm = sessionStorage.getItem("birth-reg-form");
        
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
            sessionStorage.setItem("birth-reg-step", currentStep);
            sessionStorage.setItem("birth-reg-form", JSON.stringify({
                ...form,
                files: {} // Don't store File objects
            }));
        }
    }, [currentStep, form, loading]);

    useEffect(() => {
        if (form.relationship === "SELF" && resident) {
            setForm(prev => ({
                ...prev,
                certFirstName: resident.firstName || "",
                certMiddleName: resident.middleName || "",
                certLastName: resident.lastName || "",
                certSuffix: resident.suffix || "",
                placeOfEvent: resident.placeOfBirth || resident.municipality || prev.placeOfEvent,
                dateOfEvent: resident.dateOfBirth ? new Date(resident.dateOfBirth).toISOString().split('T')[0] : prev.dateOfEvent,
                fatherFirstName: resident.fatherFirstName || prev.fatherFirstName,
                fatherMiddleName: resident.fatherMiddleName || prev.fatherMiddleName,
                fatherLastName: resident.fatherLastName || prev.fatherLastName,
                motherFirstName: resident.motherFirstName || prev.motherFirstName,
                motherMiddleName: resident.motherMiddleName || prev.motherMiddleName,
                motherLastName: resident.motherLastName || prev.motherLastName,
            }));
        } else if (form.relationship && form.relationship !== "SELF") {
            setForm(prev => ({
                ...prev,
                certFirstName: "",
                certMiddleName: "",
                certLastName: "",
                certSuffix: "",
                dateOfEvent: "",
                placeOfEvent: "",
                fatherFirstName: "",
                fatherMiddleName: "",
                fatherLastName: "",
                motherFirstName: "",
                motherMiddleName: "",
                motherLastName: "",
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
                    setForm(prev => ({
                        ...prev,
                        email: resResult.data?.email || "",
                        contactNumber: resResult.data?.contactNumber || "",
                    }));
                }
                if (typesResult.success && typesResult.data) {
                    const lcrTypes = typesResult.data.filter((t: any) => t.category === "Civil Registry");
                    setAvailableTypes(lcrTypes);
                    
                    // Set initial typeId
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

    const dbType = availableTypes.find(t => t.id === form.typeId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit.");
                return;
            }
            setForm(prev => ({
                ...prev,
                files: { ...prev.files, [key]: file }
            }));
        }
    };

    const handleSubmit = async () => {
        if (!form.relationship) {
            toast.error("Please specify your relationship.");
            return;
        }

        if (!form.idTypeOverride && !resident?.idType) {
            toast.error("Please select an ID type.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("typeId", form.typeId);
            formData.append("registryType", "BIRTH"); // Submit as birth category type to map correctly inside actions.ts
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
                subjectName: `${form.certFirstName} ${form.certMiddleName} ${form.certLastName} ${form.certSuffix}`.trim(),
                dateOfEvent: form.dateOfEvent,
                placeOfEvent: form.placeOfEvent,
                fatherName: `${form.fatherFirstName} ${form.fatherMiddleName} ${form.fatherLastName}`.trim(),
                motherName: `${form.motherFirstName} ${form.motherMiddleName} ${form.motherLastName}`.trim(),
                relationship: form.relationship,
                fulfillmentType: form.deliveryType,
                paymentType: form.paymentType,
                email: form.email,
                contactNumber: form.contactNumber,
                idType: form.idTypeOverride || resident?.idType,
                idFrontUrl: resident?.idFrontUrl,
                idBackUrl: resident?.idBackUrl,
                totalAmount: (dbType?.baseFee || 100) + (form.deliveryType === "DELIVERY" ? (dbType?.deliveryFee || 100) : 0)
            };

            formData.append("additionalData", JSON.stringify(additionalData));

            // Append files
            Object.entries(form.files).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });

            const res = await submitCivilRegistryTransaction(formData);
            if (res.success && res.data) {
                toast.success("Birth Registration submitted successfully!");
                sessionStorage.removeItem("birth-reg-step");
                sessionStorage.removeItem("birth-reg-form");
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
                <p className="font-black uppercase tracking-widest text-[10px] text-slate-400 italic">Initializing Registration Form...</p>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8 pb-32">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/" className="flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            Home
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/user/services">Services</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/user/services/civil-registry">Civil Registry</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Birth Registration</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Baby className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Local Civil Registry</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                            Birth <span className="text-blue-500">Registration</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-sm italic">Submit timely or late registration applications for newborn records.</p>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative px-2 py-4">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-white/5 -translate-y-1/2 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-blue-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${(STEPS.findIndex(s => s.id === currentStep) / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>
                    
                    <div className="flex justify-between items-center relative z-10">
                        {STEPS.map((step, idx) => {
                            const isActive = currentStep === step.id;
                            const stepIdx = STEPS.findIndex(s => s.id === currentStep);
                            const isCompleted = stepIdx > idx;
                            const Icon = step.icon;
                            
                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center gap-2 transition-all duration-300"
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
                                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[8px] md:text-[10px] font-black uppercase tracking-wider italic hidden md:block",
                                        isActive ? "text-blue-600" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Card className="p-6 md:p-10 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0f1117] shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {currentStep === "IDENTITY" && (
                            <motion.div
                                key="identity-step"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Informant Information</h2>
                                    <p className="text-xs text-slate-500 font-medium italic">Provide details of the person registering the birth</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Informant's Relationship to Child <span className="text-red-500">*</span></Label>
                                        <Select 
                                            value={form.relationship} 
                                            onValueChange={(val) => setForm({...form, relationship: val})}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-blue-500 shadow-sm text-xs md:text-sm bg-white dark:bg-slate-900 transition-all font-bold">
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 italic">
                                                <SelectItem value="MOTHER">Mother</SelectItem>
                                                <SelectItem value="FATHER">Father</SelectItem>
                                                <SelectItem value="GUARDIAN">Guardian/Relative</SelectItem>
                                                <SelectItem value="HOSPITAL_REPRESENTATIVE">Hospital Representative</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(showErrors && !form.relationship) && (
                                            <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Contact Number <span className="text-red-500">*</span></Label>
                                            <Input 
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all font-medium",
                                                    (showErrors && !form.contactNumber) && "border-red-500/50 bg-red-50/10"
                                                )}
                                                placeholder="e.g. 0917XXXXXXX"
                                                value={form.contactNumber}
                                                onChange={(e) => setForm({...form, contactNumber: e.target.value})}
                                            />
                                            {(showErrors && !form.contactNumber) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Email Address <span className="text-red-500">*</span></Label>
                                            <Input 
                                                type="email"
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all font-medium",
                                                    (showErrors && !form.email) && "border-red-500/50 bg-red-50/10"
                                                )}
                                                placeholder="e.g. informant@domain.com"
                                                value={form.email}
                                                onChange={(e) => setForm({...form, email: e.target.value})}
                                            />
                                            {(showErrors && !form.email) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Button 
                                        onClick={() => {
                                            if (!form.relationship || !form.contactNumber || !form.email) {
                                                setShowErrors(true);
                                                toast.error("Please fill in all informant details.", {
                                                    className: "font-black uppercase tracking-widest text-[10px] italic",
                                                });
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("DETAILS");
                                        }}
                                        className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl shadow-blue-500/20"
                                    >
                                        Next Step
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "DETAILS" && (
                            <motion.div
                                key="details-step"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Child Details</h2>
                                    <p className="text-xs text-slate-500 font-medium italic">Provide the birth details of the child</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name <span className="text-red-500">*</span></Label>
                                            <Input 
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium",
                                                    (showErrors && !form.certFirstName) && "border-red-500/50 bg-red-50/10"
                                                )}
                                                placeholder="First name"
                                                value={form.certFirstName}
                                                onChange={(e) => setForm({...form, certFirstName: e.target.value.toUpperCase()})}
                                            />
                                            {(showErrors && !form.certFirstName) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                            <Input 
                                                className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium"
                                                placeholder="Middle name"
                                                value={form.certMiddleName}
                                                onChange={(e) => setForm({...form, certMiddleName: e.target.value.toUpperCase()})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name <span className="text-red-500">*</span></Label>
                                            <Input 
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium",
                                                    (showErrors && !form.certLastName) && "border-red-500/50 bg-red-50/10"
                                                )}
                                                placeholder="Last name"
                                                value={form.certLastName}
                                                onChange={(e) => setForm({...form, certLastName: e.target.value.toUpperCase()})}
                                            />
                                            {(showErrors && !form.certLastName) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Suffix</Label>
                                            <Input 
                                                className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium"
                                                placeholder="e.g. Jr., III"
                                                value={form.certSuffix}
                                                onChange={(e) => setForm({...form, certSuffix: e.target.value.toUpperCase()})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Date of Birth <span className="text-red-500">*</span></Label>
                                            <Input 
                                                type="date"
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all font-medium",
                                                    (showErrors && !form.dateOfEvent) && "border-red-500/50 bg-red-50/10"
                                                )}
                                                value={form.dateOfEvent}
                                                onChange={(e) => setForm({...form, dateOfEvent: e.target.value})}
                                            />
                                            {(showErrors && !form.dateOfEvent) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Place of Birth <span className="text-red-500">*</span></Label>
                                            <Input 
                                                className={cn(
                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium",
                                                    (showErrors && !form.placeOfEvent) && "border-red-500/50 bg-red-50/10"
                                                )}
                                                placeholder="Hospital/Municipality, Province"
                                                value={form.placeOfEvent}
                                                onChange={(e) => setForm({...form, placeOfEvent: e.target.value.toUpperCase()})}
                                            />
                                            {(showErrors && !form.placeOfEvent) && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                            )}
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
                                            if (!form.certFirstName || !form.certLastName || !form.dateOfEvent || !form.placeOfEvent) {
                                                setShowErrors(true);
                                                toast.error("Please fill in all required child details.", {
                                                    className: "font-black uppercase tracking-widest text-[10px] italic",
                                                });
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("PARENTS");
                                        }}
                                        className="rounded-full px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl shadow-blue-500/20"
                                    >
                                        Next Step
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "PARENTS" && (
                            <motion.div
                                key="parents-step"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Parental Information</h2>
                                    <p className="text-xs text-slate-500 font-medium italic">Provide the full names of the child's parents</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Father */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                                            <div className="p-1 bg-blue-500/10 rounded-lg">
                                                <Users className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">Father's Name</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12",
                                                        (showErrors && !form.fatherFirstName) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="First name"
                                                    value={form.fatherFirstName}
                                                    onChange={(e) => setForm({...form, fatherFirstName: e.target.value.toUpperCase()})}
                                                />
                                                {(showErrors && !form.fatherFirstName) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                                <Input 
                                                    className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                    placeholder="Middle name"
                                                    value={form.fatherMiddleName}
                                                    onChange={(e) => setForm({...form, fatherMiddleName: e.target.value.toUpperCase()})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12",
                                                        (showErrors && !form.fatherLastName) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="Last name"
                                                    value={form.fatherLastName}
                                                    onChange={(e) => setForm({...form, fatherLastName: e.target.value.toUpperCase()})}
                                                />
                                                {(showErrors && !form.fatherLastName) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mother */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                                            <div className="p-1 bg-rose-500/10 rounded-lg">
                                                <Users className="w-4 h-4 text-rose-500" />
                                            </div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 italic">Mother's Maiden Name</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12",
                                                        (showErrors && !form.motherFirstName) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="First name"
                                                    value={form.motherFirstName}
                                                    onChange={(e) => setForm({...form, motherFirstName: e.target.value.toUpperCase()})}
                                                />
                                                {(showErrors && !form.motherFirstName) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                                <Input 
                                                    className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                    placeholder="Middle name"
                                                    value={form.motherMiddleName}
                                                    onChange={(e) => setForm({...form, motherMiddleName: e.target.value.toUpperCase()})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name <span className="text-red-500">*</span></Label>
                                                <Input 
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12",
                                                        (showErrors && !form.motherLastName) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="Last name"
                                                    value={form.motherLastName}
                                                    onChange={(e) => setForm({...form, motherLastName: e.target.value.toUpperCase()})}
                                                />
                                                {(showErrors && !form.motherLastName) && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">Required</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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
                                            if (!form.fatherFirstName || !form.fatherLastName || !form.motherFirstName || !form.motherLastName) {
                                                setShowErrors(true);
                                                toast.error("Please fill in all parent details.", {
                                                    className: "font-black uppercase tracking-widest text-[10px] italic",
                                                });
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
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Registration Review</h2>
                                        <p className="text-xs text-slate-500 font-medium italic">Verify child information and upload required documents</p>
                                    </div>
                                </div>

                                <Card className="bg-slate-50 dark:bg-white/5 border-none p-6 rounded-[2rem] space-y-4">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Certificate Type</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">Birth Registration (New Record)</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Child Name</span>
                                            <p className="font-black text-slate-900 dark:text-white italic uppercase">{`${form.certFirstName} ${form.certMiddleName} ${form.certLastName} ${form.certSuffix}`.trim()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Date of Birth</span>
                                            <p className="font-black text-slate-900 dark:text-white italic">{form.dateOfEvent}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Place of Birth</span>
                                            <p className="font-black text-slate-900 dark:text-white italic uppercase">{form.placeOfEvent}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Father's Name</span>
                                            <p className="font-black text-slate-900 dark:text-white italic uppercase">
                                                {`${form.fatherFirstName} ${form.fatherMiddleName} ${form.fatherLastName}`.trim()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Mother's Name</span>
                                            <p className="font-black text-slate-900 dark:text-white italic uppercase">
                                                {`${form.motherFirstName} ${form.motherMiddleName} ${form.motherLastName}`.trim()}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Informant</span>
                                            <p className="font-black text-slate-900 dark:text-white italic uppercase">{resident?.firstName} {resident?.lastName} ({form.relationship})</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Process Fee</span>
                                            <p className="text-2xl font-black text-blue-500 italic">₱{(dbType?.baseFee || 100).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* File Submission Section */}
                                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                <Upload className="w-3.5 h-3.5 text-blue-500" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Required Documents Upload</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic ml-1">
                                                    Certificate of Live Birth (Hospital Draft) <span className="text-red-500">*</span>
                                                </Label>
                                                <div className={cn(
                                                    "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[1.5rem] p-4 transition-all duration-300 min-h-[120px]",
                                                    form.files["liveBirthCertificate"] ? "bg-blue-50/50 border-blue-500/50" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
                                                )}>
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => handleFileChange(e, "liveBirthCertificate")}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        accept="image/*,.pdf"
                                                    />
                                                    {form.files["liveBirthCertificate"] ? (
                                                        <div className="text-center">
                                                            <Check className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase italic truncate max-w-[180px]">
                                                                {form.files["liveBirthCertificate"].name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-2">
                                                            <Upload className="w-5 h-5 text-slate-300 mx-auto" />
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Upload Certificate</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic ml-1">
                                                    Marriage Certificate of Parents <span className="text-red-500">*</span>
                                                </Label>
                                                <div className={cn(
                                                    "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[1.5rem] p-4 transition-all duration-300 min-h-[120px]",
                                                    form.files["marriageCertificate"] ? "bg-blue-50/50 border-blue-500/50" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
                                                )}>
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => handleFileChange(e, "marriageCertificate")}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        accept="image/*,.pdf"
                                                    />
                                                    {form.files["marriageCertificate"] ? (
                                                        <div className="text-center">
                                                            <Check className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase italic truncate max-w-[180px]">
                                                                {form.files["marriageCertificate"].name}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-2">
                                                            <Upload className="w-5 h-5 text-slate-300 mx-auto" />
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Upload Certificate</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 md:col-span-2 pt-2">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-500/70 ml-1">
                                                    Informant ID Type <span className="text-red-500">*</span>
                                                </Label>
                                                <Select 
                                                    value={form.idTypeOverride || resident?.idType || ""} 
                                                    onValueChange={(value) => setForm(prev => ({
                                                        ...prev,
                                                        idTypeOverride: value
                                                    }))}
                                                >
                                                    <SelectTrigger className="h-10 rounded-xl border-slate-200 focus:ring-blue-500 shadow-sm text-xs md:text-sm bg-white dark:bg-slate-900 transition-all font-bold">
                                                        <SelectValue>
                                                            {form.idTypeOverride || resident?.idType || "Select type of government ID"}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 italic">
                                                        <SelectItem value="UMID">Unified Multi-Purpose ID (UMID)</SelectItem>
                                                        <SelectItem value="DRIVERS_LICENSE">Driver&apos;s License</SelectItem>
                                                        <SelectItem value="PASSPORT">Passport</SelectItem>
                                                        <SelectItem value="POSTAL_ID">Postal ID</SelectItem>
                                                        <SelectItem value="VOTERS_ID">Voter&apos;s ID</SelectItem>
                                                        <SelectItem value="PRC_ID">PRC ID</SelectItem>
                                                        <SelectItem value="NATIONAL_ID">National ID (PhilSys)</SelectItem>
                                                        <SelectItem value="SENIOR_CITIZEN">Senior Citizen ID</SelectItem>
                                                        <SelectItem value="PWD_ID">PWD ID</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic ml-1">
                                                    Valid Informant ID (Front) <span className="text-red-500">*</span>
                                                </Label>
                                                <div className={cn(
                                                    "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[1.5rem] p-4 transition-all duration-300 min-h-[120px]",
                                                    (form.files["validIdFront"] || resident?.idFrontUrl) ? "bg-blue-50/50 border-blue-500/50" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
                                                )}>
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => handleFileChange(e, "validIdFront")}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        accept="image/*,.pdf"
                                                    />
                                                    {(form.files["validIdFront"] || resident?.idFrontUrl) ? (
                                                        <div className="text-center">
                                                            <Check className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase italic truncate max-w-[180px]">
                                                                {form.files["validIdFront"] ? form.files["validIdFront"].name : "Saved ID Record"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-2">
                                                            <Upload className="w-5 h-5 text-slate-300 mx-auto" />
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Upload Front</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic ml-1">
                                                    Valid Informant ID (Back) <span className="text-red-500">*</span>
                                                </Label>
                                                <div className={cn(
                                                    "group relative flex flex-col items-center justify-center border-2 border-dashed rounded-[1.5rem] p-4 transition-all duration-300 min-h-[120px]",
                                                    (form.files["validIdBack"] || resident?.idBackUrl) ? "bg-blue-50/50 border-blue-500/50" : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-500/50"
                                                )}>
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => handleFileChange(e, "validIdBack")}
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        accept="image/*,.pdf"
                                                    />
                                                    {(form.files["validIdBack"] || resident?.idBackUrl) ? (
                                                        <div className="text-center">
                                                            <Check className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                                                            <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase italic truncate max-w-[180px]">
                                                                {form.files["validIdBack"] ? form.files["validIdBack"].name : "Saved ID Record"}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-2">
                                                            <Upload className="w-5 h-5 text-slate-300 mx-auto" />
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Upload Back</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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
                                            onClick={() => setCurrentStep("PARENTS")}
                                            className="h-14 rounded-full border-slate-200 dark:border-white/10 font-black uppercase tracking-widest italic text-[11px]"
                                        >
                                            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                            Modify Details
                                        </Button>
                                        <Button 
                                            onClick={handleSubmit}
                                            disabled={
                                                submitting || 
                                                (!form.idTypeOverride && !resident?.idType) ||
                                                (!form.files["validIdFront"] && !resident?.idFrontUrl) ||
                                                (!form.files["validIdBack"] && !resident?.idBackUrl) ||
                                                !form.files["liveBirthCertificate"] ||
                                                !form.files["marriageCertificate"]
                                            }
                                            className={cn(
                                                "md:col-span-3 h-14 rounded-full font-black uppercase tracking-widest italic text-[11px] transition-all duration-300",
                                                (!form.idTypeOverride && !resident?.idType) || 
                                                (!form.files["validIdFront"] && !resident?.idFrontUrl) || 
                                                (!form.files["validIdBack"] && !resident?.idBackUrl) ||
                                                !form.files["liveBirthCertificate"] ||
                                                !form.files["marriageCertificate"]
                                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                                                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                                            )}
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            ) : (!form.idTypeOverride && !resident?.idType) || (!form.files["validIdFront"] && !resident?.idFrontUrl) || (!form.files["validIdBack"] && !resident?.idBackUrl) || !form.files["liveBirthCertificate"] || !form.files["marriageCertificate"] ? (
                                                <>
                                                    Upload All Required Documents to Submit
                                                    <AlertCircle className="w-5 h-5 ml-2" />
                                                </>
                                            ) : (
                                                <>
                                                    Submit Birth Registration Application
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
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">New registrations require the Draft Certificate of Live Birth from the hospital/clinic, the parents' Marriage Certificate, and informant's valid ID.</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 rounded-[2rem] border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                        <div className="flex gap-4">
                            <CreditCard className="w-5 h-5 text-slate-400 shrink-0" />
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Registration Fee</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">PHP 100.00 standard administrative filing fee applies for timely registration requests processed via the online portal.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
