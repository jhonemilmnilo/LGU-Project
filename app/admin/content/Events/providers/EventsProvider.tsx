"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children, initialData }: { children: ReactNode; initialData: Event[] }) {
    const [events, setEvents] = useState<Event[]>(initialData);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editingData, setEditingData] = useState<any | null>(null);
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
