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
import { Loader2, Home, MapPin, Users, HeartPulse, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export function AddHouseholdModal() {
    const { isAddModalOpen, setIsAddModalOpen, editingData, setEditingData, selectedCoords, setSelectedCoords } = useHousehold();
    const { handleSubmit, loading } = useHouseholdForm();

    const barangays = ["Aloleng", "Bangan-Oda", "Baracbac", "Boboy", "Buar", "Cabaruan", "Cayungnan", "Macaboboni", "Poblacion", "Patar", "Sabangan", "San Vicente", "Tupa"];
    const riskLevels = ["Safe", "Low Risk", "Moderate Risk", "High Risk", "Flood Prone", "Landslide Prone"];

    // State for temporary manual coordinate acquisition
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");

    useEffect(() => {
        if (isAddModalOpen) {
            const newLat = editingData ? (editingData.latitude?.toString() || "") : (selectedCoords ? selectedCoords.lat.toString() : "");
            const newLng = editingData ? (editingData.longitude?.toString() || "") : (selectedCoords ? selectedCoords.lng.toString() : "");

            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (lat !== newLat) setLat(newLat);
            if (lng !== newLng) setLng(newLng);
        }
    }, [isAddModalOpen, editingData, selectedCoords, lat, lng]);

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
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Head of the Family / Primary Contact Name</Label>
                                    <Input
                                        name="headOfFamily"
                                        required
                                        defaultValue={editingData?.headOfFamily}
                                        placeholder="e.g. Juan Dela Cruz"
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040] focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Barangay</Label>
                                    <Select name="barangay" defaultValue={editingData?.barangay || barangays[0]}>
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
                                        defaultValue={editingData?.householdSize || 1}
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
                                    <p className="text-xs text-slate-500">Pinpoint accuracy required. Later, we can tap these points on the map.</p>
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
                                        defaultValue={editingData?.contactNumber || ""}
                                        placeholder="09XX XXX XXXX"
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold flex items-center">
                                        <HeartPulse className="w-4 h-4 mr-1 text-slate-500" /> Special Sectors (Comma separated)
                                    </Label>
                                    <Input
                                        name="specialSectors"
                                        defaultValue={editingData?.specialSectors || ""}
                                        placeholder="PWD, Senior Citizen, Pregnant..."
                                        className="h-12 bg-slate-50 dark:bg-[#1a1f2e] border-slate-200 dark:border-[#2a3040]"
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-slate-700 dark:text-slate-300 font-bold">Additional Notes / Remarks</Label>
                                    <Textarea
                                        name="notes"
                                        defaultValue={editingData?.notes || ""}
                                        placeholder="e.g. Needs immediate relief during flood / Wood house..."
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
