/* eslint-disable @typescript-eslint/no-unused-vars */
import { TreasuryViewProps } from "./types";
import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    Coins,
    FileText,
    AlertCircle,
    RotateCw,
    ExternalLink,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import LightboxView from "../components/LightboxView";
import PrintWaybill from "../components/PrintWaybill";
import ResidentIdentityProfile from "../components/ResidentIdentityProfile";
import TransactionInfoCard from "../components/TransactionInfoCard";
import RejectionRevisionControls from "../components/RejectionRevisionControls";
import { cn } from "@/lib/utils";

export default function CivilRegistryView(props: TreasuryViewProps) {
    const {
        transaction,
        rawUserRole,
        isReadOnlyAide,
        backUrl,
        actionLoading,
        remarks,
        setRemarks,
        isRejecting,
        setIsRejecting,
        isRequestingRevision,
        setIsRequestingRevision,
        deliveryFee,
        eCopyFile,
        setECopyFile,
        eCopyPreview,
        setECopyPreview,
        orFile,
        setOrFile,
        orPreview,
        setOrPreview,
        receiptFile,
        setReceiptFile,
        receiptPreview,
        setReceiptPreview,
        handleReceiptFileSelect,
        themeColor,
        fetchTransaction,
        handleEvaluate,
        handleConfirmPayment,
        handleDeclinePaymentProof,
        handleRelease,
        handleReject,
        handleRequestRevision,
        safeFormatDate,
        displayTotal,
        evidenceDocs,
        steps,
        currentStepIdx,
        branding,
        registryBookVerification,
        setRegistryBookVerification,
        birthRegDocFile,
        setBirthRegDocFile,
        birthRegDocPreview,
        setBirthRegDocPreview,
        orSeriesNumber,
        setOrSeriesNumber
    } = props;

    const resident = transaction.user?.residentProfile || transaction.residentSnapshot || {};
    const additional = transaction.additionalData || {};

    const EVIDENCE_LABELS: Record<string, string> = {
        A: "Baptismal Certificate",
        B: "School records",
        C: "Income tax return of parents",
        D: "Insurance Policy",
        E: "Medical records",
        F: "Others (Voter registration record, Barangay certification)",
        G: "Affidavit of 2 disinterested persons"
    };

    const isDeath = transaction.type?.code?.includes("DEATH") || transaction.type?.code?.startsWith("LCR_DEATH");
    const isMarriage = transaction.type?.code?.includes("MARRIAGE") || transaction.type?.code?.startsWith("LCR_MARRIAGE");
    const fiscal = additional.feeAssessment || null;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300">
            {/* Header branding band */}
            <div className={`h-1.5 w-full ${themeColor} transition-all duration-500`} />

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

                {/* Back Button & Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in duration-300">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Civil Registry
                    </Link>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 text-[9px] font-black uppercase tracking-widest border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 rounded-full">
                            ID: {transaction.id}
                        </Badge>
                        <Badge className={`px-4 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full text-white shadow-lg ${themeColor} shadow-primary/10`}>
                            {transaction.status.replace(/_/g, " ")}
                        </Badge>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Dossier Details & Evidence */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* TRANSACTION CATEGORY CARD */}
                        <TransactionInfoCard
                            transactionName={transaction.type.name}
                            categoryLabel="Civil Registry"
                            themeColor={themeColor}
                        />

                        {/* RESIDENT IDENTITY PROFILE ACCORDION */}
                        <ResidentIdentityProfile
                            resident={resident}
                            safeFormatDate={props.safeFormatDate}
                            themeColor={themeColor}
                        />

                        {/* Primary LCR Specific Details Panel */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 italic">
                                    {isDeath ? "Death Registry Record Data" : isMarriage ? "Marriage Registry Record Data" : "Birth Registry Record Data"}
                                </h3>
                            </div>

                            {additional.registryBookVerification && (
                                <div className="p-6 rounded-3xl border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 flex items-center justify-between gap-4 animate-in fade-in duration-300">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Registry Book Verification Status</span>
                                        <p className="text-sm font-black italic uppercase text-slate-700 dark:text-slate-200">
                                            {additional.registryBookVerification === "FORM_1A" ? "Form 1A (Record Found)" :
                                             additional.registryBookVerification === "FORM_1B" ? "Form 1B (Record Not Available)" :
                                             additional.registryBookVerification === "FORM_1C" ? "Form 1C (Record Destroyed)" :
                                             additional.registryBookVerification}
                                        </p>
                                    </div>
                                    <Badge className={cn(
                                        "px-4.5 py-2 rounded-full font-black uppercase text-[10px] tracking-wider italic text-white shadow-md border-none",
                                        additional.registryBookVerification === "FORM_1A" ? "bg-emerald-500 hover:bg-emerald-500 shadow-emerald-500/10" :
                                        additional.registryBookVerification === "FORM_1B" ? "bg-amber-500 hover:bg-amber-500 shadow-amber-500/10" :
                                        "bg-rose-500 hover:bg-rose-500 shadow-rose-500/10"
                                    )}>
                                        {additional.registryBookVerification === "FORM_1A" ? "Record Found" :
                                         additional.registryBookVerification === "FORM_1B" ? "Not Available" :
                                         "Destroyed"}
                                    </Badge>
                                </div>
                            )}

                            {(additional.orSeriesNumber || additional.scannedDocUrl) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    {additional.orSeriesNumber && (
                                        <div className="p-6 rounded-3xl border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 flex flex-col justify-center gap-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">O.R. Series Number</span>
                                            <p className="text-sm font-black italic uppercase text-slate-700 dark:text-slate-200">
                                                {additional.orSeriesNumber}
                                            </p>
                                        </div>
                                    )}
                                    {additional.scannedDocUrl && (
                                        <div className="p-6 rounded-3xl border bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 flex flex-col justify-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Verified Birth Doc</span>
                                            <div>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                                                            <FileText className="w-3.5 h-3.5" /> View Scanned Document
                                                        </Button>
                                                    </DialogTrigger>
                                                    <LightboxView src={additional.scannedDocUrl} alt="Scanned Birth Registration Document" label="Scanned Birth Registration Document" />
                                                </Dialog>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Column 1: Primary Subject details */}
                                <div className="space-y-6">
                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">
                                        {isDeath ? "Deceased / Event Info" : isMarriage ? "Contracting Parties / Marriage Info" : "Subject / Document Info"}
                                    </h4>
                                    <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-5">
                                        {/* Deceased/Subject Name */}
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                {isMarriage ? "Contracting Couple" : isDeath ? "Deceased Full Name" : "Subject Name"}
                                            </span>
                                            <p className="text-lg font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                {isDeath
                                                    ? (transaction.deathRegistration?.subjectName || additional.fullName || additional.subjectName || "N/A")
                                                    : isMarriage
                                                        ? (transaction.marriageRegistration?.businessName ||
                                                            (transaction.marriageLicenseApplication
                                                                ? `${transaction.marriageLicenseApplication.app1FullName} & ${transaction.marriageLicenseApplication.app2FullName}`
                                                                : additional.subjectName || "N/A"))
                                                        : (transaction.birthCertificateRegistry?.subjectName || transaction.birthCertificateRequest?.subjectName || additional.subjectName || "N/A")}
                                            </p>
                                        </div>

                                        {/* Event Date & Registry No */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                    {isDeath ? "Date of Death" : isMarriage ? "Date of Marriage" : "Event Date"}
                                                </span>
                                                <p className="text-md font-black italic text-slate-600 dark:text-slate-200">
                                                    {isDeath
                                                        ? safeFormatDate(transaction.deathRegistration?.dateOfEvent || additional.dateOfDeath || additional.dateOfEvent)
                                                        : isMarriage
                                                            ? safeFormatDate(additional.dateOfMarriage || additional.dateOfEvent || transaction.marriageLicenseApplication?.dateIssued)
                                                            : safeFormatDate(transaction.birthCertificateRegistry?.dateOfEvent || transaction.birthCertificateRequest?.dateOfEvent || additional.dateOfEvent)}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Registry No.</span>
                                                <p className="text-md font-black italic text-slate-600 dark:text-slate-200">
                                                    {isDeath
                                                        ? (transaction.deathRegistration?.registryNumber || "PENDING")
                                                        : isMarriage
                                                            ? (transaction.marriageRegistration?.ctcNumber || transaction.marriageLicenseApplication?.registryNumber || "PENDING")
                                                            : (transaction.birthCertificateRegistry?.registryNumber || transaction.birthCertificateRequest?.registryNumber || "PENDING")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Extra Fields specifically for Death */}
                                        {isDeath && (
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Cause of Death</span>
                                                    <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                        {additional.causeOfDeath || "N/A"}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Place of Death</span>
                                                    <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                        {transaction.deathRegistration?.placeOfEvent || additional.placeOfDeath || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Extra Fields specifically for Marriage */}
                                        {isMarriage && (
                                            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-white/5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Place of Marriage</span>
                                                <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                    {additional.placeOfMarriage || "N/A"}
                                                </p>
                                            </div>
                                        )}

                                        {/* Issued By info */}
                                        {(transaction.deathRegistration?.issuedBy ||
                                            transaction.birthCertificateRegistry?.issuedBy ||
                                            transaction.birthCertificateRequest?.issuedBy ||
                                            transaction.marriageRegistration?.issuedBy ||
                                            transaction.marriageLicenseApplication?.issuedBy ||
                                            additional.issuedBy) && (
                                                <div className="space-y-1 border-t border-slate-100 dark:border-white/5 pt-4">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Issued By</span>
                                                    <p className="text-md font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                        {isDeath
                                                            ? (transaction.deathRegistration?.issuedBy || additional.issuedBy)
                                                            : isMarriage
                                                                ? (transaction.marriageRegistration?.issuedBy || transaction.marriageLicenseApplication?.issuedBy || additional.issuedBy)
                                                                : (transaction.birthCertificateRegistry?.issuedBy || transaction.birthCertificateRequest?.issuedBy || additional.issuedBy)}
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* Column 2: Secondary parties details */}
                                <div className="space-y-6">
                                    {isDeath ? (
                                        <>
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Informant & Parental Dossier</h4>
                                            <div className="space-y-4">
                                                {/* Informant Details */}
                                                <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-3xl space-y-3">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic block">Informant Profile</span>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <span className="text-[8px] uppercase tracking-wider text-slate-400">Name</span>
                                                            <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200">
                                                                {additional.informantFirstName ? `${additional.informantFirstName} ${additional.informantLastName}` : "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] uppercase tracking-wider text-slate-400">Relationship</span>
                                                            <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200">
                                                                {additional.relationship || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                                        <span className="text-[8px] uppercase tracking-wider text-slate-400">Contact Number</span>
                                                        <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200">
                                                            {additional.contactNumber || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Parents */}
                                                <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-3xl space-y-3">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic block">Parental Matrix</span>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-[8px] uppercase tracking-wider text-slate-400 block mb-1">Father</span>
                                                            <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200">
                                                                {additional.fathersName || additional.fatherName || "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] uppercase tracking-wider text-slate-400 block mb-1">Mother</span>
                                                            <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200">
                                                                {additional.mothersName || additional.motherName || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : isMarriage ? (
                                        <>
                                            <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Applicants Dossier</h4>
                                            <div className="space-y-4">
                                                {/* Applicant 1 */}
                                                {(additional.applicant1 || transaction.marriageLicenseApplication) && (
                                                    <div className="bg-[#f8fafd] dark:bg-white/5 p-5 rounded-3xl space-y-2">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic block">Applicant 1 (Groom/Spouse)</span>
                                                        <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200 leading-none">
                                                            {additional.applicant1?.fullName || transaction.marriageLicenseApplication?.app1FullName}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 text-[9px] font-medium text-slate-400 italic pt-1">
                                                            <span>DOB: {safeFormatDate(additional.applicant1?.birthDate || transaction.marriageLicenseApplication?.app1BirthDate)}</span>
                                                            <span>Citizenship: {additional.applicant1?.citizenship || transaction.marriageLicenseApplication?.app1Citizenship || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Applicant 2 */}
                                                {(additional.applicant2 || transaction.marriageLicenseApplication) && (
                                                    <div className="bg-[#f8fafd] dark:bg-white/5 p-5 rounded-3xl space-y-2">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic block">Applicant 2 (Bride/Spouse)</span>
                                                        <p className="text-xs font-black uppercase text-slate-600 dark:text-slate-200 leading-none">
                                                            {additional.applicant2?.fullName || transaction.marriageLicenseApplication?.app2FullName}
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2 text-[9px] font-medium text-slate-400 italic pt-1">
                                                            <span>DOB: {safeFormatDate(additional.applicant2?.birthDate || transaction.marriageLicenseApplication?.app2BirthDate)}</span>
                                                            <span>Citizenship: {additional.applicant2?.citizenship || transaction.marriageLicenseApplication?.app2Citizenship || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Birth Details */}
                                            {(additional.fatherName || additional.motherName || transaction.birthCertificateRegistry?.fatherName || transaction.birthCertificateRegistry?.motherName) && (
                                                <div className="space-y-6">
                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Parental Matrix</h4>
                                                    <div className="space-y-4">
                                                        {(additional.fatherName || transaction.birthCertificateRegistry?.fatherName) && (
                                                            <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-3xl">
                                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic mb-2 block">Father</span>
                                                                <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                                    {transaction.birthCertificateRegistry?.fatherName || additional.fatherName}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {(additional.motherName || transaction.birthCertificateRegistry?.motherName) && (
                                                            <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-3xl">
                                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary italic mb-2 block">Mother</span>
                                                                <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200">
                                                                    {transaction.birthCertificateRegistry?.motherName || additional.motherName}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {(additional.registrationType || "").toUpperCase() === "LATE" && (() => {
                                                const types = additional.supportingEvidenceTypes || [];
                                                const type1 = additional.supportingEvidence1Type || types[0];
                                                const type2 = additional.supportingEvidence2Type || types[1];
                                                const label1 = EVIDENCE_LABELS[type1 as string];
                                                const label2 = EVIDENCE_LABELS[type2 as string];

                                                if (!label1 && !label2) return null;

                                                return (
                                                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5 w-full">
                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Selected Supporting Evidence</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {label1 && (
                                                                <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-3xl">
                                                                    <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200 leading-normal">
                                                                        {label1}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {label2 && (
                                                                <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-3xl">
                                                                    <p className="text-sm font-black italic uppercase text-slate-600 dark:text-slate-200 leading-normal">
                                                                        {label2}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Resident Identity Profile */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    Resident <span className="text-primary">Identity Profile</span>
                                </h2>
                                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                    Verified Citizen Data Dossier
                                </p>
                            </div>

                            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                                <div className="col-span-12 md:col-span-4 space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                        {resident && resident.firstName ? `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}` : "--"}
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-4 space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Contact Number</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                        {resident?.contactNumber || "--"}
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-4 space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Barangay</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 uppercase">
                                        {resident?.barangay || "--"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Uploads & Attachments */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-6">
                            <div>
                                <h3 className="text-lg font-black italic uppercase tracking-tight text-[#1e293b] dark:text-white">Evidence & Required Dossier</h3>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic mt-1">Uploaded verification materials</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {evidenceDocs.map((doc, i) => (
                                    <div key={i} className="p-4 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase leading-none">{doc.label}</p>
                                            </div>
                                        </div>

                                        {doc.url ? (
                                            /\.(png|jpe?g|gif|webp|svg)$/i.test(doc.url) ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={doc.url}
                                                            alt={doc.label}
                                                            className="w-28 h-20 object-cover rounded-md cursor-pointer border border-slate-100 dark:border-white/5"
                                                        />
                                                    </DialogTrigger>
                                                    <LightboxView src={doc.url} alt={doc.label} label={doc.label} />
                                                </Dialog>
                                            ) : (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <LightboxView src={doc.url} alt={doc.label} label={doc.label} />
                                                </Dialog>
                                            )
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider italic">Pending Attachment</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {(() => {
                                const typeCode = (transaction?.type?.code || "").toString().toUpperCase();
                                const isBirthType = typeCode === "LCR_BIRTH_REG" || typeCode === "LCR_BIRTH" || (transaction?.type?.name && transaction.type.name.toLowerCase().includes("birth"));
                                const ctcCandidate = additional.communityTaxCertificate || additional.ctcUrl || additional.community_tax_certificate || additional.communityTax;
                                const hasCTCInEvidence = evidenceDocs && evidenceDocs.some(d => /community tax|cedula|ctc/i.test(d.label) || (d.url && (d.url === ctcCandidate)));

                                if (isBirthType && !hasCTCInEvidence) {
                                    let snapshot: any = transaction.residentSnapshot || {};
                                    if (snapshot && typeof snapshot === 'string') {
                                        try { snapshot = JSON.parse(snapshot); } catch { snapshot = {}; }
                                    }
                                    const current = transaction.user?.residentProfile || {};
                                    const snapshotHasId = snapshot && (snapshot.idFrontUrl || snapshot.idBackUrl || snapshot.idNumber || snapshot.idType);
                                    const idChanged = !!snapshotHasId && (
                                        (current.idFrontUrl && current.idFrontUrl !== snapshot.idFrontUrl) ||
                                        (current.idBackUrl && current.idBackUrl !== snapshot.idBackUrl) ||
                                        (current.idNumber && current.idNumber !== snapshot.idNumber) ||
                                        (current.idType && current.idType !== snapshot.idType)
                                    );

                                    if (idChanged) {
                                        return (
                                            <div className="mt-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-500">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase">Community Tax Certificate</p>
                                                        <p className="text-[10px] italic">Not uploaded — resident ID was updated after submission</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Snapshot (at submission)</span>
                                                        <div className="mt-2 space-y-2">
                                                            {snapshot.idFrontUrl ? (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={snapshot.idFrontUrl} alt="Previous ID Front" className="w-28 h-20 object-cover rounded-md border border-slate-100 dark:border-white/5" />
                                                                    </DialogTrigger>
                                                                    <LightboxView src={snapshot.idFrontUrl} alt="Previous ID Front" label="Previous ID Front" />
                                                                </Dialog>
                                                            ) : <div className="text-xs text-slate-400 italic">No ID front saved in snapshot</div>}

                                                            {snapshot.idBackUrl ? (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={snapshot.idBackUrl} alt="Previous ID Back" className="w-28 h-20 object-cover rounded-md border border-slate-100 dark:border-white/5" />
                                                                    </DialogTrigger>
                                                                    <LightboxView src={snapshot.idBackUrl} alt="Previous ID Back" label="Previous ID Back" />
                                                                </Dialog>
                                                            ) : null}

                                                            {snapshot.idNumber && <div className="text-xs font-bold uppercase">{(snapshot.idType || 'ID') + ': ' + snapshot.idNumber}</div>}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Resident Record</span>
                                                        <div className="mt-2 space-y-2">
                                                            {current.idFrontUrl ? (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={current.idFrontUrl} alt="Current ID Front" className="w-28 h-20 object-cover rounded-md border border-slate-100 dark:border-white/5" />
                                                                    </DialogTrigger>
                                                                    <LightboxView src={current.idFrontUrl} alt="Current ID Front" label="Current ID Front" />
                                                                </Dialog>
                                                            ) : <div className="text-xs text-slate-400 italic">No ID front on resident record</div>}

                                                            {current.idBackUrl ? (
                                                                <Dialog>
                                                                    <DialogTrigger asChild>
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img src={current.idBackUrl} alt="Current ID Back" className="w-28 h-20 object-cover rounded-md border border-slate-100 dark:border-white/5" />
                                                                    </DialogTrigger>
                                                                    <LightboxView src={current.idBackUrl} alt="Current ID Back" label="Current ID Back" />
                                                                </Dialog>
                                                            ) : null}

                                                            {current.idNumber && <div className="text-xs font-bold uppercase">{(current.idType || 'ID') + ': ' + current.idNumber}</div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                }
                                return null;
                            })()}
                        </div>

                    </div>

                    {/* Right Column: Workflow Steps & Dynamic Evaluation Controls */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* BILLING / ASSESSMENT TOTAL DUE */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-6">
                            <div>
                                <h3 className="text-md font-black italic uppercase tracking-wider text-slate-800 dark:text-slate-200">Payment Breakdown</h3>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic mt-1">LCR assessment fees</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pt-2 gap-4">
                                    <div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">Miscellaneous Fee</span>
                                        <p className="text-[10px] text-slate-400 italic">
                                            {(additional.registrationType || "").toUpperCase() === "LATE"
                                                ? "Late registration surcharge"
                                                : "Standard registration — no surcharge"}
                                        </p>
                                    </div>
                                    {(additional.registrationType || "").toUpperCase() === "LATE" ? (
                                        <span className="text-sm font-black text-amber-600 italic">₱315.00</span>
                                    ) : (
                                        <span className="text-sm font-black text-emerald-600 italic">FREE</span>
                                    )}
                                </div>

                                {transaction.fulfillmentType === "DELIVERY" && (
                                    <div className="flex justify-between items-center pt-2 gap-4">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">Delivery Fee</span>
                                        <span className="text-sm font-black text-primary italic">
                                            ₱{deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-dotted border-slate-300 dark:border-white/10 pt-8 mt-8 flex justify-between items-center">
                                    <span className="text-lg font-black uppercase italic tracking-widest text-slate-900 dark:text-white leading-none">Total Amount Due</span>
                                    <span className="text-4xl font-black italic tracking-tighter text-primary leading-none">
                                        ₱{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status tracker */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-6">
                            <div>
                                <h3 className="text-md font-black italic uppercase tracking-wider text-slate-800 dark:text-slate-200">Status Tracker</h3>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic mt-1">Status phase progress</p>
                            </div>
                            <div className="relative border-l border-slate-100 dark:border-white/5 ml-3 space-y-6">
                                {steps.map((step, idx) => {
                                    const isCompleted = idx < currentStepIdx;
                                    const isCurrent = idx === currentStepIdx;
                                    return (
                                        <div key={step.id} className="relative pl-6">
                                            <div className={cn(
                                                "absolute -left-[9px] top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                isCompleted ? "bg-primary border-primary text-white" :
                                                    isCurrent ? "bg-white dark:bg-slate-900 border-primary text-primary shadow-lg shadow-primary/20 scale-110" :
                                                        "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-300"
                                            )}>
                                                {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <span className="text-[8px] font-black">{idx + 1}</span>}
                                            </div>
                                            <div>
                                                <p className={cn("text-xs font-black uppercase leading-none", isCurrent ? "text-primary italic" : isCompleted ? "text-slate-500 dark:text-slate-400" : "text-slate-300 dark:text-slate-600")}>
                                                    {step.label}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interactive Decision / Actions box */}
                        {(!isReadOnlyAide || ["FOR_PROCESSING", "FOR_CLAIM"].includes(transaction.status)) && (
                            <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-6">
                                <div>
                                    <h3 className="text-md font-black italic uppercase tracking-wider text-slate-800 dark:text-slate-200">Evaluation Hub</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic mt-1">Actions & Endorsements</p>
                                </div>

                                {( ["FOR_REQUESTING", "UNDER_REVIEW", "EVALUATED"].includes(transaction.status) ) && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN" || rawUserRole === "REGISTRAR" || (transaction.type?.category === "Civil Registry")) && (
                                    <div className="space-y-4">
                                        {transaction.status === "EVALUATED" ? (
                                            // EVALUATED: Upload O.R & Mark as Paid flow
                                            <div className="space-y-4">
                                                <div className="space-y-3 p-5 rounded-3xl bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 italic block mb-2">
                                                        Upload Official Treasury Receipt
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={orSeriesNumber || additional?.orSeriesNumber || ""}
                                                        onChange={(e) => setOrSeriesNumber?.(e.target.value)}
                                                        placeholder="Enter O.R. Series Number..."
                                                        className="w-full h-11 px-4 rounded-xl border border-slate-150 dark:border-white/5 bg-white dark:bg-[#151b28]/60 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-3 p-5 rounded-3xl bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 italic block mb-2">
                                                        Attach Scanned Official Receipt (O.R.) <span className="text-rose-500 font-extrabold">*Required</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null;
                                                            setOrFile?.(file);
                                                            if (file) {
                                                                const url = URL.createObjectURL(file);
                                                                setOrPreview?.(url);
                                                            } else {
                                                                setOrPreview?.(null);
                                                            }
                                                        }}
                                                        className="hidden"
                                                        id="or-doc-upload"
                                                    />
                                                    <label
                                                        htmlFor="or-doc-upload"
                                                        className={cn(
                                                            "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all h-28 bg-white dark:bg-[#151b28]/60 overflow-hidden relative group cursor-pointer",
                                                            orFile ? "border-primary/30 bg-primary/5 shadow-inner" : "border-slate-200 dark:border-white/10 hover:border-primary/30"
                                                        )}
                                                    >
                                                        {orFile ? (
                                                            <div className="flex flex-col items-center justify-center text-primary/60 group-hover:text-primary transition-colors p-4">
                                                                <Check className="w-6 h-6 text-emerald-500" />
                                                                <span className="text-[9px] font-black uppercase italic tracking-widest mt-1 truncate max-w-[200px]">
                                                                    {orFile.name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-4.5 h-4.5 text-slate-400 group-hover:text-primary transition-colors mb-1" />
                                                                <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 text-center px-2">
                                                                    Upload Scanned O.R. Document
                                                                </span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>

                                                {/* Treasury receipt upload removed per request */}

                                                <Button
                                                    onClick={handleConfirmPayment}
                                                    disabled={actionLoading || !orFile || !(orSeriesNumber || additional?.orSeriesNumber)}
                                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg font-black uppercase text-xs tracking-wider flex items-center justify-center"
                                                >
                                                    {actionLoading && <RotateCw className="w-4 h-4 animate-spin mr-2" />}
                                                    Upload O.R. & Mark as Paid
                                                </Button>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => { setIsRequestingRevision(true); setRemarks(""); }}
                                                        className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase"
                                                    >
                                                        Request Revision
                                                    </Button>
                                                    <Button
                                                        onClick={() => { setIsRejecting(true); setRemarks(""); }}
                                                        className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Original: FOR_REQUESTING / UNDER_REVIEW -> Approve & Send Assessment
                                            <>
                                                {/* Registry Book Verification Choices */}
                                                <div className="space-y-3 p-5 rounded-3xl bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 italic block mb-1">
                                                        Registry Book Verification <span className="text-rose-500 font-extrabold">*Required</span>
                                                    </label>
                                                    <div className="grid grid-cols-1 gap-2.5">
                                                        {[
                                                            { id: "FORM_1A", title: "Form 1A", desc: "Record Found", activeColor: "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
                                                            { id: "FORM_1B", title: "Form 1B", desc: "Record Not Available", activeColor: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                                                            { id: "FORM_1C", title: "Form 1C", desc: "Record Destroyed", activeColor: "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400" }
                                                        ].map((opt) => {
                                                            const isSelected = registryBookVerification === opt.id;
                                                            return (
                                                                <button
                                                                    key={opt.id}
                                                                    type="button"
                                                                    onClick={() => setRegistryBookVerification?.(opt.id)}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 active:scale-98 select-none",
                                                                        isSelected ? opt.activeColor + " shadow-md font-bold" : "border-slate-150 dark:border-white/5 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#151b28]/60 hover:bg-slate-50 dark:hover:bg-white/5"
                                                                    )}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-black uppercase tracking-wider">{opt.title}</span>
                                                                        <span className="text-[10px] italic opacity-85 mt-0.5">{opt.desc}</span>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                                        isSelected ? "border-current bg-current/15" : "border-slate-300 dark:border-white/10"
                                                                    )}>
                                                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Birth Registration Additional Fields */}
                                                {transaction.type?.code === "LCR_BIRTH_REG" && (
                                                    <div className="space-y-4 p-5 rounded-3xl bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 italic block mb-2">
                                                                Attach Scanned/Required Document <span className="text-rose-500 font-extrabold">*Required</span>
                                                            </label>
                                                            <input
                                                                type="file"
                                                                accept=".pdf,image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files?.[0] || null;
                                                                    setBirthRegDocFile?.(file);
                                                                    if (file) {
                                                                        const url = URL.createObjectURL(file);
                                                                        setBirthRegDocPreview?.(url);
                                                                    } else {
                                                                        setBirthRegDocPreview?.(null);
                                                                    }
                                                                }}
                                                                className="hidden"
                                                                id="birth-reg-doc-upload"
                                                            />
                                                            <label
                                                                htmlFor="birth-reg-doc-upload"
                                                                className={cn(
                                                                    "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all h-28 bg-white dark:bg-[#151b28]/60 overflow-hidden relative group cursor-pointer",
                                                                    birthRegDocFile ? "border-primary/30 bg-primary/5 shadow-inner" : "border-slate-200 dark:border-white/10 hover:border-primary/30"
                                                                )}
                                                            >
                                                                {birthRegDocFile ? (
                                                                    <div className="flex flex-col items-center justify-center text-primary/60 group-hover:text-primary transition-colors p-4">
                                                                        <Check className="w-6 h-6 text-emerald-500" />
                                                                        <span className="text-[9px] font-black uppercase italic tracking-widest mt-1 truncate max-w-[200px]">
                                                                            {birthRegDocFile.name}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-4.5 h-4.5 text-slate-400 group-hover:text-primary transition-colors mb-1" />
                                                                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 text-center px-2">
                                                                            Upload Scanned Document
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </label>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 italic block">
                                                                O.R. Series Number <span className="text-rose-500 font-extrabold">*Required</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={orSeriesNumber || ""}
                                                                onChange={(e) => setOrSeriesNumber?.(e.target.value)}
                                                                placeholder="Enter O.R. Series Number..."
                                                                className="w-full h-11 px-4 rounded-xl border border-slate-150 dark:border-white/5 bg-white dark:bg-[#151b28]/60 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={handleEvaluate}
                                                    disabled={actionLoading}
                                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg font-black uppercase text-xs tracking-wider flex items-center justify-center"
                                                >
                                                    {actionLoading && <RotateCw className="w-4 h-4 animate-spin mr-2" />}
                                                    Approve & Send Assessment
                                                </Button>

                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => { setIsRequestingRevision(true); setRemarks(""); }}
                                                        className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase"
                                                    >
                                                        Request Revision
                                                    </Button>
                                                    <Button
                                                        onClick={() => { setIsRejecting(true); setRemarks(""); }}
                                                        className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {(transaction.status === "PAID" || transaction.status === "PENDING_PAYMENT_VERIFICATION") && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                    <div className="space-y-3">
                                        {/* Proof of Payment Lightbox */}
                                        {transaction.paymentReference && (
                                            <div className="space-y-3">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Payment Proof Reference</label>
                                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Coins className="text-primary w-4 h-4" />
                                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                                                            Reference No: {additional?.gcashReferenceNo || "N/A"}
                                                        </span>
                                                    </div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="relative aspect-[4/3] rounded-xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 overflow-hidden group cursor-pointer hover:border-primary/50 transition-all select-none">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={transaction.paymentReference}
                                                                    alt="GCash Receipt"
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-all"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                                    <span className="text-[9px] font-black text-white tracking-widest uppercase italic bg-primary px-3 py-1 rounded-full flex items-center gap-1.5">
                                                                        <ExternalLink className="w-3 h-3" /> Zoom Receipt
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </DialogTrigger>
                                                        <LightboxView src={transaction.paymentReference} alt="GCash Receipt" label="GCash Payment Proof" />
                                                    </Dialog>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleConfirmPayment}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all"
                                        >
                                            {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : (transaction.status === "PAID" ? "Confirm & Proceed to Processing" : "Confirm Payment Received")}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            onClick={handleDeclinePaymentProof}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/5 font-black uppercase tracking-wider text-[10px]"
                                        >
                                            Reject Payment (Dispute / Invalid)
                                        </Button>
                                    </div>
                                )}

                                {transaction.status === "FOR_PROCESSING" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN" || rawUserRole === "COURIER") && (() => {
                                    const isReleaseDisabled = actionLoading || (!eCopyFile && !transaction.eCopyUrl);
                                    return (
                                        <div className="space-y-6">
                                            <PrintWaybill
                                                transaction={transaction}
                                                resident={resident}
                                                deliveryAddr={null}
                                                fiscal={null}
                                                branding={branding}
                                                themeColor={themeColor}
                                            />

                                            {/* Digital E-Copy Upload Block */}
                                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">
                                                    Attach Official Digital E-Copy Registry Record <span className="text-rose-500 font-extrabold">*Required</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        setECopyFile(file);
                                                        if (file) {
                                                            const url = URL.createObjectURL(file);
                                                            setECopyPreview(url);
                                                        } else {
                                                            setECopyPreview(null);
                                                        }
                                                    }}
                                                    className="hidden"
                                                    id="treasury-ecopy-upload"
                                                />
                                                <label
                                                    htmlFor="treasury-ecopy-upload"
                                                    className={cn(
                                                        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed transition-all h-44 bg-[#f8fafd] dark:bg-white/5 overflow-hidden relative group cursor-pointer",
                                                        (eCopyFile || transaction.eCopyUrl)
                                                            ? "border-primary/30 bg-primary/5 shadow-inner"
                                                            : "border-slate-200 dark:border-white/10 hover:border-primary/30"
                                                    )}
                                                >
                                                    {(eCopyPreview || transaction.eCopyUrl) ? (
                                                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
                                                            {((eCopyFile && eCopyFile.type.startsWith("image/")) || (!eCopyFile && transaction.eCopyUrl && /\.(png|jpe?g|gif|webp|svg)$/i.test(transaction.eCopyUrl))) ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={eCopyPreview || transaction.eCopyUrl}
                                                                    alt="E-Copy Preview"
                                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity"
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center text-primary/60 group-hover:text-primary transition-colors">
                                                                    <FileText className="w-10 h-10" />
                                                                    <span className="text-[9px] font-black uppercase italic tracking-widest mt-2">PDF Document Ready</span>
                                                                </div>
                                                            )}

                                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                                                                    <Upload className="w-4 h-4" />
                                                                </div>
                                                                <span className="text-[9px] font-black uppercase text-white tracking-widest italic">Update E-Copy Attachment</span>
                                                            </div>

                                                            <div className="absolute bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                        <Check className="w-3 text-primary stroke-[3]" />
                                                                    </div>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                                                        {eCopyFile?.name || "Registry-Record.pdf"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                                                                <Upload className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <div className="text-center space-y-1">
                                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-400 dark:text-slate-500 block">
                                                                    Attach Digital Registry Record
                                                                </span>
                                                                <span className="text-[8px] font-bold text-slate-300 dark:text-slate-600 uppercase italic tracking-tighter">
                                                                    PDF or Image up to 5MB
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </label>
                                            </div>

                                            {transaction.fulfillmentMode === "DELIVERY" && !transaction.waybillPrintedAt && (
                                                <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-start gap-3">
                                                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] font-bold leading-relaxed">
                                                        Print the official shipping waybill before releasing to update the logistics carrier dispatch system.
                                                    </p>
                                                </div>
                                            )}

                                            {(!eCopyFile && !transaction.eCopyUrl) && (
                                                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-600 dark:text-rose-500 flex items-start gap-3">
                                                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                                    <p className="text-[10px] font-bold leading-relaxed">
                                                        You must upload the official digital E-Copy registry record before you can release this document.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                {transaction.fulfillmentMode === "DELIVERY" ? (
                                                    <Button
                                                        onClick={handleRelease}
                                                        disabled={isReleaseDisabled}
                                                        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black italic uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Dispatch to Courier"}
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={handleRelease}
                                                        disabled={isReleaseDisabled}
                                                        className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Release Document to Resident"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {transaction.status === "FOR_CLAIM" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-green-600 dark:text-green-500 flex items-start gap-3">
                                            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                            <p className="text-[10px] font-bold leading-relaxed">
                                                This document is ready for claiming. Once the resident personally claims the physical copy, click below to confirm and mark this request as officially released.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={handleRelease}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Confirm & Release Document"}
                                        </Button>
                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                </div>

            </div>

            <RejectionRevisionControls
                isRejecting={isRejecting}
                setIsRejecting={setIsRejecting}
                isRequestingRevision={isRequestingRevision}
                setIsRequestingRevision={setIsRequestingRevision}
                remarks={remarks}
                setRemarks={setRemarks}
                actionLoading={actionLoading}
                handleReject={handleReject}
                handleRequestRevision={handleRequestRevision}
            />
        </div>
    );
}
