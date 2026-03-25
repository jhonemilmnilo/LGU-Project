import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATIONAL_ATTAINMENT, EMPLOYMENT_STATUS, INCOME_RANGES } from "../../constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GovSocioEconomicSection({ data }: { data?: any }) {
  const [eduVal, setEduVal] = useState(() => {
    if (!data?.educationalAttainment) return "";
    return EDUCATIONAL_ATTAINMENT.includes(data.educationalAttainment) ? data.educationalAttainment : "Other";
  });
  const [empVal, setEmpVal] = useState(() => {
    if (!data?.employmentStatus) return "";
    return EMPLOYMENT_STATUS.includes(data.employmentStatus) ? data.employmentStatus : "Other";
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">TIN (Tax ID)</label>
          <Input name="tin" defaultValue={data?.tin} placeholder="XXX-XXX-XXX" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">GSIS No.</label>
          <Input name="gsis" defaultValue={data?.gsis} placeholder="XXXXXXXXXX" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">SSS No.</label>
          <Input name="sss" defaultValue={data?.sss} placeholder="XX-XXXXXXX-X" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Occupation <span className="text-red-500">*</span></label>
          <Input name="occupation" defaultValue={data?.occupation} required placeholder="e.g. Farmer, Teacher, Driver" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Employer/Company</label>
          <Input name="employer" defaultValue={data?.employer} placeholder="e.g. LGU Mapandan" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Educational Attainment</label>
          {eduVal === "Other" ? (
            <div className="relative flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
               <Input 
                 name="educationalAttainment" 
                 placeholder="Specify attainment" 
                 defaultValue={(data?.educationalAttainment === "Other" ? "" : data?.educationalAttainment) || ""}
                 required 
                 className="h-10 border-blue-400 focus:border-blue-500 bg-blue-50/30 uppercase font-bold"
                 autoFocus
               />
               <button 
                  type="button" 
                  onClick={() => setEduVal(EDUCATIONAL_ATTAINMENT[0])}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="m3 12 9-9"/><path d="m3 12 9 9"/></svg>
                </button>
            </div>
          ) : (
            <Select 
              name="educationalAttainment" 
              onValueChange={setEduVal}
              defaultValue={data?.educationalAttainment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Achievement" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATIONAL_ATTAINMENT.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Employment Status</label>
          {empVal === "Other" ? (
            <div className="relative flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                <Input 
                  name="employmentStatus" 
                  placeholder="Specify status" 
                  defaultValue={(data?.employmentStatus === "Other" ? "" : data?.employmentStatus) || ""}
                  required 
                  className="h-10 border-blue-400 focus:border-blue-500 bg-blue-50/30 uppercase font-bold"
                  autoFocus
                />
                <button 
                  type="button" 
                  onClick={() => setEmpVal(EMPLOYMENT_STATUS[0])}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="m3 12 9-9"/><path d="m3 12 9 9"/></svg>
                </button>
            </div>
          ) : (
            <Select 
              name="employmentStatus" 
              onValueChange={setEmpVal}
              defaultValue={data?.employmentStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Monthly Income</label>
          <Select name="monthlyIncome" defaultValue={data?.monthlyIncome}>
            <SelectTrigger>
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_RANGES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
