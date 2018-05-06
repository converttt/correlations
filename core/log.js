const debugEnabled = process.env.DEBUG_MODE || process.env.DEBUG_MODE === undefined;
const loggingEnabled = process.env.ENABLE_LOGGING || process.env.ENABLE_LOGGING === undefined;

class Log {
    console (type, ...messages) {
        if (loggingEnabled) {
            console.log(`[${new Date()}] ${type}`, ...messages);
        }
    }

    debug (...args) {
        if (debugEnabled) {
            this.console('DEBUG', ...args);
        }
    }

    info (...args) {
        this.console('INFO', ...args);
    }

    warn (...args) {
        this.console('WARN', ...args);
    }

    error (...args) {
        this.console('ERROR', ...args);
    }

    alert (...args) {
        this.console('ALERT', ...args);
    }
}

module.exports = new Log ();