import { useState } from "react";
import { addResident, updateResident } from "../../actions";
import { toast } from "sonner";
import { useResident } from "../providers";

export function useResidentForm() {
    const [loading, setLoading] = useState(false);
    const { setIsAddModalOpen, editingData, setResidents, setEditingData, setCurrentFamilyMembers } = useResident();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        
        // The FormData constructor captures file inputs if they have a 'name' attribute.
        // But we need to handle specific IDs from the multi-step form.

        try {
            if (editingData) {
                const response = await updateResident(editingData.id, formData);
                if (response.success && response.data) {
                    setResidents(prev => prev.map(r => r.id === editingData.id ? response.data as any : r));
                    toast.success("Resident profile updated successfully!");
                    setEditingData(null);
                    setCurrentFamilyMembers([]);
                    setIsAddModalOpen(false);
                } else {
                    toast.error(response.error || "Failed to update resident.");
                }
            } else {
                const response = await addResident(formData);
                if (response.success && response.data) {
                    setResidents(prev => [response.data as any, ...prev]);
                    toast.success("New resident registered successfully!");
                    setEditingData(null);
                    setCurrentFamilyMembers([]);
                    setIsAddModalOpen(false);
                } else {
                    toast.error(response.error || "Failed to register resident.");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        handleSubmit,
        loading,
    };
}
