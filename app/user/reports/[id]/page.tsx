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
    MessageSquare,
    Home,
    Activity,
    Share2,
    CalendarCheck,
    Navigation
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

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
        <div className="space-y-6 md:space-y-12 pb-20 max-w-7xl mx-auto px-4 md:px-10 pt-4 md:pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Navigation - Glass Bar Sticky */}
            <div className="sticky top-[72px] md:top-[88px] z-50 w-fit pointer-events-none">
                <Breadcrumb className="pointer-events-auto">
                    <BreadcrumbList className="bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32_rgba(0,0,0,0.1)] w-fit flex items-center gap-1">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/" className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                    <Home className="w-3.5 h-3.5 mb-0.5" />
                                    Home
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="opacity-20" />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/user/reports" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Reports Hub</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
                <div className="lg:col-span-8 space-y-6 md:space-y-10">
                    <div className="bg-white dark:bg-[#0d0f14] rounded-2xl md:rounded-[3rem] border border-slate-200 dark:border-white/5 p-4 md:p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Activity className="w-32 h-32" /></div>
                        
                        <div className="relative z-10 space-y-8 md:space-y-12">
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest px-3 py-1 rounded-lg text-[8px] md:text-[10px] italic">REPORT #{reportId.slice(0, 8)}</Badge>
                                    <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/10" />
                                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{format(new Date(report.createdAt), "MMMM d, yyyy")}</span>
                                </div>
                                <h1 className="text-3xl md:text-6xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                                    {report.category}
                                </h1>
                                <p className="text-sm md:text-2xl font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl border-l-4 border-primary/30 pl-4 md:pl-6">
                                    &quot;{report.description}&quot;
                                </p>
                            </div>

                            <div className="p-4 md:p-10 bg-slate-50 dark:bg-white/[0.02] rounded-xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 md:space-y-10">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-400 italic">Processing Timeline</h4>
                                    <Badge className={cn("font-black uppercase tracking-widest text-[9px] italic px-4 py-1 rounded-full", statusInfo.color, "bg-current/10 border-none")}>
                                        {report.status.replace(/_/g, " ")}
                                    </Badge>
                                </div>
                                
                                <div className="relative pt-4 pb-2 px-2">
                                    <div className="absolute top-[2rem] md:top-[2.5rem] left-0 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                            style={{ width: `${statusInfo.progress}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between relative">
                                        {statusInfo.steps.map((step, idx) => {
                                            const Icon = step.icon;
                                            return (
                                                <div key={idx} className="flex flex-col items-center gap-2 md:gap-4">
                                                    <div className={cn(
                                                        "w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center border-2 md:border-4 transition-all z-10",
                                                        step.active 
                                                            ? "bg-primary border-white dark:border-[#0d0f14] text-white shadow-xl shadow-primary/20 scale-110" 
                                                            : "bg-white dark:bg-[#1a1f29] border-slate-100 dark:border-white/5 text-slate-300"
                                                    )}>
                                                        <Icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                                                    </div>
                                                    <span className={cn(
                                                        "text-[7px] md:text-[10px] font-black uppercase tracking-widest italic transition-colors",
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
                                <div className="p-6 md:p-10 bg-primary rounded-xl md:rounded-[2.5rem] text-white space-y-4 md:space-y-6 relative overflow-hidden shadow-2xl shadow-primary/30 group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000" />
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
                                        <h4 className="text-[10px] md:text-sm font-black uppercase tracking-widest italic">LGU Service Response</h4>
                                    </div>
                                    <p className="text-lg md:text-3xl font-black italic leading-tight relative z-10 tracking-tighter">
                                        &quot;{report.adminComment}&quot;
                                    </p>
                                    <div className="pt-4 border-t border-white/20 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-[8px] md:text-[10px]">LGU</div>
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest italic opacity-80">Public Service Office • Mayors Office • eMapandan</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Share2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <h4 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Evidence Documentation</h4>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                            {report.images.map((img: string, i: number) => (
                                <div key={i} className="aspect-[4/3] md:aspect-video rounded-xl md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#0d0f14] group relative shadow-lg">
                                    <Image 
                                        src={img} 
                                        alt="evidence" 
                                        fill
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 md:space-y-8 lg:sticky lg:top-24 h-fit">
                    {/* Modern Integrated Map - Church Style */}
                    <div className="relative h-[300px] md:h-[400px] bg-slate-100 dark:bg-white/5 rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden group">
                        {report.latitude && report.longitude ? (
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                src={`https://maps.google.com/maps?q=${report.latitude},${report.longitude}&hl=en&z=15&output=embed`}
                                className="w-full h-full grayscale-[0.2] contrast-[1.1]"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center p-6">
                                <XCircle className="w-10 h-10 text-slate-200 dark:text-white/5" />
                                <p className="text-[10px] font-bold text-slate-400 italic uppercase tracking-widest">No Location Data</p>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-20">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white italic">Incident Location</p>
                                <p className="text-[11px] font-bold text-white/70 italic truncate max-w-[150px] md:max-w-[200px]">{report.address || report.category}</p>
                            </div>
                            {report.latitude && (
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`} 
                                    target="_blank"
                                    className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white rounded-xl font-black uppercase italic tracking-widest text-[9px] transition-all hover:scale-105 shadow-xl shadow-primary/40"
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                    <span>Route</span>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-950 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 text-white space-y-6 md:space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700"><CalendarCheck className="w-20 h-20" /></div>
                        
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic leading-none">Record Log</p>
                            <h4 className="text-xl font-black italic tracking-tighter">Timeline</h4>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                                    <CalendarCheck className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">Received</span>
                                </div>
                                <span className="text-[10px] font-bold italic text-white/90">{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                                    <Activity className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">Current Status</span>
                                </div>
                                <span className={cn("text-[10px] font-black italic uppercase tracking-widest", statusInfo.color)}>{report.status.replace(/_/g, " ")}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3 text-slate-500 shrink-0">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest italic">Response</span>
                                </div>
                                <span className="text-[10px] font-bold italic text-white/90">{report.adminComment ? "Official" : "Pending"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
