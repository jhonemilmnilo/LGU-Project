/* eslint-disable */
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

    const [consent, setConsent] = useState(data?.dataPrivacyConsent || false);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-amber-500 pl-3">Sectoral Membership (J)</h4>
                    
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

                <div className="space-y-4">
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-slate-500 pl-3">For Official Use Only (K)</h4>
                    <div className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-[#2a3040]">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Received By</label>
                            <Input name="receivedBy" defaultValue={data?.receivedBy} placeholder="Official's Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Position</label>
                            <Input name="officialPosition" defaultValue={data?.officialPosition} placeholder="e.g. Barangay Secretary" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold italic text-blue-600 uppercase tracking-tighter">Registration Status</label>
                            <select 
                                name="registrationStatus" 
                                defaultValue={data?.registrationStatus || "PENDING"}
                                className="w-full h-10 px-3 py-2 bg-white dark:bg-[#0f1117] rounded-xl border border-slate-200 dark:border-[#2a3040] text-sm font-bold uppercase"
                            >
                                <option value="PENDING">PENDING</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Date Received</label>
                            <Input name="dateReceived" type="date" defaultValue={data?.dateReceived ? new Date(data.dateReceived).toISOString().split('T')[0] : ""} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-blue-600 rounded-2xl text-white space-y-4 shadow-xl shadow-blue-500/20">
                <div className="flex items-start space-x-3">
                    <Checkbox 
                        id="dataPrivacyConsent" 
                        checked={consent}
                        onCheckedChange={(v) => setConsent(!!v)}
                        className="bg-white"
                    />
                    <input type="hidden" name="dataPrivacyConsent" value={consent ? "true" : "false"} />
                    <div className="space-y-1">
                        <label htmlFor="dataPrivacyConsent" className="text-sm font-black uppercase italic leading-none cursor-pointer">
                            Data Privacy Consent
                        </label>
                        <p className="text-xs text-blue-100 font-medium leading-tight">
                            I hereby give my consent to the LGU of Mapandan to collect and process my personal data for census and official government use in accordance with the Data Privacy Act of 2012.
                        </p>
                        {/* Hidden native input for HTML5 validation */}
                        <input 
                            type="checkbox" 
                            name="consent_required" 
                            required 
                            checked={consent} 
                            onChange={() => {}} // Controlled by Radix checkbox
                            className="SR-only opacity-0 absolute w-0 h-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
