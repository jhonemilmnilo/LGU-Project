/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import SecureIdleTimer from "@/components/shared/SecureIdleTimer";
import PrivacyTermsModal from "@/components/shared/PrivacyTermsModal";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    User,
    Loader2,
    Check,
    Home,
    Sparkles,
    Baby,
    ArrowRight,
    Info,
    Upload,
    Search,
    CheckCircle2,
    Users,
    AlertCircle,
    Eye
} from "lucide-react";
import DocumentViewerModal from "@/components/shared/DocumentViewerModal";
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
import { saveDraftFile, getDraftFiles, clearDraftFiles } from "@/lib/draftDb";

const STORAGE_KEY = "lcr_birth_registration_draft";

const checkIsPdf = (file: any, url: string | null) => {
    if (file && file instanceof File) {
        return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    }
    if (url) {
        return url.toLowerCase().endsWith(".pdf") || url.includes("application/pdf") || url.includes(".pdf?");
    }
    return false;
};

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
    children: {
        firstName: string;
        middleName: string;
        lastName: string;
        suffix: string;
    }[];
    dateOfEvent: string;
    placeOfEvent: string;
    fatherFirstName: string;
    fatherMiddleName: string;
    fatherLastName: string;
    motherFirstName: string;
    motherMiddleName: string;
    motherLastName: string;
    birthType: string;
    registrationType: "STANDARD" | "LATE";
    lateDuration?: "1-10" | "10-20" | "20+" | string;
    miscFee?: number;
    parentsMarried?: boolean;
    // Shared
    paymentType: "WALK_IN";
    files: Record<string, File | null>;
    previews: Record<string, string | null>;
    idTypeOverride?: string;
    email: string;
    contactNumber: string;
    relationship: string;

    // Informant details from profile
    informantFirstName: string;
    informantMiddleName: string;
    informantLastName: string;
    informantSuffix: string;
    informantBirthDate: string;
    informantAge: string;
    informantCivilStatus: string;
    informantCitizenship: string;
    informantOccupation: string;
}

