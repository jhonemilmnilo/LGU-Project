import { getPastMayors } from "../actions";
import { PastMayorsClient } from "../PastMayorsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMultipleSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PastMayorsPageAdmin() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const managedBarangay = (session?.user as any)?.managedBarangay;
    const isBarangayAdmin = role === "BARANGAY_ADMIN";

    const [pastMayors, settings] = await Promise.all([
        getPastMayors(isBarangayAdmin ? managedBarangay : null),
        getMultipleSystemSettings(["theme_color"])
    ]);

    const themeColor = settings.get("theme_color") || "#2563eb";

    return (
        <div className="p-2 md:p-4 max-w-full mx-auto space-y-6 pb-20">
            <div className="px-6 py-8 rounded-[1.5rem] border" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}25` }}>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter drop-shadow-sm" style={{ color: themeColor }}>
                    {isBarangayAdmin ? "Past Captains Control" : "Past Mayors Control"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-[0.2em] text-[10px] opacity-70">
                    {isBarangayAdmin 
                      ? "Manage the historical timeline of honorable captains who served this barangay."
                      : "Manage the historical timeline of honorable mayors who served. Content displays live on the public `/about` page."}
                </p>
            </div>
            
            <PastMayorsClient 
                initialMayors={pastMayors} 
                isBarangayAdmin={isBarangayAdmin} 
                themeColor={themeColor}
            />
        </div>
    );
}
