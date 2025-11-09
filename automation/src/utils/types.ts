import { Locator } from '@playwright/test';

// --- INTERFACE DASAR ---
/**
 * Opsi umum yang berlaku untuk semua fungsi "smart".
 */
export interface CommonSmartOptions {
    exactMatch?: boolean;       // Default: true
    timeout?: number;           // GLOBAL timeout (total waktu tunggu maksimal). Default: 30000ms
    parent?: Locator;           // Scope pencarian (opsional)
}

// --- TYPE INTERNAL ENGINE ---
/**
 * Tipe internal yang digunakan oleh smart-engine.
 */
export type Strategy = {
    name: string;
    locator: (root: any) => Locator; // 'any' untuk menerima Page | Locator
};

// --- INTERFACE SPESIFIK AKSI ---
export interface SmartFillOptions extends CommonSmartOptions { }
export interface SmartClickOptions extends CommonSmartOptions {
    force?: boolean;            // Default: false
}
export interface SmartSelectOptions extends CommonSmartOptions {
    force?: boolean;
}

// --- INTERFACE SPESIFIK UTILITAS ---
export interface SmartAssertOptions extends CommonSmartOptions { }
export interface SmartWaitOptions extends CommonSmartOptions { } // 'parent' hanya berlaku untuk locator
export interface SmartFrameOptions {
    timeout?: number;
}