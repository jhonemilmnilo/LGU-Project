"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    User,
    ChevronRight,
    Loader2,
    Check,
    AlertCircle,
    Sparkles,
    Skull,
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
    submitCivilRegistryTransaction,
    getAllResidents
} from "@/app/admin/transactions/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PrivacyTermsModal from "@/components/shared/PrivacyTermsModal";

// --- TYPES ---

type Step = "IDENTITY" | "DETAILS" | "UPLOAD" | "CONFIRM";

const STEPS: { id: Step; label: string; icon: any }[] = [
    { id: "IDENTITY", label: "Requester Details", icon: User },
    { id: "DETAILS", label: "Deceased Details", icon: Search },
    { id: "UPLOAD", label: "Supporting Docs", icon: Upload },
    { id: "CONFIRM", label: "Review & Submit", icon: CheckCircle2 },
];

interface FormState {
    typeId: string;
    // Requester Details
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    civilStatus: string;
    gender: string;
    relationship: string;
    contactNumber: string;
    email: string;
    // Deceased Details
    deceasedFirstName: string;
    deceasedMiddleName: string;
    deceasedLastName: string;
    deceasedSuffix: string;
    dateOfDeath: string;
    placeOfDeath: string;
    // Uploads
    idTypeOverride: string;
    files: Record<string, File | null>;
}

