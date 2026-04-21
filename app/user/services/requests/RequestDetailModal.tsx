"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Activity,
    X as XIcon,
    CreditCard, 
    Truck, 
    FileText, 
    Wallet,
    Info,
    Calendar,
    ChevronRight,
    MapPin,
    Building2,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

interface RequestDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: any;
}

export default function RequestDetailModal({ isOpen, onClose, request }: RequestDetailModalProps) {
    if (!request) return null;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "DRAFT":
                return { label: "DRAFT", color: "bg-slate-100 text-slate-600 border-slate-200", icon: FileText, progress: 10 };
            case "FOR_REQUESTING":
                return { label: "FOR_REQUESTING", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, progress: 25 };
            case "FOR_PROCESSING":
                return { label: "FOR_PROCESSING", color: "bg-blue-50 text-blue-600 border-blue-100", icon: Activity, progress: 40 };
            case "EVALUATED":
                return { label: "EVALUATED", color: "bg-blue-100 text-blue-700 border-blue-200", icon: DollarSign, progress: 50 };
            case "UNPAID":
                return { label: "UNPAID", color: "bg-red-50 text-red-600 border-red-100", icon: Wallet, progress: 55 };
            case "PAID":
                return { label: "PAID", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Clock, progress: 75 };
            case "RELEASED":
                return { label: "RELEASED", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, progress: 100 };
            case "REJECTED":
                return { label: "REJECTED", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, progress: 0 };
            default:
                return { label: status, color: "bg-slate-100 text-slate-700 border-slate-200", icon: Clock, progress: 0 };
        }
    };

    const statusConfig = getStatusConfig(request.status);
    const additionalData = request.additionalData || {};
    const residentData = request.residentSnapshot || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent 
                showCloseButton={false}
                className="sm:max-w-[1400px] sm:w-[95vw] h-[82vh] top-[110px] translate-y-0 p-0 overflow-hidden bg-white dark:bg-[#0a0c10] rounded-2xl border-none shadow-2xl flex flex-col"
            >
                {/* Large Modern Close Action */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 z-50 p-2 bg-slate-100/50 dark:bg-white/5 hover:bg-red-500 hover:text-white transition-all rounded-xl group border border-transparent hover:border-red-500/20"
                >
                    <XIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                {/* Clean Header Section - Compacted for better content ratio */}
                <div className="bg-slate-50 dark:bg-white/[0.02] p-8 border-b border-slate-200 dark:border-white/5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-3 flex-1 text-center lg:text-left">
                            <DialogTitle className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                {request.type?.name || "Service Request"}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500 italic max-w-xl">
                                Official records and real-time tracking for your service request.
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                {/* Content Section - Flex-1 ensures it takes all available room between header and footer */}
                <div className="flex-1 min-h-0 bg-slate-50/30 dark:bg-transparent">
                    <ScrollArea className="h-full">
                        <div className="p-8 pb-32">
                            <Tabs defaultValue="overview" className="space-y-8">
                            <TabsList className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl h-16 w-fit border border-slate-200 dark:border-white/5">
                                <TabsTrigger value="overview" className="rounded-xl px-12 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white transition-all">Overview</TabsTrigger>
                                <TabsTrigger value="declarations" className="rounded-xl px-12 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white transition-all">Application Records</TabsTrigger>
                                <TabsTrigger value="logistics" className="rounded-xl px-12 font-black text-[10px] uppercase tracking-[0.2em] italic data-[state=active]:bg-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white transition-all">Logistics & Proof</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-0">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <Card className="p-10 border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-sm rounded-3xl lg:col-span-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white flex items-center gap-3 italic">
                                                <FileText className="w-5 h-5 text-primary" />
                                                Application Summary
                                            </h3>
                                            <Badge variant="outline" className={cn("inline-flex items-center gap-2 w-fit px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] italic rounded-full border-2", statusConfig.color)}>
                                                REQUEST STATUS: {statusConfig.label}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-10 gap-x-16">
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Applicant Classification</p>
                                                <p className="text-xl font-black text-slate-700 dark:text-slate-200 italic">{additionalData.applicantType || "INDIVIDUAL"}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Submission Date</p>
                                                <p className="text-xl font-black text-slate-700 dark:text-slate-200 italic">{format(new Date(request.createdAt), "MMMM d, yyyy")}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Fulfillment Strategy</p>
                                                <div className="flex items-center gap-3 text-xl font-black text-slate-700 dark:text-slate-200 italic">
                                                    {request.fulfillmentType === "DELIVERY" ? <Truck className="w-6 h-6 text-primary" /> : <MapPin className="w-6 h-6 text-primary" />}
                                                    {request.fulfillmentType?.replace("_", " ")}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] italic">Payment Channel</p>
                                                <div className="flex items-center gap-3 text-xl font-black text-slate-700 dark:text-slate-200 italic">
                                                    <CreditCard className="w-6 h-6 text-primary" />
                                                    {request.paymentType?.replace("_", " ")}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="p-10 border-none bg-slate-900 text-white shadow-2xl rounded-[3rem] relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 p-8 opacity-10">
                                            <Info className="w-24 h-24 rotate-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic mb-10">Administrative Remarks</h3>
                                            <div className="space-y-6">
                                                <p className="text-lg font-bold italic opacity-90 leading-relaxed">
                                                    &quot;{request.rejectionRemarks || `The administration is currently evaluating your request records. Please expect an update within ${request.type?.slaDays || 3} business days.`}&quot;
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 pt-10">
                                            <Separator className="bg-white/10" />
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/50 italic">Total Amount Due</p>
                                                    <p className="text-2xl font-black text-primary italic leading-none">
                                                        ₱{request.totalAmount ? (request.totalAmount as number).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                                                    </p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 italic text-right">Last Movement</p>
                                                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/60 italic">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(request.updatedAt), "MMM d, HH:mm")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="declarations" className="mt-0">
                                <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Personal Records</h4>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Legal Full Name</p>
                                                        <p className="text-sm font-bold">{residentData.firstName} {residentData.lastName}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Citizenship</p>
                                                        <p className="text-sm font-bold">{residentData.citizenship || "Filipino"}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Birth Date</p>
                                                        <p className="text-sm font-bold">{residentData.dateOfBirth ? format(new Date(residentData.dateOfBirth), "MMM d, yyyy") : "N/A"}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Civil Status</p>
                                                        <p className="text-sm font-bold">{residentData.civilStatus || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Separator className="opacity-50" />
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Financial Self-Declaration</h4>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Annual Gross Income</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">₱{(additionalData.income || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Property Value</p>
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">₱{(additionalData.propertyValue || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Residential Address</h4>
                                            <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5 relative group">
                                                <MapPin className="absolute top-6 right-6 w-8 h-8 text-slate-200 dark:text-slate-800 transition-colors group-hover:text-primary/20" />
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase font-black text-slate-400">Street / House No.</p>
                                                        <p className="text-sm font-bold">{residentData.houseNumber} {residentData.street}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Barangay</p>
                                                            <p className="text-sm font-bold">{residentData.barangay}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] uppercase font-black text-slate-400">Municipality</p>
                                                            <p className="text-sm font-bold">{residentData.municipality || "Agno"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="logistics" className="mt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Fulfillment Logistics</h4>
                                        {request.fulfillmentType === "DELIVERY" ? (
                                            <div className="p-6 border-2 border-primary/20 bg-primary/5 rounded-2xl flex items-start gap-5">
                                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h5 className="font-black uppercase tracking-widest text-xs mb-1">Doorstep Delivery</h5>
                                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic mb-4">Specified Address:</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white underline decoration-primary/40 decoration-2">
                                                        {(() => {
                                                            const addr = request.deliveryAddress;
                                                            if (!addr) return "No address specified";
                                                            if (typeof addr === "string") return addr;
                                                            return `${addr.houseNumber || ""} ${addr.street || ""}, ${addr.sitio ? `Sitio ${addr.sitio}, ` : ""}${addr.purok ? `Purok ${addr.purok}, ` : ""}${addr.barangay}, ${addr.municipality}, ${addr.province}`.trim().replace(/^,/, "").replace(/ ,/, " ");
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-start gap-5">
                                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h5 className="font-black uppercase tracking-widest text-xs mb-1">LGU Office Pickup</h5>
                                                    <p className="text-[11px] text-slate-500 font-medium italic">
                                                        Please present a valid ID at the Municipal Treasury Office once status is &quot;RELEASED&quot;.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Documentary Evidence</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: "Valid ID", url: additionalData.validIdUrl },
                                                { label: "Proof of Income", url: additionalData.proofOfIncomeUrl }
                                            ].map((doc, i) => (
                                                <div key={i} className="group cursor-pointer">
                                                    {doc.url ? (
                                                        <a href={doc.url} target="_blank" className="block relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 overflow-hidden group-hover:border-primary transition-all shadow-sm">
                                                            {/* Image Preview */}
                                                            <Image 
                                                                src={doc.url} 
                                                                alt={doc.label}
                                                                fill
                                                                className="object-cover group-hover:scale-110 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                                                                unoptimized
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                                    <ChevronRight className="w-6 h-6 text-white" />
                                                                </div>
                                                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Click to Expand</span>
                                                            </div>
                                                            <div className="absolute top-2 left-2 z-10">
                                                                <Badge className="text-[8px] font-black uppercase tracking-widest bg-white/90 text-slate-900 border-none px-2 py-0.5">{doc.label}</Badge>
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="aspect-video rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-300">
                                                            <XCircle className="w-5 h-5" />
                                                            <span className="text-[8px] font-black uppercase tracking-widest">{doc.label} Empty</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            </Tabs>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
