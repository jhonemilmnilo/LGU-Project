import React from "react";
import TreasuryDashboard from "./TreasuryDashboard";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Treasury Hub | Agno Portal",
    description: "Official administrative dashboard for treasury services and financial processing.",
};

export default async function TreasuryPage() {
    await getServerSession(authOptions);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section — matching resident-approvals */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        Treasury <span className="text-primary tracking-normal italic">Hub</span>
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Securely manage municipal financial applications, evaluate tax declarations, and issue official community certificates.
                </p>
            </div>

            <TreasuryDashboard />
        </div>
    );
}
