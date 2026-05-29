"use client";

import React from "react";
import Image from "next/image";
import { isValidUrl } from "@/utils/image";

interface PrintWaybillProps {
    transaction: any;
    resident: any;
    deliveryAddr: any;
    fiscal: any;
    branding: {
        word1: string;
        word2: string;
        logo: string;
    };
    themeColor: string;
}

export default function PrintWaybill({
    transaction,
    resident,
    deliveryAddr,
    fiscal,
    branding,
    themeColor
}: PrintWaybillProps) {
    return (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 m-0 overflow-visible text-black font-sans leading-tight">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: 100mm 150mm; margin: 0; }
                    body { visibility: hidden; }
                    .print-only { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; height: 100%; padding: 5mm; }
                }
            `}} />

            <div className="print-only flex flex-col h-full border-[3px] border-black rounded-sm">
                {/* Header: Dynamic Branding */}
                <div className="border-b-[3px] border-black p-3 flex items-center justify-between bg-black text-white">
                    <div className="flex items-center gap-3">
                        {branding.logo ? (
                            <Image src={isValidUrl(branding.logo) ? branding.logo : "/placeholder.png"} alt="Logo" width={40} height={40} className="object-contain" unoptimized />
                        ) : (
                            <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center font-black text-[10px]">A</div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black italic tracking-tighter uppercase leading-none text-white">
                                {branding.word1} <span style={{ color: themeColor }} className="italic tracking-normal">{branding.word2}</span>
                            </span>
                            <span className="text-[6px] font-bold uppercase tracking-widest opacity-80 italic">Official Municipal Logistics</span>
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase italic tracking-widest border border-white px-2 py-1">Waybill</div>
                </div>

                {/* QR Code Segment */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 border-b-[2px] border-black border-dashed">
                    <div className="relative w-40 h-40 bg-white p-2 border border-slate-100 shadow-sm flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${transaction.id}`}
                            alt="Tracking QR"
                            className="w-full h-full p-2"
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[12px] font-black italic tracking-[0.3em] font-mono leading-none">{transaction.id.slice(-12).toUpperCase()}</span>
                        <span className="text-[6px] font-bold uppercase text-slate-500 mt-1">Transaction Tracking Reference</span>
                    </div>
                </div>

                {/* Logistics Data Segment */}
                <div className="p-4 grid grid-cols-2 gap-4 border-b-[3px] border-black">
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-[6px] font-bold uppercase text-slate-500">Recipient Name</span>
                            <span className="text-[11px] font-black uppercase italic leading-tight">{resident.firstName} {resident.lastName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[6px] font-bold uppercase text-slate-500">Contact Number</span>
                            <span className="text-[10px] font-bold italic tracking-widest">
                                {deliveryAddr?.contactNumber || resident.contactNumber || "--"}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[6px] font-bold uppercase text-slate-500">Delivery Address</span>
                        <span className="text-[9px] font-bold uppercase leading-tight italic">
                            {deliveryAddr ? (
                                <>
                                    {deliveryAddr.houseNumber && `${deliveryAddr.houseNumber}, `}
                                    {deliveryAddr.street && `${deliveryAddr.street} `}
                                    {deliveryAddr.sitio && `Sitio ${deliveryAddr.sitio}, `}
                                    {deliveryAddr.purok && `Purok ${deliveryAddr.purok}, `}
                                    <br />
                                    Barangay {deliveryAddr.barangay},<br />
                                    {deliveryAddr.municipality}, {deliveryAddr.province}
                                </>
                            ) : (
                                <>
                                    {resident.houseNumber && `${resident.houseNumber}, `}{resident.street}<br />
                                    Barangay {resident.barangay},<br />
                                    {resident.municipality}, {resident.province}
                                </>
                            )}
                        </span>
                        {(deliveryAddr?.landmark || transaction.deliveryLandmark) && (
                            <div className="mt-1 p-1 bg-black/5 rounded-sm">
                                <span className="text-[5px] font-bold uppercase text-slate-400 block leading-none">Landmark</span>
                                <span className="text-[7px] font-black italic uppercase leading-none">
                                    {deliveryAddr?.landmark || transaction.deliveryLandmark}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service & Payment Metadata */}
                <div className="p-3 bg-slate-50 grid grid-cols-3 gap-2 border-b-[3px] border-black">
                    <div className="flex flex-col">
                        <span className="text-[5px] font-bold uppercase">Payment Type</span>
                        <span className="text-[7px] font-black uppercase italic tracking-tighter">{transaction.paymentType?.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[5px] font-bold uppercase">Service</span>
                        <span className="text-[7px] font-black uppercase italic tracking-tighter">{transaction.type?.name}</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span className="text-[5px] font-bold uppercase">Amount Due</span>
                        <span className="text-[9px] font-black italic tracking-tighter text-primary">₱{(fiscal?.totalAmount || transaction.totalAmount || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* Instructions & Footnote */}
                <div className="flex-1 p-3 flex flex-col justify-end italic">
                    <div className="border-t-[2px] border-black border-dotted pt-2">
                        <p className="text-[7px] font-bold uppercase leading-relaxed text-slate-600">
                            * Official document for municipal logistics use only. Handle with extreme care.
                            If document is damaged, please report immediately to the Treasury Office.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
