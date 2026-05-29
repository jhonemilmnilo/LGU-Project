/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    Camera,
    BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import LightboxView from "../components/LightboxView";
import PrintWaybill from "../components/PrintWaybill";
import { TreasuryViewProps } from "./types";
import { cn } from "@/lib/utils";

export default function GenericServiceView({
    transaction,
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
    currentStepIdx
}: TreasuryViewProps) {
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
                    {/* MAIN ASSESSMENT CARD */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2rem] p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-12">
                        {/* IDENTIFIER */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                                        Primary Applicant Profile
                                    </span>
                                </div>
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#1e293b] dark:text-white leading-none">
                                    {resident.firstName} {resident.lastName}
                                </h1>
                            </div>
                        </div>

                        {/* TOP METRICS GRID */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{declaredLabel}</span>
                                <p className="text-2xl font-black italic tracking-tighter dark:text-slate-200">₱{declaredValue.toLocaleString()}</p>
                            </div>
                            <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Payment Mode</span>
                                <p className="text-2xl font-black italic tracking-tighter dark:text-slate-200 leading-none">
                                    {transaction.paymentType?.replace(/_/g, " ") || "--"}
                                </p>
                            </div>
                            <div className="bg-[#f8fafd] dark:bg-white/5 p-8 rounded-3xl space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Total Assessment</span>
                                <p className="text-2xl font-black italic tracking-tighter text-primary">₱{calcResult.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* INCOME SOURCE */}
                        {additional.incomeSource && (
                            <div className="border-t border-dashed border-slate-100 dark:border-white/5 pt-6 space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Primary Source of Income
                                </span>
                                <div className="bg-[#f8fafd] dark:bg-white/5 p-6 rounded-2xl flex items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic text-base select-none">
                                            {additional.incomeSource.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-base font-black italic uppercase tracking-tight text-slate-800 dark:text-white leading-tight">
                                                {additional.incomeSource === "PROFESSION" ? "Profession" : additional.incomeSource === "BUSINESS" ? "Business" : "Real Property"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* COMPUTATION BREAKDOWN */}
                        <div className="space-y-6 pt-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Tax Computation Breakdown
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                    <span>Basic Community Tax</span>
                                    <span className="dark:text-slate-200">₱{calcResult.basicTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold text-slate-600 dark:text-slate-400 italic">
                                    <span>Additional Tax (₱1.00 per ₱1,000 gross)</span>
                                    <span className="dark:text-slate-200">₱{calcResult.additionalTax.toFixed(2)}</span>
                                </div>
                                {calcResult.penalty > 0 && (
                                    <div className="flex justify-between items-center text-sm font-bold text-orange-500 italic">
                                        <span>Penalty Charge</span>
                                        <span>₱{calcResult.penalty.toFixed(2)}</span>
                                    </div>
                                )}
                                {transaction.fulfillmentType === "DELIVERY" && (
                                    <div className="flex justify-between items-center pt-2 gap-4">
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 italic">Delivery Fee</span>
                                        <span className="text-xs font-black dark:text-white italic">
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
                    </div>

                    {/* IDENTITY DOSSIER (CITIZEN ONLY) */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2.5rem] p-12 shadow-[0_2px_40px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                                <Camera className="w-5 h-5" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 italic">Identity Dossier</h3>
                        </div>

                        {/* Citizen Profile */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">First Name</span>
                                <p className="text-base font-black italic uppercase text-slate-800 dark:text-slate-200">{resident.firstName}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Middle Name</span>
                                <p className="text-base font-black italic uppercase text-slate-800 dark:text-slate-200">{resident.middleName || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Last Name</span>
                                <p className="text-base font-black italic uppercase text-slate-800 dark:text-slate-200">{resident.lastName}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-8 pt-4 border-t border-slate-100 dark:border-white/5">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Gender</span>
                                <p className="text-base font-black italic uppercase text-slate-800 dark:text-slate-200">{resident.gender || "—"}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date of Birth</span>
                                <p className="text-base font-black italic uppercase text-slate-800 dark:text-slate-200">{safeFormatDate(resident.dateOfBirth)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Civil Status</span>
                                <p className="text-base font-black italic uppercase text-slate-800 dark:text-slate-200">{resident.civilStatus || "—"}</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Registered Residential Address</span>
                            <p className="text-md font-black italic uppercase text-slate-800 dark:text-slate-200">
                                {resident.houseNumber && `${resident.houseNumber}, `}
                                {resident.street && `${resident.street} `}
                                {resident.sitio && `Sitio ${resident.sitio}, `}
                                {resident.purok && `Purok ${resident.purok}, `}
                                Barangay {resident.barangay}, {resident.municipality || "Mapandan"}, {resident.province || "Pangasinan"}
                            </p>
                        </div>
                    </div>

                    {/* EVIDENCE VAULT */}
                    <div className="bg-white dark:bg-[#151b28] p-10 rounded-[2.5rem] border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-6">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Documentary Requirements Vault</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                    </div>
                </div>

                {/* RIGHT COLUMN: Timeline & Logistics */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* WORKFLOW TRACKING TIMELINE */}
                    <div className="bg-white dark:bg-[#151b28] rounded-[2.5rem] p-10 border border-slate-50 dark:border-white/5 shadow-2xl shadow-slate-900/5 space-y-8">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 block italic leading-none">Workflow Tracking</span>
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
        </div>
    );
}
