"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, ShieldAlert, Users, Layers, Compass, Wind, Waves, Activity, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleDisasterView } from "../../admin/disasters/components/SimpleDisasterView";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UserMapsView({ initialHazardMaps = [] }: { initialHazardMaps: any[] }) {
    const [selectedHazardMap, setSelectedHazardMap] = useState(initialHazardMaps[0] || null);

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <MapIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Strategic Maps</h1>
                    </div>
                    <p className="text-slate-500 font-medium italic max-w-xl">
{ }
{ }
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Explore Mapandan through our interactive spatial hubs. Monitor environmental risks or view the municipality's residential pulse.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="disaster" className="space-y-10">
                <TabsList className="bg-slate-100 dark:bg-white/5 p-1 h-16 rounded-2xl w-full sm:w-auto">
                    <TabsTrigger value="disaster" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all">
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        Hazard Sentinel
                    </TabsTrigger>
                    <TabsTrigger value="household" className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                        <Users className="w-4 h-4 mr-2" />
                        Residential Pulse
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="disaster" className="outline-none space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        {/* Left: Dynamic Visualizer */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Active Monitoring Layer: <span className="text-blue-600">{selectedHazardMap?.title || "None"}</span></span>
                                <div className="flex items-center gap-2">
                                    {initialHazardMaps.map((map) => (
                                        <button
                                            key={map.id}
                                            onClick={() => setSelectedHazardMap(map)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                selectedHazardMap?.id === map.id
                                                    ? "bg-blue-600 text-white shadow-lg"
                                                    : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-600"
                                            )}
                                            title={map.title}
                                        >
                                            <Layers className="w-4 h-4" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedHazardMap ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <SimpleDisasterView 
                                        title={selectedHazardMap.title}
                                        description={selectedHazardMap.description || "Official hazard assessment for the municipality."}
                                        imagePath={selectedHazardMap.imagePath}
                                        riskLevel={selectedHazardMap.riskLevel}
                                    />
                                </motion.div>
                            ) : (
                                <div className="aspect-[16/10] md:aspect-[21/9] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] sm:rounded-[4rem] text-center p-8 sm:p-20 bg-white dark:bg-black/20">
                                    <MapIcon className="w-12 h-12 sm:w-20 sm:h-20 text-slate-200 dark:text-white/5 mb-6" />
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-400 uppercase italic tracking-tighter italic">Initializing Sentinel...</h3>
                                    <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium italic">Please select a monitoring layer to begin spatial analysis.</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Technical Metadata */}
                        <div className="space-y-8">
                            <div className="p-8 bg-white dark:bg-[#0a0c10] rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-8 shadow-xl">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight flex items-center gap-3">
                                    <Compass className="w-4 h-4 text-blue-600" />
                                    Environmental Pulse
                                </h3>
                                <div className="space-y-6">
                                    {[
                                        { label: "Sea Condition", value: "Normal", icon: Waves, color: "text-blue-500" },
                                        { label: "Wind Velocity", value: "12 km/h", icon: Wind, color: "text-slate-400" },
                                        { label: "Sismic Activity", value: "Level 1", icon: Activity, color: "text-green-500" },
                                        { label: "Tidal Surge", value: "Low", icon: AlertTriangle, color: "text-blue-400" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between group cursor-help">
                                            <div className="flex items-center gap-4">
                                                <item.icon className={cn("w-4 h-4", item.color)} />
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900 dark:text-white tracking-tight">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-slate-950 rounded-[2.5rem] space-y-6 border border-white/5 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Latest Advisory</h3>
                                </div>
                                <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                                    No active warnings. Monitoring localized rain showers in eastern sectors.
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="household" className="outline-none">
                    <div className="aspect-[16/10] md:aspect-[21/9] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] text-center p-12 bg-white dark:bg-black/20">
                         <Users className="w-16 h-16 text-slate-200 dark:text-white/5 mb-6" />
                         <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-tighter italic">Residential Mapping Portal</h3>
                         <p className="text-sm text-slate-400 mt-2 font-medium italic max-w-lg">
                            Visualizing the community density and demographic distribution of Mapandan. 
                            Secure access to residential spatial data is currently limited to official planning.
                         </p>
                         <div className="mt-8 flex gap-4">
                            <div className="px-6 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest italic">Density Visualizer</div>
                            <div className="px-6 py-2 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest italic">Resource Allocation</div>
                         </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
