"use client";
 
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, FileText, Download, ZoomIn, ZoomOut, RotateCw, RotateCcw, RefreshCw, Move } from "lucide-react";
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
    
    // Lock document.body background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);
 
    const [fetchedType, setFetchedType] = React.useState<string | null>(null);
 
    // Image Manipulation States
    const [scale, setScale] = React.useState(1);
    const [rotation, setRotation] = React.useState(0);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
 
    // Reset States on open/close
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setRotation(0);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);
 
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
        if (file) {
            return URL.createObjectURL(file);
        }
        return fileUrl;
    }, [file, fileUrl]);
 
    const isPdf = React.useMemo(() => {
        if (file) {
            return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        }
        if (fetchedType) {
            return fetchedType === "application/pdf";
        }
        if (fileUrl) {
            if (fileUrl.toLowerCase().endsWith(".pdf") || fileUrl.includes("application/pdf") || fileUrl.includes(".pdf?")) {
                return true;
            }
        }
        if (title && title.toLowerCase().includes("pdf")) {
            return true;
        }
        return false;
    }, [file, fileUrl, fetchedType, title]);
 
    // Interactive Handlers
    const handleWheel = (e: React.WheelEvent) => {
        if (isPdf) return;
        e.preventDefault();
        const newScale = Math.min(Math.max(scale - e.deltaY * 0.0015, 0.4), 8);
        setScale(newScale);
    };
 
    const handlePointerDown = (e: React.PointerEvent) => {
        if (isPdf) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };
 
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || isPdf) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };
 
    const handlePointerUp = () => {
        if (isPdf) return;
        setIsDragging(false);
    };
 
    const handleReset = () => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };
 
    return (
        <AnimatePresence>
            {isOpen && activeUrl && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
                    />
 
                    {/* Modal Window Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-4xl bg-white dark:bg-[#0c0f16] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 h-[80vh]"
                    >
                        {/* Ambient Glow */}
                        <div 
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 blur-[80px] rounded-full opacity-10 pointer-events-none"
                            style={{ backgroundColor: themeColor }}
                        />
 
                        {/* Modal Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/5 shrink-0">
                                    {isPdf ? (
                                        <FileText className="w-5 h-5 text-primary" style={{ color: themeColor }} />
                                    ) : (
                                        <Eye className="w-5 h-5 text-primary" style={{ color: themeColor }} />
                                    )}
                                </div>
                                <div>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 italic block leading-none">Document Visualizer</span>
                                    <h3 className="text-sm sm:text-base font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">
                                        {title}
                                    </h3>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Visualizer Controls - Only for Images */}
                                {!isPdf && (
                                    <div className="hidden sm:flex items-center gap-1 bg-slate-50 dark:bg-white/5 rounded-xl p-1 border border-slate-100 dark:border-white/5 mr-2">
                                        <Button
                                            onClick={() => setScale(prev => Math.min(prev + 0.25, 8))}
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4.5 h-4.5" />
                                        </Button>
                                        <Button
                                            onClick={() => setScale(prev => Math.max(prev - 0.25, 0.4))}
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4.5 h-4.5" />
                                        </Button>
                                        <Button
                                            onClick={() => setRotation(prev => prev - 90)}
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            title="Rotate Counter-Clockwise"
                                        >
                                            <RotateCcw className="w-4.5 h-4.5" />
                                        </Button>
                                        <Button
                                            onClick={() => setRotation(prev => prev + 90)}
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            title="Rotate Clockwise"
                                        >
                                            <RotateCw className="w-4.5 h-4.5" />
                                        </Button>
                                        <Button
                                            onClick={handleReset}
                                            variant="ghost"
                                            size="icon"
                                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                                            title="Reset Changes"
                                        >
                                            <RefreshCw className="w-4.5 h-4.5" />
                                        </Button>
                                    </div>
                                )}
 
                                <Button
                                    onClick={() => window.open(activeUrl, "_blank")}
                                    variant="ghost"
                                    size="icon"
                                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-all shrink-0"
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
 
                        {/* Content Body */}
                        <div 
                            className="flex-1 bg-slate-100/50 dark:bg-black/40 flex items-center justify-center overflow-hidden relative select-none"
                            onWheel={handleWheel}
                        >
                            {isPdf ? (
                                <iframe
                                    src={`${activeUrl}#toolbar=0&navpanes=0`}
                                    className="w-full h-full rounded-2xl border-0 bg-white"
                                    title="PDF Document Viewer"
                                />
                            ) : (
                                <div 
                                    className="w-full h-full flex items-center justify-center relative active:cursor-grabbing overflow-hidden cursor-grab"
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerLeave={handlePointerUp}
                                    style={{ touchAction: "none" }}
                                >
                                    {/* Action instructions overlay */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest pointer-events-none z-20 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                        <Move className="w-3.5 h-3.5 text-primary" />
                                        <span>Drag to Pan • Scroll to Zoom</span>
                                    </div>
 
                                    <motion.div
                                        className="relative flex items-center justify-center pointer-events-none"
                                        style={{
                                            x: position.x,
                                            y: position.y,
                                            scale,
                                            rotate: rotation,
                                        }}
                                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={activeUrl}
                                            alt={title}
                                            className="max-w-[85vw] max-h-[60vh] object-contain rounded-2xl shadow-2xl select-none"
                                            draggable={false}
                                        />
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
