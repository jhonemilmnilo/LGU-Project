"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Calculator,
    ChevronRight,
    Loader2,
    Check,
    Home,
    Upload,
    Sparkles,
    TrendingUp,
    Lock,
    User,
    Building2,
    HelpCircle,
    X,
    ChevronDown
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
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { calculateBusinessPermit, BusinessPermitResult } from "@/lib/business-permit";
import { getCurrentUserResident, getTransactionTypes, submitBusinessPermitTransaction, getBarangaysList } from "@/app/admin/transactions/actions";
import PrivacyTermsModal from "@/components/shared/PrivacyTermsModal";
import SecureIdleTimer from "@/components/shared/SecureIdleTimer";

// --- TYPES ---
type Step = "PATHWAY" | "USER_IDENTITY" | "PROFILE" | "CHECKLIST" | "SUBMIT";

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
    street: string; // Street address of the business
    building: string; // Building / House number of the business location
    capitalInvestment: string; // Declared Capitalization for new
    grossSales: string; // Declared gross sales for renewals
    employeeCount: string;
    businessArea: string;
    fulfillmentType: "PICK_UP" | "DELIVERY" | "E_COPY";
    deliveryAddress: string;
    deliveryPhone: string;
    residentData?: any; // Added for editable user details matching Cedula

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
    { id: "USER_IDENTITY", label: "Identity", icon: User },
    { id: "PROFILE", label: "Business", icon: Building2 },
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

const LINE_OF_BUSINESS_OPTIONS = [
    "Agriculture & Forestry",
    "Manufacturing",
    "Wholesale & Retail",
    "Food & Beverage Services",
    "IT & Computer Services",
    "Construction",
    "Real Estate",
    "Transportation & Storage",
    "Healthcare & Social",
    "Education"
];

const STEP_BY_STEP_GUIDES: Record<string, { title: string; steps: string[] }> = {
    ctcFile: {
        title: "How to get a Community Tax Certificate (Cedula)",
        steps: [
            "Visit your local Barangay Hall or the Municipal Treasury Office.",
            "Bring a Valid Government-Issued ID.",
            "Fill out the Community Tax Declaration Form.",
            "Declare your primary source of income or gross receipts from the preceding year (if applicable).",
            "Pay the corresponding basic and additional community tax.",
            "Receive your signed and thumb-marked Community Tax Certificate."
        ]
    },
    dtiSecFile: {
        title: "How to get a DTI / SEC / CDA Registration",
        steps: [
            "For Sole Proprietorships (DTI): Register your business name online via the DTI BNRS (Business Name Registration System) website or visit the nearest DTI Negosyo Center.",
            "For Corporations/Partnerships (SEC): Register online via the SEC eSPARC (Electronic Simplified Processing of Application for Registration of Company) portal.",
            "For Cooperatives (CDA): Coordinate with the Cooperative Development Authority (CDA) regional office for registration.",
            "Pay the corresponding registration fee via their respective online payment portals or authorized payment channels.",
            "Once approved, download and print your official Certificate of Registration."
        ]
    },
    birCorFile: {
        title: "How to get a BIR Certificate of Registration (COR)",
        steps: [
            "Fill out BIR Form 1901 (for Sole Proprietorships) or Form 1903 (for Corporations/Partnerships).",
            "Submit the completed form along along with your DTI/SEC Certificate, Barangay Clearance, and Valid IDs to your designated Revenue District Office (RDO).",
            "Pay the Annual Registration Fee (₱500) and Documentary Stamp Tax (DST) at the BIR office or an Authorized Agent Bank (AAB).",
            "Attend the required taxpayer's initial briefing or seminar scheduled by the RDO.",
            "Claim your official BIR Form 2303 (Certificate of Registration) and the 'Ask for Receipt' signage."
        ]
    },
    brgyClearanceFile: {
        title: "How to get a Barangay Business Clearance",
        steps: [
            "Visit the Barangay Hall of the barangay where your business is located.",
            "Bring your approved DTI / SEC / CDA Registration and a Valid Government-Issued ID.",
            "Request an application for a Barangay Business Clearance from the receiving desk.",
            "Pay the corresponding barangay clearance fee to the Barangay Treasurer.",
            "Wait for the issuance of your officially signed and sealed Barangay Clearance."
        ]
    },
    fireSafetyFile: {
        title: "How to get a Fire Safety Inspection Certificate",
        steps: [
            "Visit the local Bureau of Fire Protection (BFP) office.",
            "Submit the required documents (e.g., building plan, previous FSIC, or fire insurance).",
            "Pay the required Fire Code Construction/Regulatory fees.",
            "Wait for the official fire safety inspection to be conducted by authorized BFP personnel at your business location.",
            "Claim your Fire Safety Inspection Certificate (FSIC) upon passing the inspection and complying with all safety requirements."
        ]
    },
    sanitaryPermitFile: {
        title: "How to get a Sanitary Permit",
        steps: [
            "Ensure all employees secure valid Health Certificates (requires medical exams at the Municipal Health Office).",
            "Prepare water potability test results (if your business involves food, beverage, or water services).",
            "Request a sanitary inspection of your business establishment from the Rural Health Unit (RHU) / Sanitary Inspector.",
            "Pay the required Sanitary Inspection Fee at the Municipal Treasury Office.",
            "Claim your approved Sanitary Permit from the Municipal Health Office upon passing the inspection."
        ]
    }
};

