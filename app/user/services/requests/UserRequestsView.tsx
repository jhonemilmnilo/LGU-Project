"use client";

import { motion } from "framer-motion";
import { ClipboardList, Home, Clock, Package, Truck, Info, ArrowLeft, CheckCircle2, X, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { cancelServiceRequest } from "../actions";

interface ServiceRequest {
    id: string;
    service: {
        name: string;
        fee: number;
    };
    status: string;
    createdAt: string | Date;
    method: string;
    adminNotes?: string;
    paymentDetail: any;
}

export default function UserRequestsView({ requests, profile }: { requests: ServiceRequest[], profile: any }) {
    return (
        <div className="max-w-7xl mx-auto py-12 px-6 space-y-12">
            <Breadcrumb>
                <BreadcrumbList className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 w-fit shadow-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                                <Home className="w-3.5 h-3.5 mb-0.5" />
                                Home
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/user/services" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
                                Services
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">My Request History</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">My Requests</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl leading-relaxed">
                        Tracking status and history of all service applications filed within the jurisdiction of Barangay {profile.barangay}.
                    </p>
                </div>
                <Link href="/user/services">
                    <Button variant="outline" className="rounded-full border-blue-600/20 text-blue-600 font-black uppercase tracking-widest text-[10px] h-12 px-8 gap-2 hover:bg-blue-600 hover:text-white transition-all">
                        <ArrowLeft className="w-4 h-4" /> New Request
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {requests.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-white/5 rounded-[3.5rem] border border-dashed border-slate-200 dark:border-white/10 relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 blur-3xl -z-10" />
                        <Clock className="w-12 h-12 text-slate-200 dark:text-white/5 mx-auto mb-4" />
                        <h3 className="text-xl font-black uppercase italic text-slate-400 tracking-tighter">History Empty</h3>
                        <p className="text-slate-500 font-medium mt-1">You haven't submitted any service requests yet.</p>
                    </div>
                ) : (
                    requests.map(req => {
                        const paymentItems = req.paymentDetail?.items || [];
                        const totalAmount = req.paymentDetail?.totalAmount || 0;

                        return (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className={cn(
                                "relative overflow-hidden border-slate-100 dark:border-white/5 rounded-[3rem] bg-white dark:bg-black/20 shadow-xl group hover:shadow-2xl transition-all h-full flex flex-col",
                                req.status === "CANCELLED" && "opacity-60 saturate-50"
                            )}>
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                    req.status === "DELIVERED" || req.status === "PICKED_UP" ? "bg-emerald-500" :
                                    req.status === "REJECTED" || req.status === "CANCELLED" ? "bg-slate-300 dark:bg-white/10" :
                                    req.status === "PENDING" ? "bg-amber-500" : "bg-blue-500"
                                }`} />
                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <Badge className={cn(
                                            "px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest border-none",
                                            req.status === "PENDING" ? "bg-amber-50 text-amber-600" :
                                            req.status === "CANCELLED" ? "bg-slate-100 text-slate-500" :
                                            req.status === "DELIVERED" || req.status === "PICKED_UP" ? "bg-emerald-50 text-emerald-600" :
                                            "bg-blue-50 text-blue-600"
                                        )}>
                                            {req.status}
                                        </Badge>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <CardTitle className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none group-hover:text-blue-600 transition-colors uppercase">{req.service?.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-4">
                                        {req.method === "PICKUP" ? <Package className="w-3.5 h-3.5 text-slate-400" /> : <Truck className="w-3.5 h-3.5 text-slate-400" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{req.method} Method</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-4 space-y-6 mt-auto">
                                    {/* Billing Section */}
                                    {totalAmount > 0 && (
                                        <div className="space-y-3 p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Receipt className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Service Billing</span>
                                                </div>
                                                <span className="text-lg font-black text-emerald-600 tracking-tighter italic">₱{totalAmount}</span>
                                            </div>
                                            {paymentItems.length > 0 && (
                                                <div className="space-y-1.5 border-t border-slate-200/50 dark:border-white/5 pt-3">
                                                    {paymentItems.map((item: any, i: number) => (
                                                        <div key={i} className="flex justify-between items-center text-[10px] font-medium italic">
                                                            <span className="text-slate-500">{item.label}</span>
                                                            <span className="text-slate-900 dark:text-white">₱{item.amount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {req.adminNotes ? (
                                        <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 flex items-center gap-1.5">
                                                <Info className="w-3 h-3" /> Admin Response
                                            </p>
                                            <p className="text-xs font-medium italic text-slate-600 dark:text-slate-400 leading-relaxed">{req.adminNotes}</p>
                                        </div>
                                    ) : (
                                        !totalAmount && (
                                            <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 italic text-[10px] font-medium text-slate-400 text-center">
                                                No notes or billing provided yet.
                                            </div>
                                        )
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-300 uppercase italic">
                                            <Clock className="w-3 h-3" /> Updated {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        {req.status === "PENDING" && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={async () => {
                                                    if (confirm("Are you sure you want to cancel this request?")) {
                                                        const res = await cancelServiceRequest(req.id);
                                                        if (res.success) toast.success("Request cancelled");
                                                        else toast.error(res.error || "Failed to cancel");
                                                    }
                                                }}
                                                className="h-8 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-black uppercase text-[9px] tracking-widest gap-2"
                                            >
                                                <X className="w-3 h-3" /> Cancel Request
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
