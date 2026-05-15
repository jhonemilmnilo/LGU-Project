"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
    Clock, 
    CheckCircle2, 
    Home,
    FileText,
    Activity,
    ChevronRight,
    DollarSign,
    Search,
    Package,
    UserCheck,
    Truck,
    X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { getUserTransactions } from "@/app/admin/transactions/actions";
import { Input } from "@/components/ui/input";

export default function UserServiceRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchRequests() {
            try {
                const res = await getUserTransactions();
                if (res.success) {
                    setRequests(res.data || []);
                }
            } catch (err) {
                console.error("Failed to load requests:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchRequests();
    }, []);

    const getStatusStyle = (req: any) => {
        if (req.isCancelled) {
            return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: X, label: "CANCELLED" };
        }
        const status = req.status;
        switch (status) {
            case "FOR_REQUESTING": return { color: "text-white", bg: "bg-[var(--primary-theme)]", border: "border-transparent", icon: Clock, label: "PENDING", opacity: 0.8 };
            case "EVALUATED": return { color: "text-white", bg: "bg-[var(--primary-theme)]", border: "border-transparent", icon: DollarSign, label: "EVALUATED", opacity: 0.9 };
            case "PAID": return { color: "text-white", bg: "bg-emerald-500", border: "border-transparent", icon: CheckCircle2, label: "PAID", opacity: 1 };
            case "FOR_PROCESSING": return { color: "text-white", bg: "bg-blue-500", border: "border-transparent", icon: Activity, label: "PROCESSING", opacity: 1 };
            case "FOR_PICKING": return { color: "text-white", bg: "bg-amber-500", border: "border-transparent", icon: Package, label: "FOR PICKING", opacity: 1 };
            case "FOR_CLAIM": return { color: "text-white", bg: "bg-amber-500", border: "border-transparent", icon: UserCheck, label: "FOR CLAIMING", opacity: 1 };
            case "IN_ROUTE": return { color: "text-white", bg: "bg-indigo-500", border: "border-transparent", icon: Truck, label: "IN ROUTE", opacity: 1 };
            case "DELIVERED": return { color: "text-white", bg: "bg-emerald-600", border: "border-transparent", icon: CheckCircle2, label: "DELIVERED", opacity: 1 };
            case "RELEASED": return { color: "text-white", bg: "bg-emerald-600", border: "border-transparent", icon: CheckCircle2, label: "RELEASED", opacity: 1 };
            case "REJECTED": return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", icon: X, label: "DECLINED" };
            
            // Dispute Lifecycle
            case "RETURN_REQUESTED": return { color: "text-white", bg: "bg-[var(--primary-theme)]", border: "border-transparent", icon: Activity, label: "RETURN REQUESTED", opacity: 1 };
            case "REFUND_REQUESTED": return { color: "text-white", bg: "bg-[var(--primary-theme)]", border: "border-transparent", icon: DollarSign, label: "REFUND REQUESTED", opacity: 1 };
            case "RETURNED": return { color: "text-white", bg: "bg-slate-600", border: "border-transparent", icon: Package, label: "RETURNED", opacity: 1 };
            case "REFUNDED": return { color: "text-white", bg: "bg-slate-600", border: "border-transparent", icon: DollarSign, label: "REFUNDED", opacity: 1 };
            case "DISPUTE_REJECTED": return { color: "text-white", bg: "bg-red-600", border: "border-transparent", icon: X, label: "DISPUTE REJECTED", opacity: 1 };
            
            default: return { color: "text-white", bg: "bg-[var(--primary-theme)]", border: "border-transparent", icon: Clock, label: status.replace("_", " ") };
        }
    };

    const filteredRequests = requests.filter(r => 
        r.type?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Synchronizing Records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0c10] pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                
                {/* Modern Header Hierarchy */}
                <div className="space-y-8">
                    <Breadcrumb>
                        <BreadcrumbList className="bg-slate-50 dark:bg-white/5 px-6 py-2 rounded-xl border border-slate-100 dark:border-white/5 w-fit">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
                                        <Home className="w-3.5 h-3.5" />
                                        Portal
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="text-slate-300" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-primary italic">My Service Requests</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none select-none">
                                    Service <span className="text-primary underline decoration-primary/20 underline-offset-8 decoration-4">Requests</span>
                                </h1>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-2 italic">Official LGU Tracking</p>
                            </div>
                            <p className="text-slate-500 font-medium italic text-lg leading-relaxed max-w-2xl">
                                Monitor the real-time status of your official document applications, tax certificates, and public service requests.
                            </p>
                        </div>
                        
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search by Service Type..." 
                                className="h-14 pl-12 rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 font-bold italic transition-all focus:ring-2 focus:ring-primary/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Wide Request List */}
                <div className="space-y-4">
                    {filteredRequests.length > 0 ? filteredRequests.map((req) => {
                        const style = getStatusStyle(req);
                        
                        return (
                            <div 
                                key={req.id} 
                                onClick={() => router.push(`/user/services/requests/${req.id}`)}
                                className="group bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 p-4 hover:border-primary/40 hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-none transition-all cursor-pointer select-none active:scale-[0.995] flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="flex items-center gap-5 flex-1 w-full">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white italic truncate group-hover:text-primary transition-colors">
                                                {req.type?.name || "Service Request"}
                                            </h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-slate-400">
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">{format(new Date(req.createdAt), "MMMM d, yyyy")}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">{req.fulfillmentType?.replace("_", " ")}</span>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-black uppercase tracking-widest italic">{req.paymentType?.replace("_", " ")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-white/5">
                                    <div className="text-right">
                                        {req.isCancelled ? (
                                            <div className="py-1">
                                                <p className="text-[8px] font-black text-red-500/40 uppercase tracking-widest italic">Revoked</p>
                                                <p className="text-[9px] font-black text-red-500 uppercase italic tracking-tighter">Cancelled</p>
                                            </div>
                                        ) : req.status !== "FOR_REQUESTING" ? (
                                            <>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Fee</p>
                                                <p className="text-lg font-black text-slate-900 dark:text-white italic">₱{(req.totalAmount || 0).toLocaleString()}</p>
                                            </>
                                        ) : (
                                            <div className="py-1">
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">Evaluation</p>
                                                <p className="text-[9px] font-black text-primary uppercase italic tracking-tighter">In Progress</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 min-w-[110px]">
                                        <Badge className={cn("inline-flex items-center gap-1.5 font-black uppercase tracking-widest text-[8px] italic px-4 py-1.5 rounded-full border border-opacity-30 w-full justify-center", style.color, style.bg, style.border)}>
                                            {style.label}
                                        </Badge>
                                        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest italic">
                                            {req.isCancelled ? "DISCONTINUED" : `Phase ${req.status === "RELEASED" ? "4/4" : req.status === "PAID" ? "3/4" : req.status === "EVALUATED" ? "2/4" : "1/4"}`}
                                        </span>
                                    </div>
                                    <div className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-40 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] bg-slate-50/50 dark:bg-white/5">
                            <FileText className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                            <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 italic">No Service Requests Found</h3>
                            <p className="text-sm text-slate-400 mt-2 font-medium italic">Your active applications will appear here for tracking.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

