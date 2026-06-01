"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, FileText, Download, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    fileUrl: string | null;
    title: string;
    themeColor?: string;
}

export default function DocumentViewerModal({
    isOpen,
    onClose,
    file,
    fileUrl,
    title,
    themeColor = "var(--primary-theme)"
}: DocumentViewerModalProps) {

    const [fetchedType, setFetchedType] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Reset view state every time modal opens
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setRotation(0);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen, fileUrl]);

    useEffect(() => {
        if (fileUrl && fileUrl.startsWith("blob:")) {
            fetch(fileUrl)
                .then(res => res.blob())
                .then(blob => setFetchedType(blob.type))
                .catch(() => {});
        } else {
            setFetchedType(null);
        }
    }, [fileUrl]);

    const activeUrl = React.useMemo(() => {
        if (file) return URL.createObjectURL(file);
        return fileUrl;
    }, [file, fileUrl]);

    const isPdf = React.useMemo(() => {
        if (file) return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (fetchedType) return fetchedType === "application/pdf";
        if (fileUrl) {
            if (fileUrl.toLowerCase().endsWith(".pdf") || fileUrl.includes("application/pdf") || fileUrl.includes(".pdf?")) return true;
        }
        if (title && title.toLowerCase().includes("pdf")) return true;
        return false;
    }, [file, fileUrl, fetchedType, title]);

    // Zoom helpers
    const zoomIn = () => setZoom(z => Math.min(z + 0.25, 4));
    const zoomOut = () => setZoom(z => Math.max(z - 0.25, 0.25));
    const resetView = () => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); };

    // Drag handlers
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (isPdf) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y };
        e.preventDefault();
    }, [isPdf, position]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !dragStart.current) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPosition({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    }, [isDragging]);

    const onMouseUp = useCallback(() => {
        setIsDragging(false);
        dragStart.current = null;
    }, []);

    // Touch drag handlers
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (isPdf || e.touches.length !== 1) return;
        const t = e.touches[0];
        dragStart.current = { x: t.clientX, y: t.clientY, px: position.x, py: position.y };
    }, [isPdf, position]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (!dragStart.current || e.touches.length !== 1) return;
        const t = e.touches[0];
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        setPosition({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
        e.preventDefault();
    }, []);

    const onTouchEnd = useCallback(() => { dragStart.current = null; }, []);

    // Scroll wheel zoom
    const onWheel = useCallback((e: React.WheelEvent) => {
        if (isPdf) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.min(Math.max(z + delta, 0.25), 4));
    }, [isPdf]);

    return (
        <AnimatePresence>
            {isOpen && activeUrl && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", duration: 0.45 }}
                        className="relative w-full max-w-5xl bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
                        style={{ height: "88vh" }}
                    >
                        {/* Ambient Glow */}
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 blur-[80px] rounded-full opacity-10 pointer-events-none"
                            style={{ backgroundColor: themeColor }}
                        />

                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 shrink-0">
                                    {isPdf
                                        ? <FileText className="w-4 h-4" style={{ color: themeColor }} />
                                        : <Eye className="w-4 h-4" style={{ color: themeColor }} />
                                    }
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 italic block leading-none">Document Viewer</span>
                                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">{title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Image controls — shown only for non-PDF */}
                                {!isPdf && (
                                    <>
                                        {/* Zoom Out */}
                                        <button
                                            onClick={zoomOut}
                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Zoom Level */}
                                        <div className="px-2 h-8 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 min-w-[44px] tabular-nums">
                                            {Math.round(zoom * 100)}%
                                        </div>

                                        {/* Zoom In */}
                                        <button
                                            onClick={zoomIn}
                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />

                                        {/* Rotate CCW */}
                                        <button
                                            onClick={() => setRotation(r => r - 90)}
                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            title="Rotate Left"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Rotate CW */}
                                        <button
                                            onClick={() => setRotation(r => r + 90)}
                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            title="Rotate Right"
                                        >
                                            <RotateCw className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Reset */}
                                        <button
                                            onClick={resetView}
                                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                                            title="Reset View"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
                                    </>
                                )}

                                <Button
                                    onClick={() => window.open(activeUrl, "_blank")}
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-all"
                                    title="Open in new tab"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content Body */}
                        <div
                            ref={containerRef}
                            className="flex-1 relative overflow-hidden bg-[#0c0f16]"
                            style={{ cursor: isPdf ? "default" : isDragging ? "grabbing" : "grab" }}
                            onMouseDown={onMouseDown}
                            onMouseMove={onMouseMove}
                            onMouseUp={onMouseUp}
                            onMouseLeave={onMouseUp}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            onWheel={onWheel}
                        >
                            {isPdf ? (
                                <iframe
                                    src={`${activeUrl}#toolbar=0&navpanes=0`}
                                    className="w-full h-full border-0 bg-white"
                                    title="PDF Document Viewer"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center select-none">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activeUrl}
                                        alt={title}
                                        draggable={false}
                                        style={{
                                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                            transition: isDragging ? "none" : "transform 0.15s ease",
                                            maxWidth: "100%",
                                            maxHeight: "100%",
                                            objectFit: "contain",
                                            borderRadius: "8px",
                                            userSelect: "none",
                                            pointerEvents: "none",
                                        }}
                                    />
                                </div>
                            )}
                        </div>


                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
