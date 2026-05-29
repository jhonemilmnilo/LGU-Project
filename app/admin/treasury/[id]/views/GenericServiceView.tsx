/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    Camera,
    BadgeCheck,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import LightboxView from "../components/LightboxView";
import PrintWaybill from "../components/PrintWaybill";
import ResidentIdentityProfile from "../components/ResidentIdentityProfile";
import TransactionInfoCard from "../components/TransactionInfoCard";
import RejectionRevisionControls from "../components/RejectionRevisionControls";
import { TreasuryViewProps } from "./types";
import { cn } from "@/lib/utils";

export default function GenericServiceView(props: TreasuryViewProps) {
    const {
        transaction,
        userRole,
        isReadOnlyAide,
        backUrl,
        deliveryFee,
        themeColor,
        branding,
        safeFormatDate,
        declaredValue,
        declaredLabel,
        calcResult,
        displayTotal,
        evidenceDocs,
        steps,
        currentStepIdx,
        isRejecting,
        setIsRejecting,
        isRequestingRevision,
        setIsRequestingRevision,
        remarks,
        setRemarks,
        actionLoading,
        handleReject,
        handleRequestRevision,
        handleEvaluate,
        handleConfirmPayment,
        handleDeclinePaymentProof,
        feeLineItems,
        addFeeLineItem,
        removeFeeLineItem,
        updateFeeLineItem
    } = props;

    const isCedula = transaction.type?.code?.includes("CEDULA");
    const canApprove = (transaction.status === "FOR_REQUESTING" || transaction.status === "PAID") && (userRole === "TREASURY_STAFF" || userRole === "ADMIN") && !isReadOnlyAide;
    const [isProfileOpen, setIsProfileOpen] = React.useState(true);
    const [isRequirementsOpen, setIsRequirementsOpen] = React.useState(true);
    const additional = transaction.additionalData || {};
    const resident = transaction.user?.residentProfile || transaction.residentSnapshot || {};
    const deliveryAddr = transaction.deliveryAddress
        ? (typeof transaction.deliveryAddress === 'string' ? JSON.parse(transaction.deliveryAddress) : transaction.deliveryAddress)
        : null;
    const fiscal = (transaction.fiscalSnapshot as any) || null;

    return (
        <div
            className="min-h-screen bg-[#f8fafd] dark:bg-[#0c111d] text-[#0f172a] dark:text-[#f8fafc] pb-20 font-sans transition-colors duration-500"
            style={{ "--theme_color": themeColor, "--primary-theme": themeColor } as React.CSSProperties}
        >
            {/* Minimal Header */}
            <header className="h-16 px-8 flex items-center justify-between border-b border-transparent dark:border-white/5">
                <Link href={backUrl}>
                    <Button variant="ghost" className="gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-primary">
                        <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
                    </Button>
                </Link>
                <Badge variant="outline" className="font-black italic uppercase tracking-widest text-[10px] border-primary/20 text-primary bg-primary/5 px-4 py-1">
                    Type Of Request: {transaction.fulfillmentType?.replace("_", " ") || "Processing"}
                </Badge>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 grid grid-cols-12 gap-8 mt-4">
                {/* LEFT COLUMN: Assessment & Identity */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* TRANSACTION CATEGORY CARD */}
                    <TransactionInfoCard
                        transactionName={transaction.type.name}
                        categoryLabel="General Service"
                        themeColor={themeColor}
                    />

                    {/* MAIN ASSESSMENT CARD */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-6 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-6">
                        {/* IDENTIFIER / ACCORDION HEADER */}
                        <div 
                            className="flex justify-between items-center cursor-pointer select-none"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                                        Primary Applicant Profile
                                    </span>
                                    {transaction.revisionCount > 0 ? (
                                        <Badge className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border border-orange-500/20 text-[9px] font-black italic uppercase tracking-widest px-3 py-0.5 rounded-full">
                                            Revision Count: {transaction.revisionCount}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black italic uppercase tracking-widest px-3 py-0.5 rounded-full">
                                            First Submission
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    {resident.firstName} {resident.lastName}
                                </h1>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary transition-all">
                                {isProfileOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </div>

                        {/* ACCORDION CONTENT */}
                        {isProfileOpen && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                {/* TOP METRICS GRID */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div 
                                        className="bg-[#f8fafd] dark:bg-white/5 p-4 rounded-2xl space-y-1 cursor-help"
                                        title={`₱${declaredValue.toLocaleString()}`}
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{declaredLabel}</span>
                                        <p className="text-xl font-black italic tracking-tighter dark:text-slate-200 truncate">
                                            ₱{declaredValue.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="bg-[#f8fafd] dark:bg-white/5 p-4 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Mode</span>
                                        <p className="text-xl font-black italic tracking-tighter dark:text-slate-200 leading-none truncate">
                                            {transaction.paymentType?.replace(/_/g, " ") || "--"}
                                        </p>
                                    </div>
                                    <div className="bg-[#f8fafd] dark:bg-white/5 p-4 rounded-2xl space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Fulfillment</span>
                                        <p className="text-xl font-black italic tracking-tighter dark:text-slate-200 leading-none truncate">
                                            {transaction.fulfillmentType?.replace(/_/g, " ") || "PICK UP"}
                                        </p>
                                    </div>
                                    <div 
                                        className="bg-[#f8fafd] dark:bg-white/5 p-4 rounded-2xl space-y-1 cursor-help"
                                        title={`₱${calcResult.totalAmount.toLocaleString()}`}
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Total Assessment</span>
                                        <p className="text-xl font-black italic tracking-tighter text-primary truncate">
                                            ₱{calcResult.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* INCOME SOURCE */}
                                {additional.incomeSource && (
                                    <div className="border-t border-dashed border-slate-100 dark:border-white/5 pt-4 space-y-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            Primary Source of Income
                                        </span>
                                        <div className="bg-[#f8fafd] dark:bg-white/5 p-4 rounded-xl flex items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic text-sm select-none">
                                                    {additional.incomeSource.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black italic uppercase tracking-tight text-slate-800 dark:text-white leading-tight">
                                                        {additional.incomeSource === "PROFESSION" ? "Profession" : additional.incomeSource === "BUSINESS" ? "Business" : "Real Property"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* COMPUTATION BREAKDOWN */}
                                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        Tax Computation Breakdown
                                    </h3>
                                    <div className="space-y-3">
                                        {/* Basic community tax or service fee */}
                                        {calcResult.basicTax > 0 && (
                                            <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                <span>{isCedula ? "Basic Community Tax" : "Base Service Fee"}</span>
                                                <span className="dark:text-slate-200">₱{calcResult.basicTax.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* Additional community tax (for Cedula only) */}
                                        {isCedula && calcResult.additionalTax > 0 && (
                                            <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                <span>Additional Tax (₱1.00 per ₱1,000 gross)</span>
                                                <span className="dark:text-slate-200">₱{calcResult.additionalTax.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* Miscellaneous fee (e.g. Late Registration Fee) */}
                                        {calcResult.miscFee && calcResult.miscFee > 0 && (
                                            <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                <span>Late Registration Fee</span>
                                                <span className="dark:text-slate-200">₱{calcResult.miscFee.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* FIXED TAX LINE ITEMS / ADDITIONAL FEES — rendered if they exist */}
                                        {calcResult.lineItems && calcResult.lineItems.length > 0 && (
                                            calcResult.lineItems.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                                    <span>{item.label}</span>
                                                    <span className="dark:text-slate-200">₱{(Number(item.amount) || 0).toFixed(2)}</span>
                                                </div>
                                            ))
                                        )}

                                        {/* PENALTY CHARGE — always visible if applicable */}
                                        {calcResult.penalty > 0 && (
                                            <div className="flex justify-between items-center text-sm font-bold text-orange-500 italic">
                                                <span>Penalty Charge</span>
                                                <span>₱{calcResult.penalty.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {/* ADDITIONAL FEES EDITOR — Treasury Staff / Admin only when FOR_REQUESTING */}
                                        {(transaction.status === "FOR_REQUESTING" && (userRole === "TREASURY_STAFF" || userRole === "ADMIN")) && (
                                            <div className="pt-2 space-y-2">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    Additional Fees
                                                </p>
                                                <div className="bg-slate-50 dark:bg-white/[0.01] border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-3">
                                                    {feeLineItems.map((item, idx) => (
                                                        <div key={idx} className="flex gap-3 items-center group bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 px-3 py-1.5 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                                            <span className="text-[9px] font-mono font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 w-6 h-6 flex items-center justify-center rounded-lg select-none shrink-0">
                                                                {String(idx + 1).padStart(2, '0')}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                placeholder="Fee Description"
                                                                value={item.label}
                                                                onChange={(e) => updateFeeLineItem(idx, 'label', e.target.value)}
                                                                className="flex-1 h-9 bg-transparent text-sm font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0"
                                                            />
                                                            <div className="relative w-28 shrink-0 flex items-center border-l border-slate-100 dark:border-white/5 pl-3">
                                                                <span className="text-xs font-black text-slate-400 mr-1 select-none">₱</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0.00"
                                                                    value={item.amount}
                                                                    onChange={(e) => updateFeeLineItem(idx, 'amount', e.target.value)}
                                                                    className="w-full bg-transparent text-sm font-black text-right text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none border-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                            </div>
                                                            {feeLineItems.length > 1 ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeFeeLineItem(idx)}
                                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0 md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            ) : (
                                                                <div className="w-8 h-8 shrink-0" />
                                                            )}
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={addFeeLineItem}
                                                        className="h-10 px-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 font-black italic text-[10px] tracking-widest gap-2 text-slate-400 hover:text-primary hover:border-primary/50 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all w-full mt-1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> ADD FEE LINE ITEM
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* DELIVERY FEE — always visible if applicable */}
                                        {transaction.fulfillmentType === "DELIVERY" && (
                                            <div className="flex justify-between items-center pt-2 gap-4">
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">Delivery Fee</span>
                                                <span className="text-xs font-black dark:text-white italic">
                                                    ₱{deliveryFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        )}

                                        {/* TOTAL AMOUNT DUE */}
                                        <div className="border-t border-dotted border-slate-300 dark:border-white/10 pt-4 mt-4 flex justify-between items-center">
                                            <span className="text-base font-black uppercase italic tracking-widest text-slate-900 dark:text-white leading-none">Total Amount Due</span>
                                            <span className="text-3xl font-black italic tracking-tighter text-primary leading-none">
                                                ₱{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESIDENT IDENTITY PROFILE ACCORDION */}
                    <ResidentIdentityProfile
                        resident={resident}
                        safeFormatDate={safeFormatDate}
                        themeColor={themeColor}
                    />

                    {/* EVIDENCE VAULT */}
                    <div className="bg-white dark:bg-[#151b28] p-10 rounded-[2.5rem] border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-6">
                        <div 
                            className="flex justify-between items-center cursor-pointer select-none"
                            onClick={() => setIsRequirementsOpen(!isRequirementsOpen)}
                        >
                            <div className="flex items-center gap-2">
                                <BadgeCheck className="w-5 h-5 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">All Requirments</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-primary transition-all">
                                {isRequirementsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </div>
                        {isRequirementsOpen && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {evidenceDocs.map((doc, idx) => (
                                    <Dialog key={idx}>
                                        <DialogTrigger asChild>
                                            <div className="relative aspect-[4/3] rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 overflow-hidden group cursor-pointer hover:border-primary/50 transition-all select-none">
                                                {doc.url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-1.5 p-4">
                                                        <span className="text-xl">📁</span>
                                                        <span className="text-[8px] font-black uppercase text-center tracking-widest leading-none">{doc.label}</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <span className="text-[9px] font-black text-white tracking-widest uppercase italic bg-primary px-3 py-1 rounded-full">Zoom View</span>
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        {doc.url && <LightboxView src={doc.url} alt={doc.label} label={doc.label} />}
                                    </Dialog>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Timeline & Logistics — sticky */}
                <div className="col-span-12 lg:col-span-4 space-y-8 lg:sticky lg:top-8 lg:self-start">
                    {/* STATUS TRACKING TIMELINE */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2.5rem] p-10 border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 block italic leading-none">Status Tracking</span>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mt-1 leading-none">Timeline</h2>
                        </div>

                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-white/5 space-y-8">
                            {steps.map((step, idx) => {
                                const isCompleted = idx < currentStepIdx;
                                const isActive = idx === currentStepIdx;
                                return (
                                    <div key={step.id} className="relative">
                                        <div className={cn(
                                            "absolute w-4 h-4 rounded-full -left-[33px] border-4 transition-all duration-500 flex items-center justify-center text-[6px]",
                                            isActive
                                                ? "bg-primary border-white dark:border-[#151b28] ring-4 ring-primary/20 scale-110"
                                                : isCompleted
                                                    ? "bg-emerald-500 border-white dark:border-[#151b28] scale-100"
                                                    : "bg-slate-200 dark:bg-slate-800 border-white dark:border-[#151b28] scale-95"
                                        )} />
                                        <div className="space-y-1">
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                isActive ? "text-primary" : isCompleted ? "text-emerald-500" : "text-slate-400 dark:text-slate-600"
                                            )}>
                                                {step.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ACTION BUTTONS — below the card, no card wrapper */}
                    {canApprove && (
                        <div className="space-y-3">
                            {/* APPROVE — full width */}
                            <Button
                                onClick={transaction.status === "PAID" ? handleConfirmPayment : handleEvaluate}
                                disabled={actionLoading}
                                className="w-full h-14 bg-primary hover:opacity-90 text-white font-black italic uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                            >
                                {actionLoading ? "Processing..." : transaction.status === "PAID" ? "Approve Payment & Start Processing" : "Approve & Proceed to Payment"}
                            </Button>

                            {/* REVISION + REJECT — side by side */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => {
                                        setRemarks("");
                                        if (transaction.status !== "PAID") setIsRequestingRevision(true);
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white font-black italic uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-amber-500/10 active:scale-95 transition-all"
                                >
                                    {transaction.status === "PAID" ? "Decline Payment Proof" : "Request Revision"}
                                </Button>
                                <Button
                                    onClick={() => { setRemarks(""); setIsRejecting(true); }}
                                    disabled={actionLoading}
                                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-black italic uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-red-600/10 active:scale-95 transition-all"
                                >
                                    Decline
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* WAYBILL FOR DELIVERIES */}
                    {transaction.fulfillmentMode === "DELIVERY" && (
                        <div className="bg-white dark:bg-[#151b28] p-10 rounded-[2.5rem] border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-6">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 block italic leading-none">Logistics</span>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mt-1 leading-none">Delivery Details</h2>
                            </div>
                            <PrintWaybill
                                transaction={transaction}
                                resident={resident}
                                deliveryAddr={deliveryAddr}
                                fiscal={fiscal}
                                branding={branding}
                                themeColor={themeColor}
                            />
                        </div>
                    )}
                </div>
            </main>

            {/* Modals for Rejection & Revision */}
            <RejectionRevisionControls
                isRejecting={isRejecting}
                setIsRejecting={setIsRejecting}
                isRequestingRevision={isRequestingRevision}
                setIsRequestingRevision={setIsRequestingRevision}
                remarks={remarks}
                setRemarks={setRemarks}
                actionLoading={actionLoading}
                handleReject={handleReject}
                handleRequestRevision={transaction.status === "PAID" ? handleDeclinePaymentProof : handleRequestRevision}
            />
        </div>
    );
}
