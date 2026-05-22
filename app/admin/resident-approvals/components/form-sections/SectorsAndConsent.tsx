import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function SectorsAndConsentSection({ data }: { data?: any }) {
    const [sectors, setSectors] = useState({
        isSenior: data?.isSenior || false,
        isPWD: data?.isPWD || false,
        isSoloParent: data?.isSoloParent || false,
        isIndigenous: data?.isIndigenous || false,
        is4Ps: data?.is4Ps || false,
    });

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-blue-600 pl-3">
                    Sectoral Membership (J)
                </h4>
                
                <div className="grid grid-cols-1 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-[#2a3040]">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Senior Citizen</label>
                        <Switch checked={sectors.isSenior} onCheckedChange={(v) => setSectors({...sectors, isSenior: v})} />
                        <input type="hidden" name="isSenior" value={sectors.isSenior ? "true" : "false"} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Person with Disability (PWD)</label>
                        <Switch checked={sectors.isPWD} onCheckedChange={(v) => setSectors({...sectors, isPWD: v})} />
                        <input type="hidden" name="isPWD" value={sectors.isPWD ? "true" : "false"} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Solo Parent</label>
                        <Switch checked={sectors.isSoloParent} onCheckedChange={(v) => setSectors({...sectors, isSoloParent: v})} />
                        <input type="hidden" name="isSoloParent" value={sectors.isSoloParent ? "true" : "false"} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Indigenous People</label>
                        <Switch checked={sectors.isIndigenous} onCheckedChange={(v) => setSectors({...sectors, isIndigenous: v})} />
                        <input type="hidden" name="isIndigenous" value={sectors.isIndigenous ? "true" : "false"} />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">4Ps Beneficiary</label>
                        <Switch checked={sectors.is4Ps} onCheckedChange={(v) => setSectors({...sectors, is4Ps: v})} />
                        <input type="hidden" name="is4Ps" value={sectors.is4Ps ? "true" : "false"} />
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2a3040]">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Other Sector</label>
                        <Input name="otherSector" defaultValue={data?.otherSector} placeholder="e.g. LGBTQ+, Youth" />
                    </div>
                </div>
            </div>
        </div>
    );
}
