"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
    Clock, 
    Eye, 
    CheckCircle2, 
    XCircle, 
    Home,
    FileText,
    Activity,
    ChevronRight,
    Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { getUserReports } from "@/app/admin/actions";
import { useRouter } from "next/navigation";

interface Report {
    id: string;
    status: string;
    category: string;
    createdAt: string | Date;
}

export default function UserReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchReports() {
            try {
                const res = await getUserReports();
                if (res.success) {
                    setReports(res.reports || []);
                }
            } catch (err) {
                console.error("Failed to load reports:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PENDING": return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Clock };
            case "SEEN": return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Eye };
            case "IN_PROGRESS": return { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: Activity };
            case "COMPLETED": return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2 };
            case "REJECTED": return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle };
            default: return { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", icon: Clock };
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Accessing Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic max-w-[200px] truncate">My Reports</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
 
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="space-y-0.5">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Citizen <span className="text-primary">Reports</span></h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-1">LGU Tracking List</p>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-2xl text-lg leading-relaxed">
                        List of all concerns and reports you have submitted to the Local Government Unit.
                    </p>
                </div>
            </div>
 
            <div className="grid grid-cols-1 gap-4">
                {reports.length > 0 ? reports.map((report: Report) => {
                    const style = getStatusStyle(report.status);
                    const StatusIcon = style.icon;
                    
                    return (
                        <div 
                            key={report.id} 
                            onClick={() => {
                                console.log("Navigating to:", `/user/reports/${report.id}`);
                                router.push(`/user/reports/${report.id}`);
                            }}
                            className="bg-white dark:bg-[#1e2330] rounded-3xl border border-slate-200 dark:border-[#2a3040] p-6 hover:border-primary/40 group transition-all cursor-pointer select-none active:scale-[0.99]"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                                <div className="flex items-center gap-6 flex-1 min-w-0 w-full sm:w-auto">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", style.bg)}>
                                        <StatusIcon className={cn("w-7 h-7", style.color)} />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic truncate leading-tight group-hover:text-primary transition-colors">{report.category}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">ID: #{report.id.slice(-6)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                                    <Badge variant="outline" className={cn("font-black uppercase tracking-widest text-[9px] italic px-4 py-1.5 rounded-full border border-opacity-30", style.color, style.bg, style.border)}>
                                        {report.status.replace(/_/g, " ")}
                                    </Badge>
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-32 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-white dark:bg-black/10">
                        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] italic">No reports found...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
