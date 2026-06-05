import { useState } from "react";
import { addResident, updateResident } from "../../actions";
import { toast } from "sonner";
import { useResident } from "../providers";
import { Resident } from "../providers/ResidentProvider";

export function useResidentForm() {
    const [loading, setLoading] = useState(false);
    const { setIsAddModalOpen, editingData, setResidents, setEditingData, setCurrentFamilyMembers } = useResident();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        
        const uppercaseKeys = [
            "firstName", "lastName", "middleName", "suffix",
            "placeOfBirth", "citizenship", "religion", "bloodType",
            "houseNumber", "street", "sitio", "purok",
            "occupation", "employer", "degreeProgram",
            "motherFirstName", "motherMiddleName", "motherLastName",
            "fatherFirstName", "fatherMiddleName", "fatherLastName",
            "relationshipToHead",
            "otherGender", "otherCivilStatus", "otherEducationalAttainment",
            "otherEmploymentStatus", "otherIdType", "otherSector"
        ];
        
        uppercaseKeys.forEach(key => {
            const val = formData.get(key);
            if (typeof val === "string") {
                formData.set(key, val.toUpperCase().trim());
            }
        });

        try {
            if (editingData) {
                const response = await updateResident(editingData.id, formData);
                if (response.success && response.data) {
                    setResidents(prev => prev.map(r => r.id === editingData.id ? response.data as Resident : r));
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
                    setResidents(prev => [response.data as Resident, ...prev]);
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
