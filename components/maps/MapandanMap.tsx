"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from "react-leaflet";
import * as turf from "@turf/turf";
import * as L from "leaflet";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

interface GeoJSONFeature {
    type: "Feature";
    geometry: GeoJSON.Geometry | null;
    properties?: Record<string, unknown> | null;
}

const MAPANDAN_CENTER: [number, number] = [16.0333, 120.4500];

// Sub-component for Geolocation
function LocateMeControl({ onLocationFound }: { onLocationFound: (pos: [number, number]) => void }) {
    const map = useMap();
    
    const locate = () => {
        map.locate({ setView: true, maxZoom: 16 });
        map.on("locationfound", (e) => {
            onLocationFound([e.latlng.lat, e.latlng.lng]);
            toast.success("Location found!");
        });
        map.on("locationerror", () => {
            toast.error("Could not find your location.");
        });
    };

    return (
        <button 
            onClick={locate}
            className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 hover:scale-110 active:scale-95 transition-all text-blue-600 group"
            title="Locate me & show pin"
        >
            <MapPin className="w-5 h-5 group-hover:scale-125 transition-transform" />
        </button>
    );
}

function AutoFitBound({ geoJson }: { geoJson: GeoJSONFeature }) {
    const map = useMap();
    useEffect(() => {
        if (geoJson) {
            try {
                const bbox = turf.bbox(geoJson as any);
                const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
                map.fitBounds(bounds, { padding: [0, 0] });
                // Force an extra zoom in for a tighter view
                setTimeout(() => {
                    map.setZoom(map.getZoom() + 2);
                }, 300);
            } catch (e) {
                console.error("Error fitting bounds", e);
            }
        }
    }, [map, geoJson]);
    return null;
}


export default function MapandanMap() {
    const [boundaryGeoJson, setBoundaryGeoJson] = useState<GeoJSONFeature | null>(null);
    const [maskedGeoJson, setMaskedGeoJson] = useState<GeoJSONFeature | null>(null);
    const [userPosition, setUserPosition] = useState<[number, number] | null>(null);

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
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={MAPANDAN_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full rounded-3xl"
                style={{ background: "#f8fafc" }}
            >
                {/* Google-style Roadmap Tiles */}
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                    maxZoom={20}
                />

                {/* Render the Pitch-Black Mask covering everything OUTSIDE Mapandan */}
                {maskedGeoJson && (
                    <GeoJSON
                        key="mask"
                        data={maskedGeoJson}
                        style={{
                            fillColor: "#000000",
                            fillOpacity: 0.45, // Lighter mask so surrounding context is visible but darkened
                            color: "transparent",
                            weight: 0
                        }}
                    />
                )}
                {/* Tracing the EXACT border of Mapandan dynamically */}
                {boundaryGeoJson && (
                    <>
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
                        <AutoFitBound geoJson={boundaryGeoJson} />
                    </>
                )}

                {/* User Location Marker - Clean Blue Dot style */}
                {userPosition && (
                    <Marker 
                        position={userPosition}
                        icon={L.divIcon({
                            className: "custom-marker",
                            html: `
                                <div class="relative flex items-center justify-center">
                                    <div class="absolute w-8 h-8 bg-blue-500/40 rounded-full animate-ping"></div>
                                    <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-[0_0_10px_rgba(37,99,235,0.8)]"></div>
                                </div>
                            `,
                            iconSize: [20, 20],
                            iconAnchor: [10, 10],
                        })}
                    >
                         <Popup className="font-bold">You are here 📍</Popup>
                    </Marker>
                )}

                {/* Location Overlay - Nested inside MapContainer to access useMap() */}
                <div className="leaflet-top leaflet-right !z-[1000] pointer-events-none p-6">
                    <div className="pointer-events-auto shadow-2xl">
                        <LocateMeControl onLocationFound={setUserPosition} />
                    </div>
                </div>
            </MapContainer>
        </div>
    );
}
