import { getAboutData } from "./actions";
import AboutClient from "./AboutClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AboutPageAdmin() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const managedBarangay = (session?.user as any)?.managedBarangay;
    const isBarangayAdmin = role === "BARANGAY_ADMIN";

    const aboutData = await getAboutData(isBarangayAdmin ? managedBarangay : null);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
            <div className="bg-blue-600/10 dark:bg-blue-900/20 px-8 py-10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30">
                <h1 className="text-4xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter drop-shadow-sm">
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
            />
        </div>
    );
}
