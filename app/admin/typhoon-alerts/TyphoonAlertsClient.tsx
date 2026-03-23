"use client";

import React, { useState } from "react";
import { CloudLightning, Home, Plus, Edit, Trash2 } from "lucide-react";
import { createTyphoonAlert, updateTyphoonAlert, deleteTyphoonAlert } from "./actions";

export interface TyphoonAlert {
    id: string;
    name: string;
    signalNumber: number;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default function TyphoonAlertsClient({ initialData }: { initialData: TyphoonAlert[] }) {
    const [alerts, setAlerts] = useState<TyphoonAlert[]>(initialData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        signalNumber: 1,
        description: "",
        isActive: true,
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleOpen = (alert?: TyphoonAlert) => {
        if (alert) {
            setEditingId(alert.id);
            setForm({
                name: alert.name,
                signalNumber: alert.signalNumber,
                description: alert.description || "",
                isActive: alert.isActive
            });
        } else {
            setEditingId(null);
            setForm({ name: "", signalNumber: 1, description: "", isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingId) {
                const updated = await updateTyphoonAlert(editingId, form);
                setAlerts(prev => prev.map(a => a.id === editingId ? updated : a));
            } else {
                const created = await createTyphoonAlert(form);
                setAlerts(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Failed to save typhoon alert.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this alert?")) return;
        try {
            await deleteTyphoonAlert(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to delete.");
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs mb-2 bg-slate-100 dark:bg-slate-800/50 w-fit px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
                        <Home size={12} className="text-blue-500" />
                        <span className="opacity-50">/</span>
                        <span>Content</span>
                        <span className="opacity-50">/</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold">Typhoon Alerts</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic flex items-center">
                        <CloudLightning className="mr-3 text-blue-600 w-10 h-10" />
                        Typhoon Monitoring
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Manage active storm signals and broadcast emergency weather updates.</p>
                </div>
                <button
                    onClick={() => handleOpen()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all select-none cursor-pointer"
                >
                    <Plus size={18} />
                    <span>Create New Alert</span>
                </button>
            </div>

            {/* Live Weather Map Preview */}
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5 h-[450px] relative">
                <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-md px-4 py-2 rounded-xl shadow border border-slate-200 dark:border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-black tracking-widest uppercase text-slate-800 dark:text-slate-200">Live Satellite View</span>
                </div>
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=5&overlay=wind&product=ecmwf&level=surface&lat=12.8797&lon=121.7740" 
                    frameBorder="0"
                    title="Live Weather Map"
                    className="absolute inset-0"
                ></iframe>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-[#151b2b] rounded-3xl border border-slate-200 dark:border-[#2a3040] shadow-2xl shadow-blue-500/5 overflow-hidden ring-1 ring-slate-200 dark:ring-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-[#2a3040] bg-slate-50/50 dark:bg-[#1a2133]">
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Typhoon Name</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Signal Level</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#2a3040]">
                            {alerts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500 italic">No active typhoon alerts found.</td>
                                </tr>
                            ) : (
                                alerts.map(alert => (
                                    <tr key={alert.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-lg">{alert.name}</div>
                                            <div className="text-sm text-slate-500 line-clamp-1">{alert.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30">
                                                Signal {alert.signalNumber}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {alert.isActive ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                                    Ended
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleOpen(alert)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(alert.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#151b2b] rounded-2xl border border-slate-200 dark:border-[#2a3040] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-[#2a3040]">
                            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                {editingId ? "Edit Typhoon Alert" : "Create Typhoon Alert"}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Typhoon Name</label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Typhoon Kristine"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Signal Number</label>
                                <select
                                    value={form.signalNumber}
                                    onChange={e => setForm({ ...form, signalNumber: Number(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>Signal No. {num}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Advisories</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                    placeholder="Add emergency hotlines, evacuation center info, etc."
                                />
                            </div>
                            <div className="flex items-center space-x-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Currently Active Alert
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? "Saving..." : "Save Alert"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
