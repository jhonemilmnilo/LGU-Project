/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dispatch, SetStateAction } from "react";
import { TreasuryViewProps } from "./types";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
    ArrowLeft,
    Check,
    Coins,
    FileText,
    Hash,
    Plus,
    AlertCircle,
    RotateCw,
    ExternalLink,
    Ban,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import LightboxView from "../components/LightboxView";
import PrintWaybill from "../components/PrintWaybill";
import ResidentIdentityProfile from "../components/ResidentIdentityProfile";
import TransactionInfoCard from "../components/TransactionInfoCard";
import RejectionRevisionControls from "../components/RejectionRevisionControls";
import { cn } from "@/lib/utils";

export default function BuildingPermitView(props: TreasuryViewProps) {
    const {
        transaction,
        session,
        userRole,
        rawUserRole,
        isTreasuryStaff,
        isBPLOAdmin,
        isReadOnlyAide,
        backUrl,
        actionLoading,
        remarks,
        setRemarks,
        ctcNumber,
        setCtcNumber,
        stickerNumber,
        setStickerNumber,
        isRejecting,
        setIsRejecting,
        isRequestingRevision,
        setIsRequestingRevision,
        deliveryFee,
        setDeliveryFee,
        eCopyFile,
        setECopyFile,
        eCopyPreview,
        setECopyPreview,
        orFile,
        setOrFile,
        orPreview,
        setOrPreview,
        themeColor,
        branding,
        additionalFeeLabel,
        setAdditionalFeeLabel,
        additionalFeeAmount,
        setAdditionalFeeAmount,
        showAdditionalFeeForm,
        setShowAdditionalFeeForm,
        isResolvingDispute,
        setIsResolvingDispute,
        disputeModalOpen,
        setDisputeModalOpen,
        disputeAction,
        setDisputeAction,
        showPreviousPhases,
        setShowPreviousPhases,
        feeLineItems,
        setFeeLineItems,
        fetchTransaction,
        handleEvaluate,
        handleConfirmPayment,
        handleDeclinePaymentProof,
        handlePrintWaybill,
        handleRelease,
        handleResolveDispute,
        handleAddAdditionalFee,
        handleRemoveAdditionalFee,
        handleApproveBilling,
        handleReject,
        handleRequestRevision,
        safeFormatDate,
        displayTotal,
        evidenceDocs,
        steps,
        currentStepIdx,
        hasVerification,
        hasDispute,
        isRequirementsAlone
    } = props;

    const resident = transaction.resident;
    const additional = transaction.additionalData || {};

    const totalEndorsedAmount =
        (additional.feeAssessment?.buildingPermitFee || 0) +
        (additional.feeAssessment?.electricalPermitFee || 0) +
        (additional.feeAssessment?.sanitaryPermitFee || 0) +
        (additional.feeAssessment?.municipalCharges || 0) +
        (additional.feeAssessment?.additionalFees || []).reduce(
            (sum: number, f: any) => sum + Number(f.amount || 0),
            0
        );

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
                            categoryLabel="Building Permit" 
                            themeColor={themeColor} 
                        />

                        {/* RESIDENT IDENTITY PROFILE ACCORDION */}
                        <ResidentIdentityProfile 
                            resident={resident} 
                            safeFormatDate={props.safeFormatDate} 
                            themeColor={themeColor} 
                        />
                        
                        {/* Q&A Block */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    Application <span className="text-primary">Details</span>
                                </h2>
                                <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] italic mt-2">
                                    Building Permit Questionnaire
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Description of Work</label>
                                    <div className="p-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 min-h-[48px]">
                                        {additional?.descriptionOfWork || "--"}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Occupancy Use</label>
                                    <div className="p-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100 min-h-[48px]">
                                        {additional?.occupancyUse || "--"}
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Estimated Cost</label>
                                    <div className="p-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-black text-sm text-primary min-h-[48px]">
                                        ₱{Number(additional?.estimatedCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FEES SET BY ENGINEER */}
                        <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-8 md:p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-8 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Coins className="text-primary w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            Endorsed Fees Set by Engineer
                                        </span>
                                    </div>
                                </div>

                                {/* Add Fee Button */}
                                {!showAdditionalFeeForm && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && transaction.status === "EVALUATED" && (
                                    <Button
                                        onClick={() => setShowAdditionalFeeForm(true)}
                                        size="sm"
                                        className="h-9 gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Additional Fee
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Building Permit Fee</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                        ₱{Number(additional?.feeAssessment?.buildingPermitFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Electrical Permit Fee</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                        ₱{Number(additional?.feeAssessment?.electricalPermitFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Sanitary Permit Fee</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                        ₱{Number(additional?.feeAssessment?.sanitaryPermitFee || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Other Applicable Municipal Charges</label>
                                    <div className="h-12 flex items-center px-5 bg-[#f8fafd] dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-100">
                                        ₱{Number(additional?.feeAssessment?.municipalCharges || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            {/* ADDITIONAL TREASURY FEES LIST */}
                            {additional?.feeAssessment?.additionalFees && additional.feeAssessment.additionalFees.length > 0 && (
                                <div className="space-y-4 pt-6 border-t border-dashed border-slate-100 dark:border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic">
                                        Additional Treasury Charges
                                    </span>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {additional.feeAssessment.additionalFees.map((fee: any, idx: number) => (
                                            <div key={idx} className="space-y-2 relative group">
                                                <div className="flex justify-between items-center ml-1">
                                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{fee.label}</label>
                                                    {transaction.status === "EVALUATED" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                                        <button
                                                            onClick={() => handleRemoveAdditionalFee(idx)}
                                                            disabled={actionLoading}
                                                            className="text-xs font-black text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-wider text-[8px]"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="h-12 flex items-center px-5 bg-amber-500/5 border border-amber-500/10 rounded-xl font-black text-sm text-amber-500">
                                                    ₱{Number(fee.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ADD ADDITIONAL FEE INLINE FORM */}
                            {showAdditionalFeeForm && (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-4 animate-in slide-in-from-top-4 duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Create New Additional Charge</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Fee Type / Description</Label>
                                            <Input
                                                type="text"
                                                placeholder="e.g., Penalty, Zoning Fee, Convenience Charge..."
                                                value={additionalFeeLabel}
                                                onChange={(e) => setAdditionalFeeLabel(e.target.value)}
                                                className="h-11 rounded-xl text-slate-800 font-bold dark:text-slate-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Amount (₱)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={additionalFeeAmount}
                                                onChange={(e) => setAdditionalFeeAmount(e.target.value)}
                                                className="h-11 rounded-xl text-slate-800 font-black dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowAdditionalFeeForm(false)}
                                            className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAddAdditionalFee}
                                            disabled={actionLoading}
                                            className="h-9 px-4 rounded-xl bg-primary text-white font-black italic uppercase tracking-wider text-[10px] shadow-lg shadow-primary/20"
                                        >
                                            Save Additional Charge
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* TOTAL AMOUNT BLOCK */}
                            <div className="pt-6 border-t border-dashed border-slate-100 dark:border-white/5 flex justify-between items-center">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Endorsed Amount</span>
                                <span className="text-xl font-black italic text-primary">
                                    ₱{Number(totalEndorsedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
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

                                {transaction.status === "EVALUATED" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                                Review the building permit details and the endorsed fees set by the engineer. You can add additional treasury charges if needed before endorsing this billing statement to the resident.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleApproveBilling}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black italic uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Approve & Send Billing Statement"}
                                        </Button>
                                    </div>
                                )}

                                {transaction.status === "UNDER_REVIEW" && (rawUserRole === "TREASURY_STAFF" || rawUserRole === "ADMIN") && (
                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleEvaluate}
                                            disabled={actionLoading}
                                            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-black italic uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {actionLoading ? <RotateCw className="w-4 h-4 animate-spin" /> : "Endorse to Assessment"}
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
                                            fiscal={additional.feeAssessment} 
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
