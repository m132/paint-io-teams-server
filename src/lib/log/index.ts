export enum LogLevel {
    FATAL,
    ERROR,
    WARNING,
    INFO,
    VERBOSE,
    DEBUG
}

export interface LoggerBackend {
    log: (tag: LogTag, level: LogLevel, message: string) => void
}

export class LogTag extends Array<string> {
    override toString() {
        return this.join(':');
    }

    get short() {
        switch (this.length) {
            case 0:
                return null;
            case 1:
                return this[0];
            case 2:
                return this.toString();
            default:
                return `${this[0]}::${this.at(-1)}`;
        }
    }

    get last() {
        return this.length ? this.at(-1) : null;
    }

    sub(...tag: string[]) {
        return this.concat(tag) as LogTag;
    }
}

export class Logger {
    public backends: LoggerBackend[];

    constructor(public tag: LogTag) {
        this.backends = [];
        this.tag = tag;
    }

    sub(...tag: string[]) {
        let sublogger: Logger = Object.create(this);
        sublogger.tag = this.tag.sub(...tag);
        return sublogger;
    }

    log(level: LogLevel, message: string) {
        for (let backend of this.backends)
            backend.log(this.tag, level, message);
    }

    fatal(message: string) {
        this.log(LogLevel.FATAL, message);
    }

    err(message: string) {
        this.log(LogLevel.ERROR, message);
    }

    warn(message: string) {
        this.log(LogLevel.WARNING, message);
    }

    info(message: string) {
        this.log(LogLevel.INFO, message);
    }

    verbose(message: string) {
        this.log(LogLevel.VERBOSE, message);
    }

    debug(message: string) {
        this.log(LogLevel.DEBUG, message);
    }
}

export const logger = new Logger(new LogTag('paintio-teams-server'));
