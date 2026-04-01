import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBrgyServices, getBrgyRequests } from "./actions";
import { BrgyServicesClient } from "./BrgyServicesClient";

export default async function BrgyServicesAdminPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const managedBarangay = (session?.user as any)?.managedBarangay;
    const isBarangayAdmin = role === "BARANGAY_ADMIN";

    // Fetch initial data
    const services = await getBrgyServices(isBarangayAdmin ? (managedBarangay || "") : undefined);
    const requests = await getBrgyRequests(isBarangayAdmin ? (managedBarangay || "") : undefined);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
            <div className="bg-blue-600/10 dark:bg-blue-900/20 px-8 py-10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                <h1 className="text-4xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter drop-shadow-sm">Barangay Services Control</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide">
                    Manage service offerings and process resident requests for {managedBarangay || "Mapandan"}.
                </p>
            </div>
            
            <BrgyServicesClient 
                initialServices={services} 
                initialRequests={requests} 
                isBarangayAdmin={isBarangayAdmin} 
                managedBarangay={managedBarangay} 
            />
        </div>
    );
}
