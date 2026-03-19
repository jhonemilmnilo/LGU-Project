import { getPastMayors } from "../actions";
import { PastMayorsClient } from "../PastMayorsClient";

export default async function PastMayorsPageAdmin() {
    const pastMayors = await getPastMayors();

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
            <div className="bg-emerald-600/10 dark:bg-emerald-900/20 px-8 py-10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                <h1 className="text-4xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter drop-shadow-sm">Past Mayors Control</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide">Manage the historical timeline of honorable mayors who served. Content displays live on the public `/about` page.</p>
            </div>
            
            <PastMayorsClient initialMayors={pastMayors} />
        </div>
    );
}