export default function BirthRegistrationPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>("IDENTITY");
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [submitting, setSubmitting] = useState(false);
    const [, setShowErrors] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [resident, setResident] = useState<any>(null);

    const [form, setForm] = useState<FormState>({
        typeId: "",
        registryType: "BIRTH_REG",
        children: [{ firstName: "", middleName: "", lastName: "", suffix: "" }],
        dateOfEvent: "",
        placeOfEvent: "",
        fatherFirstName: "",
        fatherMiddleName: "",
        fatherLastName: "",
        motherFirstName: "",
        motherMiddleName: "",
        motherLastName: "",
        birthType: "SINGLE",
        registrationType: "STANDARD",
        miscFee: 0,
        lateDuration: "",
        paymentType: "WALK_IN",
        files: {},
        previews: {},
        idTypeOverride: "",
        email: "",
        contactNumber: "",
        relationship: "",
        informantFirstName: "",
        informantMiddleName: "",
        informantLastName: "",
        informantSuffix: "",
        informantBirthDate: "",
        informantAge: "",
        informantCivilStatus: "",
        informantCitizenship: "",
        informantOccupation: ""
    });


    // Privacy / Terms modal state (shared key across LCR pages)
    const [policyOpen, setPolicyOpen] = useState(false);

    const [policyAccepted, setPolicyAccepted] = useState(false);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerFile, setViewerFile] = useState<File | null>(null);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerTitle, setViewerTitle] = useState("");

    const handleViewFile = (file: File | null, existingUrl: string | null, title: string) => {
        setViewerFile(file);
        setViewerUrl(existingUrl);
        setViewerTitle(title);
        setViewerOpen(true);
    };

    const handleAcceptPolicy = () => {
        setPolicyOpen(false);
        setPolicyAccepted(true);
        setErrors(prev => {
            const copy = { ...prev };
            delete copy.policyAccepted;
            return copy;
        });
    };

    const isRestoredRef = useRef(false);

    const baseFee = form.registrationType === "STANDARD" ? 215 : (
        form.lateDuration === "1-10" ? 315 : form.lateDuration === "10-20" ? 515 : form.lateDuration === "20+" ? 1015 : 0
    );

    // Misc fee is display-only and represents the total amount payable
    const totalAmount = Number(baseFee || 0);

    // Restore progress from session storage & IndexedDB
    useEffect(() => {
        const savedStep = sessionStorage.getItem("birth-reg-step");
        const savedForm = sessionStorage.getItem("birth-reg-form");

        if (savedStep) setCurrentStep(savedStep as Step);
        if (savedForm) {
            try {
                const parsed = JSON.parse(savedForm);
                setForm(prev => ({
                    ...prev,
                    ...parsed
                }));
            } catch (e) {
                console.error("Failed to parse saved form", e);
            }
        }

        // Hydrate files from IndexedDB
        async function hydrateFiles() {
            try {
                const draftFiles = await getDraftFiles(STORAGE_KEY);
                if (draftFiles && Object.keys(draftFiles).length > 0) {
                    setForm(prev => {
                        const newFiles = { ...prev.files, ...draftFiles };
                        return {
                            ...prev,
                            files: newFiles
                        };
                    });

                    // Asynchronously read each image file to recover previews
                    Object.entries(draftFiles).forEach(([key, file]) => {
                        if (file && file.type.startsWith("image/")) {
                            const reader = new FileReader();
                            reader.onload = () => {
                                setForm(prev => ({
                                    ...prev,
                                    previews: { ...prev.previews, [key]: reader.result as string }
                                }));
                            };
                            reader.readAsDataURL(file);
                        }
                    });

                    toast.info("Progress restored. Uploaded document drafts recovered.", {
                        duration: 6000
                    });
                }
            } catch (error) {
                console.error("Failed to hydrate draft files from IndexedDB:", error);
            }
        }

        hydrateFiles();
    }, []);

    useEffect(() => {
        if (!loading) {
            try {
                sessionStorage.setItem("birth-reg-step", currentStep);

                // Build a serializable snapshot: omit File objects and previews
                // to prevent SessionStorage QuotaExceeded errors. Binary files are stored in IndexedDB.
                const copy: any = { ...form };
                delete copy.files;
                delete copy.previews;

                sessionStorage.setItem("birth-reg-form", JSON.stringify(copy));
            } catch (err) {
                console.warn("Failed to persist form to sessionStorage:", err);
            }
        }
    }, [currentStep, form, loading]);

    useEffect(() => {
        if (loading) return;
        if (isRestoredRef.current) {
            isRestoredRef.current = false;
            return;
        }

        if (form.relationship === "SELF" && resident) {
            setForm(prev => ({
                ...prev,
                children: [{
                    firstName: resident.firstName || "",
                    middleName: resident.middleName || "",
                    lastName: resident.lastName || "",
                    suffix: resident.suffix || "",
                }],
                placeOfEvent: resident.placeOfBirth || resident.municipality || prev.placeOfEvent,
                dateOfEvent: resident.dateOfBirth ? new Date(resident.dateOfBirth).toISOString().split('T')[0] : prev.dateOfEvent,
                fatherFirstName: resident.fatherFirstName || prev.fatherFirstName,
                fatherMiddleName: resident.fatherMiddleName || prev.fatherMiddleName,
                fatherLastName: resident.fatherLastName || prev.fatherLastName,
                motherFirstName: resident.motherFirstName || prev.motherFirstName,
                motherMiddleName: resident.motherMiddleName || prev.motherMiddleName,
                motherLastName: resident.motherLastName || prev.motherLastName,
            }));
        }
    }, [form.relationship, resident, loading]);

    useEffect(() => {
        async function init() {
            try {
                await ensureCivilRegistryTransactionTypes();
                const [resResult, typesResult] = await Promise.all([
                    getCurrentUserResident(),
                    getTransactionTypes()
                ]);

                if (resResult.success && resResult.data) {
                    const r = resResult.data;
                    setResident(r);
                    setForm(prev => ({
                        ...prev,
                        email: prev.email || r.email || "",
                        contactNumber: prev.contactNumber || r.contactNumber || "",
                        informantFirstName: r.firstName || "",
                        informantMiddleName: r.middleName || "",
                        informantLastName: r.lastName || "",
                        informantSuffix: r.suffix || "",
                        informantBirthDate: r.dateOfBirth ? new Date(r.dateOfBirth).toISOString().split('T')[0] : "",
                        informantAge: r.age?.toString() || "",
                        informantCivilStatus: r.civilStatus || "",
                        informantCitizenship: r.citizenship || "Filipino",
                        informantOccupation: r.occupation || ""
                    }));
                }
                if (typesResult.success && typesResult.data) {
                    const lcrTypes = typesResult.data.filter((t: any) => t.category === "Civil Registry");

                    const currentDbType = lcrTypes.find((t: any) => t.code === "LCR_BIRTH_REG");
                    if (currentDbType) {
                        setForm(prev => ({
                            ...prev,
                            typeId: prev.typeId || currentDbType.id
                        }));
                    }
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

    // Do not force a default for parentsMarried; let user choose explicitly

    const handleBirthTypeChange = (val: string) => {
        let count = 1;
        if (val === "TWIN") count = 2;
        if (val === "TRIPLET") count = 3;
        if (val === "OTHERS") count = 4;

        setForm(prev => {
            const currentChildren = [...prev.children];
            if (currentChildren.length < count) {
                // Add more
                for (let i = currentChildren.length; i < count; i++) {
                    currentChildren.push({ firstName: "", middleName: "", lastName: "", suffix: "" });
                }
            } else if (currentChildren.length > count) {
                // Remove extra
                currentChildren.splice(count);
            }
            return { ...prev, birthType: val, children: currentChildren };
        });
    };

    const handleChildNameChange = (index: number, field: keyof FormState['children'][0], value: string) => {
        setForm(prev => {
            const newChildren = [...prev.children];
            newChildren[index] = { ...newChildren[index], [field]: value.toUpperCase() };
            return { ...prev, children: newChildren };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size exceeds 5MB limit.");
                return;
            }

            // Save raw file to IndexedDB
            saveDraftFile(STORAGE_KEY, key, file).catch(err => {
                console.error("Failed to save draft file to IndexedDB:", err);
            });

            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string | null;
                setForm(prev => ({
                    ...prev,
                    files: { ...prev.files, [key]: file },
                    previews: { ...prev.previews, [key]: dataUrl }
                }));
                // Clear documents error when user uploads files
                setErrors(prev => {
                    if (!prev.documents) return prev;
                    const copy = { ...prev };
                    delete copy.documents;
                    return copy;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const validateStep = (step: Step) => {
        const errs: Record<string, string> = {};

        if (step === "IDENTITY") {
            if (!form.relationship) errs.relationship = "Please select relationship.";
            if (!form.contactNumber) errs.contactNumber = "Please enter a contact number.";
        }

        if (step === "DETAILS") {
            form.children.forEach((c, i) => {
                if (!c.firstName) errs[`children.${i}.firstName`] = "Please enter first name.";
                if (!c.lastName) errs[`children.${i}.lastName`] = "Please enter last name.";
            });
            if (!form.dateOfEvent) errs.dateOfEvent = "Please select date of birth.";
            if (!form.placeOfEvent) errs.placeOfEvent = "Please enter place of birth.";
        }

        if (step === "PARENTS") {
            if (typeof form.parentsMarried === 'undefined') errs.parentsMarried = "Please indicate parents' marital status.";
        }

        setErrors(errs);
        const valid = Object.keys(errs).length === 0;
        setShowErrors(!valid);
        if (!valid) {
            toast.error("Please complete highlighted required fields.", { className: "font-black uppercase tracking-widest text-[10px] italic" });
        }
        return valid;
    };

    const handleSubmit = async () => {
        // Require privacy terms acceptance before allowing submit
        if (!policyAccepted) {
            setErrors(prev => ({ ...prev, policyAccepted: "You must agree to the Data Privacy & Terms before submitting." }));
            setShowErrors(true);
            toast.error("Please review and accept the Privacy Policy & Terms before submitting. Click Review to open the agreement.");
            return;
        }
        if (!resident) {
            toast.error("Resident profile not found. Please complete your profile first.");
            return;
        }

        if (!form.relationship) {
            toast.error("Please specify your relationship.");
            return;
        }

        if (!form.typeId) {
            toast.error("Service type not initialized. Please refresh the page.");
            return;
        }

        if (!form.dateOfEvent) {
            toast.error("Please provide the date of birth.");
            return;
        }

        if (!form.idTypeOverride && !resident?.idType) {
            toast.error("Please select an ID type.");
            return;
        }

        if (form.registrationType === "LATE" && !form.lateDuration) {
            setErrors(prev => ({ ...prev, lateDuration: "Please select late registration period to compute the fee." }));
            setShowErrors(true);
            toast.error("Please select late registration period to compute the fee.");
            // Scroll to late-duration section
            try { document.getElementById('late-duration-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { void e; }
            return;
        }

        // Validate required documents before starting submission so inline alerts show immediately
        const missingDocsQuick: string[] = [];
        if (form.registrationType === "STANDARD") {
            if (form.parentsMarried) {
                if (!(form.files['marriageCertificate'] || form.previews['marriageCertificate'])) missingDocsQuick.push('Marriage Certificate of Parents');
                if (!(form.files['municipalForm102'] || form.previews['municipalForm102'])) missingDocsQuick.push('Municipal Form 102');
            } else {
                if (!(form.files['communityTaxCertificate'] || form.previews['communityTaxCertificate'])) missingDocsQuick.push('Community Tax Certificate');
            }
        } else if (form.registrationType === "LATE") {
            const lateReqs = ['negativePSA', 'colb', 'affidavitDelayed', 'supportingEvidence1', 'supportingEvidence2'];
            lateReqs.forEach(k => {
                if (!(form.files[k] || form.previews[k])) {
                    const map: any = {
                        negativePSA: 'Negative Certification from PSA',
                        colb: 'COLB',
                        affidavitDelayed: 'Affidavit of Delayed Registration',
                        supportingEvidence1: 'Supporting Evidence 1',
                        supportingEvidence2: 'Supporting Evidence 2'
                    };
                    missingDocsQuick.push(map[k] || k);
                }
            });
        }

        if (missingDocsQuick.length > 0) {
            setErrors(prev => ({ ...prev, documents: `Please upload required documents: ${missingDocsQuick.join(', ')}` }));
            setShowErrors(true);
            toast.error('Please upload required documents before submitting.');
            // Scroll to documents section
            try { document.getElementById('documents-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { void e; }
            return;
        }

        setSubmitting(true);
        try {
            const childrenList = form.children.map(c => `${c.firstName} ${c.middleName} ${c.lastName} ${c.suffix}`.trim());
            const subjectName = childrenList.join(" & ");

            // Create a full snapshot of the resident, updating only the volatile contact fields
            const residentSnapshot = {
                ...resident,
                contactNumber: form.contactNumber,
                email: form.email,
                occupation: form.informantOccupation
            };

            const formData = new FormData();
            formData.append("typeId", form.typeId);
            formData.append("registryType", "BIRTH_REG"); // Submit as birth_reg category type to map correctly inside actions.ts
            formData.append("residentSnapshot", JSON.stringify(residentSnapshot));

            // Base additional data that is always included
            const baseAdditionalData = {
                subjectName,
                children: form.children, // Store the structured array in additionalData
                dateOfEvent: form.dateOfEvent,
                placeOfEvent: form.placeOfEvent,
                birthType: form.birthType,
                registrationType: form.registrationType,
                fatherName: `${form.fatherFirstName} ${form.fatherMiddleName} ${form.fatherLastName}`.trim(),
                motherName: `${form.motherFirstName} ${form.motherMiddleName} ${form.motherLastName}`.trim(),
                relationship: form.relationship,
                email: form.email,
                contactNumber: form.contactNumber,
                // Informant Details
                informantName: `${form.informantFirstName} ${form.informantMiddleName} ${form.informantLastName} ${form.informantSuffix}`.replace(/\s+/g, ' ').trim(),
                informatnBirthDate: form.informantBirthDate,
                informantAge: form.informantAge,
                informantCivilStatus: form.informantCivilStatus,
                informantCitizenship: form.informantCitizenship,
                informantOccupation: form.informantOccupation,
                idType: form.idTypeOverride || resident?.idType,
                idFrontUrl: resident?.idFrontUrl,
                idBackUrl: resident?.idBackUrl,
                lateDuration: form.lateDuration || null,
                parentsMarried: form.parentsMarried,
                miscFee: totalAmount,
                totalAmount: totalAmount,
            };



            formData.append("additionalData", JSON.stringify(baseAdditionalData));

            // Append files
            Object.entries(form.files).forEach(([key, file]) => {
                if (file) formData.append(key, file);
            });

            console.log("Submitting with typeId:", form.typeId);
            const res = await submitCivilRegistryTransaction(formData);
            if (res.success && res.data) {
                toast.success("Birth Registration submitted successfully!");
                sessionStorage.removeItem("birth-reg-step");
                sessionStorage.removeItem("birth-reg-form");
                await clearDraftFiles(STORAGE_KEY);
                router.push(`/user/services/requests/${res.data.id}`);
            } else {
                toast.error(res.error || "Submission failed", {
                    description: "Please check your network connection and try again."
                });
            }
        } catch (err: any) {
            console.error("Submission error details:", err);
            toast.error("Registration failed to submit", {
                description: err.message || "An unexpected error occurred during submission."
            });
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
        <>
            <SecureIdleTimer />
            <PrivacyTermsModal
                isOpen={policyOpen}
                onClose={() => setPolicyOpen(false)}
                onAccept={handleAcceptPolicy}
                onDecline={() => { setPolicyAccepted(false); }}
                themeColor="var(--amber-500)"
            />
            <DocumentViewerModal
                isOpen={viewerOpen}
                onClose={() => setViewerOpen(false)}
                file={viewerFile}
                fileUrl={viewerUrl}
                title={viewerTitle}
                themeColor="var(--blue-500)"
            />
            <div className="container max-w-5xl mx-auto px-4 pt-0 pb-0 space-y-8">
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
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            const currentIdx = STEPS.findIndex(s => s.id === currentStep);
                                            if (idx <= currentIdx) setCurrentStep(step.id);
                                            else toast.error('Complete earlier steps before navigating.');
                                        }}
                                        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && idx <= STEPS.findIndex(s => s.id === currentStep)) setCurrentStep(step.id); }}
                                        className="flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer"
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

                    {mounted && typeof document !== "undefined" && createPortal(
                        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#06080a] border-t border-slate-200 dark:border-white/10 z-50 pt-2.5 pb-2.5 px-4 flex flex-col items-center">
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
                        </div>,
                        document.body
                    )}

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
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Informant&apos;s Relationship to Child <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={form.relationship}
                                                onValueChange={(val) => setForm({ ...form, relationship: val })}
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
                                            {errors.relationship && (
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors.relationship}</p>
                                            )}
                                        </div>

                                        {/* Personal Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-1 space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name</Label>
                                                <Input readOnly value={form.informantFirstName} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                            <div className="md:col-span-1 space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                                <Input readOnly value={form.informantMiddleName} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                            <div className="md:col-span-1 space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name</Label>
                                                <Input readOnly value={form.informantLastName} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                            <div className="md:col-span-1 space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Suffix</Label>
                                                <Input readOnly value={form.informantSuffix} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Birth Date</Label>
                                                <Input readOnly value={form.informantBirthDate} type="date" className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Age</Label>
                                                <Input readOnly value={form.informantAge} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Civil Status</Label>
                                                <Input readOnly value={form.informantCivilStatus} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Citizenship</Label>
                                                <Input readOnly value={form.informantCitizenship} className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 font-bold italic" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Occupation</Label>
                                                <Input
                                                    readOnly
                                                    className="rounded-xl border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 h-12 transition-all font-bold italic"
                                                    value={form.informantOccupation}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Contact Number <span className="text-red-500">*</span></Label>
                                                <Input
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all font-bold italic",
                                                        (errors.contactNumber) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="e.g. 0917XXXXXXX"
                                                    value={form.contactNumber}
                                                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                                                />
                                                {errors.contactNumber && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors.contactNumber}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parents' Marital Status */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Parents&apos; Marital Status <span className="text-red-500">*</span></Label>
                                        <div className="mt-2 flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, parentsMarried: true }))}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                                    form.parentsMarried === true ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 border border-slate-200",
                                                    (errors.parentsMarried && typeof form.parentsMarried === 'undefined') ? "ring-2 ring-red-400/60 border-red-500" : ""
                                                )}
                                                aria-pressed={form.parentsMarried === true}
                                            >
                                                Married
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, parentsMarried: false }))}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                                    form.parentsMarried === false ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 border border-slate-200",
                                                    (errors.parentsMarried && typeof form.parentsMarried === 'undefined') ? "ring-2 ring-red-400/60 border-red-500" : ""
                                                )}
                                                aria-pressed={form.parentsMarried === false}
                                            >
                                                Not Married
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-slate-500 italic mt-2">If not married, the required documents will change accordingly.</p>
                                        {errors.parentsMarried && (
                                            <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse mt-2">{errors.parentsMarried}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <Button
                                            onClick={() => {
                                                if (!validateStep("IDENTITY")) return;
                                                if (typeof form.parentsMarried === 'undefined') {
                                                    setErrors(prev => ({ ...prev, parentsMarried: "Please indicate parents' marital status before proceeding." }));
                                                    setShowErrors(true);
                                                    toast.error("Please indicate parents' marital status before proceeding.");
                                                    return;
                                                }
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

                                    <div className="space-y-8">
                                        {/* Type of Birth Moved Above */}
                                        <div className="bg-blue-50/50 dark:bg-blue-500/5 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-500/10 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                    <Baby className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">Type of Birth <span className="text-red-500">*</span></Label>
                                            </div>
                                            <Select
                                                value={form.birthType}
                                                onValueChange={handleBirthTypeChange}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-blue-500 shadow-sm text-xs md:text-sm bg-white dark:bg-slate-900 transition-all font-bold">
                                                    <SelectValue placeholder="Select birth type" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-slate-200 dark:border-white/10 italic">
                                                    <SelectItem value="SINGLE">Single</SelectItem>
                                                    <SelectItem value="TWIN">Twin</SelectItem>
                                                    <SelectItem value="TRIPLET">Triplet</SelectItem>
                                                    <SelectItem value="OTHERS">Others (Quadruplets+, etc.)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Children Inputs */}
                                        <div className="space-y-6">
                                            {form.children.map((child, index) => (
                                                <div key={index} className="space-y-6 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/2">
                                                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Child {index + 1}</span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                className={cn(
                                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium",
                                                                    (errors[`children.${index}.firstName`]) && "border-red-500/50 bg-red-50/10"
                                                                )}
                                                                placeholder="First name"
                                                                value={child.firstName}
                                                                onChange={(e) => handleChildNameChange(index, 'firstName', e.target.value)}
                                                            />
                                                            {(errors[`children.${index}.firstName`]) && (
                                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors[`children.${index}.firstName`]}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                                            <Input
                                                                className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium"
                                                                placeholder="Middle name"
                                                                value={child.middleName}
                                                                onChange={(e) => handleChildNameChange(index, 'middleName', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name <span className="text-red-500">*</span></Label>
                                                            <Input
                                                                className={cn(
                                                                    "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium",
                                                                    (errors[`children.${index}.lastName`]) && "border-red-500/50 bg-red-50/10"
                                                                )}
                                                                placeholder="Last name"
                                                                value={child.lastName}
                                                                onChange={(e) => handleChildNameChange(index, 'lastName', e.target.value)}
                                                            />
                                                            {(errors[`children.${index}.lastName`]) && (
                                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors[`children.${index}.lastName`]}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Suffix</Label>
                                                            <Input
                                                                className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium"
                                                                placeholder="e.g. Jr., III"
                                                                value={child.suffix}
                                                                onChange={(e) => handleChildNameChange(index, 'suffix', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Date & Place Shared */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Date of Birth <span className="text-red-500">*</span></Label>
                                                <Input
                                                    type="date"
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all font-medium",
                                                        (errors.dateOfEvent) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    value={form.dateOfEvent}
                                                    onChange={(e) => setForm({ ...form, dateOfEvent: e.target.value })}
                                                />
                                                {errors.dateOfEvent && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors.dateOfEvent}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Place of Birth <span className="text-red-500">*</span></Label>
                                                <Input
                                                    className={cn(
                                                        "rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 h-12 transition-all uppercase font-medium",
                                                        (errors.placeOfEvent) && "border-red-500/50 bg-red-50/10"
                                                    )}
                                                    placeholder="Hospital/Municipality, Province"
                                                    value={form.placeOfEvent}
                                                    onChange={(e) => setForm({ ...form, placeOfEvent: e.target.value.toUpperCase() })}
                                                />
                                                {errors.placeOfEvent && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors.placeOfEvent}</p>
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
                                                if (!validateStep("DETAILS")) return;
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
                                        <p className="text-xs text-slate-500 font-medium italic">Provide the full names of the child&apos;s parents</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Father */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                                                <div className="p-1 bg-blue-500/10 rounded-lg">
                                                    <Users className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">Father&apos;s Name</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name</Label>
                                                    <Input
                                                        className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                        placeholder="First name"
                                                        value={form.fatherFirstName}
                                                        onChange={(e) => setForm({ ...form, fatherFirstName: e.target.value.toUpperCase() })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                                    <Input
                                                        className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                        placeholder="Middle name"
                                                        value={form.fatherMiddleName}
                                                        onChange={(e) => setForm({ ...form, fatherMiddleName: e.target.value.toUpperCase() })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name</Label>
                                                    <Input
                                                        className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                        placeholder="Last name"
                                                        value={form.fatherLastName}
                                                        onChange={(e) => setForm({ ...form, fatherLastName: e.target.value.toUpperCase() })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mother */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-2">
                                                <div className="p-1 bg-rose-500/10 rounded-lg">
                                                    <Users className="w-4 h-4 text-rose-500" />
                                                </div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 italic">Mother&apos;s Maiden Name</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">First Name</Label>
                                                    <Input
                                                        className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                        placeholder="First name"
                                                        value={form.motherFirstName}
                                                        onChange={(e) => setForm({ ...form, motherFirstName: e.target.value.toUpperCase() })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Middle Name</Label>
                                                    <Input
                                                        className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                        placeholder="Middle name"
                                                        value={form.motherMiddleName}
                                                        onChange={(e) => setForm({ ...form, motherMiddleName: e.target.value.toUpperCase() })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Last Name</Label>
                                                    <Input
                                                        className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 transition-all uppercase font-medium h-12"
                                                        placeholder="Last name"
                                                        value={form.motherLastName}
                                                        onChange={(e) => setForm({ ...form, motherLastName: e.target.value.toUpperCase() })}
                                                    />
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
                                                if (!validateStep("PARENTS")) return;
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
                                                <p className="font-black text-slate-900 dark:text-white italic">Birth Registration</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Type of Birth</span>
                                                <p className="font-black text-slate-900 dark:text-white italic uppercase">{form.birthType}</p>
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Children to Register</span>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {form.children.map((child, i) => (
                                                        <div key={i} className="p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                                                            <span className="text-[8px] font-black text-blue-500 uppercase italic mb-1 block">Child {i + 1}</span>
                                                            <p className="font-black text-slate-900 dark:text-white italic uppercase text-xs">
                                                                {`${child.firstName} ${child.middleName} ${child.lastName} ${child.suffix}`.trim()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Registration Type:</span>
                                                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200 dark:border-white/10">
                                                    <button
                                                        onClick={() => setForm(prev => ({ ...prev, registrationType: "STANDARD" }))}
                                                        className={cn(
                                                            "px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                            form.registrationType === "STANDARD"
                                                                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                                                                : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        Standard
                                                    </button>
                                                    <button
                                                        onClick={() => setForm(prev => ({ ...prev, registrationType: "LATE" }))}
                                                        className={cn(
                                                            "px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                                            form.registrationType === "LATE"
                                                                ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                                                                : "text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        Late
                                                    </button>
                                                </div>
                                            </div>

                                            {form.registrationType === "LATE" && (
                                                <div id="late-duration-section" className="mt-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-1">Late Registration Period <span className="text-red-500">*</span></Label>
                                                    <div className="mt-2 flex flex-col md:flex-row gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setForm(prev => ({ ...prev, lateDuration: "1-10", miscFee: 315 }));
                                                                setErrors(prev => {
                                                                    if (!prev.lateDuration) return prev;
                                                                    const copy = { ...prev };
                                                                    delete copy.lateDuration;
                                                                    return copy;
                                                                });
                                                            }}
                                                            className={cn(
                                                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                form.lateDuration === "1-10" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 border border-slate-200"
                                                            )}
                                                        >
                                                            1 month - 10 years (P315)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setForm(prev => ({ ...prev, lateDuration: "10-20", miscFee: 515 }));
                                                                setErrors(prev => {
                                                                    if (!prev.lateDuration) return prev;
                                                                    const copy = { ...prev };
                                                                    delete copy.lateDuration;
                                                                    return copy;
                                                                });
                                                            }}
                                                            className={cn(
                                                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                form.lateDuration === "10-20" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 border border-slate-200"
                                                            )}
                                                        >
                                                            10 - 20 years (P515)
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setForm(prev => ({ ...prev, lateDuration: "20+", miscFee: 1015 }));
                                                                setErrors(prev => {
                                                                    if (!prev.lateDuration) return prev;
                                                                    const copy = { ...prev };
                                                                    delete copy.lateDuration;
                                                                    return copy;
                                                                });
                                                            }}
                                                            className={cn(
                                                                "px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                form.lateDuration === "20+" ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 text-slate-600 border border-slate-200"
                                                            )}
                                                        >
                                                            20 years and above (P1015)
                                                        </button>
                                                    </div>
                                                    {errors.lateDuration && (
                                                        <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse mt-2">{errors.lateDuration}</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                                        <Upload className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Required Documents</span>
                                                </div>

                                                <div className="mt-2">
                                                    <p className="text-[10px] text-slate-500 italic">Select parents&apos; marital status — required documents adjust automatically.</p>
                                                </div>

                                                {/* Modern Inline Alert */}
                                                <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">Document Upload Notice</p>
                                                        <p className="text-xs font-bold italic text-blue-500/80 leading-normal">
                                                            Please ensure all files are clear and readable before proceeding. Any blurry, altered, or incorrect documents will result in an immediate rejection or revision request.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div id="documents-section" className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                                                    {form.registrationType === "STANDARD" ? (
                                                        (form.parentsMarried ? [
                                                            { key: "marriageCertificate", label: "Marriage Certificate of Parents" },
                                                            { key: "municipalForm102", label: "Municipal Form 102" }
                                                        ] : [
                                                            { key: "communityTaxCertificate", label: "Community Tax Certificate" }
                                                        ]).map((doc) => (
                                                            <div key={doc.key} className="group relative flex items-center justify-between bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all hover:border-blue-500/50">
                                                                <div className="flex items-center gap-3">
                                                                    {form.files[doc.key] || form.previews[doc.key] ? (
                                                                        <div 
                                                                            onClick={() => handleViewFile(form.files[doc.key] || null, form.previews[doc.key] || null, doc.label)}
                                                                            className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all flex items-center justify-center bg-slate-50 dark:bg-white/5 relative group/thumb"
                                                                        >
                                                                            {checkIsPdf(form.files[doc.key], form.previews[doc.key]) ? (
                                                                                <FileText className="w-5 h-5 text-red-500 animate-pulse" />
                                                                            ) : form.previews[doc.key] ? (
                                                                                <img src={form.previews[doc.key]!} alt="Preview" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <FileText className="w-5 h-5 text-blue-500" />
                                                                            )}
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                                                                <Eye className="w-4 h-4 text-white" />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                                                            <FileText className="w-5 h-5 text-slate-300" />
                                                                        </div>
                                                                    )}
                                                                    <div 
                                                                        onClick={() => {
                                                                            if (form.files[doc.key] || form.previews[doc.key]) {
                                                                                handleViewFile(form.files[doc.key] || null, form.previews[doc.key] || null, doc.label);
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            "flex flex-col gap-0.5 select-none",
                                                                            (form.files[doc.key] || form.previews[doc.key]) ? "cursor-pointer hover:opacity-80" : ""
                                                                        )}
                                                                    >
                                                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase italic">{doc.label} <span className="text-red-500">*</span></span>
                                                                        <span className={cn(
                                                                            "text-[8px] font-black uppercase tracking-[0.2em] italic",
                                                                            (form.files[doc.key] || form.previews[doc.key]) ? "text-green-500" : "text-blue-500/50"
                                                                        )}>
                                                                            {(form.files[doc.key] || form.previews[doc.key]) ? (
                                                                                <span className="flex flex-col gap-0.5 max-w-[200px] sm:max-w-[300px]">
                                                                                    <span>Uploaded (Click to Preview)</span>
                                                                                    <span className="text-[7px] text-slate-400 dark:text-slate-500 truncate lowercase font-medium tracking-normal">
                                                                                        {form.files[doc.key] ? (form.files[doc.key] as File).name : "document.png"}
                                                                                    </span>
                                                                                </span>
                                                                            ) : "Pending"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="relative">
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => handleFileChange(e, doc.key)}
                                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                        accept="image/*,.pdf"
                                                                    />
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                                        (form.files[doc.key] || form.previews[doc.key]) ? "bg-green-500 border-green-500 text-white" : "border-slate-200 dark:border-white/10 text-slate-300"
                                                                    )}>
                                                                        {(form.files[doc.key] || form.previews[doc.key]) ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        [
                                                            { key: "negativePSA", label: "Negative Certification from PSA" },
                                                            { key: "colb", label: "COLB" },
                                                            { key: "affidavitDelayed", label: "Affidavit of Delayed Registration" },
                                                            { key: "supportingEvidence1", label: "Supporting Evidence 1" },
                                                            { key: "supportingEvidence2", label: "Supporting Evidence 2" }
                                                        ].map((doc) => (
                                                            <div key={doc.key} className="group relative flex items-center justify-between bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 transition-all hover:border-blue-500/50">
                                                                <div className="flex items-center gap-3">
                                                                    {form.files[doc.key] || form.previews[doc.key] ? (
                                                                        <div 
                                                                            onClick={() => handleViewFile(form.files[doc.key] || null, form.previews[doc.key] || null, doc.label)}
                                                                            className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500/50 transition-all flex items-center justify-center bg-slate-50 dark:bg-white/5 relative group/thumb"
                                                                        >
                                                                            {checkIsPdf(form.files[doc.key], form.previews[doc.key]) ? (
                                                                                <FileText className="w-5 h-5 text-red-500 animate-pulse" />
                                                                            ) : form.previews[doc.key] ? (
                                                                                <img src={form.previews[doc.key]!} alt="Preview" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <FileText className="w-5 h-5 text-blue-500" />
                                                                            )}
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                                                                <Eye className="w-4 h-4 text-white" />
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                                                            <FileText className="w-5 h-5 text-slate-300" />
                                                                        </div>
                                                                    )}
                                                                    <div 
                                                                        onClick={() => {
                                                                            if (form.files[doc.key] || form.previews[doc.key]) {
                                                                                handleViewFile(form.files[doc.key] || null, form.previews[doc.key] || null, doc.label);
                                                                            }
                                                                        }}
                                                                        className={cn(
                                                                            "flex flex-col gap-0.5 select-none",
                                                                            (form.files[doc.key] || form.previews[doc.key]) ? "cursor-pointer hover:opacity-80" : ""
                                                                        )}
                                                                    >
                                                                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase italic">{doc.label} <span className="text-red-500">*</span></span>
                                                                        <span className={cn(
                                                                            "text-[8px] font-black uppercase tracking-[0.2em] italic",
                                                                            (form.files[doc.key] || form.previews[doc.key]) ? "text-green-500" : "text-blue-500/50"
                                                                        )}>
                                                                            {(form.files[doc.key] || form.previews[doc.key]) ? (
                                                                                <span className="flex flex-col gap-0.5 max-w-[200px] sm:max-w-[300px]">
                                                                                    <span>Uploaded (Click to Preview)</span>
                                                                                    <span className="text-[7px] text-slate-400 dark:text-slate-500 truncate lowercase font-medium tracking-normal">
                                                                                        {form.files[doc.key] ? (form.files[doc.key] as File).name : "document.png"}
                                                                                    </span>
                                                                                </span>
                                                                            ) : "Pending"}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="relative">
                                                                    <input
                                                                        type="file"
                                                                        onChange={(e) => handleFileChange(e, doc.key)}
                                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                        accept="image/*,.pdf"
                                                                    />
                                                                    <div className={cn(
                                                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                                                                        (form.files[doc.key] || form.previews[doc.key]) ? "bg-green-500 border-green-500 text-white" : "border-slate-200 dark:border-white/10 text-slate-300"
                                                                    )}>
                                                                        {(form.files[doc.key] || form.previews[doc.key]) ? <Check className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                {errors.documents && (
                                                    <p className="text-[10px] font-black text-red-500 uppercase italic tracking-widest mt-2">{errors.documents}</p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl border border-slate-200/40 bg-white/30 dark:bg-white/5 flex items-start gap-4">
                                            <button type="button" onClick={() => setPolicyOpen(true)} className={cn("w-5 h-5 rounded-full border flex items-center justify-center", policyAccepted ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300")}>
                                                {policyAccepted ? <Check className="w-3 h-3" /> : null}
                                            </button>
                                            <div className="flex-1 text-xs">
                                                <div className="font-black uppercase text-[11px] tracking-wider">DATA PRIVACY AND TERMS AGREEMENT</div>
                                                <div className="text-[10px] text-slate-500 italic mt-1">I AUTHORIZE THE LGU TO PROCESS MY PERSONAL INFORMATION IN ACCORDANCE WITH THE DATA PRIVACY ACT. CLICK TO REVIEW AGREEMENT.</div>
                                                {errors.policyAccepted && (
                                                    <p className="text-[9px] font-black text-red-500 uppercase italic tracking-widest ml-1 animate-pulse">{errors.policyAccepted}</p>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => setPolicyOpen(true)} className="text-[10px] font-black italic text-blue-600">Review</button>
                                        </div>

                                        <div className="p-3 rounded-2xl border border-slate-200/20 bg-white/30 dark:bg-white/5 flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Misc. Fee</div>
                                                <div className="text-lg font-extrabold mt-2">P{totalAmount > 0 ? totalAmount.toString() : "—"}</div>
                                            </div>
                                            <div className="text-xs text-slate-400 italic">{form.registrationType === "STANDARD" ? "Standard registration fee" : (form.lateDuration ? "Late registration fee" : "Select late period to compute fee")}</div>
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
                                                disabled={submitting}
                                                className={cn(
                                                    "md:col-span-3 h-14 rounded-full font-black uppercase tracking-widest italic text-[11px] transition-all duration-300",
                                                    submitting ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20"
                                                )}
                                            >
                                                {submitting ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
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
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">New registrations require the Draft Certificate of Live Birth from the hospital/clinic, the parents&apos; Marriage Certificate, and informant&apos;s valid ID.</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 rounded-[2rem] border-slate-200/50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                            <div className="flex gap-4">
                                <Sparkles className="w-5 h-5 text-slate-400 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Timeline</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic">Standard registrations are processed within 3-5 working days upon verification of submitted documents.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
