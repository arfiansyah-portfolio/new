// support/playwright-logger.ts
import { Page, Locator, expect as baseExpect } from '@playwright/test';
import { log } from '../logger/logger';

//
// ---- Logging helpers ----
//
function logPageAction(action: string, args: any[]) {
    log.step(`[PAGE  ] ${action}(${JSON.stringify(args)})`);
}

function logLocatorAction(action: string, target: string, args: any[]) {
    (args && args.length > 0) ? log.step(`[ACTION] ${action} on ${target} with value ${JSON.stringify(args)}`) : log.step(`[ACTION] ${action} on ${target}`);
}

function logAssertion(action: string, target: string, args: any[]) {
    log.step(`[ASSERT] ${action} on ${target}(${JSON.stringify(args)})`);
}
//
// ---- Locator patching ----
//
function patchLocator(locator: Locator, description: string): Locator {
    const handler: ProxyHandler<Locator> = {
        get(target, prop, receiver) {
            const orig = Reflect.get(target, prop, receiver);

            // Locator actions (click, fill, type, dll)
            if (
                [
                    'click',
                    'fill',
                    'check',
                    'uncheck',
                    'press',
                    'type',
                    'hover',
                    'dblclick',
                    'clear',
                    'selectOption',
                ].includes(String(prop))
            ) {
                return (...args: any[]) => {
                    logLocatorAction(String(prop), description, args);
                    return (orig as Function).apply(target, args);
                };
            }

            // Locator chaining (getByRole, getByText, locator, dll)
            if (
                [
                    'locator',
                    'getByRole',
                    'getByText',
                    'getByLabel',
                    'getByPlaceholder',
                    'getByAltText',
                    'getByTitle',
                    'getByTestId',
                ].includes(String(prop))
            ) {
                return (...args: any[]) => {
                    const loc = (orig as Function).apply(target, args);
                    return patchLocator(loc, `${description}.${String(prop)}(${JSON.stringify(args)})`);
                };
            }

            return orig;
        },
    };

    return new Proxy(locator, handler);
}

//
// ---- Page patching ----
//
export function createLoggedPage(page: Page): Page {
    const handler: ProxyHandler<Page> = {
        get(target, prop, receiver) {
            const orig = Reflect.get(target, prop, receiver);

            if (typeof orig === 'function') {
                return (...args: any[]) => {
                    // Page-level actions
                    if (['goto', 'screenshot', 'reload'].includes(String(prop))) {
                        logPageAction(String(prop), args);
                    }
                    const result = (orig as Function).apply(target, args);

                    // Kalau hasilnya Locator, patch lagi
                    if (result instanceof Object && 'locator' in result) {
                        return patchLocator(result as Locator, `${String(prop)}(${JSON.stringify(args)})`);
                    }

                    return result;
                };
            }

            return orig;
        },
    };

    return new Proxy(page, handler);
}

//
// ---- Expect patching ----
//
function createLoggedExpect(base: typeof baseExpect) {
    return new Proxy(base, {
        apply(target, thisArg, args: any[]) {
            const actual = args[0];
            const assertionObj = Reflect.apply(target, thisArg, args);

            return new Proxy(assertionObj, {
                get(t, prop, receiver) {
                    const orig = Reflect.get(t, prop, receiver);

                    if (typeof orig === 'function') {
                        return (...fnArgs: any[]) => {
                            let desc = '';

                            if (actual && typeof (actual as any)._selector === 'string') {
                                desc = (actual as any)._selector;
                            } else if (actual?.toString) {
                                desc = actual.toString();
                            } else {
                                desc = JSON.stringify(actual);
                            }

                            logAssertion(String(prop), desc, fnArgs);
                            return (orig as Function).apply(t, fnArgs);
                        };
                    }

                    return orig;
                },
            });
        },
    });
}

// Re-export patched expect
export const expect = createLoggedExpect(baseExpect);
