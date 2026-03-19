import { getAboutPage } from "./actions";
import AboutClient from "./AboutClient";

export default async function AboutPageAdmin() {
    const data = await getAboutPage();
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-20">
            <div className="bg-blue-600/10 dark:bg-blue-900/20 px-8 py-10 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                <h1 className="text-4xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter drop-shadow-sm">About Page Control</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium tracking-wide">Manage the historical information, mission, vision, and the Honorable Mayor's message here. Content displays live on the public `/about` page.</p>
            </div>
            
            <AboutClient initialData={data} />
        </div>
    );
}
