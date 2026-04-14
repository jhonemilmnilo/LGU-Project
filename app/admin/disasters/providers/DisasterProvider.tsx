"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getDisasterZones } from "../../actions";

export interface DisasterZone {
    id: string;
    type: string;
    typeColor: string;
    riskLevel: string;
    riskColor: string;
    shapes: [number, number][][];
}

interface DisasterContextType {
    zones: DisasterZone[];
    isLoading: boolean;
    activeZoneId: string | null;
    setActiveZoneId: (id: string | null) => void;
    refreshZones: () => Promise<void>;
    addZone: (zone: DisasterZone) => void;
    updateZone: (id: string, updatedZone: Partial<DisasterZone>) => void;
    removeZone: (id: string) => void;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

export function DisasterProvider({ children }: { children: React.ReactNode }) {
    const [zones, setZones] = useState<DisasterZone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeZoneId, setActiveZoneId] = useState<string | null>(null);

    const refreshZones = useCallback(async () => {
        setIsLoading(true);
        const result = await getDisasterZones();
        if (result.success && result.zones) {
            setZones(result.zones as DisasterZone[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
         
        refreshZones();
    }, [refreshZones]);

    const addZone = (zone: DisasterZone) => {
        setZones((prev) => [zone, ...prev]);
    };

    const updateZone = (id: string, updatedZone: Partial<DisasterZone>) => {
        setZones((prev) =>
            prev.map((z) => (z.id === id ? { ...z, ...updatedZone } : z))
        );
    };

    const removeZone = (id: string) => {
        setZones((prev) => prev.filter((z) => z.id !== id));
        if (activeZoneId === id) setActiveZoneId(null);
    };

    return (
        <DisasterContext.Provider
            value={{
                zones,
                isLoading,
                activeZoneId,
                setActiveZoneId,
                refreshZones,
                addZone,
                updateZone,
                removeZone,
            }}
        >
            {children}
        </DisasterContext.Provider>
    );
}

export function useDisaster() {
    const context = useContext(DisasterContext);
    if (context === undefined) {
        throw new Error("useDisaster must be used within a DisasterProvider");
    }
    return context;
}
