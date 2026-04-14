"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
    upsertAboutData, 
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { 
    History, 
    UserCog, 
    ImageIcon, 
} from "lucide-react";

interface AboutClientProps {
     
    aboutData: any;
    isBarangayAdmin: boolean;
    managedBarangay?: string | null;
}

export default function AboutClient({ 
    aboutData, 
    isBarangayAdmin, 
    managedBarangay,
}: AboutClientProps) {
    return (
        <AboutManager 
            aboutData={aboutData} 
            isBarangayAdmin={isBarangayAdmin} 
            barangayName={managedBarangay || undefined} 
        />
    );
}

// Sub-components: AboutManager
function AboutManager({ 
    aboutData, 
    isBarangayAdmin, 
    barangayName 
}: { 
    aboutData: any, 
    isBarangayAdmin: boolean, 
    barangayName?: string 
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState(aboutData?.history || "");
    const [mission, setMission] = useState(aboutData?.mission || "");
    const [vision, setVision] = useState(aboutData?.vision || "");
    const [coreValues, setCoreValues] = useState(aboutData?.coreValues || "");
    const [geo, setGeo] = useState(aboutData?.geographyOrDemographics || "");
    const [leaderName, setLeaderName] = useState(
        (isBarangayAdmin ? aboutData?.captainName : aboutData?.mayorName) || ""
    );
    const [message, setMessage] = useState(
        (isBarangayAdmin ? aboutData?.captainMessage : aboutData?.mayorMessage) || ""
    );

    React.useEffect(() => {
        setHistory(aboutData?.history || "");
        setMission(aboutData?.mission || "");
        setVision(aboutData?.vision || "");
        setCoreValues(aboutData?.coreValues || "");
        setGeo(aboutData?.geographyOrDemographics || "");
        setLeaderName((isBarangayAdmin ? aboutData?.captainName : aboutData?.mayorName) || "");
        setMessage((isBarangayAdmin ? aboutData?.captainMessage : aboutData?.mayorMessage) || "");
    }, [aboutData, isBarangayAdmin]);
    
    const [leaderFile, setLeaderFile] = useState<File | null>(null);
    const [leaderPreview, setLeaderPreview] = useState<string | null>(
        (isBarangayAdmin ? aboutData?.captainImageUrl : aboutData?.mayorImageUrl) || null
    );

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("history", history);
            formData.append("mission", mission);
            formData.append("vision", vision);
            formData.append("coreValues", coreValues);
            formData.append("geographyOrDemographics", geo);
            
            if (isBarangayAdmin) {
                formData.append("barangayName", barangayName || "");
                formData.append("captainName", leaderName);
                formData.append("captainMessage", message);
                if (leaderFile) formData.append("captainImage", leaderFile);
                formData.append("captainImageUrl", leaderPreview || "");
            } else {
                formData.append("mayorName", leaderName);
                formData.append("mayorMessage", message);
                if (leaderFile) formData.append("mayorImage", leaderFile);
                formData.append("mayorImageUrl", leaderPreview || "");
            }
            
            const res = await upsertAboutData(formData);
            if (res.success) {
                toast.success("Info updated successfully!");
            } else {
                toast.error(res.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-slate-200 dark:border-[#2a3040] shadow-xl overflow-hidden rounded-[2rem] bg-white dark:bg-[#1e2330]">
            <CardHeader className="bg-slate-50/50 dark:bg-black/20 border-b border-slate-100 dark:border-[#2a3040] p-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black italic uppercase tracking-tighter">
                    <History className="w-6 h-6 text-blue-600" />
                    {isBarangayAdmin ? "Barangay Background" : "Municipal Background"}
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">
                    Update the official narrative and foundational pillars.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2 lg:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Historical Narrative</Label>
                        <textarea 
                            value={history} 
                            onChange={(e) => setHistory(e.target.value)}
                            className="w-full min-h-[200px] p-6 rounded-2xl border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none leading-relaxed"
                            placeholder="Tell the story of our heritage..."
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Statement</Label>
                            <textarea 
                                value={mission} 
                                onChange={(e) => setMission(e.target.value)}
                                className="w-full min-h-[120px] p-5 rounded-2xl border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-black/20 text-sm outline-none"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vision Statement</Label>
                            <textarea 
                                value={vision} 
                                onChange={(e) => setVision(e.target.value)}
                                className="w-full min-h-[120px] p-5 rounded-2xl border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-black/20 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Our Core Values</Label>
                            <textarea 
                                value={coreValues} 
                                onChange={(e) => setCoreValues(e.target.value)}
                                className="w-full min-h-[100px] p-5 rounded-2xl border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-black/20 text-sm outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isBarangayAdmin ? "Demographics" : "Geography & Fact Sheet"}</Label>
                            <textarea 
                                value={geo} 
                                onChange={(e) => setGeo(e.target.value)}
                                className="w-full min-h-[100px] p-5 rounded-2xl border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-black/20 text-sm outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-[#2a3040] space-y-8">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCog className="w-4 h-4" />
                        {isBarangayAdmin ? "Barangay Captain's Corner" : "Mayor's Public Message"}
                    </h4>
                    
                    <div className="flex flex-col md:flex-row gap-8">
                         <div className="w-full md:w-48 flex flex-col items-center gap-4">
                            <div className="w-48 h-48 rounded-[2rem] bg-slate-100 dark:bg-black/40 border-2 border-dashed border-slate-200 dark:border-[#2a3040] overflow-hidden relative group shadow-sm">
                                {leaderPreview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={leaderPreview} alt="Leader" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCog className="w-12 h-12 text-slate-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                                <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                                    <ImageIcon className="w-8 h-8 text-white mb-2" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Photo</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) { setLeaderFile(f); setLeaderPreview(URL.createObjectURL(f)); }
                                    }} />
                                </label>
                            </div>
                            <span className="text-[8px] font-black uppercase text-slate-400 text-center leading-tight">Recommended:<br/>Square Headshot (1:1)</span>
                         </div>
                         
                         <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Official Name & Title</Label>
                                <Input 
                                    value={leaderName || ""} 
                                    onChange={(e) => setLeaderName(e.target.value)} 
                                    placeholder="Hon. Juan Dela Cruz"
                                    className="h-14 rounded-2xl bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-[#2a3040] font-bold" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Message / Advocacy</Label>
                                <textarea 
                                    value={message || ""} 
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full min-h-[150px] p-6 rounded-2xl border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-black/20 text-sm outline-none leading-relaxed"
                                    placeholder="A message to your constituents..."
                                />
                            </div>
                         </div>
                    </div>
                </div>

                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full h-16 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-widest active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-none"
                >
                    {isSaving ? "Updating Heritage..." : "Publish Content Updates"}
                </Button>
            </CardContent>
        </Card>
    );
}



