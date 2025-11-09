// support/utility.ts
import Store from './store';
import { log } from '../logger/logger';

/**
 * Validates that required data fields exist in either datatest or carryover stores
 * Throws error if any required field is missing
 * 
 * @param requiredFields - Array of field names that must exist
 * @throws Error if any required field is missing
 * 
 * @example
 * // Single field
 * requireDatatest("username")
 * 
 * // Multiple fields  
 * requireDatatest("username", "password")
 * 
 * // Array format
 * requireDatatest(["username", "password", "email"])
 */
export function requireDatatest(...requiredFields: (string | string[])[]): void {
    // Flatten the arguments to handle both individual strings and arrays
    const fields: string[] = requiredFields.flat();
    
    if (fields.length === 0) {
        log.warn("⚠️  requireDatatest called with no fields specified");
        return;
    }

    const missingFields: string[] = [];
    const foundFields: { field: string, source: 'datatest' | 'carryover' }[] = [];

    // Check each required field
    fields.forEach(field => {
        const datatestValue = Store.datatest.get(field);
        const carryoverValue = Store.getCarryover(field);
        
        // Check if field exists and has valid value (not null, undefined, or empty string)
        const datatestExists = datatestValue !== null && datatestValue !== undefined && datatestValue !== '';
        const carryoverExists = carryoverValue !== null && carryoverValue !== undefined && carryoverValue !== '';
        
        if (datatestExists) {
            foundFields.push({ field, source: 'datatest' });
        } else if (carryoverExists) {
            foundFields.push({ field, source: 'carryover' });
        } else {
            missingFields.push(field);
        }
    });

    // Log found fields for debugging
    if (foundFields.length > 0) {
        const datatestFields = foundFields.filter(f => f.source === 'datatest').map(f => f.field);
        const carryoverFields = foundFields.filter(f => f.source === 'carryover').map(f => f.field);
        
        if (datatestFields.length > 0) {
            log.debug(`✅ Found in datatest: ${datatestFields.join(', ')}`);
        }
        if (carryoverFields.length > 0) {
            log.debug(`✅ Found in carryover: ${carryoverFields.join(', ')}`);
        }
    }

    // Throw error if any fields are missing
    if (missingFields.length > 0) {
        const errorMessage = `Missing required data fields: ${missingFields.join(', ')}. ` +
            `Fields must exist in either datatest or carryover store.`;
        
        log.error(`❌ ${errorMessage}`);
        
        // Show available fields for debugging
        const availableDatatest = Object.keys(Store.datatest.getAll() || {});
        const availableCarryover = Object.keys(Store.getAllCarryover() || {});
        
        if (availableDatatest.length > 0) {
            log.debug(`Available in datatest: ${availableDatatest.join(', ')}`);
        }
        if (availableCarryover.length > 0) {
            log.debug(`Available in carryover: ${availableCarryover.join(', ')}`);
        }
        
        throw new Error(errorMessage);
    }

    log.debug(`✅ All required fields validated: ${fields.join(', ')}`);
}

/**
 * Gets data from datatest first, fallback to carryover
 * Similar to Store.datatest.get() but also checks carryover
 * 
 * @param key - Field name to retrieve
 * @returns Value from datatest or carryover, undefined if not found
 */
export function getData(key: string): any {
    const datatestValue = Store.datatest.get(key);
    if (datatestValue !== null && datatestValue !== undefined && datatestValue !== '') {
        return datatestValue;
    }
    
    return Store.getCarryover(key);
}

/**
 * Alternative syntax for requireDatatest with better IntelliSense
 * 
 * @example
 * requireData(['username', 'password', 'email'])
 */
export function requireData(fields: string[]): void {
    requireDatatest(...fields);
}