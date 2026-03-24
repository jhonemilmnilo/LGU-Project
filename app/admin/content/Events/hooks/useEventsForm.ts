"use client";

import { useState } from "react";
import { useEvents } from "../providers/EventsProvider";
import { addEvent, updateEvent } from "@/app/admin/actions";
import { toast } from "sonner";

export function useEventsForm() {
    const { setIsAddModalOpen, editingData, setEditingData } = useEvents();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            if (editingData) {
                await updateEvent(editingData.id, formData);
                toast.success("Event updated successfully!");
            } else {
                await addEvent(formData);
                toast.success("Event added successfully!");
            }
            setEditingData(null);
            setIsAddModalOpen(false);
            
            // Force a slight delay before reload to ensure DB is updated and toast is visible
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error("Error saving event:", error);
            toast.error("Failed to save event. Pakisuri uli pal.");
        } finally {
            setLoading(false);
        }
    };

    return { handleSubmit, loading };
}
