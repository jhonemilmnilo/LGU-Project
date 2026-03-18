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
import { processImageUpload, updateSystemSetting, createHeroSlide, deleteHeroSlide, updateHeroSlide, updateLogoSetting, updateLoginBranding } from "./actions";
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
    const [isSaving, setIsSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Login Branding States
    const [loginBgImage, setLoginBgImage] = useState(settings.login_bg_image || "/images/umbrella-rocks.png");
    const [loginBgColor, setLoginBgColor] = useState(settings.login_bg_color || "#ffffff");
    const [loginQuote, setLoginQuote] = useState(settings.login_quote || "Agno's Umbrella Rocks represent the timeless beauty of our coastal heritage. A true marvel of nature.");
    const [loginQuoteAuthor, setLoginQuoteAuthor] = useState(settings.login_quote_author || "LOCAL TOURISM OFFICE");
    const [loginImageFile, setLoginImageFile] = useState<File | null>(null);
    const [loginImagePreview, setLoginImagePreview] = useState<string | null>(null);

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
            toast.success("General settings saved!");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveLoginBranding = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("login_bg_color", loginBgColor);
            formData.append("login_quote", loginQuote);
            formData.append("login_quote_author", loginQuoteAuthor);
            formData.append("login_bg_image", loginBgImage);

            if (loginImageFile) {
                formData.append("imageFile", loginImageFile);
            }

            const result = await updateLoginBranding(formData);
            if (result.success) {
                if (result.imageUrl) setLoginBgImage(result.imageUrl);
                setLoginImageFile(null);
                setLoginImagePreview(null);
                toast.success("Login branding updated!");
            } else {
                toast.error("Failed to update login branding");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
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
                                    <div className="pt-2">
                                        <Button 
                                            onClick={handleSaveSettings} 
                                            disabled={isSaving}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 px-8"
                                        >
                                            {isSaving ? "Saving..." : "Save Settings"}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">Leave empty to use the default municipal shield icon.</p>
                                </div>
                                
                                {(logoPreview || logoUrl) && (
                                    <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Preview</span>
                                        { }
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={logoPreview || logoUrl} alt="Logo Preview" className="h-20 w-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="login" className="space-y-6">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-indigo-600" />
                                Login Branding
                            </CardTitle>
                            <CardDescription>Customize the login page visuals and messaging.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Image & Meta */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Background Image</Label>
                                        <div className="flex flex-col gap-4">
                                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 group">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={loginImagePreview || loginBgImage} alt="Login BG" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                    <Input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setLoginImageFile(file);
                                                                setLoginImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                    <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white pointer-events-none">
                                                        Change Image
                                                    </Button>
                                                </div>
                                            </div>
                                            <Input 
                                                value={loginBgImage} 
                                                onChange={(e) => setLoginBgImage(e.target.value)} 
                                                placeholder="Or enter Image URL..." 
                                                className="text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Background Color (Left Side)</Label>
                                        <div className="flex gap-4 items-center">
                                            <Input 
                                                type="color" 
                                                value={loginBgColor} 
                                                onChange={(e) => setLoginBgColor(e.target.value)} 
                                                className="w-16 h-12 p-1 rounded-xl cursor-pointer"
                                            />
                                            <Input 
                                                value={loginBgColor} 
                                                onChange={(e) => setLoginBgColor(e.target.value)} 
                                                className="font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Quote Editor */}
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Login Quote (Motto)</Label>
                                        <textarea 
                                            value={loginQuote}
                                            onChange={(e) => setLoginQuote(e.target.value)}
                                            className="w-full h-32 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm italic font-medium resize-none outline-none focus:ring-2 focus:ring-blue-600/20"
                                            placeholder="Enter an inspiring motto..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quote Author</Label>
                                        <Input 
                                            value={loginQuoteAuthor} 
                                            onChange={(e) => setLoginQuoteAuthor(e.target.value)} 
                                            placeholder="e.g. MUNICIPAL OFFICE"
                                            className="font-black italic uppercase tracking-tighter"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                <Button 
                                    onClick={handleSaveLoginBranding} 
                                    disabled={isSaving}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-6 shadow-xl shadow-indigo-500/20"
                                >
                                    {isSaving ? "Upgrading Visuals..." : "Save Login Branding"}
                                </Button>
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
