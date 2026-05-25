"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, FileText, Download } from "lucide-react";
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
        if (fileUrl) {
            return fileUrl.toLowerCase().endsWith(".pdf") || fileUrl.includes("application/pdf") || fileUrl.includes(".pdf?");
        }
        return false;
    }, [file, fileUrl]);

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
                        <div className="flex-1 p-4 bg-slate-50/50 dark:bg-black/20 flex items-center justify-center overflow-auto relative">
                            {isPdf ? (
                                <iframe
                                    src={`${activeUrl}#toolbar=0&navpanes=0`}
                                    className="w-full h-full rounded-2xl border-0 bg-white"
                                    title="PDF Document Viewer"
                                />
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img
                                        src={activeUrl}
                                        alt={title}
                                        className="max-w-full max-h-full object-contain rounded-xl shadow-md"
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
