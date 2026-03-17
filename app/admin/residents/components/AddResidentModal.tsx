
import { useState, useEffect } from "react";
import { useResident } from "../providers";
import { useResidentForm } from "../hooks/useResidentForm";
import { 
    User, MapPin, BadgeInfo, Users, ShieldCheck, 
    ChevronRight, ChevronLeft, Save, X, Loader2, Camera, UserCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PersonalInfoSection } from "./form-sections/PersonalInfo";
import { AddressContactSection } from "./form-sections/AddressContact";
import { GovSocioEconomicSection } from "./form-sections/GovSocioEconomic";
import { FamilyBackgroundSection } from "./form-sections/FamilyBackground";
import { IdentityVerificationSection } from "./form-sections/IdentityVerification";
import { AccountSetupSection } from "./form-sections/AccountSetup";
import { SectorsAndConsentSection } from "./form-sections/SectorsAndConsent";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: "personal", title: "Personal", icon: User, description: "Basic Info (A)" },
    { id: "address", title: "Address", icon: MapPin, description: "Location & Unit (B,C,D)" },
    { id: "gov", title: "Socio-Gov", icon: BadgeInfo, description: "Occupation & IDs (E,F,I)" },
    { id: "family", title: "Family", icon: Users, description: "Parents & Dependents (G)" },
    { id: "verification", title: "ID Check", icon: Camera, description: "ID Verification (H)" },
    { id: "account", title: "Account", icon: UserCheck, description: "Account Setup" },
    { id: "consent", title: "Consent", icon: ShieldCheck, description: "Final Sign-off (J,K)" }
];

export function AddResidentModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, setCurrentFamilyMembers } = useResident();
    const { handleSubmit, loading } = useResidentForm();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isAddModalOpen) {
            if (editingData) {
                // Combine manual family members and linked household members
                const manual = editingData.familyMembers || [];
                const linked = (editingData.isHead && editingData.household?.members)
                    ? editingData.household.members
                        .filter(m => m.id !== editingData.id)
                        .map(m => ({
                            id: m.id,
                            fullName: `${m.firstName} ${m.lastName}`,
                            relationship: m.relationshipToHead || "Member",
                            age: m.age || ""
                        }))
                    : [];
                
                setCurrentFamilyMembers([...manual, ...linked]);
            } else {
                setCurrentFamilyMembers([]);
            }
        }
    }, [isAddModalOpen, editingData, setCurrentFamilyMembers]);

    const closeModal = () => {
        setIsAddModalOpen(false);
        setEditingData(null);
        setCurrentStep(0);
        setCurrentFamilyMembers([]);
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-6xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-3xl">
                <div className="flex flex-col lg:flex-row h-[95vh] lg:h-[80vh]">
                    
                    {/* Left Sidebar: Steps Progress */}
                    <div className="lg:w-80 bg-slate-50 dark:bg-[#151b2b] p-8 border-r border-slate-200 dark:border-[#2a3040] hidden lg:block">
                        <div className="flex items-center space-x-3 mb-12">
                            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">E-Mapandan</h2>
                        </div>

                        <div className="space-y-4">
                            {STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === index;
                                const isCompleted = currentStep > index;

                                return (
                                    <div 
                                        key={step.id} 
                                        className={cn(
                                            "flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300",
                                            isActive ? "bg-white dark:bg-[#0f1117] shadow-xl shadow-blue-500/5 ring-1 ring-slate-200 dark:ring-white/10" : "opacity-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            isActive ? "bg-blue-600 text-white" : isCompleted ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                        )}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={cn("text-[10px] uppercase font-black tracking-widest", isActive ? "text-blue-600" : "text-slate-400")}>
                                                Step {index + 1}
                                            </p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{step.title}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Form Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0b0e14]">
                        <DialogHeader className="p-8 pb-4 sticky top-0 bg-white/80 dark:bg-[#0b0e14]/80 backdrop-blur-md z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                        {editingData ? "Edit Resident" : "New Registration"}
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 font-medium">
                                        {STEPS[currentStep].description}
                                    </DialogDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={closeModal} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                            <form 
                                id="residentForm" 
                                onSubmit={(e) => {
                                    if (currentStep !== STEPS.length - 1) {
                                        e.preventDefault();
                                        return;
                                    }
                                    handleSubmit(e);
                                }}
                            >
                                 <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 0 && "hidden")}>
                                    <PersonalInfoSection data={editingData || undefined} />
                                </div>
                                <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 1 && "hidden")}>
                                    <AddressContactSection data={editingData || undefined} />
                                </div>
                                <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 2 && "hidden")}>
                                    <GovSocioEconomicSection data={editingData || undefined} />
                                </div>
                                <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 3 && "hidden")}>
                                    <FamilyBackgroundSection data={editingData || undefined} />
                                </div>
                                <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 4 && "hidden")}>
                                    <IdentityVerificationSection data={editingData || undefined} />
                                </div>
                                <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 5 && "hidden")}>
                                    <AccountSetupSection data={editingData || undefined} />
                                </div>
                                <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", currentStep !== 6 && "hidden")}>
                                    <SectorsAndConsentSection data={editingData || undefined} />
                                </div>
                            </form>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 dark:bg-[#151b2b] border-t border-slate-200 dark:border-[#2a3040] flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                {currentStep > 0 && (
                                    <Button 
                                        key="prev-btn"
                                        type="button"
                                        variant="outline" 
                                        onClick={prevStep}
                                        className="h-12 px-6 rounded-2xl font-bold border-slate-200 dark:border-[#2a3040]"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                    </Button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {currentStep < STEPS.length - 1 ? (
                                    <Button 
                                        key="next-btn"
                                        type="button" 
                                        onClick={nextStep}
                                        className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20"
                                    >
                                        Next Component <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button 
                                        key="submit-btn"
                                        type="submit" 
                                        form="residentForm"
                                        disabled={loading}
                                        className="h-12 px-10 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20"
                                    >
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</>
                                        ) : (
                                            <><Save className="w-4 h-4 mr-2" /> Complete Registration</>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
