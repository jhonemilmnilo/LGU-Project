import { z } from "zod";

/**
 * Universal string sanitization utility.
 * Strips HTML tags, inline scripts, and dangerous characters.
 */
export function sanitizeString(input: string): string {
    if (typeof input !== "string") return "";
    
    // 1. Remove script tags and their inner content
    let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    
    // 2. Remove HTML tags but keep text content
    sanitized = sanitized.replace(/<[^>]*>/g, "");
    
    // 3. Remove inline events (e.g. onload, onerror, onclick)
    sanitized = sanitized.replace(/on\w+\s*=\s*(["'].*?["']|[^ >\t\r\n]+)/gi, "");
    
    return sanitized.trim();
}

/**
 * Recursively sanitizes every string property within an object or array.
 * Highly useful for nested resident snapshot or additional data structures.
 */
export function sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === "string") {
        return sanitizeString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === "object") {
        const sanitizedObj: Record<string, any> = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                sanitizedObj[key] = sanitizeObject((obj as Record<string, any>)[key]);
            }
        }
        return sanitizedObj as unknown as T;
    }

    return obj;
}

/**
 * Strips protocols other than http:// and https:// (such as javascript: or data:).
 * Relative URLs starting with / are allowed.
 */
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return "";
}

// Zod schemas for shared models and params
export const idSchema = z.string().min(1, "ID is required").max(100);
export const remarksSchema = z.string().max(1000).transform(sanitizeString);
export const ctcNumberSchema = z.string().max(50).transform(sanitizeString);

export const fulfillmentTypeSchema = z.enum(["PICK_UP", "DELIVERY", "E_COPY"]);
export const paymentTypeSchema = z.enum(["CASH", "GCASH", "CASH_ON_DELIVERY"]);
