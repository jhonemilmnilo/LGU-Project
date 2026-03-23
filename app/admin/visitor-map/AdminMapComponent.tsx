"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl, Polyline, Tooltip } from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

const MAPANDAN_CENTER: [number, number] = [16.0333, 120.4500];

const routesData = {
    "1": [[16.0500, 120.4500], [16.0400, 120.4550], [16.0333, 120.4500]] as [number, number][],
    "2": [[16.0333, 120.4500], [16.0250, 120.4400], [16.0150, 120.4600]] as [number, number][],
    "3": [[16.0333, 120.4500], [16.0350, 120.4250]] as [number, number][],
};

export default function AdminMapComponent({ routes }: { routes: any[] }) {
    const [boundaryGeoJson, setBoundaryGeoJson] = useState<any>(null);
    const [maskedGeoJson, setMaskedGeoJson] = useState<any>(null);

    useEffect(() => {
        const fetchRealBoundary = async () => {
            try {
                // Fetch the exactly accurate shape of Mapandan from OpenStreetMap
                const response = await fetch("https://nominatim.openstreetmap.org/search?q=Mapandan,Pangasinan,Philippines&polygon_geojson=1&format=json");
                const data = await response.json();

                if (data && data.length > 0) {
                    // Extract the highly-detailed polygon of the municipality
                    const geojson = data[0].geojson;
                    setBoundaryGeoJson(geojson);

                    // Use Turf.js to create the Inverted World Mask!
                    // This cuts the exact shape of Mapandan out of a pitch-black world layer
                    try {
                        const feature = turf.feature(geojson);
                        const mask = turf.mask(feature as any);
                        setMaskedGeoJson(mask);
                    } catch (e) {
                        console.error("Turf masking error", e);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch Mapandan borders", error);
            }
        };

        fetchRealBoundary();
    }, []);

    return (
        <MapContainer
            center={MAPANDAN_CENTER}
            zoom={13}
            zoomControl={false}
            scrollWheelZoom={true}
            className="w-full h-full bg-[#050505]"
            minZoom={12}
            maxBounds={[
                [15.9, 120.3], 
                [16.2, 120.6],
            ]}
        >
            <ZoomControl position="bottomright" />

            {/* Premium Street Map Tiles */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={19}
            />

            {/* Render the Pitch-Black Mask covering everything OUTSIDE Mapandan */}
            {maskedGeoJson && (
                <GeoJSON
                    key="mask"
                    data={maskedGeoJson}
                    style={{
                        fillColor: "#000000",
                        fillOpacity: 0.85, // Highly darkened outside world
                        color: "transparent",
                        weight: 0
                    }}
                />
            )}

            {/* Tracing the EXACT border of Mapandan dynamically */}
            {boundaryGeoJson && (
                <GeoJSON
                    key="border"
                    data={boundaryGeoJson}
                    style={{
                        color: "#ef4444", // Neon Red border
                        weight: 4,
                        fillColor: "transparent",
                        dashArray: "10, 10",
                        className: "animate-pulse border-glow"
                    }}
                />
            )}

            {/* Render any configured Tourist Routes */}
            {routes.map((route) => {
                const positions = routesData[route.id as keyof typeof routesData];
                if (!positions) return null;

                return (
                    <Polyline
                        key={route.id}
                        positions={positions}
                        pathOptions={{ color: route.color, weight: 6, opacity: 0.9 }}
                    >
                        <Tooltip permanent direction="top" className="bg-white/90 text-slate-900 border-none font-black shadow-xl rounded-lg">
                            {route.name}
                        </Tooltip>
                    </Polyline>
                );
            })}
        </MapContainer>
    );
}
