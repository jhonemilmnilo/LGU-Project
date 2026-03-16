/* eslint-disable */
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ID_TYPES } from "../../constants";
import { Upload, Camera, FileCheck } from "lucide-react";
import { useState } from "react";

export function IdentityVerificationSection({ data }: { data?: any }) {
  const [previews, setPreviews] = useState({
    idFront: data?.idFrontUrl || null,
    idBack: data?.idBackUrl || null,
    liveness: data?.livenessUrl || null
  });

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [field]: url }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Government Issued ID Type *</label>
        <Select name="idType" defaultValue={data?.idType}>
          <SelectTrigger>
            <SelectValue placeholder="Select ID Type" />
          </SelectTrigger>
          <SelectContent>
            {ID_TYPES.map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Front */}
        <div className="space-y-3">
          <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">ID Front View</label>
          <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
            {previews.idFront ? (
                <img src={previews.idFront} alt="ID Front" className="w-full h-full object-cover" />
            ) : (
                <>
                    <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-400 font-medium">Click to upload Front</span>
                </>
            )}
            <input 
              type="file" 
              name="idFrontUrl" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => handleFileChange("idFront", e)}
            />
          </div>
        </div>

        {/* ID Back */}
        <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">ID Back View</label>
            <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
                {previews.idBack ? (
                    <img src={previews.idBack} alt="ID Back" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-400 font-medium">Click to upload Back</span>
                    </>
                )}
                <input 
                  type="file" 
                  name="idBackUrl" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleFileChange("idBack", e)}
                />
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">Facial Verification / Liveness Photo</label>
        <div className="relative h-48 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
            {previews.liveness ? (
                <img src={previews.liveness} alt="Liveness" className="w-full h-full object-cover" />
            ) : (
                <>
                    <Camera className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-400 font-medium">Click to capture/upload face photo</span>
                </>
            )}
            <input 
              type="file" 
              name="livenessUrl" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => handleFileChange("liveness", e)}
            />
        </div>
      </div>
    </div>
  );
}
