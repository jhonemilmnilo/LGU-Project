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
    ExternalLink
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
        branding
    } = props;

    const resident = transaction.resident;
    const additional = transaction.additionalData || {};

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
                        Back to Ledger
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
                                        {resident ? `${resident.firstName} ${resident.middleName ? resident.middleName + ' ' : ''}${resident.lastName}` : "--"}
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
                                                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 italic">Prisma Document Attachment</p>
                                            </div>
                                        </div>

                                        {doc.url ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <LightboxView src={doc.url} alt={doc.label} label={doc.label} />
                                            </Dialog>
                                        ) : (
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider italic">Pending Attachment</span>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                                        <span className="text-sm font-black text-amber-600 italic">₱300.00</span>
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
                        {(!isReadOnlyAide || transaction.status === "PENDING_RELEASE") && (
                            <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-10 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-6">
                                <div>
                                    <h3 className="text-md font-black italic uppercase tracking-wider text-slate-800 dark:text-slate-200">Evaluation Hub</h3>
                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic mt-1">Actions & Endorsements</p>
                                </div>

                                {transaction.status === "UNDER_REVIEW" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleEvaluate}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black italic uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Approve & Send Assessment"}
                                        </Button>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsRequestingRevision(true)}
                                                className="flex-1 h-11 border-dashed rounded-xl font-bold text-[10px] uppercase tracking-wider text-amber-500 hover:text-amber-600 transition-colors"
                                            >
                                                Request Revision
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsRejecting(true)}
                                                className="flex-1 h-11 border-dashed rounded-xl font-bold text-[10px] uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                Reject Application
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {transaction.status === "PENDING_PAYMENT_VERIFICATION" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                    <div className="space-y-4">
                                        {/* Proof of Payment Lightbox */}
                                        {transaction.paymentProofUrl && (
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Payment Proof Reference</label>
                                                <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Coins className="text-primary w-4 h-4" />
                                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">Reference: {transaction.paymentReference || "N/A"}</span>
                                                    </div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                                                                <ExternalLink className="w-3.5 h-3.5 text-primary" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <LightboxView src={transaction.paymentProofUrl} alt="GCash Receipt" label="GCash Payment Proof" />
                                                    </Dialog>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleConfirmPayment}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all"
                                        >
                                            {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Confirm Payment Received"}
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

                                {transaction.status === "PENDING_RELEASE" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN" || rawUserRole === "COURIER") && (
                                    <div className="space-y-6">
                                        <PrintWaybill 
                                            transaction={transaction} 
                                            resident={resident} 
                                            deliveryAddr={null} 
                                            fiscal={null} 
                                            branding={branding} 
                                            themeColor={themeColor} 
                                        />

                                        {transaction.fulfillmentMode === "DELIVERY" && !transaction.waybillPrintedAt && (
                                            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-600 dark:text-amber-500 flex items-start gap-3">
                                                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                                                <p className="text-[10px] font-bold leading-relaxed">
                                                    Print the official shipping waybill before releasing to update the logistics carrier dispatch system.
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                            {transaction.fulfillmentMode === "DELIVERY" ? (
                                                <Button
                                                    onClick={handleRelease}
                                                    disabled={actionLoading}
                                                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black italic uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Dispatch to Courier"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleRelease}
                                                    disabled={actionLoading}
                                                    className="w-full h-12 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-wider shadow-lg shadow-green-500/20 transition-all"
                                                >
                                                    {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Release Document to Resident"}
                                                </Button>
                                            )}
                                        </div>
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
