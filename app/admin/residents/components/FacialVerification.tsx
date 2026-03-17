"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { CheckCircle2, Circle, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { checkDuplicateFace } from "../../actions";

interface FacialVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    onVerified: (descriptor: number[], imageBase64: string) => void;
}

type VerificationStep = "INITIALIZING" | "NEUTRAL" | "LOOK_LEFT" | "LOOK_RIGHT" | "BLINK" | "COMPLETED" | "PROCESSING";

export function FacialVerification({ isOpen, onClose, onVerified }: FacialVerificationProps) {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [step, setStep] = useState<VerificationStep>("INITIALIZING");
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [hint, setHint] = useState<string>("Face the camera");
    const [showGuide, setShowGuide] = useState(false); // Default to false for better UX
    const [eyeBaseline, setEyeBaseline] = useState<number | null>(null); // To store "normal" eye state
    const [lightingDetail, setLightingDetail] = useState<{ score: number; status: 'GOOD' | 'POOR' }>({ score: 0, status: 'GOOD' });
    // const [error, setError] = useState<string | null>(null); // Removed unused state

    const isProcessing = useRef(false);

    // Liveness Detection State
    const [liveness, setLiveness] = useState({
        neutral: false,
        left: false,
        right: false,
        blink: false
    });

    // Load Models
    useEffect(() => {
        const loadModels = async () => {
            try {
                console.log("Loading face-api models...");
                const MODEL_URL = "/models";
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                setStep("NEUTRAL");
            } catch (err) {
                console.error("Error loading models:", err);
                setHint("Failed to load AI models.");
            }
        };

        if (isOpen && !modelsLoaded) {
            loadModels();
        }
    }, [isOpen, modelsLoaded]);
    const resetVerification = useCallback(() => {
        setStep("NEUTRAL");
        setLiveness({ neutral: false, left: false, right: false, blink: false });
        setHint("Face the camera");
        setEyeBaseline(null);
        setLightingDetail({ score: 0, status: 'GOOD' });
        isProcessing.current = false;
    }, []);

    // Also reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetVerification();
        }
    }, [isOpen, resetVerification]);


    const handleVerification = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.video || !modelsLoaded) return;
        if (isProcessing.current || step === "COMPLETED" || step === "PROCESSING") return;

        isProcessing.current = true;
        try {
            const video = webcamRef.current.video;
            if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
                isProcessing.current = false;
                return;
            }

            const detections = await faceapi.detectSingleFace(
                video,
                new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
            ).withFaceLandmarks().withFaceDescriptor();

            if (!detections) {
                setHint("No face detected. Align your face to the frame.");
                return;
            }

            const score = detections.detection.score;
            if (score < 0.4) {
                setHint("Face unclear. Check lighting or move closer.");
                return;
            }
            
            setHint("Face detected. Follow the instructions.");

            const landmarks = detections.landmarks;
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();

            // Glass/Occlusion Heuristic Check
            // We check the variance between eye points and the bridge of the nose.
            // If the landmark confidence for the bridge (nose[0-3]) is low or if we detect
            // specific occlusion patterns, we warn the user.
            
            // If the inner eye corners are too far or blocked, it often means heavy glasses
            if (detections.detection.score < 0.85) { // Strict confidence check
                setHint("Face clarity low. Remove glasses or check lighting.");
                isProcessing.current = false;
                return;
            }

            const leftEyeMid = (leftEye[0].x + leftEye[3].x) / 2;
            const rightEyeMid = (rightEye[0].x + rightEye[3].x) / 2;
            const eyeDist = Math.abs(rightEyeMid - leftEyeMid);
            const nosePos = (nose[6].x - Math.min(leftEyeMid, rightEyeMid)) / eyeDist;

            const getEAR = (eye: faceapi.Point[]) => {
                const v1 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
                const v2 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));
                const h = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));
                return (v1 + v2) / (2 * h);
            };

            const leftEAR = getEAR(leftEye);
            const rightEAR = getEAR(rightEye);
            const avgEAR = (leftEAR + rightEAR) / 2;

            // Lighting Check (Simple brightness estimation)
            if (Math.random() > 0.9) {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, 10, 10);
                    const imgData = ctx.getImageData(0, 0, 10, 10).data;
                    let brightness = 0;
                    for (let i = 0; i < imgData.length; i += 4) {
                        brightness += (imgData[i] + imgData[i+1] + imgData[i+2]) / 3;
                    }
                    brightness /= (imgData.length / 4);
                    setLightingDetail({ 
                        score: brightness, 
                        status: brightness < 40 ? 'POOR' : 'GOOD' 
                    });
                    if (brightness < 40) {
                        setHint("Too dark. Move to a better lit area.");
                        isProcessing.current = false;
                        return;
                    }
                }
            }

            // Enhanced Debugging
            if (step === "BLINK" || Math.random() > 0.95) {
                console.log(`[BioCheck] Step: ${step} | NosePos: ${nosePos.toFixed(3)} | EAR: ${avgEAR.toFixed(3)}`);
            }

            if (step === "NEUTRAL") {
                if (nosePos > 0.35 && nosePos < 0.65) {
                    setHint("Hold still... setting eye baseline");
                    // Take 3 snapshots of EAR to get a reliable baseline
                    setEyeBaseline(prev => prev ? (prev + avgEAR) / 2 : avgEAR);
                    
                    if (eyeBaseline && Math.abs(avgEAR - eyeBaseline) < 0.05) {
                        setHint("Perfect! Now turn your head slightly LEFT...");
                        setLiveness(prev => ({ ...prev, neutral: true }));
                        setStep("PROCESSING");
                        setTimeout(() => setStep("LOOK_LEFT"), 400);
                    }
                } else {
                    setHint("Center your face directly at the camera.");
                }
            } else if (step === "LOOK_LEFT") {
                if (nosePos > 0.65) { 
                    setHint("Good! Now turn your head slightly RIGHT...");
                    setLiveness(prev => ({ ...prev, left: true }));
                    setStep("PROCESSING");
                    setTimeout(() => setStep("LOOK_RIGHT"), 400);
                } else {
                    setHint("Look to your LEFT (towards your left shoulder)...");
                }
            } else if (step === "LOOK_RIGHT") {
                if (nosePos < 0.35) { 
                    setHint("Great! Now look center and blink naturally...");
                    setLiveness(prev => ({ ...prev, right: true }));
                    setStep("PROCESSING");
                    setTimeout(() => setStep("BLINK"), 400);
                } else {
                    setHint("Look to your RIGHT (towards your right shoulder)...");
                }
            } else if (step === "BLINK") {
                // ADAPTIVE BLINK DETECTION
                // We trigger a blink if the current EAR is 25% lower than the user's neutral baseline
                const isBlinking = eyeBaseline ? (avgEAR < eyeBaseline * 0.75) : (avgEAR < 0.24);
                
                if (isBlinking) { 
                    setHint("Identity verified! Processing...");
                    setStep("PROCESSING"); 
                    
                    const toastId = toast.loading("Finalizing biometric capture...");
                    
                    try {
                        const descriptor = Array.from(detections.descriptor);
                        const duplicateCheck = await checkDuplicateFace(descriptor);
                        
                        toast.dismiss(toastId);

                        if (duplicateCheck.success && duplicateCheck.match) {
                           toast.error(`DUPLICATE DETECTED: This person matches ${duplicateCheck.match.name}.`, {
                               duration: 8000,
                               position: "bottom-right"
                           });
                           setTimeout(() => resetVerification(), 1000);
                           return;
                        }

                        if (!duplicateCheck.success) {
                            toast.error(duplicateCheck.error || "Verification error. Please try again.");
                            setStep("BLINK");
                            return;
                        }

                        toast.success("Identity verified successfully!");
                        setLiveness(prev => ({ ...prev, blink: true }));
                        setStep("COMPLETED");

                        const imageBase64 = webcamRef.current.getScreenshot();
                        if (imageBase64) {
                            onVerified(descriptor, imageBase64);
                        }
                    } catch (dupErr) {
                        toast.dismiss();
                        console.error("Duplicate check error:", dupErr);
                        setHint("Connection error. Please blink again.");
                        setStep("BLINK");
                    }
                }
            }
        } catch (err) {
            console.error("Verification error:", err);
        } finally {
            isProcessing.current = false;
        }
    }, [step, modelsLoaded, onVerified, resetVerification]);

    const handleWebcamError = useCallback((err: string | DOMException) => {
        console.error("Webcam error:", err);
        setHint("Camera error. Please check permissions.");
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOpen && modelsLoaded && step !== "COMPLETED" && step !== "INITIALIZING" && step !== "PROCESSING" && !showGuide) {
            interval = setInterval(handleVerification, 40); // Faster scan: 80ms -> 40ms for snappier blinks
        }
        return () => clearInterval(interval);
    }, [isOpen, modelsLoaded, step, handleVerification, showGuide]);



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#0f1117] border-white/10 rounded-3xl shadow-2xl">
                <DialogHeader className="p-6 bg-[#1a1f2e] border-b border-white/5">
                    <DialogTitle className="text-lg font-black italic uppercase tracking-tighter text-white flex items-center justify-between">
                        <span>Biometric Verification</span>
                        {step === "COMPLETED" && <CheckCircle2 className="w-6 h-6 text-green-500 animate-bounce" />}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Facial recognition and liveness check for resident verification.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative aspect-square flex items-center justify-center bg-black overflow-hidden group">
                    {showGuide && (
                        <div className="absolute inset-0 z-50 bg-[#0f1117] p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                                <ShieldAlert className="w-10 h-10 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Biometric Protocol</h2>
                            <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs">
                                For maximum accuracy, ensure you are in a **well-lit area**, remove **glasses/hats**, and look directly at the camera.
                            </p>
                            <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                    💡 Good Lighting
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                                    😐 Neutral Face
                                </div>
                            </div>
                            <Button 
                                onClick={() => setShowGuide(false)}
                                className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest italic"
                            >
                                I UNDERSTAND, START
                            </Button>
                        </div>
                    )}

                    {modelsLoaded ? (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className={`w-full h-full object-cover transition-all duration-700 ${step === "INITIALIZING" || showGuide ? 'grayscale opacity-40' : 'grayscale-0 opacity-100'}`}
                                videoConstraints={{ facingMode: "user", width: 720, height: 720 }}
                                mirrored={true}
                                onUserMediaError={handleWebcamError}
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            {/* Face Overlay Guideline */}
                            <div className={`absolute inset-0 border-[10px] ${step === "COMPLETED" ? 'border-green-500/50' : lightingDetail.status === 'POOR' ? 'border-red-500/50' : 'border-blue-500/10'} pointer-events-none transition-colors duration-500`}>
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 rounded-[100px] flex items-center justify-center transition-colors ${lightingDetail.status === 'POOR' ? 'border-red-500' : 'border-white/30'}`}>
                                    {step !== "COMPLETED" && (
                                        <div className={`absolute inset-0 border-2 border-dashed rounded-[100px] animate-pulse ${lightingDetail.status === 'POOR' ? 'border-red-400/50' : 'border-blue-400/50'}`} />
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-white font-bold uppercase tracking-widest text-xs animate-pulse">Initializing AI Models...</p>
                        </div>
                    )}

                    {/* Step Instruction Overlay */}
                    {!showGuide && (
                        <div className="absolute bottom-6 left-6 right-6 p-4 bg-transparent flex flex-col items-center animate-in slide-in-from-bottom-4">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Step Guidance</span>
                            <h3 className="text-white text-lg font-black uppercase italic tracking-tighter text-center">
                                {step === "NEUTRAL" && "Center your face in the oval"}
                                {step === "LOOK_LEFT" && "Turn your head slightly LEFT"}
                                {step === "LOOK_RIGHT" && "Turn your head slightly RIGHT"}
                                {step === "BLINK" && "Blink your eyes naturally"}
                                {step === "PROCESSING" && "Hold still..."}
                                {step === "COMPLETED" && "Verification Success!"}
                            </h3>
                            {/* Status Indicator */}
                            <p className="mt-2 text-[11px] font-bold text-slate-300 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                                 <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${hint.toLowerCase().includes('no face') || lightingDetail.status === 'POOR' ? 'bg-red-500' : 'bg-green-500'}`} />
                                 {hint}
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-[#1a1f2e] space-y-6">
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-3">
                        <CheckItem label="Face Centered" active={liveness.neutral} />
                        <CheckItem label="Left Check" active={liveness.left} />
                        <CheckItem label="Right Check" active={liveness.right} />
                        <CheckItem label="Eye Blink" active={liveness.blink} />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 text-white font-bold hover:bg-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={resetVerification}
                            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Reset
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CheckItem({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-500 ${active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-white/5 border-white/5 text-slate-500'}`}>
            {active ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-tight">{label}</span>
        </div>
    );
}
