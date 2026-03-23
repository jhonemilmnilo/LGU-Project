"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import * as turf from "@turf/turf";
import "leaflet/dist/leaflet.css";

interface GeoJSONFeature {
    type: "Feature";
    geometry: GeoJSON.Geometry | null;
    properties?: Record<string, unknown> | null;
}

const MAPANDAN_CENTER: [number, number] = [16.0333, 120.4500];

export default function MapandanMap() {
    const [boundaryGeoJson, setBoundaryGeoJson] = useState<GeoJSONFeature | null>(null);
    const [maskedGeoJson, setMaskedGeoJson] = useState<GeoJSONFeature | null>(null);

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
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const feature = turf.feature(geojson);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={MAPANDAN_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full rounded-3xl"
                style={{ background: "#050505" }}
            >
                {/* Clean Street Map Layer */}
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
                            fillColor: "#050505",
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
                            color: "#3b82f6", // Neon Blue border natively tracing the real Mapandan!
                            weight: 3,
                            fillColor: "#1e40af",
                            fillOpacity: 0.15,
                            dashArray: "10, 10"
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
