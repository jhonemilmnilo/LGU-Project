import React from "react";
import ReleaseDocumentsList from "../ReleaseDocumentsList";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
    title: "Release Documents | Registrar Hub",
    description: "Documents currently in processing (FOR_PROCESSING) awaiting release for Civil Registry services.",
};

export default async function ReleaseDocumentsPage() {
    await getServerSession(authOptions);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                        Release Documents
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Transactions currently in Processing (FOR_PROCESSING) for Civil Registry services.
                </p>
            </div>

            <ReleaseDocumentsList />
        </div>
    );
}
