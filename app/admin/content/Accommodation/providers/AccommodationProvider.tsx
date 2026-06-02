"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Accommodation {
    id: string;
    name: string;
    description: string | null;
    address: string;
    type: string;
    priceRange: string | null;
    amenities: string | null;
    contactNumber: string | null;
    websiteUrl: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    googleMapsUrl: string | null;
    barangay: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface AccommodationContextType {
    accommodationData: Accommodation[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (isOpen: boolean) => void;
    editingData: Accommodation | null;
    setEditingData: (data: Accommodation | null) => void;
    selectedType: string;
    setSelectedType: (type: string) => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
    currentBarangay?: string | null;
    activeBarangays?: string[];
    themeColor: string;
}

const AccommodationContext = createContext<AccommodationContextType | undefined>(undefined);

export function AccommodationProvider({
    children,
    initialData,
    currentBarangay,
    activeBarangays = []
}: {
    children: React.ReactNode;
    initialData: Accommodation[];
    currentBarangay?: string | null;
    activeBarangays?: string[];
}) {
    const [accommodationData, setAccommodationData] = useState<Accommodation[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
     
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedType, setSelectedType] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [themeColor, setThemeColor] = useState("#2563eb");

    useEffect(() => {
        setAccommodationData(initialData);
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
        <AccommodationContext.Provider
            value={{
                accommodationData,
                searchTerm,
                setSearchTerm,
                isAddModalOpen,
                setIsAddModalOpen,
                editingData,
                setEditingData,
                selectedType,
                setSelectedType,
                selectedStatus,
                setSelectedStatus,
                currentBarangay,
                activeBarangays,
                themeColor
            }}
        >
            {children}
        </AccommodationContext.Provider>
    );
}

export function useAccommodation() {
    const context = useContext(AccommodationContext);
    if (context === undefined) {
        throw new Error("useAccommodation must be used within an AccommodationProvider");
    }
    return context;
}
