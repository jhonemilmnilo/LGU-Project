import { getAboutData } from "./actions";
import AboutClient from "./AboutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMultipleSystemSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AboutPageAdmin() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const managedBarangay = (session?.user as any)?.managedBarangay;
    const isBarangayAdmin = role === "BARANGAY_ADMIN";

    const [aboutData, settings] = await Promise.all([
        getAboutData(isBarangayAdmin ? managedBarangay : null),
        getMultipleSystemSettings(["theme_color"])
    ]);

    const themeColor = settings.get("theme_color") || "#2563eb";

    return (
        <div className="p-2 md:p-4 max-w-full mx-auto space-y-6 pb-20">
            <div className="px-6 py-8 rounded-[1.5rem] border" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}25` }}>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter drop-shadow-sm" style={{ color: themeColor }}>
                    {isBarangayAdmin ? `Brgy. ${managedBarangay} Heritage` : "Municipal Heritage"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-black uppercase tracking-[0.2em] text-[10px] opacity-70">
                    {isBarangayAdmin ? "Manage Barangay History & Officials" : "Global About Page Control"}
                </p>
            </div>
            
            <AboutClient 
                aboutData={aboutData} 
                isBarangayAdmin={isBarangayAdmin}
                managedBarangay={managedBarangay}
                themeColor={themeColor}
            />
        </div>
    );
}
