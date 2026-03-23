"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false, loading: () => <MapLoading /> });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const GeoJSON = dynamic(() => import("react-leaflet").then(mod => mod.GeoJSON), { ssr: false });
// Note: useMapEvents is used inside LocationMarker with dynamic import to avoid SSR issues
interface GeoJSONData {
    type: "Feature" | "FeatureCollection" | "Point" | "MultiPoint" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon" | "GeometryCollection";
    [key: string]: unknown;
}

function MapLoading() {
    return (
        <div className="w-full h-[400px] bg-slate-100 dark:bg-[#151b2b] rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-[#2a3040]">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading Picker Map...</p>
        </div>
    );
}

// Click Tracker Component
function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
    const MapEvents = dynamic(() => import("react-leaflet").then(mod => {
        const { useMapEvents } = mod;
        return function InternalEvents() {
            useMapEvents({
                click(e) {
                    setPosition([e.latlng.lat, e.latlng.lng]);
                },
            });
            return null;
        };
    }), { ssr: false });

    return (
        <>
            <MapEvents />
            <Marker position={position} />
        </>
    );
}

interface LocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
}

export default function LocationPicker({ initialLat, initialLng, onSelect, onClose }: LocationPickerProps) {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<[number, number]>([initialLat || 16.1158, initialLng || 119.7997]);
    const [agnoBorder, setAgnoBorder] = useState<GeoJSONData | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            fetch('/agno-border.json')
                .then(res => res.json())
                .then(data => setAgnoBorder(data))
                .catch(err => console.error("Failed to load Mapandan border:", err));
        }, 0);

        // Fix Leaflet icons
        import("leaflet").then(L => {
            const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
            delete proto._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        });

        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return <MapLoading />;

    return (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#2a3040] shadow-inner">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <MapContainer
                    center={position}
                    zoom={15}
                    style={{ height: '400px', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    
                    {agnoBorder && (
                        <GeoJSON
                            data={agnoBorder}
                            style={{
                                color: '#3b82f6',
                                weight: 2,
                                opacity: 0.6,
                                fillOpacity: 0.05
                            }}
                        />
                    )}

                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>

                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                    <div className="bg-white/90 dark:bg-[#0f1117]/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20">
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-1">Current Focus</p>
                        <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                            Lat: {position[0].toFixed(6)}<br/>
                            Lng: {position[1].toFixed(6)}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-full px-8">
                   <div className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl border border-white/20">
                      <MapPin className="w-3 h-3" /> Click anywhere on map to reposition pin
                   </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl border-slate-200 dark:border-[#2a3040] font-black uppercase tracking-widest text-xs"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={() => onSelect(position[0], position[1])}
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 gap-2"
                >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Location
                </Button>
            </div>
        </div>
    );
}
