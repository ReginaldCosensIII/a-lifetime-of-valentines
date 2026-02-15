/**
 * Logger Utility
 * Wraps console methods to allow for future expansion (e.g. sending logs to a server)
 * and to prevent cluttering the console in production if needed.
 */

const LOG_LEVELS = {
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    DEBUG: 'debug'
};

const isDev = import.meta.env.DEV;

export const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message, ...args) => {
        if (isDev) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
    group: (label) => {
        console.group(label);
    },
    groupEnd: () => {
        console.groupEnd();
    }
};

export default logger;
