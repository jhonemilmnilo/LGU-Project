import nodemailer from "nodemailer";

interface SendEmailProps {
    type: "APPROVED" | "REJECTED" | "FOR_CLAIM" | "FOR_PAYMENT" | "RELEASED" | "DEACTIVATED" | "IN_ROUTE";
    to: string;
    name: string;
    remarks?: string | null;
    transactionId?: string;
    amount?: number;
}

/**
 * Centered Email Utility for LGU Mapandan
 * Reuses existing Gmail SMTP configuration from .env
 */
export async function sendEmail({ type, to, name, remarks, transactionId, amount }: SendEmailProps) {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass || !emailUser) {
        console.warn("Skipping email: EMAIL_USER or EMAIL_PASS not configured in .env");
        return { success: false, error: "Email credentials not configured." };
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    const municipalityName = "Mapandan"; // Updated to Mapandan as per project context
    let subject = "";
    let htmlBody = "";

    // Design Tokens
    const primaryGreen = "#22c55e";
    const primaryRed = "#ef4444";
    const primaryBlue = "#3b82f6";

    if (type === "APPROVED") {
        subject = `Your Registration Has Been Approved - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryGreen}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">✓</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Registration Approved</h1>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">We are pleased to inform you that your resident registration with the <strong>${municipalityName}</strong> Local Government Unit has been <strong style="color: ${primaryGreen};">officially approved</strong>.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: center;">
                    <p style="color: #166534; font-size: 14px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Access Granted</p>
                    <p style="color: #166534; font-size: 13px; margin: 8px 0 0 0; opacity: 0.8;">You can now access all digital resident services through the portal.</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Mapandan Resident Services Portal • Automated Notification</p>
            </div>
        </div>`;
    } else if (type === "REJECTED") {
        subject = `Update on Your Registration Request - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryRed}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">✗</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Registration Update</h1>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">After careful review, your resident registration request could not be approved at this time.</p>
                ${remarks ? `
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; margin: 32px 0;">
                    <p style="color: #991b1b; font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em;">Reason for Rejection</p>
                    <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">${remarks}</p>
                </div>` : ""}
                <p style="color: #64748b; font-size: 13px;">Please re-submit your application with the corrected information to proceed.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Mapandan Resident Services Portal • Automated Notification</p>
            </div>
        </div>`;
    } else if (type === "FOR_PAYMENT") {
        subject = `Action Required: Assessment Complete - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryBlue}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">💳</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Payment Ready</h1>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Good news! Your service request has been successfully evaluated by the Municipal Treasury Office. You may now proceed to payment to finalize your application.</p>
                
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: center;">
                    <p style="color: #1e40af; font-size: 12px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em;">Final Assessment</p>
                    <p style="color: #1e40af; font-size: 36px; font-weight: 900; margin: 0; letter-spacing: -0.04em;">₱${amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</p>
                    <p style="color: #3b82f6; font-size: 11px; margin: 8px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">Reference ID: ${transactionId || "N/A"}</p>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 32px;">
                    <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.5;">
                        <strong>Next Step:</strong> Log in to the Resident Portal, navigate to <strong>"My Requests"</strong>, and select your preferred payment and fulfillment method.
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Mapandan Treasury Department • Automated Notification</p>
            </div>
        </div>`;
    } else if (type === "FOR_CLAIM") {
        subject = `Ready for Claiming: Your Cedula is Prepared - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryBlue}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">🎫</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Document Ready for Claiming</h1>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">We are pleased to inform you that your **Community Tax Certificate (Cedula)** has been processed and is now <strong style="color: ${primaryBlue};">READY FOR CLAIMING</strong> at the Municipal Treasury Office.</p>
                
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 24px; margin: 32px 0;">
                    <p style="color: #1e40af; font-size: 12px; font-weight: 800; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.05em;">Claiming Details</p>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr>
                            <td style="color: #64748b; padding: 4px 0;">Location:</td>
                            <td style="color: #1e293b; font-weight: 700; padding: 4px 0;">Municipal Treasury Office, Mapandan</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b; padding: 4px 0;">Schedule:</td>
                            <td style="color: #1e293b; font-weight: 700; padding: 4px 0;">Mon - Fri, 8:00 AM - 5:00 PM</td>
                        </tr>
                        <tr>
                            <td style="color: #64748b; padding: 4px 0;">Reference:</td>
                            <td style="color: #3b82f6; font-weight: 800; font-family: monospace; padding: 4px 0;">${transactionId || "N/A"}</td>
                        </tr>
                    </table>
                </div>

                <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 32px;">
                    <p style="color: #92400e; font-size: 13px; margin: 0;"><strong>Note:</strong> Please bring a valid ID and the exact amount for your payment as computed in the portal.</p>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Mapandan Treasury Department • Automated Notification</p>
            </div>
        </div>`;
    } else if (type === "RELEASED") {
        subject = `Document Released: Your Cedula is Ready - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryGreen}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">📄</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Document Officially Released</h1>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Your <strong>Community Tax Certificate (Cedula)</strong> has been successfully processed and <strong style="color: ${primaryGreen};">OFFICIALLY RELEASED</strong> by the Municipal Treasury Office.</p>
                
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: center;">
                    <p style="color: #166534; font-size: 12px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em;">Digital Record Protocol</p>
                    <p style="color: #166534; font-size: 18px; font-weight: 900; margin: 0; letter-spacing: 0.1em;">REF: ${transactionId || "N/A"}</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Mapandan Treasury Department • Official Release Notice</p>
            </div>
        </div>`;
    } else if (type === "DEACTIVATED") {
        subject = `URGENT: Account Deactivated - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.1); border: 1px solid #fee2e2;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryRed}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">⚠️</span>
                    </div>
                    <h1 style="color: #991b1b; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Account Deactivated</h1>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Our system has detected multiple rejections associated with your service requests. As part of our anti-spam and security protocols, your account has been <strong style="color: ${primaryRed};">AUTOMATICALLY DEACTIVATED</strong>.</p>
                
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; margin: 32px 0;">
                    <p style="color: #991b1b; font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.05em;">Action Required</p>
                    <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">To reactivate your account, please personally visit the <strong>Municipal Treasury Office</strong> for identity verification and account restoration.</p>
                </div>

                <p style="color: #64748b; font-size: 13px;">Please bring a valid Government ID for authentication. Access to all digital services is suspended until further notice.</p>
                
                <hr style="border: none; border-top: 1px solid #fecaca; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Mapandan Security Protocol • Security Alert</p>
            </div>
        </div>`;
    } else if (type === "IN_ROUTE") {
        subject = `🚚 On the Way: Your Document is Out for Delivery! - LGU ${municipalityName}`;
        htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
            <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: ${primaryBlue}; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <span style="color: white; font-size: 32px;">🚚</span>
                    </div>
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em;">Delivery in Progress</h1>
                    <p style="color: #3b82f6; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Your Rider is on the way!</p>
                </div>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Good news! Your requested document (Ref: <strong style="font-family: monospace;">${transactionId || "N/A"}</strong>) has been picked up by our municipal logistics fleet and is now <strong style="color: ${primaryBlue};">ON THE WAY</strong> to your registered address.</p>
                
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; padding: 24px; margin: 32px 0;">
                    <p style="color: #0369a1; font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 0 0 12px 0; letter-spacing: 0.05em;">Payment Information</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #0c4a6e; font-size: 14px; font-weight: 600;">Total Amount Due:</span>
                        <span style="color: #0369a1; font-size: 24px; font-weight: 900;">₱${amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}</span>
                    </div>
                    <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px; margin-top: 16px;">
                        <p style="color: #92400e; font-size: 12px; margin: 0; font-weight: 700; text-align: center;">
                            💡 REMINDER: Please prepare the EXACT AMOUNT for a faster and contactless-ready transaction.
                        </p>
                    </div>
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 32px;">
                    <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.5;">
                        <strong>Driver Note:</strong> Our rider will contact you via phone once they arrive at your location or if they need assistance finding your landmark.
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center; text-transform: uppercase; letter-spacing: 0.1em;">Agno Municipal Logistics • Automated Notification</p>
            </div>
        </div>`;
    }

    try {
        const info = await transporter.sendMail({
            from: `"LGU ${municipalityName}" <${emailUser}>`,
            to,
            subject,
            html: htmlBody,
        });
        
        console.log(`Email (${type}) sent successfully to ${to}: ${info.messageId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Nodemailer failed:", error);
        return { success: false, error: error.message || "Failed to send email." };
    }
}
