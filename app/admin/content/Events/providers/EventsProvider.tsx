"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Event {
    id: string;
    title: string;
    description: string | null;
    category: string;
    startDate: Date;
    endDate: Date;
    venueName: string;
    address: string;
    contactNumber: string | null;
    imageUrl: string | null;
    barangay: string | null;
    reminders: string[];
    latitude: number | null;
    longitude: number | null;
    googleMapsUrl: string | null;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface EventsContextType {
    events: Event[];
    setEvents: (data: Event[]) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
    editingData: Event | null;
    setEditingData: (data: Event | null) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    currentBarangay?: string;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children, initialData, currentBarangay }: { children: ReactNode; initialData: Event[]; currentBarangay?: string }) {
    const [events, setEvents] = useState<Event[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<Event | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        setEvents(initialData);
    }, [initialData]);

    return (
        <EventsContext.Provider
            value={{
                events,
                setEvents,
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
        </EventsContext.Provider>
    );
}

export function useEvents() {
    const context = useContext(EventsContext);
    if (context === undefined) {
        throw new Error("useEvents must be used within an EventsProvider");
    }
    return context;
}
