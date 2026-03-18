"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Globe, Layout, ShieldAlert, Image as ImageIcon } from "lucide-react";
import { processImageUpload, updateSystemSetting, createHeroSlide, deleteHeroSlide, updateHeroSlide, updateLogoSetting } from "./actions";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

interface SettingsClientProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    settings: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slides: any[];
}

export function SettingsClient({ settings, slides }: SettingsClientProps) {
    const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenance_mode === "true");
    const [logoUrl, setLogoUrl] = useState(settings.site_logo || "");
    const [portalName, setPortalName] = useState(settings.portal_name || "Municipality of Agno");
    const [emergencyPhone, setEmergencyPhone] = useState(settings.emergency_phone || "911");
    const [brandWord1, setBrandWord1] = useState(settings.brand_word_1 || "E");
    const [brandWord2, setBrandWord2] = useState(settings.brand_word_2 || "Mapandan");
    const [themeColor, setThemeColor] = useState(settings.theme_color || "#2563eb");
    const [isSaving, setIsSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get("tab") || "general";
    const [activeTab, setActiveTab] = useState(tabParam);

    useEffect(() => {
        if (tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`/admin/settings?tab=${value}`);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await updateSystemSetting("maintenance_mode", maintenanceMode.toString());
            
            // Handle logo
            if (logoFile) {
                const formData = new FormData();
                formData.append("imageFile", logoFile);
                formData.append("imageUrl", logoUrl);
                const result = await updateLogoSetting(formData);
                if (result.success && result.imageUrl) {
                    setLogoUrl(result.imageUrl);
                    setLogoFile(null);
                    setLogoPreview(null);
                }
            } else {
                await updateSystemSetting("site_logo", logoUrl);
            }

            await updateSystemSetting("portal_name", portalName);
            await updateSystemSetting("emergency_phone", emergencyPhone);
            await updateSystemSetting("brand_word_1", brandWord1);
            await updateSystemSetting("brand_word_2", brandWord2);
            await updateSystemSetting("theme_color", themeColor);
            toast.success("Settings updated successfully!");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Website Management</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">Configure your portal&apos;s global settings and landing page content.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">

                <TabsContent value="general" className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-blue-600" />
                                General Configuration
                            </CardTitle>
                            <CardDescription>Managed site-wide behaviors and branding.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            {/* Maintenance Mode */}
                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50">
                                <div className="space-y-1">
                                    <Label className="text-base font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" />
                                        Maintenance Mode
                                    </Label>
                                    <p className="text-sm text-amber-700 dark:text-amber-500/80 italic">
                                        Redirects all public visitors to the maintenance page.
                                    </p>
                                </div>
                                <Switch 
                                    checked={maintenanceMode} 
                                    onCheckedChange={setMaintenanceMode}
                                    className="data-[state=checked]:bg-amber-600"
                                />
                            </div>

                            {/* Site Logo */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Site Logo
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Upload Logo</Label>
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleLogoChange}
                                                className="rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs file:text-[10px] file:font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Or Logo URL</Label>
                                            <Input 
                                                value={logoUrl} 
                                                onChange={(e) => setLogoUrl(e.target.value)}
                                                placeholder="https://example.com/logo.png"
                                                className="font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">Leave empty to use the default municipal shield icon.</p>
                                </div>

                                {/* Global Branding */}
                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <Layout className="w-4 h-4" />
                                            Branding & Identity
                                        </Label>
                                        <p className="text-xs text-slate-400 italic">Configure the text and color scheme for the portal.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Branding First Word</Label>
                                            <Input 
                                                value={brandWord1} 
                                                onChange={(e) => setBrandWord1(e.target.value)}
                                                placeholder="E"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Branding Second Word</Label>
                                            <Input 
                                                value={brandWord2} 
                                                onChange={(e) => setBrandWord2(e.target.value)}
                                                placeholder="Mapandan"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-slate-400">Primary Theme Color</Label>
                                            <div className="flex gap-2">
                                                <Input 
                                                    type="color"
                                                    value={themeColor} 
                                                    onChange={(e) => setThemeColor(e.target.value)}
                                                    className="w-12 h-10 p-1 rounded-lg cursor-pointer"
                                                />
                                                <Input 
                                                    value={themeColor} 
                                                    onChange={(e) => setThemeColor(e.target.value)}
                                                    placeholder="#2563eb"
                                                    className="rounded-xl font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preview</span>
                                        <div className="flex flex-col items-center">
                                            <div className="text-3xl font-black uppercase tracking-tighter italic leading-none text-slate-900 dark:text-white">
                                                {brandWord1}<span style={{ color: themeColor }}>{brandWord2}</span>
                                            </div>
                                            <div 
                                                className="h-1 w-24 mt-2 rounded-full"
                                                style={{ background: `linear-gradient(to right, ${themeColor}, transparent)` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <Button 
                                        onClick={handleSaveSettings} 
                                        disabled={isSaving}
                                        className="w-full h-14 bg-slate-900 dark:bg-white dark:text-slate-950 text-white hover:opacity-90 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
                                    >
                                        {isSaving ? "Applying Changes..." : "Save Global Identity"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2">
                                <Save className="w-5 h-5 text-emerald-600" />
                                System Credentials & API
                            </CardTitle>
                            <CardDescription>Manage keys and identifiers used by the portal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Portal Name</Label>
                                    <Input value={portalName} onChange={(e) => setPortalName(e.target.value)} className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Emergency Contact</Label>
                                    <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="rounded-xl" />
                                </div>
                            </div>
                            <Button 
                                onClick={handleSaveSettings} 
                                disabled={isSaving}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6"
                            >
                                Update System Credentials
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hero" className="space-y-6">
                    <HeroSlidesManager initialSlides={slides} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HeroSlidesManager({ initialSlides }: { initialSlides: any[] }) {
    const [slides, setSlides] = useState(initialSlides);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSlide = async () => {
        const formData = new FormData();
        formData.append("title", "New Epic Title");
        formData.append("subtitle", "Enter a descriptive subtitle for this slide.");
        formData.append("tagline", "The Home of the Umbrella Rocks");
        formData.append("imageUrl", "https://images.unsplash.com/photo-1542332213-31f87348057f");
        formData.append("order", (slides.length).toString());
        formData.append("isActive", "true");
        formData.append("primaryBtnText", "Learn More");
        formData.append("primaryBtnLink", "#");
        
        setIsAdding(true);
        const result = await createHeroSlide(formData);
        if (result.success) {
            toast.success("New slide added!");
            window.location.reload();
        } else {
            toast.error("Failed to add slide");
        }
        setIsAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;
        
        const result = await deleteHeroSlide(id);
        if (result.success) {
            toast.success("Slide deleted");
            setSlides(slides.filter(s => s.id !== id));
        } else {
            toast.error("Failed to delete slide");
        }
    };

    const handleUpdate = async (id: string, formData: FormData) => {
        const result = await updateHeroSlide(id, formData);
        if (result.success) {
            toast.success("Slide updated successfully!");
        } else {
            toast.error("Failed to update slide");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Active Slides</h3>
                <Button onClick={handleAddSlide} disabled={isAdding} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 gap-2 shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4" />
                    Add Slide
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {slides.map((slide) => (
                    <SlideEditor key={slide.id} slide={slide} onSave={handleUpdate} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SlideEditor({ slide, onSave, onDelete }: { slide: any, onSave: (id: string, formData: FormData) => void, onDelete: (id: string) => void }) {
    const [data, setData] = useState(slide);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleLocalSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", data.title || "");
            formData.append("subtitle", data.subtitle || "");
            formData.append("tagline", data.tagline || "");
            formData.append("imageUrl", data.imageUrl || "");
            formData.append("order", (data.order || 0).toString());
            formData.append("isActive", data.isActive ? "true" : "false");
            formData.append("primaryBtnText", data.primaryBtnText || "");
            formData.append("primaryBtnLink", data.primaryBtnLink || "");
            formData.append("secondaryBtnText", data.secondaryBtnText || "");
            formData.append("secondaryBtnLink", data.secondaryBtnLink || "");

            if (imageFile) {
                formData.append("imageFile", imageFile);
            }

            await onSave(slide.id, formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Image Preview Side */}
                <div className="relative aspect-video md:aspect-auto bg-slate-100 dark:bg-slate-900">
                    { }
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl || data.imageUrl} alt="Slide Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Order: {data.order}</span>
                        <span className="text-white font-black uppercase italic tracking-tighter text-lg truncate">{data.title}</span>
                    </div>
                </div>

                {/* Editor Side */}
                <div className="md:col-span-2 p-6 space-y-4 bg-white dark:bg-slate-950">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Title</Label>
                            <Input value={data.title} onChange={(e) => setData({...data, title: e.target.value})} className="h-9 rounded-lg" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase text-slate-400">Tagline</Label>
                            <Input value={data.tagline || ""} onChange={(e) => setData({...data, tagline: e.target.value})} className="h-9 rounded-lg" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Subtitle</Label>
                        <Input value={data.subtitle || ""} onChange={(e) => setData({...data, subtitle: e.target.value})} className="h-9 rounded-lg" />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Upload Image</Label>
                                <Input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="h-9 rounded-lg text-xs file:bg-slate-100 dark:file:bg-slate-800 file:border-0 file:rounded-md file:mr-2 file:text-[10px] file:font-bold" 
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Or Image URL</Label>
                                <Input 
                                    value={data.imageUrl} 
                                    onChange={(e) => setData({...data, imageUrl: e.target.value})} 
                                    placeholder="https://..."
                                    className="h-9 rounded-lg font-mono text-[10px]" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Order</Label>
                                <Input type="number" value={data.order} onChange={(e) => setData({...data, order: e.target.value})} className="h-9 rounded-lg" />
                            </div>
                            <div className="flex flex-col justify-end pb-1 px-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 mb-1">Active</Label>
                                <Switch checked={data.isActive} onCheckedChange={(val) => setData({...data, isActive: val})} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex border-t border-slate-200 dark:border-slate-800 gap-4">
                        <Button 
                            onClick={handleLocalSave}
                            disabled={isSaving}
                            className="bg-slate-900 dark:bg-slate-100 dark:text-slate-950 text-white hover:bg-slate-800 rounded-full px-6 gap-2 flex-grow sm:flex-grow-0"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                            variant="ghost" 
                            disabled={isSaving}
                            onClick={() => onDelete(slide.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full px-4 gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
