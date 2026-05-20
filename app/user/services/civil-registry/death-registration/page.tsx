import React from "react";
import { Construction } from "lucide-react";

export default function DeathRegistrationPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Construction className="w-8 h-8 text-amber-500" />
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-black italic uppercase tracking-wider text-slate-900 dark:text-white">
                    Death Registration
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
                    This service is currently under development. Please check back later or visit our office.
                </p>
            </div>
        </div>
    );
}
