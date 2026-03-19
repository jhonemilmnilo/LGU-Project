"use client";

import { motion } from "framer-motion";
import { HeartPulse, Send, AlertTriangle, Info, Clock, CheckCircle2, FileText, ClipboardList, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export function UserServicesView() {
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
                        <BreadcrumbPage className="text-[10px] font-black uppercase tracking-widest text-blue-600 italic max-w-[200px] truncate">Resident Services</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <HeartPulse className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Resident Services</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
                        Access official municipal services and report community concerns. Secure, transparent, and direct service delivery.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="reporting" className="space-y-10">
                <TabsList className="bg-slate-100 dark:bg-white/5 p-1 h-16 rounded-2xl w-full sm:w-auto">
                    <TabsTrigger value="reporting" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Issue Reporting
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <FileText className="w-4 h-4 mr-2" />
                        Service Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="reporting" className="outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter italic">Community Watch</h2>
                                <p className="text-slate-500 font-medium italic leading-relaxed">
{ }
{ }
                                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                                    Spotted an issue in your neighborhood? Help us maintain Mapandan's excellence by reporting road damage, waste management issues, or street lighting concerns.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: "Response Time", value: "24-48 Hours", icon: Clock },
                                    { label: "Status Tracking", value: "Real-time", icon: CheckCircle2 },
                                ].map((stat, i) => (
                                    <div key={i} className="p-6 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/10">
                                        <stat.icon className="w-6 h-6 text-blue-600 mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Info className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Reporting Protocol</h3>
                                </div>
                                <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                                    For life-threatening emergencies, please bypass this form and use the **Council & Safety** panel to call emergency hotlines immediately.
                                </p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#0a0c10] border border-slate-100 dark:border-white/5 p-8 sm:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16" />
                            
                            <form className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Type of Concern</label>
                                    <Select>
                                        <SelectTrigger className="h-14 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 rounded-2xl font-bold italic transition-all">
                                            <SelectValue placeholder="Identify Issue" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl">
                                            <SelectItem value="waste" className="py-3 font-bold italic">Waste Management</SelectItem>
                                            <SelectItem value="road" className="py-3 font-bold italic">Infrastructure / Road</SelectItem>
                                            <SelectItem value="lighting" className="py-3 font-bold italic">Street Lighting</SelectItem>
                                            <SelectItem value="other" className="py-3 font-bold italic">Other Concerns</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Incident Location</label>
                                    <Input 
                                        placeholder="Nearest landmark or Barangay..." 
                                        className="h-14 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 rounded-2xl font-bold italic"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Detailed Narrative</label>
                                    <Textarea 
                                        placeholder="Explain the situation..." 
                                        className="min-h-[140px] bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 rounded-3xl p-5 font-bold italic"
                                    />
                                </div>

                                <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] italic shadow-2xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                                    Transmit Report
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                </TabsContent>

                <TabsContent value="requests" className="outline-none">
                     <div className="aspect-[16/10] md:aspect-[21/9] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] text-center p-12 bg-white dark:bg-black/20">
                         <ClipboardList className="w-16 h-16 text-slate-200 dark:text-white/5 mb-6" />
                         <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-tighter italic italic">Digital Certification Portal</h3>
                         <p className="text-sm text-slate-400 mt-2 font-medium italic max-w-lg">
                            Requesting for Barangay Clearance, Business Permits, or Health Certificates? 
                            The automated document processing engine is currently undergoing final calibration.
                         </p>
                         <div className="mt-8 flex gap-4">
                            <div className="px-6 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest italic">Digital Signature Verified</div>
                            <div className="px-6 py-2 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest italic">E-Governence Module</div>
                         </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
