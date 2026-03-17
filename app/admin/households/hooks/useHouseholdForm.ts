"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addHousehold, updateHousehold } from "../../actions";
import { useHousehold, Household } from "../providers/HouseholdProvider";

export function useHouseholdForm() {
    const [loading, setLoading] = useState(false);
    const { setHouseholds, setIsAddModalOpen, editingData, setEditingData } = useHousehold();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);

            // Validate required coordinates
            const lat = formData.get("latitude") as string;
            const lng = formData.get("longitude") as string;
            if (!lat || !lng) {
                toast.error("Latitude and Longitude are required to plot the household on the map.");
                setLoading(false);
                return;
            }

            let response;
            if (editingData) {
                response = await updateHousehold(editingData.id, formData);
            } else {
                response = await addHousehold(formData);
            }

            if (response.success && response.household) {
                const h = response.household as Household & { head?: { firstName: string, lastName: string } | null; createdAt: Date | string; updatedAt: Date | string };
                const updatedHousehold: Household = {
                    ...h,
                    headOfFamily: h.head ? `${h.head.firstName} ${h.head.lastName}` : "No Head Assigned",
                    createdAt: new Date(h.createdAt),
                    updatedAt: new Date(h.updatedAt),
                };

                if (editingData) {
                    setHouseholds(prev => prev.map(h => h.id === updatedHousehold.id ? updatedHousehold : h));
                    toast.success("Household updated successfully!");
                } else {
                    setHouseholds(prev => [updatedHousehold, ...prev]);
                    toast.success("Household added successfully!");
                }

                setIsAddModalOpen(false);
                setEditingData(null);
            } else {
                toast.error(response.error || "Something went wrong.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save household data.");
        } finally {
            setLoading(false);
        }
    };

    return { handleSubmit, loading };
}
