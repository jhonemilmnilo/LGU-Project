"use client";

import { motion } from "framer-motion";
import { Hammer, Shield, HardHat, Clock } from "lucide-react";

export default function MaintenancePage() {
    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white overflow-hidden relative">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-12">
                        <Shield className="w-12 h-12 text-white -rotate-12" />
                    </div>
                    
                    <div className="space-y-4">
                        <motion.span 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-400"
                        >
                            System Upgrade in Progress
                        </motion.span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                            Under <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Maintenance</span>
                        </h1>
                    </div>
                </motion.div>

                <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed italic max-w-lg mx-auto">
{ }
{ }
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    We're currently fine-tuning the Agno Portal to better serve our community. 
{ }
{ }
{ }
{ }

                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    Rest assured, the Umbrella Rocks aren't going anywhere—we'll be back shortly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                    {[
                        { icon: Hammer, label: "Fine Tuning", sub: "Logic Refinement" },
                        { icon: HardHat, label: "Architecture", sub: "Structural Upgrades" },
                        { icon: Clock, label: "Estimation", sub: "Almost Done" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl"
                        >
                            <item.icon className="w-8 h-8 text-blue-500 mb-4 mx-auto" />
                            <h3 className="text-sm font-black uppercase tracking-widest mb-1">{item.label}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.sub}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="pt-12 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
                    © 2026 Municipality of Agno • Digital Services
                </div>
            </div>

            {/* Cinematic Floating Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-10 w-2 h-2 bg-blue-500 rounded-full opacity-20 animate-ping" />
                <div className="absolute bottom-1/4 right-20 w-3 h-3 bg-indigo-500 rounded-full opacity-20 animate-ping delay-700" />
            </div>
        </main>
    );
}
