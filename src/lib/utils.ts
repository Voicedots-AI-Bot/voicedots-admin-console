import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
    }).format(amount);
}

export function formatRate(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
    }).format(amount);
}

export function toDecimalString(amount: number): string {
    if (amount === undefined || amount === null) return '';
    if (amount === 0) return '0';
    // Force decimal representation for very small numbers
    return amount.toFixed(12).replace(/\.?0+$/, '');
}
