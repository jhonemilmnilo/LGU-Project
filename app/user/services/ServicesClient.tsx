"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    ArrowRight,
    Sparkles, 
    Building2, 
    Info, 
    ShieldCheck, 
    Coins, 
    ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface TransactionType {
    id: string;
    code: string;
    name: string;
    description: string | null;
    category: string | null;
    level: number;
    baseFee: number;
    deliveryFee: number;
    requiredDocs: any;
}

interface ServicesClientProps {
    initialServices: TransactionType[];
    themeColor: string;
}

export default function ServicesClient({ initialServices: _initialServices, themeColor }: ServicesClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedCode, setExpandedCode] = useState<string | null>("CEDULA");

    // Static list of premium high-level service gateways
    const servicesData = [
        {
            title: "Community Tax Certificate",
            code: "CEDULA",
            alias: "Cedula (CTC) Portal",
            category: "TREASURER",
            department: "Municipal Treasurer Office",
            description: "Secure your official Community Tax Certificate (CTC) online for personal clearance or corporate registration with dynamic municipal rate assessment.",
            link: "/user/services/cedula",
            requirements: [
                "Valid Government ID (e.g. UMID, Driver's License)",
                "Proof of Annual Income (e.g. Payslip, BIR 2316, or Income Declaration)"
            ],
            icon: Coins,
            accentBg: "bg-blue-500/10 dark:bg-blue-500/5",
            borderColor: "border-blue-500/10 dark:border-blue-500/5",
            hoverAccent: "group-hover:border-blue-500/30 dark:group-hover:border-blue-500/20",
            buttonShadow: "shadow-blue-500/10"
        },
        {
            title: "Business Permit & Licensing",
            code: "BUSINESS_PERMIT",
            alias: "BPLO Operations Gate",
            category: "BPLO",
            department: "Business Permits & Licensing Office",
            description: "Apply for a new municipal business permit or renew your existing enterprise operation license online with digital checklist validation.",
            link: "/user/services/business-permit",
            requirements: [
                "Unified Application Form",
                "Community Tax Certificate (Cedula)",
                "DTI / SEC / CDA Registry Copy",
                "Barangay Business Clearance",
                "Location Photograph",
                "Sanitary Permit",
                "Fire Safety Inspection Certificate",
                "BIR Certificate of Registration (COR - Optional)"
            ],
            icon: Building2,
            accentBg: "bg-emerald-500/10 dark:bg-emerald-500/5",
            borderColor: "border-emerald-500/10 dark:border-emerald-500/5",
            hoverAccent: "group-hover:border-emerald-500/30 dark:group-hover:border-emerald-500/20",
            buttonShadow: "shadow-emerald-500/10"
        }
    ];

    // Filter services based on search query
    const filteredServices = servicesData.filter(service => {
        return (
            service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.department.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const toggleAccordion = (code: string) => {
        setExpandedCode(expandedCode === code ? null : code);
    };

    return (
        <div className="space-y-8 md:space-y-10">
            {/* Elegant Floating Glass Breadcrumbs */}
            <div className="flex items-center justify-between">
                <Breadcrumb className="bg-white/60 dark:bg-white/[0.02] backdrop-blur-md px-6 py-3 rounded-full border border-slate-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.02)]">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="font-bold uppercase tracking-widest text-[8px] md:text-[9px] hover:text-primary transition-colors italic">Home</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="opacity-40" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-black uppercase tracking-widest text-[8px] md:text-[9px] text-slate-400 italic">Services Portal</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Premium Header/Banner with Ambient Gradient Backdrop */}
            <div className="relative overflow-hidden bg-slate-900 dark:bg-[#0c1017] p-8 md:p-14 rounded-[2.5rem] md:rounded-[3rem] border border-slate-800 dark:border-white/5 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div 
                    className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full opacity-20 pointer-events-none -mr-40 -mt-40 transition-colors duration-700" 
                    style={{ backgroundColor: themeColor }}
                />
                
                <div className="space-y-3 md:space-y-4 max-w-2xl relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70 italic">EMapandan Citizen Suite</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                        Municipal <span style={{ color: themeColor }}>Services</span>
                    </h1>
                    
                    <p className="text-slate-300 font-medium text-xs md:text-sm leading-relaxed max-w-xl italic">
                        Access official municipality gateways. Expand service items below to view requirements and file your digital applications securely.
                    </p>
                </div>

                <div className="hidden lg:block relative z-10">
                    <div className="w-36 h-36 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 shadow-2xl relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundImage: `linear-gradient(to top right, ${themeColor}, transparent)` }} />
                        <ShieldCheck className="w-10 h-10 mb-2 opacity-80" style={{ color: themeColor }} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">Secured Gateways</p>
                    </div>
                </div>
            </div>

            {/* Compact Search Bar Row */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
                <div className="relative flex-1 max-w-md group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search service portals, requirements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/10 transition-all shadow-[0_10px_30px_-15px_rgba(0,0,0,0.03)]"
                    />
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                    {filteredServices.length} portals available
                </div>
            </div>

            {/* Accordion Container List */}
            <div className="space-y-4 max-w-4xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {filteredServices.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-16 text-center bg-slate-50 dark:bg-white/[0.01] rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/5"
                        >
                            <Info className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">No Matching Services</h3>
                            <p className="text-slate-500 font-medium text-xs mt-1 italic">Try adjusting your keywords or lookups.</p>
                        </motion.div>
                    ) : (
                        filteredServices.map((service, idx) => {
                            const Icon = service.icon;
                            const isExpanded = expandedCode === service.code;

                            return (
                                <motion.div
                                    key={service.code}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className={`group bg-white dark:bg-[#0c1017] rounded-3xl border ${isExpanded ? "border-slate-300 dark:border-white/10 shadow-[0_15px_45px_-15px_rgba(0,0,0,0.03)]" : "border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"} transition-all duration-300 overflow-hidden`}
                                >
                                    {/* Accordion Header */}
                                    <button
                                        onClick={() => toggleAccordion(service.code)}
                                        className="w-full p-6 md:p-8 flex items-center justify-between text-left gap-6 focus:outline-none"
                                    >
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <div className={`w-11 h-11 ${service.accentBg} border ${service.borderColor} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                                <Icon className="w-5 h-5" style={{ color: themeColor }} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic block leading-none">{service.department}</span>
                                                <h3 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">
                                                    {service.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </motion.div>
                                    </button>

                                    {/* Accordion Content Panel */}
                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.005]"
                                            >
                                                <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                                                    {/* Description */}
                                                    <p className="text-xs font-semibold italic leading-relaxed text-slate-500 dark:text-slate-400">
                                                        {service.description}
                                                    </p>

                                                    {/* Documents checklist */}
                                                    <div className="space-y-3">
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 italic block leading-none">Required Files Checklist</span>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                                            {service.requirements.map((req, i) => (
                                                                <div key={i} className="flex items-center gap-3">
                                                                    <div className="w-4 h-4 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeColor }} /></div>
                                                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 italic truncate leading-snug">{req}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Footer button row */}
                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">verified digital gateway</span>
                                                        </div>

                                                        <Button asChild className={`h-10 px-5 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all active:scale-95 shadow-md ${service.buttonShadow} gap-2`} style={{ backgroundColor: themeColor }}>
                                                            <Link href={service.link}>
                                                                Filing Portal
                                                                <ArrowRight className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
