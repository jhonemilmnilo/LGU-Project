"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Package, Truck, Loader2, CheckCircle2, FileText, BadgeCheck, ShieldAlert, Camera, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { submitServiceRequest } from "../actions";

interface ServiceRequirement {
    id: string;
    label: string;
    type: "TEXT" | "NUMBER" | "FILE";
    required: boolean;
}

interface Service {
    id: string;
    name: string;
    description: string;
    fee: number;
    requirements: ServiceRequirement[];
}

export function ServiceRequestFormView({ service, profile }: { service: Service, profile: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [method, setMethod] = useState<"PICKUP" | "DELIVER">("PICKUP");
    const [submissions, setSubmissions] = useState<Record<string, any>>({});

    const handleInputChange = (label: string, value: any) => {
        setSubmissions(prev => ({ ...prev, [label]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const missing = service.requirements.filter(req => req.required && !submissions[req.label]);
        if (missing.length > 0) {
            toast.error(`Please provide: ${missing.map(m => m.label).join(", ")}`);
            return;
        }

        setIsSubmitting(true);
        
        try {
            const res = await submitServiceRequest(service.id, method, submissions);
            if (res.success) {
                setIsSuccess(true);
                toast.success("Request submitted successfully!");
            } else {
                toast.error(res.error || "Failed to submit request");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-6 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-8 bg-white dark:bg-[#0a0c10] p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-emerald-500/5 blur-3xl -z-10" />
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 rotate-12">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Request Received!</h2>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto italic">
                            Your request for <strong>{service.name}</strong> has been sent to the Barangay Hall. You can track its status in your dashboard.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 pt-4">
                        <Link href="/user/services">
                            <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Go to My Requests
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] opacity-60">
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <Link href="/user/services">
                <Button 
                    variant="ghost" 
                    className="mb-8 font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full px-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#0a0c10] border border-slate-100 dark:border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl -mr-32 -mt-32" />
                        <div className="p-10 border-b border-slate-100 dark:border-white/5 relative z-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{service.name}</h2>
                                <p className="text-slate-500 font-medium mt-1">Application for {profile.firstName} {profile.lastName}</p>
                            </div>
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jurisdiction</span>
                                <span className="text-sm font-black uppercase italic text-blue-600 tracking-tight">{profile.barangay}</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 relative z-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Requirement Details</h4>
                                </div>
                                
                                {service.requirements.length === 0 ? (
                                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                                        <p className="text-xs font-bold text-slate-400 italic italic">No specific text requirements for this service.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {service.requirements.map((req: any) => (
                                            <div key={req.id} className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                                    {req.label} {req.required && <span className="text-red-500">*</span>}
                                                </label>
                                                {req.type === "TEXT" && (
                                                    <Input 
                                                        required={req.required}
                                                        value={submissions[req.label] || ""}
                                                        onChange={e => handleInputChange(req.label, e.target.value)}
                                                        className="h-14 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 rounded-2xl font-bold italic"
                                                        placeholder={`Input ${req.label}...`}
                                                    />
                                                )}
                                                {req.type === "NUMBER" && (
                                                    <Input 
                                                        type="number"
                                                        required={req.required}
                                                        value={submissions[req.label] || ""}
                                                        onChange={e => handleInputChange(req.label, e.target.value)}
                                                        className="h-14 bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10 rounded-2xl font-bold italic"
                                                        placeholder="0"
                                                    />
                                                )}
                                                {req.type === "FILE" && (
                                                    <div className="space-y-4">
                                                        {submissions[req.label] ? (
                                                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 group">
                                                                <img src={submissions[req.label]} className="w-full h-full object-cover" alt="Preview" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                    <Button 
                                                                        type="button" 
                                                                        variant="destructive" 
                                                                        size="sm" 
                                                                        onClick={() => handleInputChange(req.label, null)}
                                                                        className="rounded-full font-black uppercase tracking-widest text-[9px] gap-2"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" /> Remove Image
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <label className="flex flex-col items-center justify-center h-40 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        className="hidden" 
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => handleInputChange(req.label, reader.result);
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }} 
                                                                    />
                                                                    <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload File</span>
                                                                </label>

                                                                <label className="flex flex-col items-center justify-center h-40 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        capture="environment"
                                                                        className="hidden" 
                                                                        onChange={async (e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                const reader = new FileReader();
                                                                                reader.onloadend = () => handleInputChange(req.label, reader.result);
                                                                                reader.readAsDataURL(file);
                                                                            }
                                                                        }} 
                                                                    />
                                                                    <Camera className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capture Now</span>
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 pt-8 border-t border-slate-50 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Fulfillment Method</h4>
                                </div>
                                <Tabs value={method} onValueChange={(v: any) => setMethod(v)}>
                                    <TabsList className="bg-slate-50 dark:bg-white/5 h-16 p-1.5 rounded-2xl grid grid-cols-2 gap-2">
                                        <TabsTrigger value="PICKUP" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg h-full">
                                            <Package className="w-4 h-4" /> Pickup
                                        </TabsTrigger>
                                        <TabsTrigger value="DELIVER" className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg h-full">
                                            <Truck className="w-4 h-4" /> Delivery
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <p className="text-[10px] font-medium text-slate-400 italic px-2">
                                    {method === "PICKUP" 
                                        ? "You will be notified to pick up the document once it's ready at the Barangay Hall." 
                                        : "The document will be delivered to your registered address once processed."}
                                </p>
                            </div>

                            <Button 
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all gap-3"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {isSubmitting ? "PROCESSING..." : "SUBMIT REQUEST"}
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-slate-100 dark:border-white/5 shadow-xl bg-blue-600 text-white overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/20" />
                        <CardHeader className="relative z-10 p-8 pb-4">
                            <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 p-8 pt-0 space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Fulfillment</span>
                                <span className="text-sm font-black uppercase tracking-tight italic">{method}</span>
                            </div>
                            <div className="pt-4 flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                                <BadgeCheck className="w-5 h-5 text-blue-100" />
                                <span className="text-[9px] font-black uppercase tracking-[0.1em] leading-tight">Proceeding will create an official record request for your profile.</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-slate-100 dark:border-white/5 shadow-xl bg-slate-50 dark:bg-white/5 p-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-amber-500" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Important Note</h4>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 italic leading-relaxed">
                            Please ensure all provided information are accurate. False information may delay or result in the rejection of your request. Processing times vary by barangay but usually take 1-3 business days.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Re-using Lucide icons if needed
const Send = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
