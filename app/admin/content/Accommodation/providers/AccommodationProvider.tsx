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
}

const AccommodationContext = createContext<AccommodationContextType | undefined>(undefined);

export function AccommodationProvider({
    children,
    initialData
}: {
    children: React.ReactNode;
    initialData: Accommodation[]
}) {
    const [accommodationData, setAccommodationData] = useState<Accommodation[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingData, setEditingData] = useState<any | null>(null);

    useEffect(() => {
        setAccommodationData(initialData);
    }, [initialData]);

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
