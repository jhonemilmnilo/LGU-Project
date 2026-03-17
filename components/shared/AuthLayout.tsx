"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface AuthLayoutProps {
    children: React.ReactNode;
    imageSrc: string;
    quote?: string;
    author?: string;
    description?: string;
    badges?: React.ReactNode;
}

export function AuthLayout({
    children,
    imageSrc,
    quote,
    author,
    description,
    badges,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-[#0a0c10]">
            {/* Left Side: Form */}
            <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex w-full flex-col justify-center px-8 lg:w-1/2 xl:px-20 relative"
            >
                {/* Subtle top-left brand mark */}
                <div className="absolute top-8 left-8 xl:left-12 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9" />
                        </svg>
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">
                        Mapandan
                    </span>
                </div>

                <div className="mx-auto w-full max-w-md">
                    {children}
                </div>

                {/* Bottom footer */}
                <p className="absolute bottom-8 left-8 xl:left-12 text-xs text-slate-400 dark:text-slate-600 font-medium">
                    © {new Date().getFullYear()} Mapandan. All rights reserved.
                </p>
            </motion.div>

            {/* Right Side: Image & Quote */}
            <div className="relative hidden w-1/2 lg:block overflow-hidden">
                {/* Background image */}
                <Image
                    src={imageSrc}
                    alt="Auth Background"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Gradient overlay — darker at bottom for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

                {/* Floating glass card with quote */}
                <div className="absolute bottom-10 left-10 right-10">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 p-7 shadow-2xl"
                    >
                        {quote && (
                            <blockquote className="text-xl font-semibold text-white leading-relaxed mb-4">
                                &quot;{quote}&quot;
                            </blockquote>
                        )}
                        {description && (
                            <p className="text-sm text-white/70 leading-relaxed mb-5">
                                {description}
                            </p>
                        )}
                        {author && (
                            <div className="flex items-center gap-3">
                                <span className="h-px w-6 bg-indigo-400 rounded-full" />
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-widest">
                                    {author}
                                </p>
                            </div>
                        )}
                        {badges && (
                            <div className="mt-5 pt-5 border-t border-white/10">
                                {badges}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}