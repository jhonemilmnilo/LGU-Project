"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Tourism {
    id: string;
    name: string;
    description: string | null;
    category: string;
    address: string;
    entranceFee: string | null;
    bestTimeToVisit: string | null;
    contactNumber: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    googleMapsUrl: string | null;
    barangay: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface TourismContextType {
    tourismData: Tourism[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (isOpen: boolean) => void;
    editingData: Tourism | null;
    setEditingData: (data: Tourism | null) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    currentBarangay?: string | null;
    activeBarangays?: string[];
    themeColor: string;
}

const TourismContext = createContext<TourismContextType | undefined>(undefined);

export function TourismProvider({
    children,
    initialData,
    currentBarangay,
    activeBarangays = []
}: {
    children: React.ReactNode;
    initialData: Tourism[];
    currentBarangay?: string | null;
    activeBarangays?: string[];
}) {
    const [tourismData, setTourismData] = useState<Tourism[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [themeColor, setThemeColor] = useState("#2563eb");

    useEffect(() => {
        setTourismData(initialData);
    }, [initialData]);

    useEffect(() => {
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
        <TourismContext.Provider
            value={{
                tourismData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedCategory,
                setSelectedCategory,
                selectedStatus,
                setSelectedStatus,
                currentBarangay,
                activeBarangays,
                themeColor
            }}
        >
            {children}
        </TourismContext.Provider>
    );
}

export function useTourism() {
    const context = useContext(TourismContext);
    if (context === undefined) {
        throw new Error("useTourism must be used within a TourismProvider");
    }
    return context;
}
