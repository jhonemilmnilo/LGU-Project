#!/usr/bin/env node
// Simple simulator for PayMongo webhook handler logic (no DB calls)
// Usage: node scripts/simulate-paymongo-webhook.js source|payment [transactionId]

function mapPaymentStatusToPrisma(status) {
  if (!status) return "PENDING";
  const s = String(status).toLowerCase();
  if (s.includes("paid") || s.includes("succeed") || s.includes("success") || s.includes("captur")) return "PAID";
  if (s.includes("fail") || s.includes("declin") || s.includes("error")) return "FAILED";
  return "PENDING";
}

function extractTransactionId(obj) {
  if (!obj) return undefined;
  if (obj.transactionId) return obj.transactionId;
  if (obj.transactionid) return obj.transactionid;
  if (obj.reference) return obj.reference;
  if (obj.metadata && typeof obj.metadata === 'object') {
    return obj.metadata.transactionId || obj.metadata.transactionid || obj.metadata.reference;
  }
  if (obj.attributes && obj.attributes.metadata) {
    return obj.attributes.metadata.transactionId || obj.attributes.metadata.transactionid;
  }
  return undefined;
}

const args = process.argv.slice(2);
const type = args[0] || 'source';
const txId = args[1] || 'txn_sim_123';

if (!['source', 'payment'].includes(type)) {
  console.error('Usage: node scripts/simulate-paymongo-webhook.js source|payment [transactionId]');
  process.exit(1);
}

if (type === 'source') {
  const payload = {
    data: {
      id: 'src_test_1',
      type: 'source',
      attributes: {
        status: 'chargeable',
        amount: 10000,
        metadata: { transactionId: txId }
      }
    }
  };

  console.log('Simulating source.chargeable payload:');
  console.log(JSON.stringify(payload, null, 2));

  const resource = payload.data;
  const attrs = resource.attributes || {};
  const status = attrs.status;
  if (status !== 'chargeable') {
    console.log('Source not chargeable; nothing to do.');
    process.exit(0);
  }

  const metadata = attrs.metadata || {};
  const transactionId = extractTransactionId(metadata);

  if (!transactionId) {
    console.warn('No transactionId found in metadata; cannot proceed to create payment.');
    process.exit(0);
  }

  const amountCents = attrs.amount || 0;
  console.log('Resolved transactionId =', transactionId);
  console.log('Amount (cents) =', amountCents);

  // Simulate creating payment via PayMongo server-side
  const simulatedPay = {
    data: {
      id: 'pay_sim_1',
      attributes: {
        amount: amountCents,
        currency: 'PHP',
        status: 'paid'
      }
    }
  };

  const pay = simulatedPay.data;
  const payAttrs = pay.attributes || {};
  const paymentStatus = mapPaymentStatusToPrisma(payAttrs.status);

  console.log('\nSimulated PayMongo create payment response:');
  console.log(JSON.stringify(simulatedPay, null, 2));
  console.log('\nMapped payment status ->', paymentStatus);

  console.log('\nDB upsert (would):');
  console.log({
    transactionId,
    payment: {
      amount: (Number(payAttrs.amount || amountCents) || 0) / 100,
      method: 'E_PAYMENT',
      status: paymentStatus,
      reference: pay.id,
      meta: simulatedPay,
    }
  });

  const txUpdate = { additionalData: { paymongo: { sourceId: resource.id, paymentId: pay.id, lastPayment: simulatedPay } }, updatedAt: new Date() };
  if (paymentStatus === 'PAID') {
    txUpdate.status = 'PAID';
    txUpdate.paymentReference = pay.id;
  }

  console.log('\nTransaction update (would):');
  console.log(txUpdate);
  process.exit(0);
}

if (type === 'payment') {
  const payload = {
    data: {
      id: 'pay_test_1',
      type: 'payment',
      attributes: {
        status: 'paid',
        amount: 10000,
        source: { id: 'src_test_1', metadata: { transactionId: txId } }
      }
    }
  };

  console.log('Simulating payment event payload:');
  console.log(JSON.stringify(payload, null, 2));

  const resource = payload.data;
  const attrs = resource.attributes || {};
  const status = mapPaymentStatusToPrisma(attrs.status);

  let transactionId = extractTransactionId(attrs.source) || extractTransactionId(attrs.billing) || undefined;

  console.log('\nExtracted transactionId =', transactionId);
  console.log('Mapped payment status ->', status);

  console.log('\nDB upsert (would):');
  console.log({
    transactionId,
    payment: {
      amount: (Number(attrs.amount || 0) || 0) / 100,
      method: 'E_PAYMENT',
      status: status,
      reference: resource.id,
      meta: resource,
    }
  });

  const txUpdate = { additionalData: { paymongo: { paymentId: resource.id, lastPayment: resource } }, updatedAt: new Date() };
  if (status === 'PAID') {
    txUpdate.status = 'PAID';
    txUpdate.paymentReference = resource.id;
  }

  console.log('\nTransaction update (would):');
  console.log(txUpdate);
  process.exit(0);
}
