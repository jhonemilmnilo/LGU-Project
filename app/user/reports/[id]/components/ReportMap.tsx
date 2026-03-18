"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

const icon = L.divIcon({
    className: "custom-marker",
    html: renderToString(
        <div className="relative flex items-center justify-center">
            <div className="absolute w-10 h-10 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-8 h-8 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/40 border-2 border-white">
                <MapPin className="w-4 h-4" />
            </div>
        </div>
    ),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);
    return null;
}

export default function ReportMap({ lat, lng, address }: { lat: number; lng: number; address?: string }) {
    const position: [number, number] = [lat, lng];

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-white/5 shadow-inner">
            <MapContainer 
                center={position} 
                zoom={15} 
                scrollWheelZoom={false}
                zoomControl={false}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={icon}>
                    {address && (
                        <Popup className="custom-popup">
                            <p className="text-[10px] font-black uppercase tracking-widest italic text-slate-900">{address}</p>
                        </Popup>
                    )}
                </Marker>
                <ChangeView center={position} />
            </MapContainer>
            
            <div className="absolute bottom-3 left-3 z-[100] px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Coordinate System
                </p>
            </div>
        </div>
    );
}
