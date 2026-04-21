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
 * Calculates the penalty rate based on the current month.
 * January: 0%
 * February: 0%
 * March: 2%
 * April: 4%
 * ...
 * February (Next Year Theoretical Max): 24%
 */
export function getCedulaPenaltyRate(): number {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed: 0=Jan, 1=Feb, 2=Mar...

    // Penalty starts in March (Index 2)
    if (month < 2) return 0;
    
    // Formula: (MonthIndex - 1) * 2% 
    // March(2) -> (2-1)*0.02 = 0.02 (2%)
    // December(11) -> (11-1)*0.02 = 0.20 (20%)
    return (month - 1) * 0.02;
}

/**
 * Returns a human-readable penalty label (e.g., "4%")
 */
export function getCedulaPenaltyRateLabel(): string {
    const rate = getCedulaPenaltyRate();
    return `${Math.round(rate * 100)}%`;
}

/**
 * Computes the Community Tax Certificate (Cedula) amount.
 */
export function calculateCedula(params: CedulaCalculationParams): CedulaResult {
    const { 
        type, 
        income, 
        propertyValue, 
        fulfillmentType = "PICK_UP",
        deliveryFee = 0
    } = params;

    const basicTax = type === "INDIVIDUAL" ? 5.00 : 500.00;
    let additionalTax = 0;
    const totalBasis = income + propertyValue;

    if (type === "INDIVIDUAL") {
        // Individual: ₱1.00 for every ₱1,000 of income/property
        additionalTax = Math.floor(totalBasis / 1000) * 1.00;
    } else {
        // Juridical: ₱2.00 for every ₱5,000 of income/property
        additionalTax = Math.floor(totalBasis / 5000) * 2.00;
    }

    // Dynamic Penalty: 2% monthly increase starting March
    const penaltyRate = getCedulaPenaltyRate();
    let penalty = (basicTax + additionalTax) * penaltyRate;

    // Apply Global Caps (Including Penalty)
    // Individual: ₱5,000 max
    // Juridical: ₱10,000 max
    const cap = type === "INDIVIDUAL" ? 5000 : 10000;
    const currentSubtotal = basicTax + additionalTax + penalty;

    if (currentSubtotal > cap) {
        // If over cap, we need to adjust additionalTax and penalty proportionally
        // basicTax remains constant as it's the fixed minimum
        const adjustableAmount = cap - basicTax;
        const totalAdjustableRaw = additionalTax + penalty;
        
        if (totalAdjustableRaw > 0) {
            const reductionRatio = adjustableAmount / totalAdjustableRaw;
            additionalTax = additionalTax * reductionRatio;
            penalty = penalty * reductionRatio;
        } else {
            // Edge case: basicTax already exceeds cap (shouldn't happen with 5/500 vs 5k/10k)
            additionalTax = 0;
            penalty = 0;
        }
    }

    // Delivery Fee (External to caps)
    const finalDeliveryFee = fulfillmentType === "DELIVERY" ? deliveryFee : 0;

    return {
        basicTax,
        additionalTax,
        penalty,
        deliveryFee: finalDeliveryFee,
        totalAmount: basicTax + additionalTax + penalty + finalDeliveryFee
    };
}
