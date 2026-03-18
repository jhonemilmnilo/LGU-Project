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
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
} from "@/components/ui/dialog";
import { Plus, Trash2, Save, Globe, Layout, ShieldAlert, Image as ImageIcon, Send } from "lucide-react";
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

                                {/* Logo Preview Display */}
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logo Preview</span>
                                    <div className="relative w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                                        {(logoPreview || logoUrl) ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img 
                                                src={logoPreview || logoUrl} 
                                                alt="Logo Preview" 
                                                className="max-w-full max-h-full object-contain" 
                                            />
                                        ) : (
                                            <ImageIcon className="w-10 h-10 text-slate-200" />
                                        )}
                                    </div>
                                    {(logoPreview || logoUrl) && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => { setLogoUrl(""); setLogoPreview(null); setLogoFile(null); }}
                                            className="h-7 text-[8px] font-black uppercase text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                        >
                                            Reset Logo
                                        </Button>
                                    )}
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
                    <HeroSlidesManager initialSlides={slides} themeColor={themeColor} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function HeroSlidesManager({ initialSlides, themeColor }: { initialSlides: any[], themeColor: string }) {
    const [slides, setSlides] = useState(initialSlides);
    const [showAddModal, setShowAddModal] = useState(false);

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
                <Button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 gap-2 shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4" />
                    Add Slide
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {slides.map((slide) => (
                    <SlideEditor key={slide.id} slide={slide} onSave={handleUpdate} onDelete={handleDelete} />
                ))}
            </div>

            <AddHeroSlideModal 
                isOpen={showAddModal} 
                onClose={() => setShowAddModal(false)} 
                order={slides.length}
                themeColor={themeColor}
            />
        </div>
    );
}

interface AddHeroSlideModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: number;
    themeColor: string;
}

function AddHeroSlideModal({ isOpen, onClose, order, themeColor }: AddHeroSlideModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        tagline: "",
        imageUrl: "",
        primaryBtnText: "",
        primaryBtnLink: "",
        secondaryBtnText: "",
        secondaryBtnLink: "",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("subtitle", formData.subtitle);
        data.append("tagline", formData.tagline);
        data.append("imageUrl", formData.imageUrl);
        data.append("order", order.toString());
        data.append("isActive", "true");
        data.append("primaryBtnText", formData.primaryBtnText);
        data.append("primaryBtnLink", formData.primaryBtnLink);
        data.append("secondaryBtnText", formData.secondaryBtnText);
        data.append("secondaryBtnLink", formData.secondaryBtnLink);

        if (imageFile) {
            data.append("imageFile", imageFile);
        }

        setIsSaving(true);
        try {
            const result = await createHeroSlide(data);
            if (result.success) {
                toast.success("New slide added successfully!");
                onClose();
                window.location.reload();
            } else {
                toast.error("Failed to add slide");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-950 p-0 border-none shadow-2xl">
                <DialogHeader className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">Add New Hero Slide</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium italic">Create a stunning first impression for your landing page.</DialogDescription>
                </DialogHeader>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form Fields */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Main Title</Label>
                                    <Input 
                                        placeholder="e.g. Welcome to Mapandan" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tagline</Label>
                                    <Input 
                                        placeholder="e.g. The Home of Umbrella Rocks" 
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                        className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-medium italic"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Subtitle / Description</Label>
                                <Input 
                                    placeholder="Enter a brief description of this slide..." 
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                    className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                />
                            </div>
                        </div>

                        {/* Buttons section */}
                        <div className="pt-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                                <Layout className="w-3.5 h-3.5" />
                                Action Buttons
                            </Label>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-slate-400">Primary Text</Label>
                                    <Input 
                                        placeholder="Explore" 
                                        value={formData.primaryBtnText}
                                        onChange={(e) => setFormData({...formData, primaryBtnText: e.target.value})}
                                        className="rounded-xl h-10 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-slate-400">Primary Link</Label>
                                    <Input 
                                        placeholder="/explore" 
                                        value={formData.primaryBtnLink}
                                        onChange={(e) => setFormData({...formData, primaryBtnLink: e.target.value})}
                                        className="rounded-xl h-10 text-xs font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-slate-400">Secondary Text</Label>
                                    <Input 
                                        placeholder="Learn More" 
                                        value={formData.secondaryBtnText}
                                        onChange={(e) => setFormData({...formData, secondaryBtnText: e.target.value})}
                                        className="rounded-xl h-10 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-slate-400">Secondary Link</Label>
                                    <Input 
                                        placeholder="/about" 
                                        value={formData.secondaryBtnLink}
                                        onChange={(e) => setFormData({...formData, secondaryBtnLink: e.target.value})}
                                        className="rounded-xl h-10 text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image Selection & Preview */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Slide Imagery
                            </Label>
                            
                            <div className="aspect-video rounded-[2rem] bg-slate-100 dark:bg-slate-900 overflow-hidden relative border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center group">
                                {previewUrl || formData.imageUrl ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={previewUrl || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-[10px] font-black uppercase tracking-widest">Image Loaded</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <ImageIcon className="w-8 h-8 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Blank Canvas</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Upload High-Res Image</Label>
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 file:border-none file:bg-slate-200 dark:file:bg-slate-800 file:text-[10px] file:font-black file:uppercase file:mr-4 file:h-full file:px-4 cursor-pointer"
                                    />
                                </div>
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                                    <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-950 px-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">OR</span></div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">External Image URL</Label>
                                    <Input 
                                        placeholder="https://images.unsplash.com/..." 
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                        className="h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono text-[10px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-[0.98] flex items-center gap-3"
                        style={{ backgroundColor: themeColor }}
                    >
                        {isSaving ? "Publishing..." : (
                            <>
                                <Send className="w-4 h-4" />
                                Publish Slide
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                <div className="relative aspect-video md:aspect-auto bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    {(previewUrl || data.imageUrl) ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl || data.imageUrl} alt="Slide Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Image Set</span>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80 drop-shadow-md">Order: {data.order}</span>
                        <span className="text-white font-black uppercase italic tracking-tighter text-lg truncate drop-shadow-lg">
                            {data.title || "UNNAMED SLIDE"}
                        </span>
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
