"use client";

import React, { createContext, useContext, useState } from "react";

export interface Dining {
    id: string;
    name: string;
    description: string | null;
    address: string;
    cuisineType: string | null;
    openingHours: string | null;
    contactNumber: string | null;
    facebookUrl: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    googleMapsUrl: string | null;
    barangay: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface DiningContextType {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (isOpen: boolean) => void;
    diningData: Dining[];
    editingData: Dining | null;
    setEditingData: (data: Dining | null) => void;
    selectedCuisine: string;
    setSelectedCuisine: (cuisine: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    currentBarangay?: string;
    activeBarangays?: string[];
    themeColor: string;
}

const DiningContext = createContext<DiningContextType | undefined>(undefined);

export function DiningProvider({ children, initialData, currentBarangay, activeBarangays = [] }: { children: React.ReactNode; initialData: Dining[]; currentBarangay?: string; activeBarangays?: string[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [diningData, setDiningData] = useState<Dining[]>(initialData);
    const [editingData, setEditingData] = useState<Dining | null>(null);
    const [selectedCuisine, setSelectedCuisine] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [themeColor, setThemeColor] = useState("#2563eb");

    // Whenever initialData from server changes, you might want to sync, 
    // but for simple cases we just use it directly or let the server action revalidate the page.
    React.useEffect(() => {
        setDiningData(initialData);
    }, [initialData]);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/settings");
                const data = await response.json();
                if (data.themeColor) {
                    setThemeColor(data.themeColor);
                }
            } catch (error) {
                console.error("Error fetching theme settings:", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <DiningContext.Provider value={{ searchTerm, setSearchTerm, isAddModalOpen, setIsAddModalOpen, diningData, editingData, setEditingData, selectedCuisine, setSelectedCuisine, selectedStatus, setSelectedStatus, currentBarangay, activeBarangays, themeColor }}>
            {children}
        </DiningContext.Provider>
    );
}

export function useDining() {
    const context = useContext(DiningContext);
    if (context === undefined) {
        throw new Error("useDining must be used within a DiningProvider");
    }
    return context;
}