function FilePreview({ file }: { file: File }) {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!file) return;
        
        if (file.type.startsWith("image/")) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    if (file.type.startsWith("image/")) {
        if (!previewUrl) return null;
        return (
            <div className="relative w-full h-36 rounded-xl overflow-hidden mt-3 border border-slate-100 dark:border-white/10 shadow-inner bg-slate-50 dark:bg-black/20 flex items-center justify-center group/preview animate-in fade-in zoom-in-95 duration-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={previewUrl} 
                    alt="Document Preview" 
                    className="w-full h-full object-cover group-hover/preview:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                        Selected Image Preview
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-4 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 mt-3 flex items-center gap-2.5 animate-in fade-in duration-200">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                PDF
            </div>
            <div className="truncate text-left">
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 truncate font-mono">{file.name}</span>
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Document File</span>
            </div>
        </div>
    );
}

export default function BusinessPermitWizardPage() {
    const router = useRouter();
    const draftRestored = useRef(false);
    const contactInputRef = useRef<HTMLInputElement>(null);

    const [currentStep, setCurrentStep] = useState<Step>("PATHWAY");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false); // 3-Strike Penalty Flag
    const [calcResult, setCalcResult] = useState<BusinessPermitResult | null>(null);
    const [initialResident, setInitialResident] = useState<any>(null);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
    const [bpTypes, setBpTypes] = useState<any[]>([]);
    const [dbBarangays, setDbBarangays] = useState<string[]>([]);
    const [isOtherLine, setIsOtherLine] = useState(false);
    const [isDtiGuideOpen, setIsDtiGuideOpen] = useState(false);
    const [activeGuideKey, setActiveGuideKey] = useState<string | null>(null);



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
        street: "",
        building: "",
        capitalInvestment: "",
        grossSales: "",
        employeeCount: "0",
        businessArea: "",
        fulfillmentType: "E_COPY",
        deliveryAddress: "",
        deliveryPhone: "",
        residentData: {},
        ctcFile: null,
        dtiSecFile: null,
        brgyClearanceFile: null,
        ownerIdFile: null,
        locationPhotoFile: null,
        sanitaryPermitFile: null,
        fireSafetyFile: null,
        birCorFile: null
    });



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
                        residentData: resident,
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
                    const filtered = typesRes.data?.filter((t: any) => t.code.startsWith("BUSINESS_PERMIT")) || [];
                    setBpTypes(filtered);
                    if (filtered.length > 0) {
                        // Select default NEW permit type ID
                        const newType = filtered.find((t: any) => t.code === "BUSINESS_PERMIT_NEW") || filtered[0];
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
                if (savedDraft && !draftRestored.current) {
                    draftRestored.current = true;
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

    // --- SYNCHRONIZE TYPEID REACTIVELY ON PATHWAY TOGGLE ---
    useEffect(() => {
        if (bpTypes.length === 0) return;
        const targetCode = formData.businessType === "NEW" ? "BUSINESS_PERMIT_NEW" : "BUSINESS_PERMIT_RENEW";
        const matched = bpTypes.find((t: any) => t.code === targetCode);
        if (matched) {
            setFormData(prev => {
                if (prev.typeId === matched.id) return prev;
                return { ...prev, typeId: matched.id };
            });
        }
    }, [formData.businessType, bpTypes]);

    // Synchronize isOtherLine state with formData.lineOfBusiness on draft hydration
    useEffect(() => {
        if (formData.lineOfBusiness && !LINE_OF_BUSINESS_OPTIONS.includes(formData.lineOfBusiness)) {
            setIsOtherLine(true);
        }
    }, [formData.lineOfBusiness]);

    const handleLineOfBusinessSelect = (val: string) => {
        if (val === "Other") {
            setIsOtherLine(true);
            handleInputChange("lineOfBusiness", "");
            setTimeout(() => {
                document.getElementById("profile-lineOfBusiness")?.focus();
            }, 50);
        } else {
            setIsOtherLine(false);
            handleInputChange("lineOfBusiness", val);
        }
    };

    // --- AUTO-SAVE ON FIELD CHANGES ---
    const persistDraft = (state: FormState) => {
        const textInputs = {
            businessType: state.businessType,
            businessName: state.businessName,
            tradeName: state.tradeName,
            orgType: state.orgType,
            barangay: state.barangay,
            street: state.street,
            building: state.building,
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
            case "USER_IDENTITY":
                const r = formData.residentData;
                return !!(r?.firstName && r?.lastName && r?.dateOfBirth && r?.occupation && r?.contactNumber);
            case "PROFILE":
                if (!formData.businessName || !formData.lineOfBusiness || !formData.barangay || !formData.orgType) return false;
                if (formData.businessType === "NEW") {
                    return parseFloat(formData.capitalInvestment.replace(/,/g, "")) > 0 && !!formData.dtiSecNumber;
                } else {
                    return parseFloat(formData.grossSales.replace(/,/g, "")) > 0 && !!formData.permitNumber;
                }
            case "CHECKLIST":
                // 7 Mandatory File uploads must all be loaded (or preloaded from resident profile for owner ID)
                return !!(
                    formData.ctcFile &&
                    formData.dtiSecFile &&
                    formData.brgyClearanceFile &&
                    (formData.ownerIdFile || formData.residentData?.idFrontUrl) &&
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
            if (currentStep === "USER_IDENTITY") {
                toast.error("Municipal profile record not loaded. Please contact administration.");
                const r = formData.residentData;
                if (!r?.firstName) {
                    document.getElementById("resident-firstName")?.focus();
                } else if (!r?.lastName) {
                    document.getElementById("resident-lastName")?.focus();
                } else if (!r?.dateOfBirth) {
                    document.getElementById("resident-dateOfBirth")?.focus();
                } else if (!r?.occupation) {
                    document.getElementById("resident-occupation")?.focus();
                } else if (!r?.contactNumber) {
                    document.getElementById("resident-contactNumber")?.focus();
                }
            } else if (currentStep === "PROFILE") {
                toast.error("Please fill out all required business profile details.");
                if (!formData.businessName) {
                    document.getElementById("profile-businessName")?.focus();
                } else if (!formData.orgType) {
                    document.getElementById("profile-orgType")?.focus();
                } else if (!formData.barangay) {
                    document.getElementById("profile-barangay")?.focus();
                } else if (!formData.lineOfBusiness) {
                    if (isOtherLine) {
                        document.getElementById("profile-lineOfBusiness")?.focus();
                    } else {
                        document.getElementById("profile-lineOfBusiness-select")?.focus();
                    }
                } else if (formData.businessType === "NEW") {
                    const capVal = parseFloat(formData.capitalInvestment.replace(/,/g, "")) || 0;
                    if (capVal <= 0) {
                        document.getElementById("profile-capitalInvestment")?.focus();
                    } else if (!formData.dtiSecNumber) {
                        document.getElementById("profile-dtiSecNumber")?.focus();
                    }
                } else {
                    const salesVal = parseFloat(formData.grossSales.replace(/,/g, "")) || 0;
                    if (salesVal <= 0) {
                        document.getElementById("profile-grossSales")?.focus();
                    } else if (!formData.permitNumber) {
                        document.getElementById("profile-permitNumber")?.focus();
                    }
                }
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
            submitData.append("residentSnapshot", JSON.stringify(formData.residentData));

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
                street: formData.street,
                building: formData.building,
                capitalInvestment: parseFloat(formData.capitalInvestment.replace(/,/g, "")) || 0,
                grossSales: parseFloat(formData.grossSales.replace(/,/g, "")) || 0,
                employeeCount: isNaN(parseInt(formData.employeeCount)) ? 0 : parseInt(formData.employeeCount),
                businessArea: parseFloat(formData.businessArea) || 0,
                fulfillmentType: null,
                deliveryAddress: null,
                deliveryPhone: null,
                ownerIdUrl: formData.residentData?.idFrontUrl || null
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
                <div className="sticky top-[64px] sm:top-[80px] z-40 md:static -mx-4 md:mx-0 px-4 md:px-0 pt-2 md:pt-0">
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
                                <BreadcrumbLink asChild>
                                    <Link href="/user/services" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors italic">
                                        Services
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-slate-300 dark:text-white/10" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest italic" style={{ color: "var(--primary-theme)" }}>Permit Portal</BreadcrumbPage>
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
            <div className="grid grid-cols-5 gap-1.5 md:gap-4 relative px-1 md:px-2">
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

            {/* Secure Idle Inactivity Timer */}
            <SecureIdleTimer />

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
                                                code: "BUSINESS_PERMIT_NEW",
                                                icon: Sparkles
                                            },
                                            {
                                                id: "RENEWAL",
                                                code: "BUSINESS_PERMIT_RENEW",
                                                icon: TrendingUp
                                            }
                                        ].map(opt => {
                                            const matchedType = bpTypes.find((t: any) => t.code === opt.code);
                                            const label = matchedType?.name || (opt.id === "NEW" ? "New Business Permit" : "Permit Renewal");
                                            const desc = matchedType?.description || (opt.id === "NEW" 
                                                ? "For newly registered businesses in Mapandan. Based on initial declared capitalization investment." 
                                                : "For existing businesses renewing for the current year. Calculated on previous annual gross receipts/sales.");

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
                                                            {label}
                                                        </h4>
                                                        <p className={cn("text-[9px] md:text-[11px] font-bold uppercase italic tracking-widest leading-relaxed", isSelected ? "text-white/70" : "text-slate-400")}>
                                                            {desc}
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

                            {/* STEP 2: USER PROFILE REVIEW */}
                            {currentStep === "USER_IDENTITY" && (
                                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-1">
                                        <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight text-slate-900 dark:text-white">
                                            Identity <span className="text-primary italic">Confirmation</span>
                                        </h2>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">
                                            Verify and refine your personal records for this certificate.
                                        </p>
                                    </div>

                                    <div className="space-y-4 md:space-y-6">
                                        {/* Row 1: Names */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">First Name</Label>
                                                <Input
                                                    id="resident-firstName"
                                                    value={formData.residentData?.firstName || ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, firstName: e.target.value } }))}
                                                    readOnly={!!initialResident?.firstName}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.firstName && "bg-slate-50 text-slate-400")}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Middle Name</Label>
                                                <Input
                                                    value={formData.residentData?.middleName || ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, middleName: e.target.value } }))}
                                                    readOnly={!!initialResident?.middleName}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.middleName && "bg-slate-50 text-slate-400")}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</Label>
                                                <Input
                                                    id="resident-lastName"
                                                    value={formData.residentData?.lastName || ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, lastName: e.target.value } }))}
                                                    readOnly={!!initialResident?.lastName}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.lastName && "bg-slate-50 text-slate-400")}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Suffix</Label>
                                                <Input
                                                    value={formData.residentData?.suffix || ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, suffix: e.target.value } }))}
                                                    readOnly={!!initialResident?.suffix}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.suffix && "bg-slate-50 text-slate-400")}
                                                    placeholder="Jr."
                                                />
                                            </div>
                                        </div>

                                        <Separator className="opacity-50" />

                                        {/* Row 2: Personal */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Date</Label>
                                                <Input
                                                    id="resident-dateOfBirth"
                                                    type="date"
                                                    value={formData.residentData?.dateOfBirth ? new Date(formData.residentData.dateOfBirth).toISOString().split('T')[0] : ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, dateOfBirth: e.target.value } }))}
                                                    readOnly={!!initialResident?.dateOfBirth}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.dateOfBirth && "bg-slate-50 text-slate-400")}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Age</Label>
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
                                                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Civil Status</Label>
                                                <Input
                                                    value={formData.residentData?.civilStatus || "N/A"}
                                                    readOnly
                                                    className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-400 font-bold text-xs md:text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Citizenship</Label>
                                                <Input
                                                    value={formData.residentData?.citizenship || "Filipino"}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, citizenship: e.target.value } }))}
                                                    readOnly={!!initialResident?.citizenship}
                                                    className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.citizenship && "bg-slate-50 text-slate-400")}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 3: Contact & Occupation */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Occupation</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="resident-occupation"
                                                        value={formData.residentData?.occupation || ""}
                                                        onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, occupation: e.target.value } }))}
                                                        readOnly={!!initialResident?.occupation}
                                                        className={cn("h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm", !!initialResident?.occupation && "bg-slate-50 text-slate-400")}
                                                        placeholder="e.g. Employee"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</Label>
                                                <Input
                                                    id="resident-contactNumber"
                                                    ref={contactInputRef}
                                                    value={formData.residentData?.contactNumber || ""}
                                                    onChange={(e) => setFormData(p => ({ ...p, residentData: { ...p.residentData, contactNumber: e.target.value } }))}
                                                    className="h-10 rounded-xl border-slate-200 focus:ring-primary shadow-sm text-xs md:text-sm"
                                                    placeholder="09xx xxx xxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>


                                                                                <div className="bg-primary/5 border border-primary/10 p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-2 md:gap-3">
                                            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <p className="text-[8px] md:text-[10px] text-primary font-black italic leading-tight uppercase tracking-widest">
                                                Note: Changes will update your Resident Profile upon submission.
                                            </p>
                                        </div>
                                </div>
                            )}

                            {/* STEP 3: PROFILE FORMS */}
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
                                                id="profile-businessName"
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
                                                placeholder="e.g. Mapandan Express Café"
                                                className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Organization Type <span className="text-rose-500 ml-0.5">*</span></Label>
                                            <div className="relative">
                                                <select
                                                    id="profile-orgType"
                                                    value={formData.orgType}
                                                    onChange={e => handleInputChange("orgType", e.target.value)}
                                                    className="w-full appearance-none rounded-xl h-12 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/50 px-4 pr-10 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-white/20"
                                                >
                                                    <option value="SOLE_PROPRIETORSHIP" className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">Sole Proprietorship</option>
                                                    <option value="PARTNERSHIP" className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">Partnership</option>
                                                    <option value="CORPORATION" className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">Corporation</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Business Barangay Location <span className="text-rose-500 ml-0.5">*</span></Label>
                                            <div className="relative">
                                                <select
                                                    id="profile-barangay"
                                                    value={formData.barangay}
                                                    onChange={e => handleInputChange("barangay", e.target.value)}
                                                    className="w-full appearance-none rounded-xl h-12 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/50 px-4 pr-10 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-white/20"
                                                >
                                                    <option value="" disabled className="dark:bg-[#0c0d12] text-slate-400">Select Barangay...</option>
                                                    {(dbBarangays.length > 0 ? dbBarangays : MAPANDAN_BARANGAYS).map((b) => (
                                                        <option key={b} value={b} className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">{b}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Building / House No. / Unit</Label>
                                            <Input
                                                type="text"
                                                value={formData.building}
                                                onChange={e => handleInputChange("building", e.target.value)}
                                                placeholder="e.g. Bldg 4A, Green Meadows (Optional)"
                                                className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Street Address</Label>
                                            <Input
                                                type="text"
                                                value={formData.street}
                                                onChange={e => handleInputChange("street", e.target.value)}
                                                placeholder="e.g. Rizal Avenue (Optional)"
                                                className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Line of Business / Classification <span className="text-rose-500 ml-0.5">*</span></Label>
                                            {!isOtherLine ? (
                                                <div className="relative">
                                                    <select
                                                        id="profile-lineOfBusiness-select"
                                                        value={formData.lineOfBusiness || ""}
                                                        onChange={e => handleLineOfBusinessSelect(e.target.value)}
                                                        className="w-full appearance-none rounded-xl h-12 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d12]/50 px-4 pr-10 text-xs md:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm hover:border-slate-300 dark:hover:border-white/20"
                                                    >
                                                        <option value="" disabled className="dark:bg-[#0c0d12] text-slate-400">Select Line of Business...</option>
                                                        {LINE_OF_BUSINESS_OPTIONS.map((opt) => (
                                                            <option key={opt} value={opt} className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">{opt}</option>
                                                        ))}
                                                        <option value="Other" className="dark:bg-[#0c0d12] text-slate-900 dark:text-white font-bold">Other...</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                        <ChevronDown className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                                                    <Input
                                                        id="profile-lineOfBusiness"
                                                        type="text"
                                                        value={formData.lineOfBusiness}
                                                        onChange={e => handleInputChange("lineOfBusiness", e.target.value)}
                                                        placeholder="Enter your custom line of business..."
                                                        className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 pr-10 font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsOtherLine(false);
                                                            handleInputChange("lineOfBusiness", "");
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 transition-all select-none"
                                                        title="Back to dropdown options"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Employee Count</Label>
                                            <Input
                                                type="number"
                                                value={formData.employeeCount}
                                                onChange={e => handleInputChange("employeeCount", e.target.value)}
                                                min="0"
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

                                        {formData.businessType === "NEW" ? (
                                            <div className="space-y-2 relative animate-in fade-in duration-200">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Initial Capitalization (₱) <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                     id="profile-capitalInvestment"
                                                     type="text"
                                                     value={formData.capitalInvestment}
                                                     onChange={e => handleInputChange("capitalInvestment", e.target.value)}
                                                     placeholder="e.g. 250,000"
                                                     className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 pr-12 font-mono font-bold"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2 relative animate-in fade-in duration-200">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Annual Gross Sales (₱) <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                     id="profile-grossSales"
                                                     type="text"
                                                     value={formData.grossSales}
                                                     onChange={e => handleInputChange("grossSales", e.target.value)}
                                                     placeholder="e.g. 1,200,000"
                                                     className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 pr-12 font-mono font-bold"
                                                />
                                            </div>
                                        )}

                                        {/* Pathway Specific Inputs */}
                                        {formData.businessType === "NEW" ? (
                                            <div className="space-y-2 col-span-1 md:col-span-2 animate-in fade-in duration-200">
                                                <div className="flex items-center gap-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">DTI / SEC Registration Number <span className="text-rose-500 ml-0.5">*</span></Label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsDtiGuideOpen(true)}
                                                        className="text-slate-400 hover:text-primary transition-all p-0.5 shrink-0"
                                                        title="Click for registration guide"
                                                    >
                                                        <HelpCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <Input
                                                    id="profile-dtiSecNumber"
                                                    type="text"
                                                    value={formData.dtiSecNumber}
                                                    onChange={e => handleInputChange("dtiSecNumber", e.target.value)}
                                                    placeholder="e.g. DTI-123456789"
                                                    className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 font-bold"
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-2 col-span-1 md:col-span-2 animate-in fade-in duration-200">
                                                <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic">Existing Permit License Number <span className="text-rose-500 ml-0.5">*</span></Label>
                                                <Input
                                                    id="profile-permitNumber"
                                                    type="text"
                                                    value={formData.permitNumber}
                                                    onChange={e => handleInputChange("permitNumber", e.target.value)}
                                                    placeholder="e.g. MP-2025-0816"
                                                    className="rounded-xl h-12 border-slate-200 focus-visible:ring-emerald-500/20 font-bold"
                                                />
                                            </div>
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
                                            { label: "5. Photo of Location", field: "locationPhotoFile" },
                                            { label: "6. Sanitary Permit", field: "sanitaryPermitFile" },
                                            { label: "7. Fire Safety Inspection Certificate", field: "fireSafetyFile" },
                                            { label: "8. BIR Certificate of Registration (Optional)", field: "birCorFile", optional: true }
                                        ].map(item => {
                                            const file = formData[item.field as keyof FormState] as File | null;
                                            return (
                                                <div key={item.field} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] font-black uppercase tracking-wider text-slate-500 italic flex items-center">
                                                            <span>{item.label}</span>
                                                            {STEP_BY_STEP_GUIDES[item.field] && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveGuideKey(item.field)}
                                                                    className="ml-1.5 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-all shrink-0"
                                                                    title="View step-by-step guide"
                                                                >
                                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </Label>
                                                        {item.optional && (
                                                            <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase italic">
                                                                (optional)
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={cn(
                                                        "p-4 md:p-5 bg-slate-50/50 dark:bg-white/[0.02] rounded-3xl border border-dashed flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-primary/40 shadow-sm",
                                                        (file || (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl))
                                                            ? "border-emerald-500 dark:border-emerald-500/30 bg-emerald-500/[0.01]" 
                                                            : "border-slate-200 dark:border-white/10"
                                                    )}>
                                                        <div className="flex items-center gap-3.5 w-full text-left">
                                                            <div className={cn(
                                                                "w-11 h-11 bg-white dark:bg-black/20 border rounded-xl flex items-center justify-center shadow-sm shrink-0",
                                                                (file || (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl)) ? "border-emerald-200 dark:border-emerald-500/20 text-emerald-500" : "border-slate-100 dark:border-white/5 text-primary"
                                                            )}>
                                                                <Upload className={cn("w-4 h-4", (file || (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl)) && "animate-bounce")} />
                                                            </div>
                                                            <div className="space-y-0.5 min-w-0">
                                                                <h4 className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-white italic truncate pr-2">
                                                                    {item.label.replace(/^\d+\.\s*/, "")}
                                                                </h4>
                                                                <p className="text-[8px] md:text-[9px] text-slate-400 font-bold italic uppercase tracking-tighter truncate">
                                                                    {file ? `Uploaded (${(file.size / 1024).toFixed(1)} KB)` : (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl) ? "Preloaded from Resident Profile" : (item.optional ? "PDF / IMAGE (OPTIONAL)" : "PDF / IMAGE (MAX 5MB)")}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Live File Preview Card for Images/PDFs or Preloaded Identity Card */}
                                                        {file ? (
                                                            <FilePreview file={file} />
                                                        ) : (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl) ? (
                                                            <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-black/30 h-28 flex items-center justify-center">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={formData.residentData.idFrontUrl}
                                                                    alt="Preloaded ID Front"
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            </div>
                                                        ) : null}

                                                        <div className="flex items-center justify-between w-full gap-2 mt-1">
                                                            <input 
                                                                type="file" 
                                                                onChange={(e) => handleFileChange(e, item.field as keyof FormState)} 
                                                                className="hidden" 
                                                                id={`upload-${item.field}`} 
                                                            />
                                                            <Button 
                                                                asChild 
                                                                className={cn(
                                                                    "font-black italic uppercase tracking-widest text-[9px] sm:text-xs h-10 w-full rounded-2xl transition-all select-none shadow-md active:scale-[0.98]",
                                                                    (file || (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl))
                                                                        ? "bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white" 
                                                                        : "bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-white"
                                                                )}
                                                            >
                                                                <label htmlFor={`upload-${item.field}`} className="cursor-pointer flex items-center justify-center w-full h-full">
                                                                    {(file || (item.field === "ownerIdFile" && formData.residentData?.idFrontUrl)) ? "Change File" : "Upload"}
                                                                </label>
                                                            </Button>
                                                        </div>
                                                    </div>                                                </div>
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
                                                        <span>Org Type</span>
                                                        <span className="text-slate-900 dark:text-white font-mono text-right capitalize">
                                                            {formData.orgType.toLowerCase().replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-slate-200/50 dark:border-white/5 pb-2">
                                                        <span>Location Address</span>
                                                        <span className="text-slate-900 dark:text-white font-mono text-right truncate max-w-[200px]">
                                                            {[formData.building, formData.street, formData.barangay].filter(Boolean).join(", ")}
                                                        </span>
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

                                            {/* Privacy Acceptance checkbox card */}
                                            <div
                                                onClick={() => {
                                                    if (privacyAccepted) {
                                                        setPrivacyAccepted(false);
                                                    } else {
                                                        setIsPrivacyModalOpen(true);
                                                    }
                                                }}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none",
                                                    privacyAccepted ? "bg-primary/5 border-primary shadow-sm" : "bg-slate-50 dark:bg-white/[0.02] border-transparent hover:border-primary/20"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
                                                    privacyAccepted ? "bg-primary border-primary text-white" : "border-slate-300 dark:border-white/10"
                                                )}>
                                                    {privacyAccepted && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Data Privacy and Terms Agreement</p>
                                                    <p className="text-[8px] md:text-[10px] text-slate-500 font-medium leading-relaxed italic uppercase tracking-widest">
                                                        I officially accept the EMapandan Data Privacy Agreement & Terms. I declare under penalty of perjury that all submitted details are 100% legal and genuine. Click to review agreement.
                                                    </p>
                                                </div>
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
                                                <div className="flex justify-between items-end flex-wrap gap-2">
                                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Total Assessed Due</span>
                                                    <span className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono leading-none">₱{calcResult.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
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
                <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 dark:border-white/10 flex justify-end items-center">
                    <Button
                        onClick={currentStep === "SUBMIT" ? onSubmit : handleNext}
                        disabled={submitting || (currentStep === "SUBMIT" && !isStepValid(currentStep))}
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
            <PrivacyTermsModal
                isOpen={isPrivacyModalOpen}
                onClose={() => setIsPrivacyModalOpen(false)}
                onAccept={() => {
                    setPrivacyAccepted(true);
                    setIsPrivacyModalOpen(false);
                }}
                themeColor="var(--primary-theme)"
            />

            <AnimatePresence>
                {isDtiGuideOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 pt-24 sm:pt-4 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDtiGuideOpen(false)}
                            className="absolute inset-0 bg-[#06070a]/80 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-[#0c0d12] border border-slate-100 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-md sm:max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden z-10 space-y-4 sm:space-y-6 max-h-[calc(100vh-120px)] sm:max-h-[85vh] overflow-y-auto"
                        >
                            {/* Top Accent line with dynamic theme color */}
                            <div 
                                className="absolute top-0 left-0 right-0 h-1.5"
                                style={{ background: "var(--primary-theme)" }}
                            />

                            <div className="space-y-2">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary bg-primary/10 mb-4 shrink-0">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">DTI & SEC Registration Guide</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Learn how to easily register your business entity online under the Philippine regulatory compliance laws.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Sole Proprietorship Card */}
                                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl space-y-2">
                                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                                        Sole Proprietorship
                                    </h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                                        Register your trade name online using the DTI Business Name Registration System (BNRS) in just 10-15 minutes.
                                    </p>
                                    <a 
                                        href="https://bnrs.dti.gov.ph" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-extrabold"
                                    >
                                        Visit DTI BNRS Website <ChevronRight className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* Partnership & Corporation Card */}
                                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl space-y-2">
                                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5 text-primary" />
                                        Partnership or Corporation
                                    </h4>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                                        Submit your articles of incorporation and secure registration numbers through the SEC Electronic Simplified Processing System (eSPARC / CRS).
                                    </p>
                                    <a 
                                        href="https://crs.sec.gov.ph" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-extrabold"
                                    >
                                        Visit SEC eSPARC Portal <ChevronRight className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={() => setIsDtiGuideOpen(false)}
                                    className="w-full h-12 rounded-xl text-white font-extrabold uppercase italic tracking-widest transition-all"
                                    style={{ backgroundColor: "var(--primary-theme)" }}
                                >
                                    Got it, thanks!
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Document Step-by-Step Guide Modal */}
            <AnimatePresence>
                {activeGuideKey && STEP_BY_STEP_GUIDES[activeGuideKey] && (
                    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 pt-24 sm:pt-4 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveGuideKey(null)}
                            className="absolute inset-0 bg-[#06070a]/80 backdrop-blur-md"
                        />

                        {/* Modal Body */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white dark:bg-[#0c0d12] border border-slate-100 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-md sm:max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden z-10 space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto"
                        >
                            {/* Top Accent Theme Line */}
                            <div 
                                className="absolute top-0 left-0 right-0 h-1.5"
                                style={{ background: "var(--primary-theme)" }}
                            />

                            {/* Floating Close Button */}
                            <button
                                type="button"
                                onClick={() => setActiveGuideKey(null)}
                                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all z-20"
                                title="Close guide"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="space-y-2">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary bg-primary/10 mb-2 shrink-0">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white pr-8">
                                    {STEP_BY_STEP_GUIDES[activeGuideKey].title}
                                </h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Follow these official procedural guidelines to successfully acquire this required document.
                                </p>
                            </div>

                            <div className="space-y-3.5 pt-1">
                                {STEP_BY_STEP_GUIDES[activeGuideKey].steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-xl transition-all duration-200 hover:border-primary/20">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-[10px] text-primary dark:text-emerald-400 font-mono font-black shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <p className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={() => setActiveGuideKey(null)}
                                    className="w-full h-12 rounded-xl text-white font-extrabold uppercase italic tracking-widest transition-all"
                                    style={{ backgroundColor: "var(--primary-theme)" }}
                                >
                                    Got it, thank you!
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

