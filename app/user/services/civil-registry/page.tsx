"use client";

import React from "react";
import {
    Baby,
    Skull,
    Heart,
    FileText,
    ArrowRight,
    Sparkles,
    Home
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getSystemSettingAction } from "@/app/admin/transactions/actions";

const REGISTRY_TYPES = [
    {
        id: "BIRTH_REQ",
        label: "Birth Certificate Request (True Copy)",
        icon: FileText,
        description: "Request a certified true copy of an existing birth certificate.",
        color: "blue",
        requirements: ["Valid ID of Applicant (Owner/Immediate Family)", "Authorization Letter (if not owner)"],
        href: "/user/services/civil-registry/birth-certificate-request",
        available: true
    },
    {
        id: "BIRTH_REG",
        label: "Birth Registration",
        icon: Baby,
        description: "Register a new birth record (timely or late registration).",
        color: "blue",
        requirements: [
            "Accomplished Municipal Form 102 (from Midwife/Hospital)",
            "Marriage Certificate of Parents (if married)",
            "Community Tax Certificate (if unmarried for Acknowledgment)",
            "PSA Negative Certification (for Late Registration)",
            "Affidavit of Delayed Registration (for Late Registration)"
        ],
        href: "/user/services/civil-registry/birth-registration",
        available: true
    },
    {
        id: "DEATH_REQ",
        label: "Death Certificate Request (True Copy)",
        icon: FileText,
        description: "Request a certified true copy of an existing death certificate.",
        color: "slate",
        requirements: ["Valid ID of Applicant (Immediate Family)", "Authorization Letter (if not immediate family)"],
        href: "/user/services/civil-registry/death-certificate-request",
        available: true
    },
    {
        id: "DEATH",
        label: "Death Registration",
        icon: Skull,
        description: "Register a Death or Request a Certified Death Certificate.",
        color: "slate",
        requirements: [
            "Certificate of Death (issued by Hospital/MCR)",
            "Burial/Transfer Permit",
            "PSA Negative Certification (for Late Registration)",
            "Affidavit of Delay (for Late Registration)"
        ],
        href: "/user/services/civil-registry/death-registration",
        available: true
    },
    {
        id: "MARRIAGE_REQ",
        label: "Marriage Certificate Request (True Copy)",
        icon: FileText,
        description: "Request a certified true copy of an existing marriage certificate.",
        color: "rose",
        requirements: ["Valid ID of Applicant (Spouse/Immediate Family)", "Authorization Letter (if not spouse)"],
        href: "/user/services/civil-registry/marriage-certificate-request",
        available: true
    },
    {
        id: "MARRIAGE",
        label: "Marriage Registration",
        icon: Heart,
        description: "Request a certified copy of a Marriage Certificate.",
        color: "rose",
        requirements: [
            "Accomplished Certificate of Marriage",
            "PSA Negative Certification (for Late Registration)",
            "Affidavit of Delayed Registration (for Late Registration)",
            "Certified Copy of Marriage License"
        ],
        href: "/user/services/civil-registry/marriage-registration",
        available: true
    },
    {
        id: "MARRIAGE_LICENSE",
        label: "Marriage License Application",
        icon: FileText,
        description: "Apply for a legal license to be married in the Philippines.",
        color: "amber",
        requirements: [
            "Municipal Form No. 90",
            "Community Tax Certificate",
            "CENOMAR (from PSA)",
            "Birth Certificates (from PSA)",
            "Parental Consent/Advice (for 18-21 and 22-25)",
            "Certificate of Pre-Marriage Counseling",
            "Certificate of Family Planning"
        ],
        href: "/user/services/civil-registry/marriage-license-application",
        available: true
    },
];

export default function CivilRegistryPage() {
    const [themeColor, setThemeColor] = React.useState("theme_color");

    React.useEffect(() => {
        getSystemSettingAction("theme_color").then((res) => {
            if (res.success && res.data) {
                setThemeColor(res.data);
            }
        });
    }, []);

    return (
        <div className="container max-w-5xl mx-auto px-4 pt-0 pb-32 space-y-6">
            <style dangerouslySetInnerHTML={{
                __html: `
                .theme-icon-bg {
                    background-color: ${themeColor}1a !important; /* 10% opacity */
                }
                .theme-icon-text {
                    color: ${themeColor} !important;
                }
                .theme-text-hover:hover {
                    color: ${themeColor} !important;
                }
                .theme-bg-hover:hover {
                    background-color: ${themeColor} !important;
                    border-color: ${themeColor} !important;
                }
                .theme-border-hover:hover {
                    border-color: ${themeColor} !important;
                }
                `
            }} />

            {/* Breadcrumbs */}
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/user" className="flex items-center gap-1.5 transition-colors hover:text-blue-500 theme-text-hover font-bold italic text-[11px] uppercase tracking-wider">
                                <Home className="w-3.5 h-3.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="opacity-40" />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/user/services" className="transition-colors hover:text-blue-500 theme-text-hover font-bold italic text-[11px] uppercase tracking-wider">
                                Services
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="opacity-40" />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-blue-500 theme-icon-text font-black italic text-[11px] uppercase tracking-wider">
                            Civil Registry
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 md:p-12 text-white shadow-2xl border border-slate-700/50">
                <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
                    style={{ backgroundColor: `${themeColor}1a` }}
                />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest theme-icon-bg theme-icon-text border border-blue-500/20"
                        style={{ borderColor: `${themeColor}33` }}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Local Civil Registry (LCR)
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Civil Registry <span className="theme-icon-text">Services</span>
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed italic">
                        Select a civil registry service to file a new application or request official copies of certificates issued in Mapandan.
                    </p>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REGISTRY_TYPES.map((type) => {
                    const Icon = type.icon;

                    const cardContent = (
                        <Card className={cn(
                            "group p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 bg-white dark:bg-[#0f1117] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full relative overflow-hidden",
                            type.available ? "theme-border-hover" : "opacity-75 hover:border-slate-300 dark:hover:border-white/10"
                        )}>
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 rounded-2xl w-fit transition-colors theme-icon-bg">
                                        <Icon className="w-6 h-6 theme-icon-text" />
                                    </div>
                                    {!type.available && (
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                            Coming Soon
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-tight italic text-slate-900 dark:text-white">
                                        {type.label}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium italic">
                                        {type.description}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Requirements
                                    </h4>
                                    <ul className="text-[10px] font-bold text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                                        {type.requirements.map((req, rIdx) => (
                                            <li key={rIdx}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border",
                                    type.available
                                        ? "bg-slate-50 border-slate-100 text-slate-900 group-hover:text-white dark:bg-white/5 dark:border-transparent dark:text-white theme-bg-hover"
                                        : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed dark:bg-white/5 dark:border-transparent"
                                )}>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Card>
                    );

                    if (type.available) {
                        return (
                            <Link href={type.href} key={type.id} className="block h-full">
                                {cardContent}
                            </Link>
                        );
                    }

                    return (
                        <div
                            key={type.id}
                            onClick={() => toast.info(`${type.label} is currently under development.`)}
                            className="block h-full"
                        >
                            {cardContent}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
