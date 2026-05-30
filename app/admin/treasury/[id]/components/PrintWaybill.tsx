"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

/**
 * PrintWaybill — Renders waybill DIRECTLY under <body> via React Portal.
 * 
 * WHY PORTAL?
 * -----------
 * The waybill must be a DIRECT child of <body> so we can use the CSS rule:
 *     body > * { display: none !important; }
 * to hide EVERYTHING (including #__next, modals, toasts, sidebar, etc.)
 * and then show ONLY the waybill with an ID selector override.
 * 
 * WHY NOT visibility:hidden?
 * --------------------------
 * - `visibility: hidden` keeps elements in the layout (they still take up space)
 * - Tailwind utility classes can override visibility due to specificity wars
 * - Children can override parent's visibility, causing leaks
 * 
 * WHY NOT display:none inside a nested component?
 * ------------------------------------------------
 * - If the waybill is nested inside #__next > ... > ... , then
 *   `body > * { display: none }` hides #__next which cascades to hide
 *   the waybill too. Portal avoids this by rendering as a sibling of #__next.
 */
export default function PrintWaybill({
    transaction,
    resident,
    deliveryAddr,
    fiscal,
    branding,
    themeColor
}: PrintWaybillProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // SSR guard: document.body is not available during server-side rendering
    if (!mounted) return null;

    return createPortal(
        <>
            {/* 
                GLOBAL PRINT STYLESHEET
                -----------------------
                This <style> is a direct child of <body> (via portal).
                It is ALWAYS processed by the browser regardless of display state.
                
                Strategy:
                1. body > * { display: none } — nukes EVERYTHING (sidebar, #__next, overlays)
                2. #waybill-print-portal { display: block } — resurrects ONLY the waybill
                
                ID selector (1,0,0) always beats child combinator + universal (0,0,2),
                even with both using !important. Bulletproof specificity.
            */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { 
                        size: 100mm 150mm; 
                        margin: 0; 
                    }
                    body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: white !important;
                    }
                    body > * { 
                        display: none !important; 
                    }
                    #waybill-print-portal {
                        display: block !important;
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        visibility: visible !important;
                        overflow: visible !important;
                        padding: 5mm !important;
                        background: white !important;
                        z-index: 99999 !important;
                        color: black !important;
                    }
                    #waybill-print-portal * {
                        visibility: visible !important;
                        color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}} />

            {/* 
                WAYBILL CONTAINER
                -----------------
                Hidden off-screen on normal display using inline styles (not Tailwind)
                to avoid any class specificity conflicts.
                
                We use position:fixed + left:-9999px instead of display:none so that:
                - Images (QR code, logo) still LOAD in the background
                - The browser can measure/layout the content for print
                - No lazy-loading issues with Next.js Image or native img
            */}
            <div
                id="waybill-print-portal"
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    width: '100mm',
                    height: '150mm',
                    visibility: 'hidden',
                    overflow: 'hidden',
                    zIndex: -1,
                    pointerEvents: 'none'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        border: '3px solid black',
                        borderRadius: '2px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: 1.2,
                        color: 'black',
                        background: 'white'
                    }}
                >
                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* HEADER: Dynamic Branding Bar                          */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div style={{ borderBottom: '3px solid black', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'black', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {branding.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={isValidUrl(branding.logo) ? branding.logo : "/placeholder.png"}
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    style={{ objectFit: 'contain' }}
                                />
                            ) : (
                                <div style={{ width: 32, height: 32, border: '2px solid white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '10px', color: 'white' }}>
                                    {branding.word1?.charAt(0) || 'A'}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 1, color: 'white' }}>
                                    {branding.word1}{' '}
                                    <span style={{ color: themeColor, fontStyle: 'italic', letterSpacing: 'normal' }}>{branding.word2}</span>
                                </span>
                                <span style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, fontStyle: 'italic', color: 'white' }}>
                                    Official Municipal Logistics
                                </span>
                            </div>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '0.1em', border: '1px solid white', padding: '4px 8px', color: 'white' }}>
                            Waybill
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* QR CODE SEGMENT                                       */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: '16px', borderBottom: '2px dashed black' }}>
                        <div style={{ width: 160, height: 160, background: 'white', padding: 8, border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${transaction.id}`}
                                alt="Tracking QR"
                                style={{ width: '100%', height: '100%', padding: 8 }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '0.3em', fontFamily: 'monospace', lineHeight: 1, color: 'black' }}>
                                {transaction.id.slice(-12).toUpperCase()}
                            </span>
                            <span style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginTop: 4 }}>
                                Transaction Tracking Reference
                            </span>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* LOGISTICS DATA SEGMENT                                */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '3px solid black' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Recipient Name</span>
                                <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.2, color: 'black' }}>
                                    {resident.firstName} {resident.lastName}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Contact Number</span>
                                <span style={{ fontSize: '10px', fontWeight: 700, fontStyle: 'italic', letterSpacing: '0.1em', color: 'black' }}>
                                    {deliveryAddr?.contactNumber || resident.contactNumber || "--"}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '6px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Delivery Address</span>
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.3, fontStyle: 'italic', color: 'black' }}>
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
                                <div style={{ marginTop: 4, padding: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
                                    <span style={{ fontSize: '5px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', lineHeight: 1 }}>Landmark</span>
                                    <span style={{ fontSize: '7px', fontWeight: 900, fontStyle: 'italic', textTransform: 'uppercase', lineHeight: 1, color: 'black' }}>
                                        {deliveryAddr?.landmark || transaction.deliveryLandmark}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* SERVICE & PAYMENT METADATA                            */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div style={{ padding: '12px', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderBottom: '3px solid black' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '5px', fontWeight: 700, textTransform: 'uppercase', color: 'black' }}>Payment Type</span>
                            <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'black' }}>
                                {transaction.paymentType?.replace(/_/g, " ")}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '5px', fontWeight: 700, textTransform: 'uppercase', color: 'black' }}>Service</span>
                            <span style={{ fontSize: '7px', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'black' }}>
                                {transaction.type?.name}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                            <span style={{ fontSize: '5px', fontWeight: 700, textTransform: 'uppercase', color: 'black' }}>Amount Due</span>
                            <span style={{ fontSize: '9px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-0.05em', color: themeColor }}>
                                ₱{(fiscal?.totalAmount || transaction.totalAmount || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════════════════ */}
                    {/* INSTRUCTIONS & FOOTNOTE                               */}
                    {/* ═══════════════════════════════════════════════════════ */}
                    <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontStyle: 'italic' }}>
                        <div style={{ borderTop: '2px dotted black', paddingTop: 8 }}>
                            <p style={{ fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.6, color: '#475569' }}>
                                * Official document for municipal logistics use only. Handle with extreme care.
                                If document is damaged, please report immediately to the Treasury Office.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
