/**
 * Cedula (Community Tax Certificate) Calculation Logic
 * Based on the LGU Online Services Portal Documentation
 */

export type CedulaType = "INDIVIDUAL" | "JURIDICAL";

export interface CedulaCalculationParams {
    type: CedulaType;
    income: number;
    propertyValue: number;
    isPastDeadline?: boolean; // Default check: On or after March 1
    fulfillmentType?: "PICK_UP" | "DELIVERY";
    deliveryFee?: number;
}

export interface CedulaResult {
    basicTax: number;
    additionalTax: number;
    penalty: number;
    deliveryFee: number;
    totalAmount: number;
}

/**
 * Checks if the current date is on or after March 1st of the current year.
 */
export function isPastCedulaDeadline(): boolean {
    const now = new Date();
    const march1st = new Date(now.getFullYear(), 2, 1); // Month is 0-indexed (2 = March)
    return now >= march1st;
}

/**
 * Computes the Community Tax Certificate (Cedula) amount.
 */
export function calculateCedula(params: CedulaCalculationParams): CedulaResult {
    const { 
        type, 
        income, 
        propertyValue, 
        isPastDeadline = isPastCedulaDeadline(),
        fulfillmentType = "PICK_UP",
        deliveryFee = 0
    } = params;

    let basicTax = 0;
    let additionalTax = 0;
    const totalBasis = income + propertyValue;

    if (type === "INDIVIDUAL") {
        // Individual Logic
        basicTax = 5.00;
        // ₱1.00 for every ₱1,000 of income/property
        additionalTax = Math.floor(totalBasis / 1000) * 1.00;
        // Maximum Additional Tax: ₱5,000
        if (additionalTax > 5000) additionalTax = 5000;
    } else {
        // Juridical Logic
        basicTax = 500.00;
        // ₱2.00 for every ₱5,000 of income/property
        additionalTax = Math.floor(totalBasis / 5000) * 2.00;
        // Maximum Additional Tax: ₱10,000
        if (additionalTax > 10000) additionalTax = 10000;
    }

    // Penalty Rule: 24% interest per annum if obtained after March 1
    const penalty = isPastDeadline ? (basicTax + additionalTax) * 0.24 : 0;

    // Delivery Fee
    const finalDeliveryFee = fulfillmentType === "DELIVERY" ? deliveryFee : 0;

    return {
        basicTax,
        additionalTax,
        penalty,
        deliveryFee: finalDeliveryFee,
        totalAmount: basicTax + additionalTax + penalty + finalDeliveryFee
    };
}
