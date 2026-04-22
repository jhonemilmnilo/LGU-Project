"use client"

import React from "react"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserRound, Mail, Phone } from "lucide-react"
import { differenceInYears } from "date-fns"

interface IdentityConfirmationVaultProps {
    resident: any
}

const IdentityConfirmationVault = ({ resident }: IdentityConfirmationVaultProps) => {
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
                    backgroundColor: '#030712'
                }} 
                className="bg-[#030712] border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl border"
            >
                <div className="p-12 space-y-10">
                    <DialogHeader className="space-y-1.5">
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none text-white">
                            Resident <span className="text-primary">Identity</span>
                        </DialogTitle>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] italic opacity-80">Authenticated Citizen Snapshot Data Record.</p>
                    </DialogHeader>

                    <div className="grid grid-cols-12 gap-x-8 gap-y-10">
                        {/* Row 1: Names */}
                        <div className="col-span-3 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">First Name</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                {resident?.firstName || "--"}
                            </div>
                        </div>
                        <div className="col-span-3 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Middle Name</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                {resident?.middleName || "--"}
                            </div>
                        </div>
                        <div className="col-span-3 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Last Name</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                {resident?.lastName || "--"}
                            </div>
                        </div>
                        <div className="col-span-3 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Suffix</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                {resident?.suffix || "--"}
                            </div>
                        </div>

                        {/* Row 2: Details */}
                        <div className="col-span-3 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Birth Date</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                {resident?.dateOfBirth ? new Date(resident.dateOfBirth).toLocaleDateString() : "--"}
                            </div>
                        </div>
                        <div className="col-span-2 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Age</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] text-slate-100">
                                {resident?.age ?? (resident?.dateOfBirth ? differenceInYears(new Date(), new Date(resident.dateOfBirth)) : "--")}
                            </div>
                        </div>
                        <div className="col-span-3 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Civil Status</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] uppercase text-slate-100">
                                {resident?.civilStatus || "--"}
                            </div>
                        </div>
                        <div className="col-span-4 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Citizenship</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] uppercase text-primary">
                                {resident?.citizenship || "Filipino"}
                            </div>
                        </div>

                        {/* Row 3: Contact */}
                        <div className="col-span-6 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] lowercase gap-4 text-slate-100">
                                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                                {resident?.email || "--"}
                            </div>
                        </div>
                        <div className="col-span-6 space-y-3">
                            <label style={{ whiteSpace: 'nowrap' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Contact Number</label>
                            <div className="h-13 flex items-center px-6 bg-white/5 border border-white/10 rounded-[1.25rem] font-bold text-[14px] gap-4 text-slate-100">
                                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                                {resident?.contactNumber || "--"}
                            </div>
                            <p className="text-[9px] font-bold text-slate-600 italic mt-3 ml-1 text-right tracking-widest uppercase opacity-40">System Resident Verification Vault</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default IdentityConfirmationVault
