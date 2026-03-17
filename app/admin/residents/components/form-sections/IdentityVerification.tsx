import { Upload, Camera } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { CameraCapture } from "../CameraCapture";
import { FacialVerification } from "../FacialVerification";
import { Resident } from "../../providers/ResidentProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ID_TYPES } from "../../constants";

export function IdentityVerificationSection({ data }: { data?: Partial<Resident> }) {
  const [previews, setPreviews] = useState({
    idFront: data?.idFrontUrl || null,
    idBack: data?.idBackUrl || null,
    liveness: data?.livenessUrl || null
  });

  const [camera, setCamera] = useState<{ isOpen: boolean; field: "idFront" | "idBack" | null }>({
    isOpen: false,
    field: null
  });
  const [facialVerifyOpen, setFacialVerifyOpen] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(
    data?.facialRecognition ? (data.facialRecognition as any).descriptor || null : null
  );

  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);
  const livenessInputRef = useRef<HTMLInputElement>(null);

  // Sync previews when data changes (e.g. during edit)
  useEffect(() => {
    if (data) {
      setPreviews({
        idFront: data.idFrontUrl || null,
        idBack: data.idBackUrl || null,
        liveness: data.livenessUrl || null
      });
    }
  }, [data?.idFrontUrl, data?.idBackUrl, data?.livenessUrl, data]);

  const handleFileChange = (field: "idFront" | "idBack" | "liveness", e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [field]: url }));
    }
  };

  const handleCapture = (imageSrc: string) => {
    const field = camera.field;
    if (!field) return;

    // Convert base64 to File
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `${field}_capture.jpg`, { type: "image/jpeg" });
        
        // Update the preview
        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [field]: url }));

        // Update the file input programmatically
        let inputRef: React.RefObject<HTMLInputElement | null> | null = null;
        if (field === "idFront") inputRef = idFrontInputRef;
        if (field === "idBack") inputRef = idBackInputRef;

        if (inputRef && inputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          inputRef.current.files = dataTransfer.files;
        }
      });
  };

  const openCamera = (field: "idFront" | "idBack") => {
    setCamera({ isOpen: true, field });
  };

  const onFacialVerified = (descriptor: number[], imageBase64: string) => {
    setFaceDescriptor(descriptor);
    
    // Convert base64 to File for the preview/upload
    fetch(imageBase64)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `liveness_capture.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, liveness: url }));

        if (livenessInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          livenessInputRef.current.files = dataTransfer.files;
        }
      });
    
    setFacialVerifyOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-sm font-semibold">Government Issued ID Type *</label>
        <Select name="idType" defaultValue={data?.idType || undefined}>
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">ID Front View</label>
            <button 
                type="button"
                onClick={() => openCamera("idFront")}
                className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline"
            >
                <Camera className="w-3 h-3" /> OPEN CAMERA
            </button>
          </div>
          <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
            {previews.idFront ? (
                <div className="w-full h-full relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previews.idFront} alt="ID Front" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                    </div>
                </div>
            ) : (
                <>
                    <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-400 font-medium">Click to upload Front</span>
                </>
            )}
            <input 
              type="file" 
              name="idFrontUrl" 
              ref={idFrontInputRef}
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={(e) => handleFileChange("idFront", e)}
            />
          </div>
        </div>

        {/* ID Back */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">ID Back View</label>
                <button 
                    type="button"
                    onClick={() => openCamera("idBack")}
                    className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline"
                >
                    <Camera className="w-3 h-3" /> OPEN CAMERA
                </button>
            </div>
            <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
                {previews.idBack ? (
                    <div className="w-full h-full relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previews.idBack} alt="ID Back" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </div>
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-slate-400 font-medium">Click to upload Back</span>
                    </>
                )}
                <input 
                  type="file" 
                  name="idBackUrl" 
                  ref={idBackInputRef}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleFileChange("idBack", e)}
                />
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">Facial Verification / Liveness Photo</label>
        <div className="relative h-64 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2a3040] bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
            {previews.liveness ? (
                <div className="w-full h-full relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previews.liveness} alt="Liveness" className="w-full h-full object-cover" />
                    <button 
                        type="button"
                        onClick={() => setFacialVerifyOpen(true)}
                        className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                    {faceDescriptor && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                            Biometric Secured
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    type="button"
                    onClick={() => setFacialVerifyOpen(true)}
                    className="flex flex-col items-center justify-center w-full h-full"
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Open Camera and verify face</span>
                    <p className="text-[10px] text-slate-400 mt-1">Look directly at the camera and ensure good lighting</p>
                </button>
            )}
            <input 
              type="file" 
              name="livenessUrl" 
              ref={livenessInputRef}
              className="absolute inset-0 opacity-0 pointer-events-none" 
              onChange={(e) => handleFileChange("liveness", e)}
            />
        </div>
      </div>

      <CameraCapture 
        isOpen={camera.isOpen}
        onClose={() => setCamera({ isOpen: false, field: null })}
        onCapture={handleCapture}
        title="ID Capture"
      />

      <FacialVerification 
        isOpen={facialVerifyOpen}
        onClose={() => setFacialVerifyOpen(false)}
        onVerified={onFacialVerified}
      />

      {/* Hidden input for biometric data */}
      {faceDescriptor && (
        <input type="hidden" name="facialRecognition" value={JSON.stringify({ descriptor: faceDescriptor })} />
      )}
    </div>
  );
}
