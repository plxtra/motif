import { checkLimitTextLength, getOrCreateLoggerGlobalAlias, Logger } from '@pbkware/js-utils';

declare global {
    interface Window {
        motifHighchartsLogger: Logger;
    }
}

export class LogService {
    constructor(
    ) {
        const logger = getOrCreateLoggerGlobalAlias('motifHighchartsLogger');
        logger.setLogEventer((logEvent) => this.processLogEvent(logEvent));
    }

    logDebug(text: string, maxTextLength?: number) {
        text = checkLimitTextLength(text, maxTextLength ?? 500);
        console.debug(text);
    }

    logInfo(text: string, maxTextLength?: number) {
        text = checkLimitTextLength(text, maxTextLength ?? 500);
        console.info(text);
    }

    logWarning(text: string, maxTextLength?: number) {
        text = checkLimitTextLength(text, maxTextLength ?? 500);
        console.warn(text);
    }

    logError(text: string, maxTextLength?: number) {
        text = checkLimitTextLength(text, maxTextLength ?? 500);
        console.error(text);
    }

    logConfigError(code: string, text: string, maxTextLength?: number) {
        this.logError(`Config [${code}]: ${text}`, maxTextLength);
    }

    private processLogEvent(logEvent: Logger.LogEvent) {
        switch (logEvent.levelId) {
            case Logger.LevelId.Debug: {
                const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, undefined);
                console.debug(text);
                break;
            }
            case Logger.LevelId.Info: {
                const text = this.prepareLogText(logEvent.text, undefined, logEvent.telemetryAndExtra);
                console.info(text);
                break;
            }
            case Logger.LevelId.Warning: {
                const text = this.prepareLogText(logEvent.text, undefined, logEvent.telemetryAndExtra);
                console.warn(text);
                break;
            }
            case Logger.LevelId.Error:
            case Logger.LevelId.Severe: {
                const text = this.prepareLogText(logEvent.text, logEvent.maxTextLength, logEvent.telemetryAndExtra);
                console.error(text);
                break;
            }
            default:
                throw new Logger.UnreachableCaseError('LSPLE66812', logEvent.levelId);
        }
    }

    private prepareLogText(text: string, maxTextLength: number | undefined, extra: string | undefined) {
        text = `Motif Highcharts: ${text}`;
        if (extra !== undefined && extra.length > 0) {
            text += ': ' + extra;
        }

        if (maxTextLength === undefined) {
            maxTextLength = 500;
        }

        return checkLimitTextLength(text, maxTextLength);
    }
}