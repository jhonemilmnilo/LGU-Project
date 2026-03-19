"use client";

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { RotateCcw, Check, X, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CameraCaptureProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageSrc: string) => void;
    title?: string;
}

export function CameraCapture({ isOpen, onClose, onCapture, title = "Capture Photo" }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setCapturedImage(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setCapturedImage(null);
    };

    const confirmCapture = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
            setCapturedImage(null);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none">
                <DialogHeader className="p-4 bg-white dark:bg-slate-900 absolute top-0 w-full z-10 opacity-90">
                    <DialogTitle className="text-sm font-bold uppercase tracking-tight flex items-center justify-between">
                        {title}
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <X className="w-4 h-4" />
                        </button>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Camera interface to capture resident photos.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative aspect-video bg-black flex items-center justify-center mt-12">
                    {capturedImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode: facingMode
                            }}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 flex justify-center items-center gap-4">
                    {!capturedImage ? (
                        <>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={toggleCamera}
                                className="rounded-full h-12 w-12"
                            >
                                <SwitchCamera className="w-5 h-5" />
                            </Button>
                            
                            <button 
                                onClick={capture}
                                className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl hover:scale-105 active:scale-95 transition-all"
                            >
                                <div className="h-12 w-12 rounded-full border-2 border-white/50" />
                            </button>

                            <div className="w-12" /> {/* Spacer */}
                        </>
                    ) : (
                        <div className="flex gap-4 w-full">
                            <Button 
                                variant="outline" 
                                onClick={retake}
                                className="flex-1 h-12 rounded-xl font-bold uppercase text-xs tracking-widest"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" /> Retake
                            </Button>
                            <Button 
                                onClick={confirmCapture}
                                className="flex-1 h-12 rounded-xl font-bold uppercase text-xs tracking-widest bg-green-600 hover:bg-green-700"
                            >
                                <Check className="w-4 h-4 mr-2" /> Use Photo
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
