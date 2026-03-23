/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { 
    Church, Download, Plus, Trash2, Calendar, 
    TrendingUp, DollarSign, Clock, Users, FileText,
    MapPin, Globe, LayoutDashboard, History, Save, CloudLightning, Pencil,
    AlertCircle, Layers, Info
} from "lucide-react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area 
} from "recharts";
import { format } from "date-fns";
import { 
    addMassSchedule, updateMassSchedule, deleteMassSchedule, 
    updateChurchInfo, saveChurchCollection, deleteCollectionEntry 
} from "./actions";
import { toast } from "sonner";

interface ChurchClientProps {
    initialInfo: any;
    initialSchedules: any[];
    initialCollections: any[];
}

export default function ChurchClient({ initialInfo, initialSchedules, initialCollections }: ChurchClientProps) {
    const [info, setInfo] = useState(initialInfo);
    const [schedules, setSchedules] = useState(initialSchedules);
    const [collections, setCollections] = useState(initialCollections);
    const [activeTab, setActiveTab] = useState<"dashboard" | "collections" | "schedule" | "settings">("dashboard");
    
    // Modal states
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
    const [flyerFile, setFlyerFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    // Collection Form State
    const [colForm, setColForm] = useState({
        date: format(new Date(), "yyyy-MM-dd"),
        sundayMassJson: [{ time: "6:00 AM", amount: "" }],
        secondBasket: 0,
        weekdays: 0,
        envelopes: 0,
        donationsJson: [{ name: "", amount: "" }]
    });

    // Schedule Form State
    const [schForm, setSchForm] = useState({
        id: "",
        day: "Sunday",
        time: "",
        language: "Ilocano",
        type: "Mass",
        date: "",
        prio: 0,
        description: ""
    });

    const [editingCollection, setEditingCollection] = useState<any | null>(null);
    const [editingSchedule, setEditingSchedule] = useState<any | null>(null);

    // Graph Data Transformation
    const chartData = useMemo(() => {
        return [...collections].reverse().map(c => ({
            name: format(new Date(c.date), "MMM dd"),
            total: c.totalAmount,
            sunday: (c.sundayMassJson as any[])?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0,
            donations: (c.donationsJson as any[])?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0,
        }));
    }, [collections]);

    // Financial Analysis
    const totalDonationsAllTime = collections.reduce((sum, c) => sum + c.totalAmount, 0);
    const avgMonthly = totalDonationsAllTime / (collections.length || 1);

    const handleSaveCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const cleanedSunday = colForm.sundayMassJson.filter(item => item.amount !== "");
            const cleanedDonations = colForm.donationsJson.filter(item => item.name !== "" && item.amount !== "");
            
            const payload = {
                ...colForm,
                id: editingCollection?.id,
                sundayMassJson: cleanedSunday.map(i => ({ ...i, amount: Number(i.amount) })),
                donationsJson: cleanedDonations.map(i => ({ ...i, amount: Number(i.amount) })),
                secondBasket: Number(colForm.secondBasket),
                weekdays: Number(colForm.weekdays),
                envelopes: Number(colForm.envelopes)
            };

            const saved = await saveChurchCollection(payload);
            
            if (editingCollection) {
                setCollections(prev => prev.map(c => c.id === saved.id ? saved : c));
                toast.success("Record updated!");
            } else {
                setCollections([saved, ...collections]);
                toast.success("Financial collection logged!");
            }
            
            setIsCollectionModalOpen(false);
            setEditingCollection(null);
            // Reset
            setColForm({
                date: format(new Date(), "yyyy-MM-dd"),
                sundayMassJson: [{ time: "6:00 AM", amount: "" }],
                secondBasket: 0,
                weekdays: 0,
                envelopes: 0,
                donationsJson: [{ name: "", amount: "" }]
            });
        } catch (err) {
            toast.error("Failed to save records.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingSchedule) {
                const updated = await updateMassSchedule(editingSchedule.id, schForm);
                setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
                toast.success("Schedule updated!");
            } else {
                const created = await addMassSchedule({ ...schForm, churchInfoId: info.id });
                setSchedules(prev => [...prev, created]);
                toast.success("Schedule added!");
            }
            setIsScheduleModalOpen(false);
            setEditingSchedule(null);
            setSchForm({ id: "", day: "Sunday", time: "", language: "Ilocano", type: "Mass", date: "", prio: 0, description: "" });
        } catch (err) {
            toast.error("Failed to save schedule.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm("Remove this schedule?")) return;
        try {
            await deleteMassSchedule(id);
            setSchedules(prev => prev.filter(s => s.id !== id));
            toast.success("Schedule removed.");
        } catch (err) {
            toast.error("Delete failed.");
        }
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm("Delete this financial record?")) return;
        try {
            await deleteCollectionEntry(id);
            setCollections(prev => prev.filter(c => c.id !== id));
            toast.success("Record deleted.");
        } catch (err) {
            toast.error("Delete failed.");
        }
    };

    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", info.name);
            formData.append("address", info.address);
            formData.append("locationUrl", info.locationUrl || "");
            if (info.latitude) formData.append("latitude", info.latitude.toString());
            if (info.longitude) formData.append("longitude", info.longitude.toString());
            formData.append("flyerUrl", info.flyerUrl || "");
            
            if (flyerFile) {
                formData.append("flyerFile", flyerFile);
            }

            const updated = await updateChurchInfo(info.id, formData);
            setInfo(updated);
            setFlyerFile(null);
            setIsEditInfoOpen(false);
            toast.success("Church details updated.");
        } catch (err) {
            toast.error("Failed to update info.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-slate-50/50 dark:bg-transparent min-h-screen">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <Church size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Holy Parish</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                        <Church className="mr-3 text-blue-600 w-10 h-10" />
                        Parish Records Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Transparency ledger, schedules, and digital mass flyers management.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCollectionModalOpen(true)}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-black shadow-lg shadow-emerald-500/30 transition-all select-none cursor-pointer uppercase text-xs"
                    >
                        <Plus size={18} />
                        <span>Log Collection</span>
                    </button>
                    <button
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black shadow-lg shadow-blue-500/30 transition-all select-none cursor-pointer uppercase text-xs"
                    >
                        <Calendar size={18} />
                        <span>Add Schedule</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 bg-white dark:bg-[#151b2b] p-1.5 rounded-[2rem] border border-slate-200 dark:border-[#2a3040] w-fit shadow-xl">
                {[
                    { id: "dashboard", label: "Financial Data", icon: LayoutDashboard },
                    { id: "collections", label: "History Log", icon: History },
                    { id: "schedule", label: "Mass Schedule", icon: Clock },
                    { id: "settings", label: "Basics & Flyers", icon: FileText }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${
                            activeTab === tab.id 
                            ? "bg-blue-600 text-white shadow-lg" 
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                        }`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Summary Cards */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#151b2b] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <TrendingUp className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1 italic">Monthly Average</h3>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">₱{avgMonthly.toLocaleString()}</p>
                        </div>

                         <div className="bg-white dark:bg-[#151b2b] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <DollarSign className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1 italic">Latest Collection</h3>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">₱{(collections[0]?.totalAmount || 0).toLocaleString()}</p>
                        </div>

                         <div className="bg-white dark:bg-[#151b2b] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest mb-1 italic">Records Collected</h3>
                            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{collections.length} Weeks</p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#151b2b] p-8 rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 ring-1 ring-slate-200 dark:ring-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Donation Trends</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sunday Masses</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Donations</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "1rem", border: "1px solid #1e293b" }}
                                        itemStyle={{ color: "#fff", fontWeight: "bold" }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                    <Area type="monotone" dataKey="donations" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDonations)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "collections" && (
                <div className="bg-white dark:bg-[#151b2b] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl overflow-hidden shadow-blue-500/5 ring-1 ring-slate-200 dark:ring-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#1a2133]">
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Log Date</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sunday Masses</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Others (Envelopes, etc)</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Total Amount</th>
                                    <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-[#2a3040]">
                                {collections.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-6">
                                            <div className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-lg">{format(new Date(c.date), "MMM dd, yyyy")}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Logged at {format(new Date(c.createdAt), "HH:mm")}</div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                {(c.sundayMassJson as any[])?.map((m, i) => (
                                                    <span key={i} className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold">
                                                        {m.time}: ₱{m.amount.toLocaleString()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="space-y-1 text-xs font-medium text-slate-500">
                                                <p>Basket 2: <span className="text-slate-900 dark:text-slate-300 font-bold">₱{c.secondBasket.toLocaleString()}</span></p>
                                                <p>Weekdays: <span className="text-slate-900 dark:text-slate-300 font-bold">₱{c.weekdays.toLocaleString()}</span></p>
                                                <p>Envelopes: <span className="text-slate-900 dark:text-slate-300 font-bold">₱{c.envelopes.toLocaleString()}</span></p>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter italic">₱{c.totalAmount.toLocaleString()}</div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setEditingCollection(c);
                                                        setColForm({
                                                            date: format(new Date(c.date), "yyyy-MM-dd"),
                                                            sundayMassJson: (c.sundayMassJson as any[]).map(s => ({ ...s, amount: s.amount.toString() })),
                                                            secondBasket: c.secondBasket,
                                                            weekdays: c.weekdays,
                                                            envelopes: c.envelopes,
                                                            donationsJson: (c.donationsJson as any[]).map(d => ({ ...d, amount: d.amount.toString() }))
                                                        });
                                                        setIsCollectionModalOpen(true);
                                                    }}
                                                    className="p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-2xl transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteCollection(c.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "schedule" && (
                <div className="space-y-12 pb-20">
                    {/* Summary Stat */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-8 bg-blue-600 rounded-full" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Weekly Timetable</h3>
                        <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Scroll and Manage Liturgy</span>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => {
                            const daySchedules = schedules.filter(s => s.day === day && !s.date);
                            const specificSchedules = schedules.filter(s => s.date && format(new Date(s.date), "EEEE") === day);
                            const allForDay = [...daySchedules, ...specificSchedules].sort((a,b) => (b.prio || 0) - (a.prio || 0));

                            if (allForDay.length === 0) return null;

                            return (
                                <div key={day} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black uppercase tracking-[0.2em] italic shadow-xl">
                                            {day}
                                        </div>
                                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {allForDay.map((s) => (
                                            <div key={s.id} className="bg-white dark:bg-[#151b2b] p-8 rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-xl relative group hover:border-blue-500/50 transition-all duration-500">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                                        <Clock className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingSchedule(s);
                                                                setSchForm({
                                                                    id: s.id,
                                                                    day: s.day,
                                                                    time: s.time,
                                                                    language: s.language || "",
                                                                    type: s.type || "",
                                                                    prio: s.prio || 0,
                                                                    date: s.date ? format(new Date(s.date), "yyyy-MM-dd") : "",
                                                                    description: s.description || ""
                                                                });
                                                                setIsScheduleModalOpen(true);
                                                            }}
                                                            className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 dark:bg-blue-500/5 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                            title="Edit Slot"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteSchedule(s.id);
                                                            }} 
                                                            className="w-10 h-10 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        {s.date ? format(new Date(s.date), "MMM dd, yyyy") : (s.prio > 0 ? `Priority P${s.prio}` : "Standard Time")}
                                                    </h4>
                                                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">{s.time}</p>
                                                </div>

                                                {s.description && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-3 leading-relaxed font-medium">
                                                            {s.description}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-6 flex flex-wrap gap-2">
                                                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest italic border border-slate-100 dark:border-white/5">{s.language || "English"}</span>
                                                    <span className="px-3 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[10px] font-black text-blue-500 uppercase tracking-widest italic">{s.type || "Mass"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === "settings" && (
                <div className="max-w-4xl space-y-8">
                     <div className="bg-white dark:bg-[#151b2b] p-10 rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl relative overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Parish Identity</h3>
                            <button onClick={() => setIsEditInfoOpen(true)} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-sm font-black uppercase italic tracking-tighter transition-all">Edit Basics</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic mb-1">Official Church Name</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{info.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic mb-1">Physical Address</p>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium italic">
                                        <MapPin size={16} />
                                        <span>{info.address}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 italic mb-1">Interactive Map Link</p>
                                    <div className="flex items-center gap-2 text-blue-600 font-bold italic truncate">
                                        <Globe size={16} />
                                        <span className="truncate">{info.locationUrl || "Not set"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-blue-50 dark:bg-blue-500/5 rounded-[2rem] border border-blue-100 dark:border-blue-500/20 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center">
                                    <FileText className="text-blue-600 dark:text-blue-400 w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Active Mass Flyer</h4>
                                    <p className="text-xs text-slate-500 font-medium italic">All users can download this PDF in the landing page.</p>
                                </div>
                                {info.flyerUrl ? (
                                    <a href={info.flyerUrl} target="_blank" className="flex items-center gap-2 text-blue-600 font-black uppercase italic text-sm hover:underline">
                                        <Download size={16} />
                                        <span>Download PDF</span>
                                    </a>
                                ) : (
                                    <p className="text-amber-600 text-xs font-bold uppercase tracking-widest italic">No Flyer Uploaded</p>
                                )}
                            </div>
                        </div>
                     </div>
                </div>
            )}

            {/* MODALS */}
            
            {/* Collection Logger Modal */}
            {isCollectionModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => { setIsCollectionModalOpen(false); setEditingCollection(null); }}>
                    <div className="bg-white dark:bg-[#151b2b] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-slate-200 dark:border-[#2a3040] flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                                    {editingCollection ? "Edit Financial Entry" : "Log Financial Record"}
                                </h2>
                                <p className="text-slate-500 text-sm font-medium italic mt-1">
                                    {editingCollection ? `Updating record for ${format(new Date(editingCollection.date), "MMMM dd")}` : "Add Sunday masses, donations, and other parish income."}
                                </p>
                            </div>
                            <button onClick={() => { setIsCollectionModalOpen(false); setEditingCollection(null); }} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveCollection} className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Record Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={colForm.date}
                                        onChange={e => setColForm({...colForm, date: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Sunday Mass Rows */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Sunday Mass Collections (per Time Slot)</p>
                                {colForm.sundayMassJson.map((slot, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <input
                                            placeholder="Time (e.g. 6AM)"
                                            value={slot.time}
                                            onChange={e => {
                                                const news = [...colForm.sundayMassJson];
                                                news[idx].time = e.target.value;
                                                setColForm({...colForm, sundayMassJson: news});
                                            }}
                                            className="flex-1 bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={slot.amount}
                                            onChange={e => {
                                                const news = [...colForm.sundayMassJson];
                                                news[idx].amount = e.target.value;
                                                setColForm({...colForm, sundayMassJson: news});
                                            }}
                                            className="w-32 bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold"
                                        />
                                        {idx > 0 && (
                                            <button type="button" onClick={() => {
                                                setColForm({...colForm, sundayMassJson: colForm.sundayMassJson.filter((_, i) => i !== idx)});
                                            }} className="p-2 text-red-500"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setColForm({...colForm, sundayMassJson: [...colForm.sundayMassJson, {time: "", amount: ""}]})} className="text-[10px] font-black text-blue-500 uppercase italic hover:underline">+ Add Time Slot</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Basket 2</label>
                                    <input type="number" value={colForm.secondBasket} onChange={e => setColForm({...colForm, secondBasket: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Weekdays</label>
                                    <input type="number" value={colForm.weekdays} onChange={e => setColForm({...colForm, weekdays: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Envelopes</label>
                                    <input type="number" value={colForm.envelopes} onChange={e => setColForm({...colForm, envelopes: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold" />
                                </div>
                            </div>

                            {/* Donations Rows */}
                            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#2a3040]">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Specific Donations (Name and Amount)</p>
                                {colForm.donationsJson.map((d, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <input
                                            placeholder="Donor Name"
                                            value={d.name}
                                            onChange={e => {
                                                const news = [...colForm.donationsJson];
                                                news[idx].name = e.target.value;
                                                setColForm({...colForm, donationsJson: news});
                                            }}
                                            className="flex-1 bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={d.amount}
                                            onChange={e => {
                                                const news = [...colForm.donationsJson];
                                                news[idx].amount = e.target.value;
                                                setColForm({...colForm, donationsJson: news});
                                            }}
                                            className="w-32 bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-sm font-bold"
                                        />
                                        {idx > 0 && (
                                            <button type="button" onClick={() => {
                                                setColForm({...colForm, donationsJson: colForm.donationsJson.filter((_, i) => i !== idx)});
                                            }} className="p-2 text-red-500"><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setColForm({...colForm, donationsJson: [...colForm.donationsJson, {name: "", amount: ""}]})} className="text-[10px] font-black text-emerald-500 uppercase italic hover:underline">+ Add Donation</button>
                            </div>

                            <div className="flex items-center justify-end space-x-4 pt-10">
                                <button type="button" onClick={() => { setIsCollectionModalOpen(false); setEditingCollection(null); }} className="px-8 py-4 rounded-2xl text-sm font-black text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase italic">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-8 py-4 rounded-2xl text-sm font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/30 transition-all disabled:opacity-50 uppercase italic">
                                    {isLoading ? "Saving Ledger..." : editingCollection ? "Update Historical Entry" : "Post to Transparency Ledger"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
             {isScheduleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }}>
                    <div className="bg-white dark:bg-[#151b2b] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-slate-200 dark:border-[#2a3040] flex justify-between items-start">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                                {editingSchedule ? "Edit Schedule Slot" : "Add Mass Schedule"}
                            </h2>
                            <button onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddOrUpdateSchedule} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic flex items-center gap-1">
                                        <Calendar size={10} /> Specific Date (Optional)
                                    </label>
                                    <input type="date" value={schForm.date} onChange={e => setSchForm({...schForm, date: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold text-xs" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic flex items-center gap-1">
                                        <Layers size={10} /> Priority (Higher = Top)
                                    </label>
                                    <input type="number" value={schForm.prio} onChange={e => setSchForm({...schForm, prio: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold text-xs" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Standard Day of Week</label>
                                <select value={schForm.day} onChange={e => setSchForm({...schForm, day: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold">
                                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Time Slot</label>
                                    <input required placeholder="6:00 AM" value={schForm.time} onChange={e => setSchForm({...schForm, time: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Language</label>
                                    <input value={schForm.language} onChange={e => setSchForm({...schForm, language: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Service Type</label>
                                <input value={schForm.type} onChange={e => setSchForm({...schForm, type: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" placeholder="Mass" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic flex items-center gap-1">
                                    <Info size={10} /> Liturgical Description
                                </label>
                                <textarea 
                                    value={schForm.description} 
                                    onChange={e => setSchForm({...schForm, description: e.target.value})} 
                                    className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-medium text-sm italic h-24"
                                    placeholder="e.g. Feast of the Holy Rosary / Healing Mass"
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-4 pt-6">
                                <button type="button" onClick={() => { setIsScheduleModalOpen(false); setEditingSchedule(null); }} className="px-8 py-4 rounded-2xl text-sm font-black text-slate-500 uppercase italic">Cancel</button>
                                <button type="submit" className="px-8 py-4 rounded-2xl text-sm font-black bg-blue-600 text-white shadow-xl shadow-blue-500/30 transition-all uppercase italic">
                                    {editingSchedule ? "Update Slot" : "Save Slot"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
             )}

             {/* Info Edit Modal */}
             {isEditInfoOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsEditInfoOpen(false)}>
                    <div className="bg-white dark:bg-[#151b2b] rounded-[3rem] border border-slate-200 dark:border-[#2a3040] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-slate-200 dark:border-[#2a3040] flex justify-between items-start">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                                Church Identity
                            </h2>
                            <button onClick={() => setIsEditInfoOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateInfo} className="p-10 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Parish Name</label>
                                <input value={info.name} onChange={e => setInfo({...info, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Official Address</label>
                                <input value={info.address} onChange={e => setInfo({...info, address: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Map Link / Location URL (Google Maps)</label>
                                <input 
                                    value={info.locationUrl || ""} 
                                    onChange={e => {
                                        const url = e.target.value;
                                        // Attempt to extract latitude and longitude from common Google Maps URL formats
                                        const locationMatch = url.match(/@([-0-9.]+),([-0-9.]+)/) || 
                                                              url.match(/query=([-0-9.]+),([-0-9.]+)/) || 
                                                              url.match(/ll=([-0-9.]+),([-0-9.]+)/) ||
                                                              url.match(/lat=([-0-9.]+)&lng=([-0-9.]+)/);
                                        
                                        const stateUpdate: any = { ...info, locationUrl: url };
                                        if (locationMatch && locationMatch.length >= 3) {
                                            stateUpdate.latitude = parseFloat(locationMatch[1]);
                                            stateUpdate.longitude = parseFloat(locationMatch[2]);
                                        }
                                        setInfo(stateUpdate);
                                    }} 
                                    className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" 
                                    placeholder="Paste Google Maps link here" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Latitude</label>
                                    <input type="number" step="any" value={info.latitude || ""} onChange={e => setInfo({...info, latitude: e.target.value ? parseFloat(e.target.value) : undefined})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" placeholder="e.g. 16.0354" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Longitude</label>
                                    <input type="number" step="any" value={info.longitude || ""} onChange={e => setInfo({...info, longitude: e.target.value ? parseFloat(e.target.value) : undefined})} className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold" placeholder="e.g. 120.4431" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">PDF Flyer URL (Optional)</label>
                                <input value={info.flyerUrl || ""} onChange={e => setInfo({...info, flyerUrl: e.target.value})} className="w-full bg-slate-50 dark:bg-[#1e2330] border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 font-bold mb-4" placeholder="Or leave blank to use file upload" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Upload New PDF Flyer</label>
                                <div className="relative group">
                                    <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        onChange={e => setFlyerFile(e.target.files?.[0] || null)}
                                        className="w-full bg-slate-50 dark:bg-[#1e2330] border border-dashed border-slate-300 dark:border-[#2a3040] rounded-xl px-4 py-8 text-sm font-bold text-slate-500 cursor-pointer file:hidden text-center hover:border-blue-500 transition-all"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        {flyerFile ? (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <FileText size={18} />
                                                <span className="truncate max-w-[200px]">{flyerFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-50">
                                                <CloudLightning size={24} className="mb-1" />
                                                <span>Click to select PDF flyer</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end space-x-4 pt-6">
                                <button type="button" onClick={() => setIsEditInfoOpen(false)} className="px-8 py-4 rounded-2xl text-sm font-black text-slate-500 uppercase italic">Cancel</button>
                                <button type="submit" disabled={isLoading} className="px-8 py-4 rounded-2xl text-sm font-black bg-blue-600 text-white shadow-xl shadow-blue-500/30 transition-all uppercase italic">
                                    {isLoading ? "Updating..." : "Update Parish Info"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
             )}
        </div>
    );
}
