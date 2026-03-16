/* eslint-disable */
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function FamilyBackgroundSection({ data }: { data?: any }) {
  const [familyMembers, setFamilyMembers] = useState<any[]>(data?.familyMembers || []);

  const addMember = () => {
    setFamilyMembers([...familyMembers, { fullName: "", relationship: "", age: "" }]);
  };

  const removeMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  return (
    <div className="space-y-8">
      {/* Parents Section */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-blue-500 pl-3">Mother's Maiden Name</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input name="motherFirstName" defaultValue={data?.motherFirstName} placeholder="First Name" />
          <Input name="motherMiddleName" defaultValue={data?.motherMiddleName} placeholder="Middle Name" />
          <Input name="motherLastName" defaultValue={data?.motherLastName} placeholder="Last Name" />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-blue-500 pl-3">Father's Name</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input name="fatherFirstName" defaultValue={data?.fatherFirstName} placeholder="First Name" />
          <Input name="fatherMiddleName" defaultValue={data?.fatherMiddleName} placeholder="Middle Name" />
          <Input name="fatherLastName" defaultValue={data?.fatherLastName} placeholder="Last Name" />
        </div>
      </div>

      {/* Dependents/Children Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs tracking-widest border-l-4 border-green-500 pl-3">Children / Dependents (G)</h4>
          <Button type="button" variant="outline" size="sm" onClick={addMember} className="rounded-full border-green-500 text-green-600 hover:bg-green-50">
            <Plus className="w-4 h-4 mr-1" /> Add Dependent
          </Button>
        </div>

        <div className="space-y-3">
          {familyMembers.map((member, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-[#2a3040] animate-in slide-in-from-right-2">
              <div className="md:col-span-5">
                <Input 
                  placeholder="Full Name" 
                  value={member.fullName} 
                  onChange={(e) => updateMember(index, "fullName", e.target.value)}
                />
              </div>
              <div className="md:col-span-3">
                <Input 
                  placeholder="Relationship" 
                  value={member.relationship} 
                  onChange={(e) => updateMember(index, "relationship", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Input 
                  type="number" 
                  placeholder="Age" 
                  value={member.age} 
                  onChange={(e) => updateMember(index, "age", e.target.value)}
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(index)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {familyMembers.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-[#2a3040] rounded-2xl text-slate-400 text-sm italic">
              No family members added yet.
            </div>
          )}
        </div>
        {/* Hidden input to pass family members data to form submission */}
        <input type="hidden" name="familyMembers" value={JSON.stringify(familyMembers)} />
      </div>
    </div>
  );
}
