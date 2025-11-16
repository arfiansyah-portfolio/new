import Store from './store';
import { log } from '../logger/logger';

export function requireDatatest(...requiredFields: (string | string[])[]): void {
    const fields: string[] = requiredFields.flat();
    
    if (fields.length === 0) {
        return;
    }

    const missingFields: string[] = [];
    const foundFields: { field: string, source: 'datatest' | 'carryover' }[] = [];

    fields.forEach(field => {
        const datatestValue = Store.datatest.get(field);
        const carryoverValue = Store.carryover.get(field);
        
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

    if (missingFields.length > 0) {
        const errorMessage = `Missing required data fields: ${missingFields.join(', ')}. ` +
            `Fields must exist in either datatest or carryover store.`;
        
        throw new Error(errorMessage);
    }
}

export function getData(key: string): any {
    const datatestValue = Store.datatest.get(key);
    if (datatestValue !== null && datatestValue !== undefined && datatestValue !== '') {
        return datatestValue;
    }
    
    return Store.carryover.get(key);
}

export function requireData(fields: string[]): void {
    requireDatatest(...fields);
}