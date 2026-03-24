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
    currentBarangay?: string | null;
}

const TourismContext = createContext<TourismContextType | undefined>(undefined);

export function TourismProvider({
    children,
    initialData,
    currentBarangay
}: {
    children: React.ReactNode;
    initialData: Tourism[];
    currentBarangay?: string | null;
}) {
    const [tourismData, setTourismData] = useState<Tourism[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingData, setEditingData] = useState<any | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        setTourismData(initialData);
    }, [initialData]);

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
                currentBarangay
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
