"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Official {
    id: string;
    name: string;
    position: string;
    contactNumber: string | null;
    email: string | null;
     
    links: any;
    bio: string | null;
    education: string | null;
    motto: string | null;
    achievements: string | null;
    imageUrl: string | null;
    termStart: Date | null;
    termEnd: Date | null;
    order: number;
    isActive: boolean;
    barangay: string | null;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

interface OfficialsContextType {
    officialsData: Official[];
    setOfficialsData: (data: Official[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Official | null;
    setEditingData: (data: Official | null) => void;
    selectedPosition: string;
    setSelectedPosition: (position: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedBarangay: string;
    setSelectedBarangay: (barangay: string) => void;
    barangays: string[];
}

const OfficialsContext = createContext<OfficialsContextType | undefined>(undefined);

export function OfficialsProvider({ 
    children, 
    initialData, 
    barangays, 
    managedBarangay 
}: { 
    children: ReactNode; 
    initialData: Official[]; 
    barangays: string[];
    managedBarangay?: string | null;
}) {
    const [officialsData, setOfficialsData] = useState<Official[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
     
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedPosition, setSelectedPosition] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBarangay, setSelectedBarangay] = useState(managedBarangay || "LGU");

    useEffect(() => {
        setOfficialsData(initialData);
    }, [initialData]);

    return (
        <OfficialsContext.Provider
            value={{
                officialsData,
                setOfficialsData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedPosition,
                setSelectedPosition,
                selectedCategory,
                setSelectedCategory,
                selectedBarangay,
                setSelectedBarangay,
                barangays,
            }}
        >
            {children}
        </OfficialsContext.Provider>
    );
}

export function useOfficials() {
    const context = useContext(OfficialsContext);
    if (context === undefined) {
        throw new Error("useOfficials must be used within an OfficialsProvider");
    }
    return context;
}
