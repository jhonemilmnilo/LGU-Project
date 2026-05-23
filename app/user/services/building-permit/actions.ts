"use server";

import prisma from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export async function submitBuildingPermit(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    // Get Building Permit Transaction Type
    const type = await prisma.transactionType.findFirst({
      where: { code: "BUILDING_PERMIT" }
    });
    
    if (!type) {
      return { success: false, error: "Building Permit transaction type not found in database." };
    }

    // Check if there is already an active transaction for this user
    const activeTransaction = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        typeId: type.id,
        isCancelled: false,
        status: {
          notIn: ["RELEASED", "REJECTED", "DELIVERED"]
        }
      }
    });

    if (activeTransaction) {
      return { success: false, error: "You already have an active building permit application in progress." };
    }

    // Extract basic form data
    const descriptionOfWork = formData.get("descriptionOfWork") as string;
    const occupancyUse = formData.get("occupancyUse") as string;
    const estimatedCost = formData.get("estimatedCost") as string;
    const applicantName = formData.get("applicantName") as string || session.user.name || "Unknown";

    // Prepare JSON for additional Data
    const additionalData: any = {
      descriptionOfWork,
      occupancyUse,
      estimatedCost,
      documents: {}
    };

    // Helper to upload and store URL
    const processFile = async (key: string, folder: string) => {
      const file = formData.get(key) as File;
      if (file && file.size > 0) {
        const timestamp = Date.now();
        const path = `building-permits/${userId}/${folder}/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const url = await uploadFile(file, path);
        if (url) {
          additionalData.documents[key] = url;
        }
      }
    };

    // Upload ID and TCT if they exist
    await processFile("newIdFile", "ids");
    await processFile("tctFile", "tct");

    // Loop through requirements and permits
    // We expect keys like req_0, req_1, permit_0, etc.
    for (const [key, value] of Array.from(formData.entries())) {
      if ((key.startsWith("req_") || key.startsWith("permit_")) && value instanceof File && value.size > 0) {
         await processFile(key, key.startsWith("req_") ? "requirements" : "permits");
      }
    }

    // Get current resident data for snapshot
    const resident = await prisma.resident.findFirst({
      where: { userId: userId }
    });

    // Create the transaction (FOR_REQUESTING)
    // We do NOT create the BuildingPermit record yet. That happens upon RELEASED.
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        typeId: type.id,
        status: "FOR_REQUESTING",
        residentSnapshot: resident ? JSON.stringify(resident) : "{}",
        additionalData: additionalData,
        totalAmount: type.baseFee || 1000,
      }
    });

    revalidatePath("/user/transactions");
    return { success: true, transactionId: transaction.id };

  } catch (error) {
    console.error("Building Permit Submission Error:", error);
    return { success: false, error: "Failed to submit building permit application." };
  }
}

export async function saveTransactionSignature(transactionId: string, signatureBase64: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return { success: false, error: "Transaction not found or unauthorized" };
    }

    const additionalData = transaction.additionalData as any || {};
    additionalData.signature = signatureBase64;

    await prisma.transaction.update({
      where: { id: transactionId },
      data: { additionalData }
    });

    revalidatePath("/user/transactions");
    return { success: true };

  } catch (error) {
    console.error("Save signature error:", error);
    return { success: false, error: "Failed to save signature." };
  }
}

export async function getExistingBuildingPermits() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, data: [] };
    }

    const type = await prisma.transactionType.findFirst({
      where: { code: "BUILDING_PERMIT" }
    });

    if (!type) {
      return { success: false, data: [] };
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        typeId: type.id
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching existing permits:", error);
    return { success: false, data: [] };
  }
}
