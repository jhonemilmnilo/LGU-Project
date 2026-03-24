"use client";

import React, { useEffect, useState } from "react";
import { useBarangay } from "@/components/providers/BarangayProvider";
import LoadingClientBody from "@/app/LoadingClientBody";
import { AnimatePresence } from "framer-motion";

export function GlobalLoading() {
    const { isLoading } = useBarangay();
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        // Fetch branding from API since we're in a client component
        fetch("/api/settings")
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error("Failed to fetch settings for loader", err));
    }, []);

    return (
        <AnimatePresence>
            {isLoading && settings && (
                <LoadingClientBody 
                    logoUrl={settings.logoUrl}
                    brand1={settings.brand1}
                    brand2={settings.brand2}
                    themeColor={settings.themeColor}
                />
            )}
        </AnimatePresence>
    );
}
