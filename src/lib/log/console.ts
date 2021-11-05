import { LoggerBackend, LogLevel, LogTag } from './index.js';

export class ConsoleLoggerBackend implements LoggerBackend {
    log(tag: LogTag, level: LogLevel, message: string) {
        let method;

        switch (level) {
            case LogLevel.FATAL:
            case LogLevel.ERROR:
                method = console.error;
                break;
            case LogLevel.WARNING:
                method = console.warn;
                break;
            case LogLevel.INFO:
                method = console.info;
                break
            default:
                method = console.log;
        }

        method(new Date(), tag.last?.padStart(15), LogLevel[level][0], message);
    }
}