export default function DeathCertificateRequestPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("IDENTITY");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [dbType, setDbType] = useState<any>(null);
    const [resident, setResident] = useState<any>(null);
    const [allResidents, setAllResidents] = useState<any[]>([]);
    const [selectedResidentId, setSelectedResidentId] = useState("");

    const [form, setForm] = useState<FormState>({
        typeId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        civilStatus: "",
        gender: "",
        relationship: "",
        contactNumber: "",
        email: "",
        deceasedFirstName: "",
        deceasedMiddleName: "",
        deceasedLastName: "",
        deceasedSuffix: "",
        dateOfDeath: "",
        placeOfDeath: "",
        idTypeOverride: "",
        files: {
            validIdFront: null,
            validIdBack: null,
            proofOfRelationship: null,
        },
    });

    // Privacy policy modal state
    const [policyOpen, setPolicyOpen] = useState(false);
    const [policyAccepted, setPolicyAccepted] = useState(false);

    useEffect(() => {
        async function init() {
            try {
                // Ensure civil registry transaction types are seeded in db
                await ensureCivilRegistryTransactionTypes();
                const [resResult, typesResult, allResidentsResult] = await Promise.all([
                    getCurrentUserResident(),
                    getTransactionTypes(),
                    getAllResidents()
                ]);

                if (resResult.success && resResult.data) {
                    const r = resResult.data;
                    setResident(r);
                    setSelectedResidentId(r.id);
                    
                    // Pre-fill requester details from database resident profile
                    setForm(prev => ({
                        ...prev,
                        firstName: r.firstName || "",
                        middleName: r.middleName || "",
                        lastName: r.lastName || "",
                        suffix: r.suffix || "",
                        civilStatus: (r.civilStatus || "").toUpperCase(),
                        gender: (r.gender || "").toUpperCase(),
                        contactNumber: r.contactNumber || "",
                        email: r.email || "",
                    }));
                }

                if (allResidentsResult.success && allResidentsResult.data) {
                    setAllResidents(allResidentsResult.data);
                }

                if (typesResult.success && typesResult.data) {
                    const deathReqType = typesResult.data.find((t: any) => t.code === "LCR_DEATH");
                    if (deathReqType) {
                        setDbType(deathReqType);
                        setForm(prev => ({ ...prev, typeId: deathReqType.id }));
                    }
                }
            } catch (err) {
                console.error("Initialization Failed:", err);
                toast.error("Failed to load LCR parameters");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setForm(prev => ({
                ...prev,
                files: { ...prev.files, [key]: e.target.files![0] }
            }));
        }
    };

    const handleAcceptPolicy = () => {
        setPolicyOpen(false);
        setPolicyAccepted(true);
    };

    const handleSubmit = async () => {
        if (!resident) {
            toast.error("User profile required to submit transaction");
            return;
        }

        // Validate uploads
        if ((!form.files["validIdFront"] && !resident?.idFrontUrl) || (!form.files["validIdBack"] && !resident?.idBackUrl)) {
            toast.error("Please upload both Front and Back of your Government ID.");
            return;
        }

        if (!form.idTypeOverride && !resident?.idType) {
            toast.error("Please specify your ID type.");
            return;
        }

        if (!policyAccepted) {
            toast.error("Please review and accept the Privacy Policy & Terms before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("typeId", form.typeId);
            formData.append("registryType", "DEATH");
            
            // Build resident snapshot to update in database
            formData.append("residentSnapshot", JSON.stringify({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                middleName: form.middleName.trim(),
                suffix: form.suffix.trim(),
                contactNumber: form.contactNumber.trim(),
                email: form.email.trim(),
                gender: form.gender || resident?.gender,
                barangay: resident?.barangay || "Mapandan",
                municipality: resident?.municipality || "Mapandan",
                province: resident?.province || "Pangasinan"
            }));

            const deceasedFullName = `${form.deceasedFirstName} ${form.deceasedMiddleName} ${form.deceasedLastName} ${form.deceasedSuffix}`.replace(/\s+/g, " ").trim();

            const additionalData = {
                subjectName: deceasedFullName,
                deceasedFirstName: form.deceasedFirstName.trim(),
                deceasedMiddleName: form.deceasedMiddleName.trim(),
                deceasedLastName: form.deceasedLastName.trim(),
                deceasedSuffix: form.deceasedSuffix.trim(),
                dateOfEvent: form.dateOfDeath,
                placeOfEvent: form.placeOfDeath.trim(),
                relationship: form.relationship,
                email: form.email.trim(),
                contactNumber: form.contactNumber.trim(),
                idType: form.idTypeOverride || resident?.idType,
                idFrontUrl: resident?.idFrontUrl,
                idBackUrl: resident?.idBackUrl,
                totalAmount: dbType?.baseFee || 150.00
            };

            formData.append("additionalData", JSON.stringify(additionalData));

            // Append file uploads
            Object.entries(form.files).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });

            const res = await submitCivilRegistryTransaction(formData);
            if (res.success && res.data) {
                toast.success("Death Certificate Request submitted successfully!");
                router.push(`/user/services/requests/${res.data.id}`);
            } else {
                toast.error(res.error || "Submission failed");
            }
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("An error occurred during submission");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400 italic">Syncing LCR Database...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] pb-32 pt-24 px-6">
            <PrivacyTermsModal
                isOpen={policyOpen}
                onClose={() => setPolicyOpen(false)}
                onAccept={handleAcceptPolicy}
                onDecline={() => setPolicyAccepted(false)}
                themeColor="var(--blue-500)"
            />

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Breadcrumbs */}
                <div className="space-y-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbLink href="/user/services">Services</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbLink href="/user/services/civil-registry">Civil Registry</BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Death Certificate Request</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-500/10 rounded-xl">
                                    <FileText className="w-6 h-6 text-slate-500" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Local Civil Registry</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                Death <span className="text-slate-500">Certificate</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-sm italic">Request a certified true copy of an official death certificate.</p>
                        </div>
                    </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative px-2 py-4">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-white/5 -translate-y-1/2" />
                    <motion.div
                        className="absolute top-1/2 left-0 h-0.5 bg-slate-500 -translate-y-1/2 z-0"
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

                            return (
                                <div key={idx} className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 bg-white dark:bg-[#08090d]",
                                        isActive ? "border-slate-500 text-slate-500 shadow-lg shadow-slate-500/20 scale-110" :
                                            isCompleted ? "bg-slate-500 border-slate-500 text-white" :
                                                "border-slate-200 dark:border-white/10 text-slate-400"
                                    )}>
                                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest italic hidden md:block",
                                        isActive ? "text-slate-500" : "text-slate-400"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Wizards */}
                <Card className="p-8 rounded-[2.5rem] border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0f1117] shadow-xl shadow-slate-200/40 dark:shadow-none min-h-[400px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: IDENTITY (REQUESTER DETAILS) */}
                        {currentStep === "IDENTITY" && (
                            <motion.div
                                key="identity-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 md:space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
                                        Requester <span className="text-slate-500">Identity</span>
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">
                                        Verify or enter your details as the requesting party.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Resident Selection Dropdown */}
                                    <div className="space-y-2 p-6 rounded-[2rem] bg-slate-500/5 border border-slate-200/50 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-500" />
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                Select Requester from Resident Database
                                            </Label>
                                        </div>
                                        <Select
                                            value={selectedResidentId}
                                            onValueChange={(val) => {
                                                setSelectedResidentId(val);
                                                const r = allResidents.find(x => x.id === val);
                                                if (r) {
                                                    setResident(r);
                                                    setForm(p => ({
                                                        ...p,
                                                        firstName: r.firstName || "",
                                                        middleName: r.middleName || "",
                                                        lastName: r.lastName || "",
                                                        suffix: r.suffix || "",
                                                        civilStatus: (r.civilStatus || "").toUpperCase(),
                                                        gender: (r.gender || "").toUpperCase(),
                                                        contactNumber: r.contactNumber || "",
                                                        email: r.email || "",
                                                    }));
                                                    toast.success(`Loaded requester: ${r.firstName} ${r.lastName}`);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl text-xs md:text-sm font-bold uppercase">
                                                <SelectValue placeholder="Choose a resident..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allResidents.map((r) => (
                                                    <SelectItem key={r.id} value={r.id}>
                                                        {`${r.lastName}, ${r.firstName} ${r.middleName || ""}`.trim().toUpperCase()} ({r.barangay})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Name Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                                            <Input
                                                value={form.firstName}
                                                readOnly
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Middle Name</Label>
                                            <Input
                                                value={form.middleName}
                                                readOnly
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                placeholder="Middle name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                                            <Input
                                                value={form.lastName}
                                                readOnly
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                placeholder="Last name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Suffix</Label>
                                            <Input
                                                value={form.suffix}
                                                readOnly
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                placeholder="Suffix"
                                            />
                                        </div>
                                    </div>

                                    {/* Personal details & Relationship */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Civil Status</Label>
                                            <Input
                                                value={form.civilStatus}
                                                readOnly
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                placeholder="Civil Status"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sex / Gender</Label>
                                            <Input
                                                value={form.gender}
                                                readOnly
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                placeholder="Sex / Gender"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Relationship to Owner <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={form.relationship}
                                                onValueChange={(val) => setForm(p => ({ ...p, relationship: val }))}
                                            >
                                                <SelectTrigger className={cn("h-10 rounded-xl text-xs md:text-sm font-bold uppercase", (showErrors && !form.relationship) && "border-red-500")}>
                                                    <SelectValue placeholder="Select relationship" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="SPOUSE">Spouse</SelectItem>
                                                    <SelectItem value="SON">Son</SelectItem>
                                                    <SelectItem value="DAUGHTER">Daughter</SelectItem>
                                                    <SelectItem value="MOTHER">Mother</SelectItem>
                                                    <SelectItem value="FATHER">Father</SelectItem>
                                                    <SelectItem value="SIBLING">Sibling</SelectItem>
                                                    <SelectItem value="REPRESENTATIVE">Legal Representative</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Contact Number */}
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={form.contactNumber}
                                            onChange={(e) => setForm(p => ({ ...p, contactNumber: e.target.value }))}
                                            className={cn("h-10 rounded-xl text-xs md:text-sm font-bold", (showErrors && !form.contactNumber) && "border-red-500")}
                                            placeholder="e.g. 09123456789"
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-500/5 border border-slate-500/10 p-4 rounded-3xl flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-slate-500 shrink-0" />
                                    <p className="text-[10px] text-slate-500 font-black italic leading-tight uppercase tracking-widest">
                                        Requester profile synchronized. Please ensure your contact details are updated.
                                    </p>
                                </div>

                                {/* Step Nav */}
                                <div className="flex justify-end gap-3 pt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/user/services/civil-registry")}
                                        className="rounded-full px-8 font-black uppercase tracking-widest italic text-[10px] h-12"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (!form.firstName || !form.lastName || !form.civilStatus || !form.gender || !form.relationship || !form.contactNumber) {
                                                setShowErrors(true);
                                                toast.error("Please fill in all required requester fields.");
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("DETAILS");
                                        }}
                                        className="rounded-full px-12 bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl hover:opacity-90 transition-opacity"
                                    >
                                        Proceed to Deceased Details
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: DETAILS (DECEASED DETAILS) */}
                        {currentStep === "DETAILS" && (
                            <motion.div
                                key="details-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 md:space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
                                        Deceased <span className="text-slate-500">Details</span>
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">
                                        Provide the official registry details of the deceased individual.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* Deceased Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deceased First Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={form.deceasedFirstName}
                                                onChange={(e) => setForm(p => ({ ...p, deceasedFirstName: e.target.value }))}
                                                className={cn("h-10 rounded-xl uppercase font-bold text-xs md:text-sm", (showErrors && !form.deceasedFirstName) && "border-red-500")}
                                                placeholder="Deceased first name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deceased Middle Name</Label>
                                            <Input
                                                value={form.deceasedMiddleName}
                                                onChange={(e) => setForm(p => ({ ...p, deceasedMiddleName: e.target.value }))}
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm"
                                                placeholder="Deceased middle name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deceased Last Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={form.deceasedLastName}
                                                onChange={(e) => setForm(p => ({ ...p, deceasedLastName: e.target.value }))}
                                                className={cn("h-10 rounded-xl uppercase font-bold text-xs md:text-sm", (showErrors && !form.deceasedLastName) && "border-red-500")}
                                                placeholder="Deceased last name"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deceased Suffix</Label>
                                            <Input
                                                value={form.deceasedSuffix}
                                                onChange={(e) => setForm(p => ({ ...p, deceasedSuffix: e.target.value }))}
                                                className="h-10 rounded-xl uppercase font-bold text-xs md:text-sm"
                                                placeholder="e.g. Jr."
                                            />
                                        </div>
                                    </div>

                                    {/* Date & Place of Event */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date of Death <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="date"
                                                value={form.dateOfDeath}
                                                onChange={(e) => setForm(p => ({ ...p, dateOfDeath: e.target.value }))}
                                                className={cn("h-10 rounded-xl font-bold text-xs md:text-sm", (showErrors && !form.dateOfDeath) && "border-red-500")}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Place of Death <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={form.placeOfDeath}
                                                onChange={(e) => setForm(p => ({ ...p, placeOfDeath: e.target.value }))}
                                                className={cn("h-10 rounded-xl font-bold text-xs md:text-sm uppercase", (showErrors && !form.placeOfDeath) && "border-red-500")}
                                                placeholder="e.g. Mapandan, Pangasinan"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Step Nav */}
                                <div className="flex justify-end gap-3 pt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentStep("IDENTITY")}
                                        className="rounded-full px-8 font-black uppercase tracking-widest italic text-[10px] h-12"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (!form.deceasedFirstName || !form.deceasedLastName || !form.dateOfDeath || !form.placeOfDeath) {
                                                setShowErrors(true);
                                                toast.error("Please fill in all required fields.");
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("UPLOAD");
                                        }}
                                        className="rounded-full px-12 bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl hover:opacity-90 transition-opacity"
                                    >
                                        Proceed to Document Upload
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: UPLOAD */}
                        {currentStep === "UPLOAD" && (
                            <motion.div
                                key="upload-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 md:space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
                                        Supporting <span className="text-slate-500">Documents</span>
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">
                                        Upload legal proofs to verify your identity and association.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* ID Type Select */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Government ID Type <span className="text-red-500">*</span></Label>
                                        <Select
                                            value={form.idTypeOverride || resident?.idType || ""}
                                            onValueChange={(val) => setForm(p => ({ ...p, idTypeOverride: val }))}
                                        >
                                            <SelectTrigger className={cn("h-12 rounded-xl text-xs md:text-sm font-bold uppercase", (showErrors && !form.idTypeOverride && !resident?.idType) && "border-red-500")}>
                                                <SelectValue placeholder="Select ID Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UMID">UMID</SelectItem>
                                                <SelectItem value="SSS">SSS ID</SelectItem>
                                                <SelectItem value="TIN">TIN Card</SelectItem>
                                                <SelectItem value="PASSPORT">Passport</SelectItem>
                                                <SelectItem value="DRIVERS_LICENSE">Driver&apos;s License</SelectItem>
                                                <SelectItem value="PHILHEALTH">PhilHealth ID</SelectItem>
                                                <SelectItem value="VOTERS_ID">Voter&apos;s ID</SelectItem>
                                                <SelectItem value="POSTAL">Postal ID</SelectItem>
                                                <SelectItem value="PRC">PRC ID</SelectItem>
                                                <SelectItem value="NATIONAL_ID">National ID (PhilSys)</SelectItem>
                                                <SelectItem value="BARANGAY_ID">Barangay ID</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Grid Uploaders */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Front ID Uploader */}
                                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between space-y-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Government ID (Front) <span className="text-red-500">*</span></Label>
                                                <p className="text-[9px] text-slate-400 italic">Clear photographic copy of front side.</p>
                                            </div>
                                            {resident?.idFrontUrl && !form.files.validIdFront ? (
                                                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-bold">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                    Using registered ID (Front) from Profile
                                                </div>
                                            ) : form.files.validIdFront ? (
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl text-xs font-bold truncate">
                                                    <FileText className="w-4 h-4 shrink-0" />
                                                    {form.files.validIdFront.name}
                                                </div>
                                            ) : null}
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => handleFileChange(e, "validIdFront")}
                                                    className="hidden"
                                                    id="id-front-input"
                                                />
                                                <label
                                                    htmlFor="id-front-input"
                                                    className="flex items-center justify-center gap-2 w-full h-11 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider italic cursor-pointer hover:border-slate-800 dark:hover:border-white/30 transition-colors"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {form.files.validIdFront || resident?.idFrontUrl ? "Replace File" : "Upload Front ID"}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Back ID Uploader */}
                                        <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between space-y-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Government ID (Back) <span className="text-red-500">*</span></Label>
                                                <p className="text-[9px] text-slate-400 italic">Clear photographic copy of back side.</p>
                                            </div>
                                            {resident?.idBackUrl && !form.files.validIdBack ? (
                                                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-bold">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                    Using registered ID (Back) from Profile
                                                </div>
                                            ) : form.files.validIdBack ? (
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl text-xs font-bold truncate">
                                                    <FileText className="w-4 h-4 shrink-0" />
                                                    {form.files.validIdBack.name}
                                                </div>
                                            ) : null}
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => handleFileChange(e, "validIdBack")}
                                                    className="hidden"
                                                    id="id-back-input"
                                                />
                                                <label
                                                    htmlFor="id-back-input"
                                                    className="flex items-center justify-center gap-2 w-full h-11 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider italic cursor-pointer hover:border-slate-800 dark:hover:border-white/30 transition-colors"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    {form.files.validIdBack || resident?.idBackUrl ? "Replace File" : "Upload Back ID"}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proof of Relationship Uploader (Optional) */}
                                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proof of Relationship (Optional)</Label>
                                            <p className="text-[9px] text-slate-400 italic">E.g., Birth Certificate, Authorization Letter, or marriage contract verifying relationship.</p>
                                        </div>
                                        {form.files.proofOfRelationship ? (
                                            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-xl text-xs font-bold truncate">
                                                <FileText className="w-4 h-4 shrink-0" />
                                                {form.files.proofOfRelationship.name}
                                            </div>
                                        ) : null}
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                onChange={(e) => handleFileChange(e, "proofOfRelationship")}
                                                className="hidden"
                                                id="relationship-input"
                                            />
                                            <label
                                                htmlFor="relationship-input"
                                                className="flex items-center justify-center gap-2 w-full h-11 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-wider italic cursor-pointer hover:border-slate-800 dark:hover:border-white/30 transition-colors"
                                            >
                                                <Upload className="w-4 h-4" />
                                                {form.files.proofOfRelationship ? "Replace File" : "Upload Proof of Relationship"}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Step Nav */}
                                <div className="flex justify-end gap-3 pt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentStep("DETAILS")}
                                        className="rounded-full px-8 font-black uppercase tracking-widest italic text-[10px] h-12"
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const activeIdType = form.idTypeOverride || resident?.idType;
                                            if (!activeIdType) {
                                                setShowErrors(true);
                                                toast.error("Please select a Government ID Type.");
                                                return;
                                            }
                                            if ((!form.files.validIdFront && !resident?.idFrontUrl) || (!form.files.validIdBack && !resident?.idBackUrl)) {
                                                setShowErrors(true);
                                                toast.error("Please upload front and back of your Government ID.");
                                                return;
                                            }
                                            setShowErrors(false);
                                            setCurrentStep("CONFIRM");
                                        }}
                                        className="rounded-full px-12 bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl hover:opacity-90 transition-opacity"
                                    >
                                        Proceed to Review & Confirm
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: REVIEW & CONFIRM */}
                        {currentStep === "CONFIRM" && (
                            <motion.div
                                key="confirm-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 md:space-y-8"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
                                        Review & <span className="text-slate-500">Confirm</span>
                                    </h2>
                                    <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">
                                        Review all parameters for this LCR request prior to filing.
                                    </p>
                                </div>

                                {/* Review panels */}
                                <div className="space-y-6">
                                    {/* Data Privacy checkbox */}
                                    <div className="p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 bg-slate-500/5 flex items-start gap-4 shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => setPolicyOpen(true)}
                                            className={cn("w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors", policyAccepted ? "bg-slate-800 border-slate-800 dark:bg-white dark:border-white text-white dark:text-slate-900" : "border-slate-300")}
                                        >
                                            {policyAccepted ? <Check className="w-3.5 h-3.5" /> : null}
                                        </button>
                                        <div className="flex-1 text-xs">
                                            <div className="font-black uppercase text-[10px] tracking-wider text-slate-800 dark:text-white">Data Privacy & Certification Agreement</div>
                                            <div className="text-[9px] text-slate-500 italic mt-1 leading-relaxed">
                                                I certify that all details submitted are true, correct, and matching public registry records. I agree to the Municipal Data Privacy compliance. Click to review.
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPolicyOpen(true)}
                                            className="text-[10px] font-black italic text-slate-600 dark:text-slate-400 hover:underline shrink-0"
                                        >
                                            Review
                                        </button>
                                    </div>

                                    {/* Summary columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 rounded-[2.5rem] bg-slate-500/5 border border-slate-200/50 dark:border-white/5">
                                        
                                        {/* Requester Details */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic">Requester Details</h3>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Full Name:</span>
                                                    <span className="font-black uppercase text-slate-900 dark:text-white">{`${form.firstName} ${form.middleName} ${form.lastName} ${form.suffix}`.trim()}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Civil Status / Sex:</span>
                                                    <span className="font-black uppercase text-slate-900 dark:text-white">{form.civilStatus} / {form.gender}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Relationship:</span>
                                                    <span className="font-black uppercase text-slate-900 dark:text-white">{form.relationship}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Contact:</span>
                                                    <span className="font-black text-slate-900 dark:text-white">{form.contactNumber}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Deceased Details */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 italic">Deceased Details</h3>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Deceased Individual:</span>
                                                    <span className="font-black uppercase text-slate-900 dark:text-white">{`${form.deceasedFirstName} ${form.deceasedMiddleName} ${form.deceasedLastName} ${form.deceasedSuffix}`.trim()}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Date of Death:</span>
                                                    <span className="font-black text-slate-900 dark:text-white">{form.dateOfDeath}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Place of Death:</span>
                                                    <span className="font-black uppercase text-slate-900 dark:text-white">{form.placeOfDeath}</span>
                                                </div>
                                                <div className="flex justify-between py-1 border-b border-slate-200/30 dark:border-white/5">
                                                    <span className="text-slate-400 font-bold italic uppercase text-[9px]">Service Fee:</span>
                                                    <span className="font-black text-slate-900 dark:text-white">₱{(dbType?.baseFee || 150).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step Nav */}
                                <div className="flex justify-end gap-3 pt-8">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCurrentStep("UPLOAD")}
                                        className="rounded-full px-8 font-black uppercase tracking-widest italic text-[10px] h-12"
                                        disabled={submitting}
                                    >
                                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitting || !policyAccepted}
                                        className="rounded-full px-12 bg-slate-800 dark:bg-white dark:text-slate-900 text-white font-black uppercase tracking-widest italic text-[10px] h-12 shadow-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-white dark:text-slate-900" />
                                                Filing Request...
                                            </>
                                        ) : (
                                            <>
                                                File LCR Request
                                                <Check className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>
        </div>
    );
}
