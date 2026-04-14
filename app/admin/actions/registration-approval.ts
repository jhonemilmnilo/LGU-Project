"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

// Direct Server-Side Email Sender using Nodemailer (100% FREE via Gmail)
async function sendEmail({ type, to, name, remarks }: { type: "APPROVED" | "REJECTED", to: string, name: string, remarks?: string | null }) {
    const emailUser = process.env.EMAIL_USER || "lgu.mapandan@gmail.com";
    const emailPass = process.env.EMAIL_PASS; // This must be a 16-character App Password, NOT the regular password

    if (!emailPass) {
        console.warn("Skipping email: EMAIL_PASS is not configured in .env");
        return { success: false, error: "EMAIL_PASS not configured." };
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    const municipalityName = "Mapandan";
    const isApproved = type === "APPROVED";
    const subject = isApproved
        ? `Your Registration Has Been Approved - LGU ${municipalityName}`
        : `Update on Your Registration Request - LGU ${municipalityName}`;

    const htmlBody = isApproved
        ? `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: #22c55e; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">✓</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase;">Registration Approved</h1>
                </div>
                <p style="color: #475569; font-size: 15px;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px;">We are pleased to inform you that your resident registration with the <strong>${municipalityName}</strong> Local Government Unit has been <strong style="color: #22c55e;">officially approved</strong>.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0;">You can now access all resident services through the portal.</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message. Please do not reply.</p>
            </div>
        </div>`
        : `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: #ef4444; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">✗</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase;">Registration Update</h1>
                </div>
                <p style="color: #475569; font-size: 15px;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px;">After careful review, your resident registration request could not be approved at this time.</p>
                ${remarks ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p style="color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase; margin: 0 0 8px 0;">Reason for Rejection</p>
                    <p style="color: #7f1d1d; font-size: 14px; margin: 0;">${remarks}</p>
                </div>` : ""}
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated message. Please do not reply.</p>
            </div>
        </div>`;

    try {
        const info = await transporter.sendMail({
            from: `"LGU ${municipalityName}" <${emailUser}>`,
            to,
            subject,
            html: htmlBody,
        });
        
        console.log("Email sent successfully: " + info.messageId);
        return { success: true };
     
    } catch (error: any) {
        console.error("Nodemailer failed:", error);
        return { success: false, error: error.message || "Failed to send email." };
    }
}

export async function approveResident(residentId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    const adminId = (session.user as { id?: string })?.id || "admin";

    try {
        const resident = await prisma.resident.update({
            where: { id: residentId },
            data: {
                registrationStatus: "APPROVED",
                reviewedAt: new Date(),
                reviewedBy: adminId,
                rejectionRemarks: null,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                userId: true,
            }
        });

        // 🔄 Sync with the connected User table
        if (resident.userId) {
            await prisma.user.update({
                where: { id: resident.userId },
                data: {
                    isEmailVerified: true,
                    emailVerified: new Date(),
                }
            });
        }

        // Trigger email notification directly from server
        if (resident.email) {
            const emailResult = await sendEmail({
                type: "APPROVED",
                to: resident.email,
                name: `${resident.firstName} ${resident.lastName}`,
                remarks: null,
            });
            
            if (!emailResult.success) {
                console.warn(`Approval recorded, but email failed to send: ${emailResult.error}`);
                // You can choose to throw or return partial success here
            }
        }

        revalidatePath("/admin/residents");
        return { success: true };
    } catch (error) {
        console.error("Approve resident error:", error);
        return { success: false, error: "Failed to approve resident." };
    }
}

export async function rejectResident(residentId: string, remarks: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    if (!remarks || remarks.trim().length < 10) {
        return { success: false, error: "Rejection remarks must be at least 10 characters." };
    }

    const adminId = (session.user as { id?: string })?.id || "admin";

    try {
        const resident = await prisma.resident.update({
            where: { id: residentId },
            data: {
                registrationStatus: "REJECTED",
                reviewedAt: new Date(),
                reviewedBy: adminId,
                rejectionRemarks: remarks.trim(),
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                userId: true,
            }
        });

        // 🔄 Sync with the connected User table
        if (resident.userId) {
            await prisma.user.update({
                where: { id: resident.userId },
                data: {
                    isEmailVerified: false,
                    emailVerified: null,
                }
            });
        }

        // Trigger rejection email directly from server
        if (resident.email) {
            const emailResult = await sendEmail({
                type: "REJECTED",
                to: resident.email,
                name: `${resident.firstName} ${resident.lastName}`,
                remarks: remarks.trim(),
            });

            if (!emailResult.success) {
                console.warn(`Rejection recorded, but email failed to send: ${emailResult.error}`);
            }
        }

        revalidatePath("/admin/residents");
        return { success: true };
    } catch (error) {
        console.error("Reject resident error:", error);
        return { success: false, error: "Failed to reject resident." };
    }
}

export async function getPendingResidentsCount() {
    try {
        const count = await prisma.resident.count({
            where: { registrationStatus: "PENDING" }
        });
        return count;
    } catch {
        return 0;
    }
}

export async function getResidentForReview(residentId: string) {
    try {
        const resident = await prisma.resident.findUnique({
            where: { id: residentId },
            include: {
                category: true,
            }
        });
        return { success: true, resident };
    } catch (error) {
        console.error("Get resident error:", error);
        return { success: false, error: "Failed to fetch resident." };
    }
}
