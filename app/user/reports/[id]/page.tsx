import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getReportById } from "@/app/admin/actions";
import { format } from "date-fns";
import { 
    Clock, 
    Eye, 
    CheckCircle2, 
    XCircle, 
    MapPin, 
    MessageSquare,
    Home,
    Activity,
    Share2,
    CalendarCheck,
    Map as MapIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

import ReportMapWrapper from "./components/ReportMapWrapper";

// Next.js 15+ requires params to be a Promise, but we handle it safely for both versions
export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params if it behaves like a promise (for newer Next.js versions)
    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    console.log(`[Reporting] Entry: Viewing details for ${reportId}`);

    const session = await getServerSession(authOptions);
    if (!session) {
        console.warn("[Reporting] No session found, redirecting to login");
        redirect("/auth/login");
    }

    const { report, success, error } = await getReportById(reportId);
    
    if (!success || !report) {
        console.error(`[Reporting] Failed to fetch report ${reportId}: ${error}`);
        return notFound();
    }

    const getStatusInfo = (status: string) => {
        const steps = [
            { id: "PENDING", label: "Submitted", icon: Clock },
            { id: "SEEN", label: "Seen", icon: Eye },
            { id: "IN_PROGRESS", label: "In Progress", icon: Activity },
            { id: "COMPLETED", label: "Resolved", icon: CheckCircle2 }
        ];

        let currentIdx = steps.findIndex(s => s.id === status);
        if (currentIdx === -1 && status === "COMPLETED") currentIdx = 3;
        if (status === "REJECTED") {
            return { steps: [{ id: "REJECTED", label: "Rejected", icon: XCircle, active: true }], color: "text-red-500", progress: 100, isRejected: true };
        }
        
        return {
            steps: steps.map((s, i) => ({ ...s, active: i <= currentIdx })),
            progress: ((currentIdx + 1) / steps.length) * 100,
            color: status === "COMPLETED" ? "text-emerald-500" : status === "PENDING" ? "text-amber-500" : "text-primary",
            isRejected: false
        };
    };

    const statusInfo = getStatusInfo(report.status);

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation & Breadcrumbs */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList className="bg-black/20 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/10 w-fit shadow-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors">
                                    <Home className="w-3.5 h-3.5 mb-0.5" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-white/50" />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/reports" className="text-[10px] font-black uppercase tracking-widest text-white transition-colors">Reports Hub</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-white/50" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">#{reportId.slice(-6)}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white dark:bg-[#1e2330] rounded-[3.5rem] border border-slate-200 dark:border-[#2a3040] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-4">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full text-[9px] italic">#{reportId.slice(0, 8)}</Badge>
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{format(new Date(report.createdAt), "MMMM d, yyyy")}</span>
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">
                                    {report.category}
                                </h1>
                                <p className="text-xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                                    &quot;{report.description}&quot;
                                </p>
                            </div>

                            <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white italic">Current Progress</h4>
                                </div>
                                
                                <div className="relative pt-6 pb-2">
                                    <div className="absolute top-[2.5rem] left-0 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${statusInfo.progress}%` }}
                                        />
                                    </div>
                                    <div className="relative flex justify-between">
                                        {statusInfo.steps.map((step, idx) => {
                                            const Icon = step.icon;
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all z-10",
                                                        step.active 
                                                            ? "bg-primary border-white dark:border-[#1e2330] text-white shadow-xl shadow-primary/20 scale-110" 
                                                            : "bg-white dark:bg-[#1a1f29] border-slate-100 dark:border-white/5 text-slate-300"
                                                    )}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest italic transition-colors",
                                                        step.active ? "text-slate-900 dark:text-white" : "text-slate-400"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {report.adminComment && (
                                <div className="p-10 bg-primary rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-primary/30">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <MessageSquare className="w-6 h-6" />
                                        <h4 className="text-sm font-black uppercase tracking-widest italic">Official LGU Response</h4>
                                    </div>
                                    <p className="text-2xl font-black italic leading-tight relative z-10">
                                        &quot;{report.adminComment}&quot;
                                    </p>
                                    <div className="pt-4 border-t border-white/20 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-[10px]">LGU</div>
                                            <span className="text-[10px] font-black uppercase tracking-widest italic opacity-80">Public Service Office</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Share2 className="w-5 h-5 text-primary" />
                            <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Evidence & Multimedia</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {report.images.map((img: string, i: number) => (
                                <div key={i} className="aspect-video rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#1e2330] group relative">
                                    <Image 
                                        src={img} 
                                        alt="evidence" 
                                        fill
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-[#1e2330] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] p-8 space-y-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-6 h-6 text-red-500" />
                            <h4 className="text-lg font-black uppercase italic tracking-tighter">Location Box</h4>
                        </div>
                        
                        <div className="aspect-square rounded-3xl bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 relative overflow-hidden group">
                           {report.latitude && report.longitude ? (
                             <ReportMapWrapper 
                               lat={report.latitude} 
                               lng={report.longitude} 
                               address={report.address || report.category} 
                             />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6">
                               <XCircle className="w-12 h-12 text-slate-300" />
                               <p className="text-xs font-bold text-slate-400 italic">Location data not provided</p>
                             </div>
                           )}
                        </div>

                        {report.latitude && (
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`} 
                                target="_blank"
                                className="w-full h-14 bg-primary text-white rounded-2xl text-[9px] font-black uppercase tracking-widest italic hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
                            >
                                Get Live Directions <MapIcon className="w-4 h-4 ml-1" />
                            </a>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl shadow-primary/10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">System Records</p>
                            <h4 className="text-xl font-black italic tracking-tighter">Report Timeline</h4>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <div className="flex items-center gap-3 text-slate-400 shrink-0">
                                    <CalendarCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Received</span>
                                </div>
                                <span className="text-[10px] font-bold italic text-right">{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3 text-slate-400 shrink-0">
                                    <Activity className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Status</span>
                                </div>
                                <span className="text-[10px] font-bold italic text-primary">{report.status.replace(/_/g, " ")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
