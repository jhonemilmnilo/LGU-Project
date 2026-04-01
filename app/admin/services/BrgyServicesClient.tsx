"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
    getBrgyServices, 
    upsertBrgyService, 
    deleteBrgyService, 
    getBrgyRequests, 
    updateRequestStatus 
} from "./actions";
import { Plus, Trash2, Edit2, CheckCircle2, Clock, Truck, Package, X, Loader2, DollarSign, FileText, Image as ImageIcon, ExternalLink, Receipt, PlusCircle, MinusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface Requirement {
    id: string;
    label: string;
    type: "TEXT" | "NUMBER" | "FILE";
    required: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BrgyServicesClient({ 
    initialServices, 
    initialRequests, 
    isBarangayAdmin, 
    managedBarangay 
}: { 
    initialServices: any[], 
    initialRequests: any[], 
    isBarangayAdmin: boolean, 
    managedBarangay?: string 
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("requests");
    const [services, setServices] = useState(initialServices);
    const [requests, setRequests] = useState(initialRequests);

    // Filter by barangay name implicitly if needed?
    // The server already does it. 
    useEffect(() => {
        setServices(initialServices);
        setRequests(initialRequests);
    }, [initialServices, initialRequests]);

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <TabsTrigger value="requests" className="rounded-xl px-8 font-bold uppercase tracking-tight data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg">
                    Incoming Requests
                </TabsTrigger>
                <TabsTrigger value="inventory" className="rounded-xl px-8 font-bold uppercase tracking-tight data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg">
                    Service Inventory
                </TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-4 focus-visible:outline-none">
                <ServiceRequestsManager 
                    requests={requests} 
                    isBarangayAdmin={isBarangayAdmin} 
                />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4 focus-visible:outline-none">
                <ServicesInventoryManager 
                    services={services} 
                    isBarangayAdmin={isBarangayAdmin} 
                    managedBarangay={managedBarangay}
                />
            </TabsContent>
        </Tabs>
    );
}

// --- SUB-COMPONENTS ---

// 1. Service Requests Manager
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ServiceRequestsManager({ requests, isBarangayAdmin }: { requests: any[], isBarangayAdmin: boolean }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [updatingRequest, setUpdatingRequest] = useState<any | null>(null);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.length === 0 ? (
                    <Card className="col-span-full py-20 border-dashed bg-slate-50/50 dark:bg-slate-900/10">
                        <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
                            <Clock className="w-12 h-12 text-slate-300" />
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">No Requests Yet</h3>
                                <p className="text-sm text-slate-500 font-medium">When residents submit service requests, they will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    requests.map(request => (
                        <Card key={request.id} className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                                            {request.service.name}
                                        </CardTitle>
                                        <CardDescription className="font-bold flex items-center gap-1.5 text-blue-600 uppercase text-[10px] tracking-widest">
                                            {request.user.name}
                                        </CardDescription>
                                    </div>
                                    <StatusBadge status={request.status} />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Method</span>
                                        <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                            {request.method === "PICKUP" ? <Package className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                                            {request.method}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest">Date Submitted</span>
                                        <span className="font-black text-slate-900 dark:text-white">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button 
                                        onClick={() => setUpdatingRequest(request)}
                                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        Update Progress
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {updatingRequest && (
                <StatusUpdateModal 
                    request={updatingRequest} 
                    isOpen={!!updatingRequest} 
                    onClose={() => setUpdatingRequest(null)} 
                />
            )}
        </div>
    );
}

// 2. Status Update Modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatusUpdateModal({ request, isOpen, onClose }: { request: any, isOpen: boolean, onClose: () => void }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState(request.status);
    const [paymentMethod, setPaymentMethod] = useState(request.paymentDetail?.method || "CASH");
    const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");
    
    // Billing Items logic
    const [billingItems, setBillingItems] = useState<{ label: string, amount: number }[]>(
        request.paymentDetail?.items || []
    );

    const totalAmount = billingItems.reduce((sum, item) => sum + item.amount, 0);

    const addBillingItem = () => {
        setBillingItems([...billingItems, { label: "", amount: 0 }]);
    };

    const removeBillingItem = (index: number) => {
        setBillingItems(billingItems.filter((_, i) => i !== index));
    };

    const updateBillingItem = (index: number, updates: Partial<{ label: string, amount: number }>) => {
        setBillingItems(billingItems.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    const handleUpdate = async () => {
        setIsSaving(true);
        const detail = {
            totalAmount: totalAmount,
            items: billingItems,
            method: paymentMethod,
            paidAt: status === "DELIVERED" || status === "PICKED_UP" ? new Date().toISOString() : request.paymentDetail?.paidAt
        };

        const res = await updateRequestStatus(request.id, status, detail, adminNotes);
        if (res.success) {
            toast.success("Request updated!");
            router.refresh();
            onClose();
        } else {
            toast.error("Failed to update");
        }
        setIsSaving(false);
    };

    const submissions = request.submissions || {};

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] rounded-3xl border-none p-0 overflow-hidden bg-white dark:bg-slate-950 flex flex-col">
                <DialogHeader className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b">
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Process Application</DialogTitle>
                    <DialogDescription className="font-medium">Verify submissions and provide billing details for {request.service.name}.</DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {/* 1. Review Submissions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Resident Submissions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(submissions).length === 0 ? (
                                <p className="col-span-full text-xs font-bold text-slate-400 uppercase italic py-4 text-center bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed">No dynamic requirements provided.</p>
                            ) : (
                                Object.entries(submissions).map(([label, value]: [string, any]) => {
                                    const isImage = typeof value === 'string' && value.startsWith('data:image');
                                    return (
                                        <div key={label} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">{label}</Label>
                                            {isImage ? (
                                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group">
                                                    <img src={value} className="w-full h-full object-cover" alt={label} />
                                                    <a href={value} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <ImageIcon className="text-white w-6 h-6" />
                                                    </a>
                                                </div>
                                            ) : (
                                                <p className="font-bold text-slate-900 dark:text-white truncate">{value || 'N/A'}</p>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 2. Status & Payment Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Update Status</Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">PENDING</SelectItem>
                                    <SelectItem value="PROCESSING">PROCESSING</SelectItem>
                                    <SelectItem value="FOR_PICKUP">FOR PICKUP</SelectItem>
                                    <SelectItem value="FOR_DELIVERY">FOR DELIVERY</SelectItem>
                                    <SelectItem value="PICKED_UP">PICKED UP / COMPLETED</SelectItem>
                                    <SelectItem value="DELIVERED">DELIVERED / COMPLETED</SelectItem>
                                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Payment Channel</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 font-bold">
                                    <SelectValue placeholder="Method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">CASH ON COUNTER</SelectItem>
                                    <SelectItem value="GCASH">GCASH MOBILE</SelectItem>
                                    <SelectItem value="FREE">GRATIS / WAIVED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 3. Itemized Billing */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Bill Calculations</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={addBillingItem} className="h-8 rounded-full text-blue-600 font-black uppercase text-[10px] tracking-widest gap-2 bg-blue-50 dark:bg-blue-900/10 px-4 hover:bg-blue-100">
                                <PlusCircle className="w-3.5 h-3.5" /> Add Fee Row
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {billingItems.map((item, index) => (
                                <div key={index} className="flex gap-3 items-center group">
                                    <Input 
                                        placeholder="Description (e.g., Tax)" 
                                        value={item.label}
                                        onChange={(e) => updateBillingItem(index, { label: e.target.value })}
                                        className="h-11 rounded-xl font-bold flex-[2]"
                                    />
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">₱</span>
                                        <Input 
                                            type="number"
                                            placeholder="0"
                                            value={item.amount || ""}
                                            onChange={(e) => updateBillingItem(index, { amount: parseFloat(e.target.value) || 0 })}
                                            className="h-11 rounded-xl font-black pl-8"
                                        />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeBillingItem(index)} className="h-11 w-11 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                                        <MinusCircle className="w-5 h-5" />
                                    </Button>
                                </div>
                            ))}
                            
                            <div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/20 flex justify-between items-center">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Total Billable Amount</p>
                                    <p className="text-[9px] font-bold text-emerald-500 italic uppercase">Residents will see this breakdown in their status portal.</p>
                                </div>
                                <div className="text-3xl font-black text-emerald-600 tracking-tighter italic">₱{totalAmount}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Admin Internal Notes / Remarks</Label>
                        <Textarea 
                            placeholder="Add instructions or explain the billing to the resident..." 
                            value={adminNotes} 
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="rounded-2xl font-medium min-h-[100px]" 
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t flex flex-row gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 font-bold h-14 rounded-2xl uppercase tracking-widest text-[11px]">Discard</Button>
                    <Button 
                        disabled={isSaving}
                        onClick={handleUpdate}
                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 h-14 transition-all active:scale-95"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize & Send"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// 3. Services Inventory Manager
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ServicesInventoryManager({ services, isBarangayAdmin, managedBarangay }: { services: any[], isBarangayAdmin: boolean, managedBarangay?: string }) {
    const [showAddModal, setShowAddModal] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingService, setEditingService] = useState<any | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Active Inventory</h3>
                    <p className="text-sm text-slate-500 font-medium">Services currently available to your residents.</p>
                </div>
                <Button 
                    onClick={() => { setEditingService(null); setShowAddModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 gap-2 shadow-xl shadow-emerald-500/20"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-black uppercase tracking-widest text-xs">New Service</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <Card key={service.id} className="group border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">
                                    {service.name}
                                </CardTitle>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900 font-black text-[9px] uppercase tracking-widest">
                                    ₱{service.fee}
                                </Badge>
                            </div>
                            <CardDescription className="line-clamp-2 font-medium">{service.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 flex gap-2 border-t border-slate-50 dark:border-slate-900">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingService(service); setShowAddModal(true); }} className="flex-1 rounded-xl text-xs font-bold gap-2">
                                <Edit2 className="w-3.5 h-3.5" /> Edit
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {showAddModal && (
                <ServiceEditorModal 
                    service={editingService} 
                    isOpen={showAddModal} 
                    onClose={() => setShowAddModal(false)}
                    managedBarangay={managedBarangay}
                />
            )}
        </div>
    );
}

// 4. Service Editor Modal (Includes JSON Requirement Builder)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ServiceEditorModal({ service, isOpen, onClose, managedBarangay }: { service: any, isOpen: boolean, onClose: () => void, managedBarangay?: string }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState(service?.name || "");
    const [description, setDescription] = useState(service?.description || "");
    const [fee, setFee] = useState(service?.fee || 0);
    const [isPublished, setIsPublished] = useState(service?.isPublished ?? true);
    
    // Requirements JSON state
    const [requirements, setRequirements] = useState<Requirement[]>(service?.requirements || []);

    const addRequirement = () => {
        const newReq: Requirement = {
            id: Math.random().toString(36).substr(2, 9),
            label: "New Field",
            type: "TEXT",
            required: true
        };
        setRequirements([...requirements, newReq]);
    };

    const updateRequirement = (id: string, updates: Partial<Requirement>) => {
        setRequirements(requirements.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const removeRequirement = (id: string) => {
        setRequirements(requirements.filter(r => r.id !== id));
    };

    const handleSave = async () => {
        if (!name) return toast.error("Name is required");
        setIsSaving(true);
        
        const data = {
            name,
            description,
            isPublished,
            requirements,
            barangay: managedBarangay
        };

        const res = await upsertBrgyService(service?.id || null, data);
        if (res.success) {
            toast.success("Service saved!");
            router.refresh();
            onClose();
        } else {
            toast.error("Failed to save");
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 overflow-hidden border-none bg-white dark:bg-slate-950">
                <DialogHeader className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b">
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                        {service ? "Edit Service" : "Create New Barangay Service"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Service Name</Label>
                            <Input placeholder="e.g., Barangay Clearance" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl font-bold" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Description</Label>
                        <Textarea placeholder="Explain what this service is for..." value={description} onChange={e => setDescription(e.target.value)} className="min-h-[100px] rounded-xl font-medium" />
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-6">
                            <div className="space-y-1">
                                <h4 className="text-lg font-black uppercase italic tracking-tighter">Dynamic Requirements</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Define the JSON fields that residents must provide.</p>
                            </div>
                            <Button variant="outline" onClick={addRequirement} className="rounded-full border-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 gap-2 font-black text-[10px] uppercase tracking-widest px-6 h-9">
                                <Plus className="w-4 h-4" /> Add Field
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {requirements.length === 0 && (
                                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No requirements set. Direct submission only.</p>
                                </div>
                            )}
                            {requirements.map((req, idx) => (
                                <div key={req.id} className="flex gap-4 items-start bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Input Label</Label>
                                            <Input value={req.label} onChange={e => updateRequirement(req.id, { label: e.target.value })} className="h-9 rounded-lg" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] font-bold text-slate-400 uppercase">Data Type</Label>
                                            <Select value={req.type} onValueChange={(val: any) => updateRequirement(req.id, { type: val })}>
                                                <SelectTrigger className="h-9 rounded-lg">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="TEXT">TEXT INPUT</SelectItem>
                                                    <SelectItem value="NUMBER">NUMBER ONLY</SelectItem>
                                                    <SelectItem value="FILE">FILE UPLOAD / PHOTO</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col justify-end pb-2">
                                            <div className="flex items-center gap-2">
                                                <Switch checked={req.required} onCheckedChange={(val) => updateRequirement(req.id, { required: val })} />
                                                <span className="text-[9px] font-black uppercase text-slate-500">Required</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeRequirement(req.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t flex flex-row gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 font-black uppercase text-[10px] tracking-widest">Discard</Button>
                    <Button 
                        disabled={isSaving}
                        onClick={handleSave}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Service"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper small components
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string, className: string, icon: React.ReactNode }> = {
        PENDING: { label: "Pending", className: "bg-slate-100 text-slate-800", icon: <Clock className="w-3 h-3" /> },
        PROCESSING: { label: "In Process", className: "bg-blue-100 text-blue-800", icon: <Loader2 className="w-3 h-3 animate-spin" /> },
        FOR_PICKUP: { label: "Ready", className: "bg-amber-100 text-amber-800", icon: <Package className="w-3 h-3" /> },
        FOR_DELIVERY: { label: "On Delivery", className: "bg-purple-100 text-purple-800", icon: <Truck className="w-3 h-3" /> },
        PICKED_UP: { label: "Completed", className: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="w-3 h-3" /> },
        DELIVERED: { label: "Completed", className: "bg-emerald-100 text-emerald-800", icon: <CheckCircle2 className="w-3 h-3" /> },
        CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800", icon: <X className="w-3 h-3" /> },
    };

    const s = config[status] || config.PENDING;
    return (
        <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-none font-black text-[9px] uppercase tracking-widest whitespace-nowrap ${s.className}`}>
            {s.icon} {s.label}
        </Badge>
    );
}

function CardFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}
