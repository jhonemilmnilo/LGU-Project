"use client"

import React, { useState } from "react"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserRound, Phone, Building2, MapPin, Hash } from "lucide-react"
import { differenceInYears } from "date-fns"

interface IdentityConfirmationVaultProps {
    resident: any;
    additional?: any;
    isBusinessPermit?: boolean;
    transactionTypeCode?: string;
    themeColor?: string;
}

const IdentityConfirmationVault = ({ resident, additional = {}, isBusinessPermit = false, transactionTypeCode = "", themeColor }: IdentityConfirmationVaultProps) => {
    const [activeTab, setActiveTab] = useState<"citizen" | "business">("citizen");

    const isRenewal = transactionTypeCode === "BUSINESS_PERMIT_RENEW" || 
                      additional?.businessType === "RENEWAL" || 
                      additional?.businessType?.toLowerCase()?.includes("renew");

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 hover:text-primary shadow-sm border border-slate-100 dark:border-white/5">
                    <UserRound className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent 
                style={{ 
                    maxWidth: '1000px', 
                    width: '90vw',
                    backgroundColor: '#030712',
                    "--primary-theme": themeColor || "var(--primary-theme)"
                } as React.CSSProperties} 
                className="bg-[#030712] border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl border"
            >
                <div className="p-12 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/5 pb-6">
                        <DialogHeader className="space-y-1.5">
                            <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white">
                                {isBusinessPermit && activeTab === "business" ? (
                                    <>Business <span className="text-primary">Record</span></>
                                ) : (
                                    <>Resident <span className="text-primary">Identity</span></>
                                )}
                            </DialogTitle>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] italic opacity-80">
                                {isBusinessPermit && activeTab === "business" ? "BPLO Registration Dossier" : "Citizen Data Record"}
                            </p>
                        </DialogHeader>

                        {/* Interactive Tab Toggles (Glass-morphic pills) */}
                        {isBusinessPermit && (
                            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start sm:self-center">
                                <button
                                    onClick={() => setActiveTab("citizen")}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider italic transition-all flex items-center gap-2 ${
                                        activeTab === "citizen"
                                            ? "bg-primary text-white shadow-lg"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <UserRound className="w-3.5 h-3.5" />
                                    Citizen Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab("business")}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider italic transition-all flex items-center gap-2 ${
                                        activeTab === "business"
                                            ? "bg-primary text-white shadow-lg"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    <Building2 className="w-3.5 h-3.5" />
                                    Business Profile
                                </button>
                            </div>
                        )}
                    </div>

                    {activeTab === "citizen" ? (
                        <div className="grid grid-cols-12 gap-x-8 gap-y-8 animate-in fade-in zoom-in-95 duration-200">
                            {/* Row 1: Names */}
                            <div className="col-span-12 md:col-span-3 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">First Name</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.firstName || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-3 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Middle Name</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.middleName || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-3 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Last Name</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.lastName || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-3 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Suffix</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.suffix || "--"}
                                </div>
                            </div>

                            {/* Row 2: Details */}
                            <div className="col-span-12 md:col-span-3 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Birth Date</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString() : "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-2 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Age</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.age ?? (resident?.dateOfBirth ? differenceInYears(new Date(), new Date(resident.dateOfBirth)) : "--")}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-3 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Civil Status</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] uppercase text-slate-100">
                                    {resident?.civilStatus || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Citizenship</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] uppercase text-primary">
                                    {resident?.citizenship || "Filipino"}
                                </div>
                            </div>

                            {/* Row 3: Contact & Occupation */}
                            <div className="col-span-12 md:col-span-6 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Occupation</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {resident?.occupation || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-6 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Contact Number</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] gap-4 text-slate-100">
                                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                                    {resident?.contactNumber || "--"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-x-8 gap-y-8 animate-in fade-in zoom-in-95 duration-200">
                            {/* Business Row 1 - Business Identity */}
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Official Business</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-black uppercase tracking-tight text-[14px] text-primary truncate">
                                    {additional?.businessName || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Trade Signage Name</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100 truncate">
                                    {additional?.tradeName || "Same as Business Name"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Organization Type</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100 uppercase truncate">
                                    {additional?.orgType ? additional.orgType.replace(/_/g, " ") : "--"}
                                </div>
                            </div>

                            {/* Business Row 2 - Location Address */}
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Building / House No. / Unit</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100 truncate">
                                    {additional?.building || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Street Address</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100 truncate">
                                    {additional?.street || "--"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Business Barangay</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] gap-4 text-slate-100 uppercase">
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="truncate">{additional?.businessBarangay || additional?.barangay || resident?.barangay || "--"}</span>
                                </div>
                            </div>

                            {/* Business Row 3 - Category & Registration */}
                            <div className="col-span-12 md:col-span-6 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Line of Business</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100 truncate">
                                    {additional?.lineOfBusiness || "General"}
                                </div>
                            </div>
                            {!isRenewal ? (
                                <div className="col-span-12 md:col-span-6 space-y-3">
                                    <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">DTI / SEC Registration</label>
                                    <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100 truncate">
                                        {additional?.dtiSecNumber || "--"}
                                    </div>
                                </div>
                            ) : (
                                <div className="col-span-12 md:col-span-6 space-y-3 animate-in slide-in-from-right-4 duration-300">
                                    <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Existing Permit No.</label>
                                    <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] gap-3 text-primary">
                                        <Hash className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span className="truncate">{additional?.existingPermitNumber || additional?.existingPermitNo || additional?.permitNumber || "--"}</span>
                                    </div>
                                </div>
                            )}

                            {/* Business Row 4 - Operational Metrics */}
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Employee Count</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {additional?.employeeCount ?? "0"}
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-4 space-y-3">
                                <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Store Area</label>
                                <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                    {additional?.businessArea ? `${additional.businessArea} sqm` : "0 sqm"}
                                </div>
                            </div>
                            {!isRenewal ? (
                                <div className="col-span-12 md:col-span-4 space-y-3">
                                    <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Initial Capitalization</label>
                                    <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-primary">
                                        {additional?.capitalInvestment ? "₱" + Number(additional.capitalInvestment).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "₱0.00"}
                                    </div>
                                </div>
                            ) : (
                                <div className="col-span-12 md:col-span-4 space-y-3">
                                    <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Declared Gross Sales</label>
                                    <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-primary">
                                        {additional?.grossSales ? "₱" + Number(additional.grossSales).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "₱0.00"}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                        <span className="text-[8px] font-black uppercase text-slate-600 tracking-[0.2em] italic">EMAPANDAN INTEGRATED DOSSIER SYSTEM</span>
                        <p className="text-[9px] font-bold text-slate-600 italic tracking-widest uppercase opacity-40">System Resident Verification Vault</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default IdentityConfirmationVault
