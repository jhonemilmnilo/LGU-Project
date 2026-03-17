"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import { CheckCircle2, Circle, AlertCircle, Loader2, Camera, RefreshCw } from "lucide-react";
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
    const [progress, setProgress] = useState(0);
    const [hint, setHint] = useState<string>("Face the camera");
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
    }, []);


    const handleVerification = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.video || !modelsLoaded) return;
        if (isProcessing.current || step === "COMPLETED" || step === "PROCESSING") return;

        isProcessing.current = true;
        try {
            const video = webcamRef.current.video;
            if (video.readyState < 2) {
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

            // Enhanced Debugging
            if (step === "BLINK" || Math.random() > 0.95) {
                console.log(`[BioCheck] Step: ${step} | NosePos: ${nosePos.toFixed(3)} | EAR: ${avgEAR.toFixed(3)}`);
            }

            if (step === "NEUTRAL") {
                if (nosePos > 0.35 && nosePos < 0.65) { // Slightly wider precise center
                    setHint("Perfect! Now turn your head slightly LEFT...");
                    setLiveness(prev => ({ ...prev, neutral: true }));
                    setStep("PROCESSING");
                    setTimeout(() => setStep("LOOK_LEFT"), 400);
                } else {
                    setHint("Center your face directly at the camera.");
                }
            } else if (step === "LOOK_LEFT") {
                if (nosePos > 0.65) { // Nose closer to anatomical left eye (image right)
                    setHint("Good! Now turn your head slightly RIGHT...");
                    setLiveness(prev => ({ ...prev, left: true }));
                    setStep("PROCESSING");
                    setTimeout(() => setStep("LOOK_RIGHT"), 400);
                } else {
                    setHint("Look to your LEFT (towards your left shoulder)...");
                }
            } else if (step === "LOOK_RIGHT") {
                if (nosePos < 0.35) { // Nose closer to anatomical right eye (image left)
                    setHint("Great! Now look center and blink naturally...");
                    setLiveness(prev => ({ ...prev, right: true }));
                    setStep("PROCESSING");
                    setTimeout(() => setStep("BLINK"), 400);
                } else {
                    setHint("Look to your RIGHT (towards your right shoulder)...");
                }
            } else if (step === "BLINK") {
                if (avgEAR < 0.26) { // Increased from 0.22 to be more lenient based on logs
                    setHint("Verifying identity...");
                    setStep("PROCESSING"); 
                    
                    const toastId = toast.loading("Verifying identity against database...");
                    
                    try {
                        const descriptor = Array.from(detections.descriptor);
                        const duplicateCheck = await checkDuplicateFace(descriptor);
                        
                        toast.dismiss(toastId);

                        if (duplicateCheck.success && duplicateCheck.match) {
                            toast.error(`DUPLICATE DETECTED: This person is already registered as ${duplicateCheck.match.name}.`, {
                                duration: 8000,
                                position: "top-center"
                            });
                            resetVerification();
                            return;
                        }

                        if (!duplicateCheck.success) {
                            toast.error(duplicateCheck.error || "Database verification failed. Please try again.");
                            setStep("BLINK");
                            return;
                        }

                        toast.success("No duplicate found. Identity verified!");
                        setLiveness(prev => ({ ...prev, blink: true }));
                        setStep("COMPLETED");

                        const imageBase64 = webcamRef.current.getScreenshot();
                        if (imageBase64) {
                            onVerified(descriptor, imageBase64);
                        }
                    } catch (dupErr) {
                        toast.dismiss();
                        console.error("Duplicate check error:", dupErr);
                        setHint("Database error. Please blink again.");
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
        if (isOpen && modelsLoaded && step !== "COMPLETED" && step !== "INITIALIZING" && step !== "PROCESSING") {
            interval = setInterval(handleVerification, 80); // Speed up slightly to catch blinks
        }
        return () => clearInterval(interval);
    }, [isOpen, modelsLoaded, step, handleVerification]);



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
                    {modelsLoaded ? (
                        <>
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className={`w-full h-full object-cover transition-all duration-700 ${step === "INITIALIZING" ? 'grayscale opacity-40' : 'grayscale-0 opacity-100'}`}
                                videoConstraints={{ facingMode: "user", width: 720, height: 720 }}
                                mirrored={true}
                                onUserMediaError={handleWebcamError}
                            />
                            {/* Face Overlay Guideline */}
                            <div className={`absolute inset-0 border-[10px] ${step === "COMPLETED" ? 'border-green-500/50' : 'border-blue-500/10'} pointer-events-none transition-colors duration-500`}>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-white/30 rounded-[100px] flex items-center justify-center">
                                    {step !== "COMPLETED" && (
                                        <div className="absolute inset-0 border-2 border-dashed border-blue-400/50 rounded-[100px] animate-pulse" />
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
                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center animate-in slide-in-from-bottom-4">
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
                             <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${hint.toLowerCase().includes('no face') ? 'bg-red-500' : 'bg-green-500'}`} />
                             {hint}
                        </p>
                    </div>
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
