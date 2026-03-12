import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/landing/Hero";
import { DiningLodging } from "@/components/sections/landing/DiningLodging";
import { PlacesToVisit } from "@/components/sections/landing/PlacesToVisit";
import { NewsEvents } from "@/components/sections/landing/NewsEvents";
import { JobBoard } from "@/components/sections/landing/JobBoard";
import { Government } from "@/components/sections/landing/Government";
import { Services } from "@/components/sections/landing/Services";
import { EmergencyReport } from "@/components/sections/landing/EmergencyReport";

export default function Home() {
    return (
        <main className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-blue-600/30">
            <Navbar />
            
            <Hero />
            
            <div className="space-y-32 pb-32">
                <DiningLodging />
                <PlacesToVisit />
                <NewsEvents />
                <JobBoard />
                <Government />
                <Services />
            </div>
            
            <EmergencyReport />
            <Footer />
        </main>
    );
}
