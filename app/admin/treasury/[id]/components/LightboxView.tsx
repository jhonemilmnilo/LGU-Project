"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { isValidUrl } from "@/utils/image";
import { ZoomIn, ZoomOut, RotateCw, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function LightboxView({ src, alt, label }: { src: string; alt: string; label: string }) {
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const isPdf = useMemo(() => {
        if (src) {
            return src.toLowerCase().endsWith(".pdf") || src.includes("application/pdf") || src.includes(".pdf?");
        }
        return false;
    }, [src]);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        setIsDragging(true);
        const touch = e.touches[0];
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setPosition({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const reset = () => {
        setScale(1);
        setRotate(0);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex flex-col items-center justify-center gap-6 outline-none">
            <DialogHeader className="sr-only">
                <DialogTitle>{label}</DialogTitle>
            </DialogHeader>

            <div
                className={`relative w-full h-[75vh] flex items-center justify-center overflow-hidden select-none ${isPdf ? "bg-[#1e293b] rounded-3xl" : "cursor-grab active:cursor-grabbing"}`}
                onWheel={isPdf ? undefined : handleWheel}
                onMouseDown={isPdf ? undefined : handleMouseDown}
                onMouseMove={isPdf ? undefined : handleMouseMove}
                onMouseUp={isPdf ? undefined : handleMouseUp}
                onMouseLeave={isPdf ? undefined : handleMouseUp}
                onTouchStart={isPdf ? undefined : handleTouchStart}
                onTouchMove={isPdf ? undefined : handleTouchMove}
                onTouchEnd={isPdf ? undefined : handleTouchEnd}
            >
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={isPdf ? {} : {
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                    }}
                >
                    {isPdf ? (
                        <iframe
                            src={`${src}#toolbar=1`}
                            className="w-full h-full rounded-3xl border-0 bg-white"
                            title={label}
                        />
                    ) : (
                        <Image
                            src={isValidUrl(src) ? src : "/placeholder.png"}
                            alt={alt}
                            fill
                            className="object-contain"
                            priority
                            draggable={false}
                        />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 px-6 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-1 pr-4 border-r border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic whitespace-nowrap">{label}</p>
                </div>

                {isPdf ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all"
                        onClick={() => window.open(src, "_blank")}
                    >
                        Open PDF in New Tab
                    </Button>
                ) : (
                    <>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                                onClick={() => setScale(s => Math.max(s - 0.2, 0.5))}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <div className="w-12 text-center text-[10px] font-black text-white/50 italic">
                                {Math.round(scale * 100)}%
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                                onClick={() => setScale(s => Math.min(s + 0.2, 5))}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="w-px h-4 bg-white/10 mx-2" />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                            onClick={() => setRotate(r => (r + 90) % 360)}
                            title="Rotate 90°"
                        >
                            <RotateCw className="w-4 h-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-10 h-10 rounded-full hover:bg-white/10 text-white transition-all"
                            onClick={reset}
                            title="Reset View"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </>
                )}
            </div>

            {!isPdf && (
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] italic">Scroll to Zoom • Drag to Pan Active</p>
            )}
        </DialogContent>
    );
}
