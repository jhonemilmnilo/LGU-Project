import PaymentSuccessClient from "@/components/PaymentSuccessClient";
import { checkPaymongoPaymentStatus } from "@/app/admin/transactions/actions";
import prisma from "@/lib/db/prisma";

type SearchParams = { [key: string]: string | string[] | undefined };

function extractIdFromUrl(url: string) {
  try {
    const m = url.match(/\/user\/services\/requests\/([^\/?#]+)/);
    if (m) return m[1];
  } catch {
    // ignore
  }
  return null;
}

export default async function PaymentSuccessPage({ searchParams }: { searchParams?: SearchParams }) {
  // Try to find a transaction id from common query parameters or embedded URLs
  const params = searchParams || {};
  const candidates = [
    "transactionId",
    "transaction_id",
    "transaction",
    "id",
    "tx",
    "ref",
    "reference",
    "referenceId",
    "checkoutSessionId",
    "checkout_session",
    "session_id",
    "paymentId",
    "payment_id",
    "payment",
    "redirect",
  ];

  let transactionId: string | null = null;

  for (const k of candidates) {
    const raw = params[k] as string | undefined;
    if (!raw) continue;
    // if value looks like a URL path containing request id
    const fromUrl = extractIdFromUrl(raw);
    if (fromUrl) {
      transactionId = fromUrl;
      break;
    }
    // otherwise take the value directly
    transactionId = raw;
    break;
  }

  // If the parsed ID is actually a PayMongo Reference ID (starts with cs_ or pay_), 
  // lookup the corresponding database Transaction UUID instead!
  if (transactionId && (transactionId.startsWith("cs_") || transactionId.startsWith("pay_"))) {
    try {
      const dbTx = await prisma.transaction.findFirst({
        where: {
          OR: [
            { paymentReference: transactionId },
            {
              additionalData: {
                path: ["paymongo", "checkoutSessionId"],
                equals: transactionId
              }
            },
            {
              additionalData: {
                path: ["paymongo", "paymentId"],
                equals: transactionId
              }
            }
          ]
        },
        select: { id: true }
      });

      if (dbTx) {
        transactionId = dbTx.id;
      } else {
        // Fallback: check the Payment table references
        const dbPayment = await prisma.payment.findFirst({
          where: { reference: transactionId },
          select: { transactionId: true }
        });
        if (dbPayment) {
          transactionId = dbPayment.transactionId;
        } else {
          // If still not found, set to null to avoid redirecting to invalid page
          transactionId = null;
        }
      }
    } catch (err) {
      console.error("[PaymentSuccessPage] Error looking up transaction by PayMongo reference:", err);
    }
  }

  let checkResult: any = null;
  if (transactionId) {
    try {
      checkResult = await checkPaymongoPaymentStatus(transactionId);
    } catch (err) {
      console.error("Payment success status check failed:", err);
      checkResult = { success: false, error: "check failed" };
    }
  }

  const redirectUrl = transactionId ? `/user/services/requests/${transactionId}` : "/user/services/requests";

  return (
    <PaymentSuccessClient redirectUrl={redirectUrl} status={checkResult?.status} />
  );
}
