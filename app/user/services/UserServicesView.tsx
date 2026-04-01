"use client";

import { motion } from "framer-motion";
import { HeartPulse, Info, Clock, CheckCircle2, FileText, ClipboardList, Home, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Service {
    id: string;
    name: string;
    description: string;
    fee: number;
    requirements: any[];
}

export function UserServicesView({ profile, initialServices }: { profile: any, initialServices: Service[] }) {
    return (
        <div className="space-y-12 pb-20">
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic">Resident Services</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-blue-600/10 dark:bg-blue-900/10 p-10 rounded-[3rem] border border-blue-100 dark:border-blue-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl -mr-32 -mt-32 group-hover:bg-blue-600/10 transition-all" />
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:rotate-6 transition-transform">
                            <HeartPulse className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Brgy. {profile.barangay} Services</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Official certification and document processing for verified residents of Barangay {profile.barangay}.
                    </p>
                </div>

                <Link href="/user/services/requests" className="relative z-10">
                    <Button variant="outline" className="h-16 px-10 rounded-2xl border-blue-600/20 text-blue-600 font-black uppercase tracking-[0.2em] text-[12px] bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 transition-all gap-4 shadow-xl shadow-blue-600/5">
                        <ClipboardList className="w-5 h-5" />
                        MY REQUESTS
                    </Button>
                </Link>
            </div>

            <div className="space-y-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-0.5 bg-blue-600 rounded-full" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-600">Available Support Services</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {initialServices.length === 0 ? (
                        <div className="col-span-full py-24 text-center border-4 border-dashed rounded-[3rem] border-slate-100 dark:border-white/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-50/50 dark:bg-blue-900/10 blur-3xl -z-10" />
                            <Info className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                            <h3 className="text-xl font-black uppercase italic text-slate-400 tracking-tighter">No Public Services Found</h3>
                            <p className="text-slate-500 font-medium mt-1">Please contact your Barangay Hall for manual document requests.</p>
                        </div>
                    ) : (
                        initialServices.map(service => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="group border-slate-100 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all rounded-[3rem] overflow-hidden bg-white dark:bg-black/20 flex flex-col h-full hover:border-blue-500/50 hover:scale-[1.02]">
                                    <CardHeader className="p-10 pb-6 relative">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                                <FileText className="w-7 h-7" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors leading-none">{service.name}</CardTitle>
                                        <CardDescription className="font-medium line-clamp-2 mt-4 text-slate-500 italic">{service.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="px-10 pb-10 pt-4 border-t border-slate-50 dark:border-white/5 flex gap-4 mt-auto">
                                        <Link href={`/user/services/${service.id}`} className="w-full">
                                            <Button 
                                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] h-14 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
                                            >
                                                Select Service
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
