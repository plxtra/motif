import { checkLimitTextLength, getOrCreateLoggerGlobalAlias, Logger, newNowDate, UnreachableCaseError } from '@pbkware/js-utils';
import { StringId, Strings } from '@plxtra/motif-core';
import { TelemetryService } from './telemetry-service';

declare global {
    interface Window {
        motifLogger: Logger;
    }
}

export class LogService {
    private _logEventerForStartup: LogService.LogEventerForStartup | undefined;
    private _queuedStartupEntries: LogService.StartupEntry[] | undefined = [];

    constructor(
        private readonly _devMode: boolean,
        private readonly _telemetryService: TelemetryService
    ) {
        const logger = getOrCreateLoggerGlobalAlias('motifLogger');
        logger.setLogEventer((logEvent) => this.processLogEvent(logEvent));
    }

    setLogEventerForStartup(value: LogService.LogEventerForStartup | undefined) {
        this._logEventerForStartup = value;
        if (value !== undefined) {
            const queuedStartupEntries = this._queuedStartupEntries;
            if (queuedStartupEntries !== undefined) {
                const count = queuedStartupEntries.length;
                for (let i = 0; i < count; i++) {
                    const entry = queuedStartupEntries[i];
                    value(entry);
                }
                this._queuedStartupEntries = undefined;
            }
        }
    }

    private processLogEvent(logEvent: Logger.LogEvent) {
        // Note that currently LogEvent.errorTypeId is ignored
        switch (logEvent.levelId) {
            case Logger.LevelId.Debug:
                this.logDebug(logEvent);
                break;
            case Logger.LevelId.Info:
                this.logInfo(logEvent);
                break;
            case Logger.LevelId.Warning:
                this.logWarning(logEvent);
                break;
            case Logger.LevelId.Error:
            case Logger.LevelId.Severe:
                this.logErrorSevere(logEvent);
                break;
            default:
                throw new UnreachableCaseError('LSPLE66812', logEvent.levelId);
        }
    }

    private logDebug(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, undefined);
        console.debug(text);
        const levelId = logEvent.levelId;
        this.checkNotifyStartup(levelId, text)
        this.checkNotifyTelemetry(levelId, text, logEvent.telemetryAndExtra);
    }

    private logInfo(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, undefined, logEvent.telemetryAndExtra);
        if (this._devMode) {
            console.info(text);
        }
        const levelId = logEvent.levelId;
        this.checkNotifyStartup(levelId, text)
        this.checkNotifyTelemetry(levelId, text, logEvent.telemetryAndExtra);
    }

    private logWarning(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, undefined, logEvent.telemetryAndExtra);
        console.warn(text);
        const levelId = logEvent.levelId;
        this.checkNotifyStartup(levelId, text)
        this.checkNotifyTelemetry(levelId, text, logEvent.telemetryAndExtra);
    }

    private logErrorSevere(logEvent: Logger.LogEvent) {
        const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, logEvent.telemetryAndExtra);
        console.error(text);
        const levelId = logEvent.levelId;
        this.checkNotifyStartup(levelId, text)
        this.checkNotifyTelemetry(levelId, text, logEvent.telemetryAndExtra);
    }

    private prepareLogText(text: string, maxTextLength: number | undefined, extra: string | undefined) {
        if (extra !== undefined && extra.length > 0) {
            text += ': ' + extra;
        }

        if (maxTextLength === undefined) {
            maxTextLength = 1000;
        }

        return checkLimitTextLength(text, maxTextLength);
    }

    private checkNotifyTelemetry(levelId: Logger.LevelId, text: string, telemetryAndExtra: string | undefined) {
        if (telemetryAndExtra !== undefined) {
            if (telemetryAndExtra === '') {
                this._telemetryService.sendLogEvent(levelId, text, undefined);
            } else {
                this._telemetryService.sendLogEvent(levelId, text, telemetryAndExtra);
            }
        }
    }

    private checkNotifyStartup(levelId: Logger.LevelId, text: string) {
        if (this._logEventerForStartup !== undefined) {
            this._logEventerForStartup({ time: newNowDate(), levelId, text });
        } else {
            if (this._queuedStartupEntries !== undefined) {
                this._queuedStartupEntries.push({ time: newNowDate(), levelId, text });
            }
        }
    }
}

export namespace LogService {
    export type LogEventerForStartup = (this: void, entry: StartupEntry) => void;

    export interface StartupEntry {
        readonly time: Date,
        readonly levelId: Logger.LevelId;
        readonly text: string;
    }

    export namespace Level {
        export type Id = Logger.LevelId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof Logger.LevelId]: Info };

        const infosObject: InfosObject = {
            Debug: {
                id: Logger.LevelId.Debug,
                name: 'Debug',
                displayId: StringId.LogLevel_Debug,
            },
            Info: {
                id: Logger.LevelId.Info,
                name: 'Info',
                displayId: StringId.LogLevel_Info,
            },
            Warning: {
                id: Logger.LevelId.Warning,
                name: 'Warning',
                displayId: StringId.LogLevel_Warning,
            },
            Error: {
                id: Logger.LevelId.Error,
                name: 'Error',
                displayId: StringId.LogLevel_Error,
            },
            Severe: {
                id: Logger.LevelId.Severe,
                name: 'Severe',
                displayId: StringId.LogLevel_Severe,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index as Logger.LevelId);
            if (outOfOrderIdx >= 0) {
                throw new Error(`Log.Level out of order Error ${outOfOrderIdx}: ${infos[outOfOrderIdx].name}`);
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }
}

LogService.Level.initialise();
