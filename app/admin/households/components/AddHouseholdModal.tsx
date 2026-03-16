"use client";

import { useHousehold } from "../providers/HouseholdProvider";
import { useHouseholdForm } from "../hooks/useHouseholdForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Home, MapPin, Users, ShieldAlert, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { HeadSearch } from "../../residents/components/HeadSearch";
import { getHeadDetails } from "../../actions";

export function AddHouseholdModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, selectedCoords, setSelectedCoords } = useHousehold();
    const { handleSubmit, loading } = useHouseholdForm();

    const barangays = ["Aloleng", "Bangan-Oda", "Baracbac", "Boboy", "Buar", "Cabaruan", "Cayungnan", "Macaboboni", "Poblacion", "Patar", "Sabangan", "San Vicente", "Tupa"];
    const riskLevels = ["Safe", "Low Risk", "Moderate Risk", "High Risk", "Flood Prone", "Landslide Prone"];

    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [headInfo, setHeadInfo] = useState({ id: editingData?.headId || "", name: "" });
    const [selectedBarangay, setSelectedBarangay] = useState("");
    const [householdSize, setHouseholdSize] = useState("1");
    const [contactNumber, setContactNumber] = useState("");

    useEffect(() => {
        if (isAddModalOpen) {
            const newLat = editingData ? (editingData.latitude?.toString() || "") : (selectedCoords ? selectedCoords.lat.toString() : "");
            const newLng = editingData ? (editingData.longitude?.toString() || "") : (selectedCoords ? selectedCoords.lng.toString() : "");

            /* eslint-disable react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any, react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars */
            // eslint-disable-next-line
            if (lat !== newLat) setLat(newLat);
            // eslint-disable-next-line
            if (lng !== newLng) setLng(newLng);
            
            if (editingData) {
                // eslint-disable-next-line
                if (!headInfo.id) setHeadInfo({ id: editingData.headId || "", name: editingData.headOfFamily || "Current Head" });
                // eslint-disable-next-line
                setSelectedBarangay(editingData.barangay);
                // eslint-disable-next-line
                setHouseholdSize(editingData.householdSize.toString());
                // eslint-disable-next-line
                setContactNumber(editingData.contactNumber || "");
            }
            /* eslint-enable */
        }
    }, [isAddModalOpen, editingData, selectedCoords, lat, lng, headInfo.id]);

    const handleHeadSelect = async (id: string, name: string) => {
        setHeadInfo({ id, name });
        const res = await getHeadDetails(id);
        if (res.success && res.data) {
            setSelectedBarangay(res.data.barangay);
            setHouseholdSize(res.data.familyCount.toString());
            setContactNumber(res.data.contactNumber || "");
        }
    };

    const handleGetCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLat(position.coords.latitude.toString());
                setLng(position.coords.longitude.toString());
            });
        }
    };

    return (
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
                setTimeout(() => {
                    setEditingData(null);
                    setSelectedCoords(null);
                    setLat("");
                    setLng("");
                    setHeadInfo({ id: "", name: "" });
                    setSelectedBarangay("");
                    setHouseholdSize("1");
                    setContactNumber("");
                }, 200);
            }
        }}>
            <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-white dark:bg-[#0f1117] border-slate-200 dark:border-[#2a3040] shadow-2xl rounded-2xl">
                <div className="flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-[#151b2b] sticky top-0 z-50 border-b border-slate-200 dark:border-[#2a3040]">
                        <div className="flex items-center space-x-3 mb-1">
                            <div className="p-2 bg-blue-600 rounded-lg">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    {editingData ? "Edit Household Data" : "Add New Household"}
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                    Map and log a household entry for DRRM and census tracking.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="householdForm" onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Family details */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                                        <UserCheck className="w-4 h-4 text-blue-500" />
                                        Head of the Family / Primary Contact *
                                    </Label>
                                    <HeadSearch 
                                        onSelect={handleHeadSelect}
                                        defaultValue={headInfo.name}
                                    />
                                    <input type="hidden" name="headId" value={headInfo.id} required />
                                    <p className="text-[10px] text-slate-500 italic mt-1 uppercase tracking-wider">
                                        Note: The head must be registered first in the Resident Registry.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Barangay</Label>
                                    <Select name="barangay" value={selectedBarangay} onValueChange={setSelectedBarangay}>
                                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                                            <SelectValue placeholder="Select Barangay" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {barangays.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                        <Users className="w-4 h-4 mr-1 text-slate-500" /> Household Size
                                    </Label>
                                    <Input
                                        type="number"
                                        name="householdSize"
                                        required
                                        min="1"
                                        value={householdSize}
                                        onChange={(e) => setHouseholdSize(e.target.value)}
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                </div>

                                {/* Coordinates */}
                                <div className="space-y-4 md:col-span-2 p-5 bg-slate-50 dark:bg-[#151b2b] rounded-xl border border-slate-200 dark:border-[#2a3040]">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#2a3040]">
                                        <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Exact GPS Coordinates
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGetCurrentLocation}
                                            className="h-8 text-xs font-bold"
                                        >
                                            Use My Location
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Latitude</Label>
                                            <Input
                                                name="latitude"
                                                type="number"
                                                step="any"
                                                required
                                                value={lat}
                                                onChange={(e) => setLat(e.target.value)}
                                                placeholder="16.12345"
                                                className="font-mono h-11 bg-white dark:bg-[#0f1117]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">Longitude</Label>
                                            <Input
                                                name="longitude"
                                                type="number"
                                                step="any"
                                                required
                                                value={lng}
                                                onChange={(e) => setLng(e.target.value)}
                                                placeholder="119.87654"
                                                className="font-mono h-11 bg-white dark:bg-[#0f1117]"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">Pinpoint accuracy required for emergency response mapping.</p>
                                </div>

                                {/* Additional Data */}
                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                        <ShieldAlert className="w-4 h-4 mr-1 text-slate-500" /> Risk Assessment
                                    </Label>
                                    <Select name="riskLevel" defaultValue={editingData?.riskLevel || "Safe"}>
                                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]">
                                            <SelectValue placeholder="Assess Risk Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {riskLevels.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Contact Number</Label>
                                    <Input
                                        name="contactNumber"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="09XX XXX XXXX"
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Additional Notes / Remarks</Label>
                                    <Textarea
                                        name="notes"
                                        defaultValue={editingData?.notes || ""}
                                        placeholder="e.g. Needs immediate relief during flood / Old structure..."
                                        className="min-h-[100px] bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] resize-y"
                                    />
                                </div>

                            </div>

                        </form>
                    </div>

                    <DialogFooter className="p-8 bg-white dark:bg-[#151b2b] sticky bottom-0 z-50 border-t border-slate-200 dark:border-[#2a3040] flex justify-end gap-3 rounded-b-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAddModalOpen(false)}
                            className="h-12 px-8 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="householdForm"
                            disabled={loading}
                            className="h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                            ) : (
                                editingData ? "Update Household" : "Plot on Map"
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
