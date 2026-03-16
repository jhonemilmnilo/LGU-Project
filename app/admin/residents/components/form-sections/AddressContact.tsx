/* eslint-disable */
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BARANGAYS } from "../../constants";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { HeadSearch } from "../HeadSearch";

export function AddressContactSection({ data }: { data?: any }) {
  const [isHead, setIsHead] = useState(data?.isHead || false);
  const [headInfo, setHeadInfo] = useState({ id: data?.headId || "", name: "" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">House Number</label>
          <Input name="houseNumber" defaultValue={data?.houseNumber} placeholder="e.g. 123" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Street</label>
          <Input name="street" defaultValue={data?.street} placeholder="e.g. Rizal St." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Sitio</label>
          <Input name="sitio" defaultValue={data?.sitio} placeholder="e.g. Maligaya" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Purok</label>
          <Input name="purok" defaultValue={data?.purok} placeholder="e.g. 1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Barangay *</label>
          <Select name="barangay" defaultValue={data?.barangay}>
            <SelectTrigger>
              <SelectValue placeholder="Select Barangay" />
            </SelectTrigger>
            <SelectContent>
              {BARANGAYS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Municipality</label>
          <Input name="municipality" defaultValue={data?.municipality || "Mapandan"} readOnly className="bg-slate-100" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Province</label>
          <Input name="province" defaultValue={data?.province || "Pangasinan"} readOnly className="bg-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Mobile Number</label>
          <Input name="contactNumber" defaultValue={data?.contactNumber} placeholder="09XX XXX XXXX" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Email (Optional)</label>
          <Input name="email" type="email" defaultValue={data?.email} placeholder="juan@example.com" />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isHead" 
            name="isHead" 
            value="true"
            checked={isHead}
            onCheckedChange={(checked) => setIsHead(!!checked)}
          />
          <label htmlFor="isHead" className="text-sm font-bold text-blue-900 dark:text-blue-100 italic uppercase">
            Check if this person is the HEAD OF THE HOUSEHOLD
          </label>
        </div>

        {!isHead && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Relationship to Head</label>
              <Input name="relationshipToHead" defaultValue={data?.relationshipToHead} placeholder="e.g. Spouse, Son, Daughter" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Search Household Head</label>
              <HeadSearch 
                onSelect={(id, name) => setHeadInfo({ id, name })} 
                defaultValue={data?.headName} 
              />
              <input type="hidden" name="headId" value={headInfo.id} />
              <input type="hidden" name="isHead" value="false" />
            </div>
          </div>
        )}
        {isHead && <input type="hidden" name="isHead" value="true" />}
      </div>
    </div>
  );
}
