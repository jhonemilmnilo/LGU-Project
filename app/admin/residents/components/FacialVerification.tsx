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
    onVerified: (descriptor: number[]) => void; 
}

type VerificationStep = "INITIALIZING" | "NEUTRAL" | "LOOK_LEFT" | "LOOK_RIGHT" | "BLINK" | "COMPLETED" | "PROCESSING";

export function FacialVerification({ isOpen, onClose, onVerified }: FacialVerificationProps) {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [step, setStep] = useState<VerificationStep>("INITIALIZING");
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [hint, setHint] = useState<string>("Face the camera");
    const [showGuide, setShowGuide] = useState(false); 
    const isBlinkProcessing = useRef(false);
    const [eyeBaseline, setEyeBaseline] = useState<number | null>(null); 
    const [lightingDetail, setLightingDetail] = useState<{ score: number; status: 'GOOD' | 'POOR' }>({ score: 0, status: 'GOOD' });

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
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
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

    const blinkFrameCounter = useRef(0);
    const eyeWasClosed = useRef(false);
    const baselineEAR = useRef(0);
    const baselineFrames = useRef(0);

    const resetVerification = useCallback(() => {
        setStep("NEUTRAL");
        setLiveness({ neutral: false, left: false, right: false, blink: false });
        setHint("Face the camera");
        setEyeBaseline(null);
        setLightingDetail({ score: 0, status: 'GOOD' });
        isProcessing.current = false;
        isBlinkProcessing.current = false;
        
        // Reset blink detection counters
        baselineEAR.current = 0;
        baselineFrames.current = 0;
        blinkFrameCounter.current = 0;
        eyeWasClosed.current = false;
    }, []);

    // Also reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetVerification();
        }
    }, [isOpen, resetVerification]);

    const euclidean = (p1: faceapi.Point, p2: faceapi.Point) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const getEAR = (p: faceapi.Point[]) => {
        const v1 = euclidean(p[1], p[5]);
        const v2 = euclidean(p[2], p[4]);
        const h = euclidean(p[0], p[3]);
        return (v1 + v2) / (2.0 * h);
    };

    const handleVerification = useCallback(async () => {
        if (!webcamRef.current || !webcamRef.current.video || !modelsLoaded) return;
        const isBlinkStep = step === "BLINK" && !liveness.blink;
        if (!isBlinkStep && isProcessing.current) return;
        if (step === "COMPLETED" || step === "PROCESSING") return;

        if (!isBlinkStep) isProcessing.current = true;
        
        try {
            const video = webcamRef.current.video;
            if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
                if (!isBlinkStep) isProcessing.current = false;
                return;
            }

            const detection = await faceapi.detectSingleFace(
                video,
                new faceapi.TinyFaceDetectorOptions({ 
                    inputSize: isBlinkStep ? 160 : 224, 
                    scoreThreshold: isBlinkStep ? 0.25 : 0.5 
                })
            ).withFaceLandmarks();

            if (!detection) {
                setHint("Align your face to the frame.");
                if (!isBlinkStep) isProcessing.current = false;
                return;
            }
            
            setHint("Face detected. Follow the instructions.");

            const landmarks = detection.landmarks;
            const box = detection.detection.box;
            const frameWidth = video.videoWidth;
            const frameHeight = video.videoHeight;

            // STEP 1 — CENTER
            if (!liveness.neutral) {
                const boxCenterX = box.x + box.width / 2;
                const boxCenterY = box.y + box.height / 2;
                const isCentered = 
                    Math.abs(boxCenterX - frameWidth / 2) < frameWidth * 0.15 &&
                    Math.abs(boxCenterY - frameHeight / 2) < frameHeight * 0.15;

                if (isCentered) {
                    setLiveness(prev => ({ ...prev, neutral: true }));
                    setStep("BLINK");
                } else {
                    setHint("Center your face directly at the camera.");
                }
                isProcessing.current = false;
                return;
            }

            // --- FIX 1: SURGICAL BLINK UPDATE ---
            if (liveness.neutral && !liveness.blink) {
                if (isBlinkProcessing.current) {
                  isProcessing.current = false;
                  return;
                }
                isBlinkProcessing.current = true;

                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const avgEAR = (getEAR(leftEye) + getEAR(rightEye)) / 2;

                // Calibration phase
                if (baselineFrames.current < 6) {
                    baselineEAR.current += avgEAR;
                    baselineFrames.current++;
                    setHint(`Calibrating... ${baselineFrames.current}/6`);
                    isBlinkProcessing.current = false;  // RELEASE HERE
                    isProcessing.current = false;
                    return;
                }
                if (baselineFrames.current === 6) {
                    baselineEAR.current = baselineEAR.current / 6;
                    baselineFrames.current = 7;
                }

                const dynamicThreshold = baselineEAR.current * 0.82; 

                if (avgEAR < dynamicThreshold) {
                    blinkFrameCounter.current++;
                    eyeWasClosed.current = true;
                    setHint("Blinking detected...");
                } else {
                    if (eyeWasClosed.current && blinkFrameCounter.current >= 1) {
                        setLiveness(prev => ({ ...prev, blink: true }));
                        setStep("LOOK_LEFT");
                    } else {
                        blinkFrameCounter.current = 0;
                        eyeWasClosed.current = false;
                        // FIX 4: DEBUG HINT
                        setHint(`Blink naturally... (EAR: ${avgEAR.toFixed(3)} / T: ${dynamicThreshold.toFixed(3)})`);
                    }
                }

                isBlinkProcessing.current = false; // RELEASE AT END
                isProcessing.current = false;
                return;
            }

            // STEP 3 — TURN LEFT
            if (liveness.blink && !liveness.left) {
                const jawPoints = landmarks.getJawOutline();
                const nosePoints = landmarks.getNose();
                const noseTip = nosePoints[6]; 
                const jawMid = jawPoints[8];
                
                if (noseTip.x - jawMid.x > 12) {
                    setLiveness(prev => ({ ...prev, left: true }));
                    setStep("LOOK_RIGHT");
                } else {
                    setHint("Turn your head slightly LEFT...");
                }
                isProcessing.current = false;
                return;
            }

            // STEP 4 — TURN RIGHT
            if (liveness.left && !liveness.right) {
                const jawPoints = landmarks.getJawOutline();
                const nosePoints = landmarks.getNose();
                const noseTip = nosePoints[6];
                const jawMid = jawPoints[8];

                if (jawMid.x - noseTip.x > 12) {
                    setLiveness(prev => ({ ...prev, right: true }));
                    setHint("Identity verified! Processing...");
                    setStep("PROCESSING");

                    // EXTRACTION: AT THE FINAL STEP (LOOK_RIGHT)
                    try {
                        const fullDetections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })).withFaceLandmarks().withFaceDescriptor();
                        
                        if (!fullDetections) {
                           toast.error("Extraction failed. Resetting.");
                           resetVerification();
                           return;
                        }

                        const descriptor = Array.from(fullDetections.descriptor);
                        const duplicateCheck = await checkDuplicateFace(descriptor);
                        
                        if (duplicateCheck.success && duplicateCheck.match) {
                           toast.error(`DUPLICATE DETECTED: Matches ${duplicateCheck.match.name}.`, { duration: 6000 });
                           resetVerification();
                           onClose(); // Kill the modal
                           return;
                        }

                        toast.success("Ready!");
                        setStep("COMPLETED");
                        onVerified(descriptor);
                    } catch (e) {
                        toast.error("Cap error.");
                        resetVerification();
                    }
                } else {
                    setHint("Turn your head slightly RIGHT...");
                }
                isProcessing.current = false;
                return;
            }
        } catch (err) {
            console.error("Liveness system fail:", err);
            isProcessing.current = false;
        }
    }, [step, modelsLoaded, liveness, onVerified, resetVerification, onClose]);

    const handleVerificationRef = useRef(handleVerification);
    useEffect(() => {
        handleVerificationRef.current = handleVerification;
    }, [handleVerification]);

    const handleWebcamError = useCallback((err: string | DOMException) => {
        console.error("Webcam error:", err);
        setHint("Camera error. Please check permissions.");
    }, []);

    useEffect(() => {
        if (!isOpen || !modelsLoaded || 
            ["COMPLETED", "INITIALIZING", "PROCESSING"].includes(step) || 
            showGuide) return;
        
        const intervalSpeed = step === "BLINK" ? 40 : 150;
        const interval = setInterval(() => {
            handleVerificationRef.current();  // always calls latest version
        }, intervalSpeed);
        
        return () => clearInterval(interval);
    }, [isOpen, modelsLoaded, step, showGuide]); 

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
                        <CheckItem label="Eye Blink" active={liveness.blink} />
                        <CheckItem label="Left Check" active={liveness.left} />
                        <CheckItem label="Right Check" active={liveness.right} />
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
