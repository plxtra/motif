import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Json, JsonElement, createRandomUrlSearch } from '@pbkware/js-utils';
import {
    ConfigError,
    ErrorCode,
    ErrorCodeLogger,
    ExtensionInfo,
    MarketIvemId,
    MarketsConfig,
    SessionInfoService,
    ZenithPublisherSubscriptionManager,
} from '@plxtra/motif-core';
import { Config } from '../config';

@Injectable({
    providedIn: 'root'
})
export class ConfigNgService {
    version: string;
    config: Config;

    // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
    constructor() { }

    async load(domSanitizer: DomSanitizer) {
        const versionFileName = 'version.txt';

        const configFolderPath = 'config';
        const configJsonFileName = 'config.json';
        const randomUrlSearch = createRandomUrlSearch();

        const versionUri = `./${versionFileName}${randomUrlSearch}`;
        const configJsonUri = `./${configFolderPath}/${configJsonFileName}${randomUrlSearch}`;
        const [versionResponse, configResponse] = await Promise.all([fetch(versionUri), fetch(configJsonUri)]);

        if (versionResponse.status !== 200) {
            throw new ConfigError(ErrorCode.CSL23230003998, 'VersionHTTP',
                `${versionResponse.status}: "${versionResponse.statusText}" Uri: ${configJsonUri}`);
        } else {
            const versionText = await versionResponse.text();
            this.version = versionText.trim();

            if (configResponse.status !== 200) {
                throw new ConfigError(ErrorCode.CSL23230003998, 'ConfigHTTP',
                    `${configResponse.status}: "${configResponse.statusText}" Uri: ${configJsonUri}`);
            } else {
                const configText = await configResponse.text();
                return this.loadText(domSanitizer, configText, configFolderPath);
            }
        }
    }

    loadText(
        sanitizer: DomSanitizer,
        jsonText: string,
        configFolderPath: string,
    ): Promise<boolean> {
        let configJson: ConfigNgService.ConfigJson;
        try {
            configJson = JSON.parse(jsonText) as ConfigNgService.ConfigJson;
        } catch (e) {
            ErrorCodeLogger.logConfigError('CSLTP988871038839', jsonText, 500);
            throw (e);
        }

        if (configJson.configFormatVersion !== ConfigNgService.acceptedConfigFormatVersion) {
            throw new ConfigError(ErrorCode.CSLTF1988871038839, '?', jsonText);
        } else {
            const service = ConfigNgService.Service.parseJson(configJson.service, jsonText);
            // const environment = ConfigNgService.Environment.parseJson(configJson.environment, service.name);
            // const exchange = ConfigNgService.Exchange.parseJson(configJson.exchange, service.name);
            const endpoints = ConfigNgService.Endpoints.parseJson(configJson.endpoints, service.name);
            const openId = ConfigNgService.OpenId.parseJson(configJson.openId, service.name);
            const defaultLayout = ConfigNgService.DefaultLayout.parseJson(configJson.defaultLayout);
            const bundledExtensions = ConfigNgService.BundledExtensions.parseJson(configJson.bundledExtensions, service.name);
            const diagnostics = ConfigNgService.Diagnostics.parseJson(configJson.diagnostics, service.name);
            const capabilities = ConfigNgService.Capabilities.parseJson(configJson.capabilities ?? configJson.features);
            const branding = ConfigNgService.Branding.parseJson(sanitizer, configJson.branding, service.name);
            let marketsConfig: MarketsConfig;
            const marketsConfigJson = configJson.markets;
            if (marketsConfigJson === undefined) {
                marketsConfig = MarketsConfig.createEmpty();
            } else {
                const marketsConfigResult = MarketsConfig.tryParse(marketsConfigJson);
                if (marketsConfigResult.isErr()) {
                    throw new ConfigError(ErrorCode.ConfigService_MarketsConfigCouldNotBeParsed, service.name, marketsConfigResult.error);
                } else {
                    marketsConfig = marketsConfigResult.value;
                }

            }
            const config: Config = {
                service,
                endpoints,
                openId,
                defaultLayout,
                bundledExtensions,
                diagnostics,
                capabilities,
                branding,
                marketsConfig,
            };

            this.config = config;
            return Promise.resolve(true);
        }
    }
}

export namespace ConfigNgService {
    export function getLoadConfigFtn(domSanitizer: DomSanitizer, configNgService: ConfigNgService) {
        return (): Promise<boolean> => loadConfig(domSanitizer, configNgService);
    }

    function loadConfig(domSanitizer: DomSanitizer, configNgService: ConfigNgService): Promise<boolean> {
        return configNgService.load(domSanitizer);
    }

    export const acceptedConfigFormatVersion = '2';

    export interface ConfigJson {
        readonly configFormatVersion: string;
        readonly configComment?: string;
        readonly service: Service.ServiceJson;
        readonly endpoints: Endpoints.EndPointsJson;
        readonly openId: OpenId.OpenIdJson;
        readonly defaultLayout?: DefaultLayout.DefaultLayoutJson;
        readonly bundledExtensions?: Json;
        readonly diagnostics?: Diagnostics.DiagnosticsJson;
        readonly features?: Capabilities.CapabilitiesJson; // backwards compatibility - remove when all configs have been updated
        readonly capabilities?: Capabilities.CapabilitiesJson;
        readonly branding?: Branding.BrandingJson;
        readonly markets?: Json;
    }

    export namespace Service {
        export interface ServiceJson {
            readonly name: string;
            readonly description?: string;
            readonly operator?: string;
        }

        export function parseJson(json: ServiceJson, jsonText: string) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (json === undefined) {
                throw new ConfigError(ErrorCode.Config_MissingService, '?', jsonText);
            } else {
                const name = json.name;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (name === undefined) {
                    throw new ConfigError(ErrorCode.Config_ServiceMissingName, '?', jsonText);
                } else {
                    const operator = json.operator;
                    if (operator === undefined) {
                        throw new ConfigError(ErrorCode.Config_ServiceMissingOperator, '?', jsonText);
                    } else {
                        const description = json.description;

                        const service: Config.Service = {
                            name,
                            operator,
                            description,
                        };

                        return service;
                    }
                }
            }
        }
    }

    export namespace Endpoints {
        export interface EndPointsJson {
            readonly motifServices: readonly string[];
            readonly zenith: readonly string[];
        }

        export function parseJson(json: EndPointsJson, serviceName: string) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (json === undefined) {
                throw new ConfigError(ErrorCode.Config_MissingEndpoints, serviceName, '');
            } else {
                const motifServices = json.motifServices;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (motifServices === undefined) {
                    throw new ConfigError(ErrorCode.CSEPPMSU00831852399, serviceName, '');
                } else {
                    if (motifServices.length === 0) {
                        throw new ConfigError(ErrorCode.CSEPPMSL00831852399, serviceName, '');
                    } else {
                        if (motifServices[0].length === 0) {
                            throw new ConfigError(ErrorCode.CSEPPMSE00831852399, serviceName, '');
                        } else {
                            const zenith = json.zenith;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (zenith === undefined) {
                                throw new ConfigError(ErrorCode.CSEPPZU00831852399, serviceName, '');
                            } else {
                                if (zenith.length === 0) {
                                    throw new ConfigError(ErrorCode.CSEPPZL00831852399, serviceName, '');
                                } else {
                                    if (zenith[0].length === 0) {
                                        throw new ConfigError(ErrorCode.CSEPPZE00831852399, serviceName, '');
                                    } else {
                                        const endpoints: Config.Endpoints = {
                                            motifServices,
                                            zenith,
                                        };

                                        return endpoints;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    export namespace OpenId {
        export interface OpenIdJson {
            readonly authority: string;
            readonly clientId: string;
            readonly redirectUri: string;
            readonly silentRedirectUri: string;
            readonly scope: string;
        }

        export function parseJson(json: OpenIdJson, serviceName: string) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (json === undefined) {
                throw new ConfigError(ErrorCode.Config_MissingOpenId, serviceName, '');
            } else {
                const authority = json.authority;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (authority === undefined) {
                    throw new ConfigError(ErrorCode.CSOIPJA0831852399, serviceName, '');
                } else {
                    const clientId = json.clientId;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (clientId === undefined) {
                        throw new ConfigError(ErrorCode.CSOIPJCI100194724, serviceName, '');
                    } else {
                        const redirectUri = json.redirectUri;
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (redirectUri === undefined) {
                            throw new ConfigError(ErrorCode.CSOIPJRU33448829, serviceName, '');
                        } else {
                            const silentRedirectUri = json.silentRedirectUri;
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (silentRedirectUri === undefined) {
                                throw new ConfigError(ErrorCode.CSOIPJSR12120987, serviceName, '');
                            } else {
                                const scope = json.scope;
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                if (scope === undefined) {
                                    throw new ConfigError(ErrorCode.CSOIPJSC67773223, serviceName, '');
                                } else {
                                    const openId: Config.OpenId = {
                                        authority,
                                        clientId,
                                        redirectUri,
                                        silentRedirectUri,
                                        scope,
                                    };

                                    return openId;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    export namespace DefaultLayout {
        export interface DefaultLayoutJson {
            readonly internalName: string | undefined;
            readonly instanceName: string | undefined;
            readonly linkedSymbol: MarketIvemId.Json | undefined;
            readonly watchlist: MarketIvemId.Json[] | undefined;
        }

        export function parseJson(json: DefaultLayoutJson | undefined) {
            let defaultLayout: SessionInfoService.DefaultLayout;
            if (json === undefined) {
                defaultLayout = {
                    internalName: undefined,
                    instanceName: undefined,
                    linkedSymbolJson: undefined,
                    watchlistJson: undefined,
                };
            } else {
                defaultLayout = {
                    internalName: json.internalName,
                    instanceName: json.instanceName,
                    linkedSymbolJson: json.linkedSymbol,
                    watchlistJson: json.watchlist,
                };
            }
            return defaultLayout;
        }
    }

    export namespace BundledExtensions {
        export interface BundledExtension {
            readonly info: ExtensionInfo;
            readonly install: boolean;
        }

        export namespace JsonName {
            export const install = 'install';
            export const info = 'info';
        }

        export function parseJson(json: Json | undefined, serviceName: string): Config.BundledExtensions {
            if (json !== undefined) {
                if (!Array.isArray(json)) {
                    ErrorCodeLogger.logConfigError('CNSDEPJA23300911', serviceName);
                } else {
                    const maxCount = json.length;
                    const result = new Array<BundledExtension>(maxCount);
                    let count = 0;
                    for (let i = 0; i < maxCount; i++) {
                        const bundledExtensionJson = json[i] as Json;
                        const bundledExtensionJsonType = typeof bundledExtensionJson;
                        if (bundledExtensionJsonType !== 'object') {
                            ErrorCodeLogger.logConfigError('CNSDEPJBE23300', `${serviceName}: ${bundledExtensionJsonType}`);
                        } else {
                            const bundledExtensionJsonElement = new JsonElement(bundledExtensionJson);
                            const bundledExtension = parseBundledExtensionJson(bundledExtensionJsonElement, serviceName);
                            if (bundledExtension !== undefined) {
                                result[count++] = bundledExtension;
                            }
                        }
                    }
                    result.length = count;
                    return result;
                }
            }

            return [];
        }

        export function parseBundledExtensionJson(json: JsonElement | undefined, serviceName: string) {
            if (json === undefined) {
                ErrorCodeLogger.logConfigError('CNSPJU13300911', serviceName);
            } else {
                const installResult = json.tryGetBoolean(JsonName.install);
                if (installResult.isErr()) {
                    ErrorCodeLogger.logConfigError('CNSPJI13300911', serviceName);
                } else {
                    const infoElementResult = json.tryGetElement(JsonName.info);
                    if (infoElementResult.isErr()) {
                        ErrorCodeLogger.logConfigError('CNSBEPBEJNL20558', serviceName);
                    } else {
                        const createResult = ExtensionInfo.tryCreateFromJson(infoElementResult.value);
                        if (createResult.isErr()) {
                            ErrorCodeLogger.logConfigError('CNSPJU13300911', `"${serviceName}": ${createResult.error}`);
                        } else {
                            const result: BundledExtension = {
                                info: createResult.value,
                                install: installResult.value,
                            };
                            return result;
                        }
                    }
                }
            }
            return undefined;
        }
    }

    export namespace Diagnostics {
        export interface DiagnosticsJson {
            readonly toolsEnabled?: boolean;
            readonly appNotifyErrors?: boolean;
            readonly telemetry?: Telemetry.TelemetryJson;
            readonly zenithLogLevel?: ZenithLog.Level;
            readonly dataSubscriptionCachingDisabled?: boolean;
            readonly motifServicesBypass?: MotifServicesBypass.MotifServicesByPassJson;
            readonly fullDepthDebugLoggingEnabled?: boolean;
            readonly fullDepthConsistencyCheckingEnabled?: boolean;
        }

        export function parseJson(json: DiagnosticsJson | undefined, serviceName: string) {
            if (json === undefined) {
                const diagnostics: Config.Diagnostics = {
                    toolsEnabled: Config.Diagnostics.defaultToolsEnabled,
                    appNotifyErrors: Config.Diagnostics.defaultAppNotifyErrors,
                    telemetry: Telemetry.parseJson(undefined, serviceName),
                    zenithLogLevelId: Config.Diagnostics.ZenithLog.defaultLevelId,
                    dataSubscriptionCachingDisabled: Config.Diagnostics.defaultDataSubscriptionCachingDisabled,
                    motifServicesBypass: MotifServicesBypass.parseJson(undefined),
                    fullDepthDebugLoggingEnabled: Config.Diagnostics.defaultFullDepthDebugLoggingEnabled,
                    fullDepthConsistencyCheckingEnabled: Config.Diagnostics.defaultFullDepthConsistencyCheckingEnabled,
                };

                return diagnostics;
            } else {
                const diagnostics: Config.Diagnostics = {
                    toolsEnabled: json.toolsEnabled ?? Config.Diagnostics.defaultToolsEnabled,
                    appNotifyErrors: json.appNotifyErrors ?? Config.Diagnostics.defaultAppNotifyErrors,
                    telemetry: Telemetry.parseJson(json.telemetry, serviceName),
                    zenithLogLevelId: ZenithLog.parseJson(json.zenithLogLevel, serviceName),
                    dataSubscriptionCachingDisabled: json.dataSubscriptionCachingDisabled ?? Config.Diagnostics.defaultDataSubscriptionCachingDisabled,
                    motifServicesBypass: MotifServicesBypass.parseJson(json.motifServicesBypass),
                    fullDepthDebugLoggingEnabled: json.fullDepthDebugLoggingEnabled ?? Config.Diagnostics.defaultFullDepthDebugLoggingEnabled,
                    fullDepthConsistencyCheckingEnabled: json.fullDepthConsistencyCheckingEnabled ?? Config.Diagnostics.defaultFullDepthConsistencyCheckingEnabled,
                };

                return diagnostics;
            }
        }

        export namespace Telemetry {
            export interface TelemetryJson {
                enabled?: boolean;
                itemsPerMinute?: number;
                maxErrorCount?: number;
                itemIgnores?: Config.Diagnostics.Telemetry.ItemIgnore[];
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(json: TelemetryJson | undefined, serviceName: string) {
                let enabled: boolean;
                let itemsPerMinute: number;
                let maxErrorCount: number;
                let itemIgnores: Config.Diagnostics.Telemetry.ItemIgnore[];

                if (json === undefined) {
                    enabled = Config.Diagnostics.Telemetry.defaultEnabled;
                    itemsPerMinute = Config.Diagnostics.Telemetry.defaultItemsPerMinute;
                    maxErrorCount = Config.Diagnostics.Telemetry.defaultMaxErrorCount;
                    itemIgnores = Config.Diagnostics.Telemetry.defaultItemIgnores;
                } else {
                    enabled = json.enabled ?? Config.Diagnostics.Telemetry.defaultEnabled;
                    itemsPerMinute = json.itemsPerMinute ?? Config.Diagnostics.Telemetry.defaultItemsPerMinute;
                    maxErrorCount = json.maxErrorCount ?? Config.Diagnostics.Telemetry.defaultMaxErrorCount;
                    itemIgnores = parseItemIgnoresJson(json.itemIgnores, serviceName);
                }
                const telemetry: Config.Diagnostics.Telemetry = {
                    enabled,
                    itemsPerMinute,
                    maxErrorCount,
                    itemIgnores,
                };

                return telemetry;
            }

            export function parseItemIgnoresJson(json: Config.Diagnostics.Telemetry.ItemIgnore[] | undefined, serviceName: string) {
                if (json !== undefined) {
                    if (!Array.isArray(json)) {
                        ErrorCodeLogger.logConfigError('CNSDTPIIJA13300911', serviceName);
                    } else {
                        let invalid = false;
                        for (const itemIgnore of json) {
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                            if (typeof itemIgnore !== 'object' || itemIgnore === null) {
                                ErrorCodeLogger.logConfigError('CNSDTPIIJO13300911', serviceName);
                                invalid = true;
                                break;
                            } else {
                                const typeId = itemIgnore.typeId;
                                if (typeof typeId !== 'string') {
                                    ErrorCodeLogger.logConfigError('CNSDTPIIJS13300911', serviceName);
                                    invalid = true;
                                    break;
                                } else {
                                    if (!Config.Diagnostics.Telemetry.ItemIgnore.Type.isValidId(typeId)) {
                                        ErrorCodeLogger.logConfigError('CNSDTPIIJTU13300911', `${serviceName}: ${typeId}`);
                                        invalid = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (!invalid) {
                            return json;
                        }
                    }
                }
                return Config.Diagnostics.Telemetry.defaultItemIgnores;
            }
        }

        export namespace ZenithLog {
            export const enum Level {
                Off = 'off',
                Partial = 'partial',
                Full = 'full'
            }

            function tryLevelToId(value: Level): ZenithPublisherSubscriptionManager.LogLevelId | undefined {
                switch (value) {
                    case Level.Off: return ZenithPublisherSubscriptionManager.LogLevelId.Off;
                    case Level.Partial: return ZenithPublisherSubscriptionManager.LogLevelId.Partial;
                    case Level.Full: return ZenithPublisherSubscriptionManager.LogLevelId.Full;
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(level: Level | undefined, serviceName: string) {
                if (level === undefined) {
                    return Config.Diagnostics.ZenithLog.defaultLevelId;
                } else {
                    const levelId = tryLevelToId(level);
                    if (levelId === undefined) {
                        throw new ConfigError(ErrorCode.CSDZLPJ788831131, serviceName, level);
                    } else {
                        return levelId;
                    }
                }
            }
        }

        export namespace MotifServicesBypass {
            export interface MotifServicesByPassJson {
                readonly useLocalStateStorage?: boolean;
            }

            // eslint-disable-next-line @typescript-eslint/no-shadow
            export function parseJson(json: MotifServicesByPassJson | undefined) {
                let useLocalStateStorage: boolean;

                if (json === undefined) {
                    useLocalStateStorage = Config.Diagnostics.MotifServicesBypass.defaultUseLocalStateStorage;
                } else {
                    useLocalStateStorage = json.useLocalStateStorage ?? Config.Diagnostics.MotifServicesBypass.defaultUseLocalStateStorage;
                }

                const motifServicesBypass: Config.Diagnostics.MotifServicesBypass = {
                    useLocalStateStorage,
                };

                return motifServicesBypass;
            }
        }
    }

    export namespace Capabilities {
        export interface CapabilitiesJson {
            readonly advertising?: boolean;
            readonly dtr?: boolean;
        }

        export function parseJson(json: CapabilitiesJson | undefined) {
            const advertising = json?.advertising ?? Config.Capabilities.defaultAdvertising;
            const dtr = json?.dtr ?? Config.Capabilities.defaultDtr;

            const capabilities: Config.Capabilities = {
                advertising,
                dtr
            };

            return capabilities;
        }
    }

    export namespace Branding {
        export interface BrandingJson {
            readonly startupSplashWebPageUrl?: string;
            readonly desktopBarLeftImageUrl?: string;
        }

        export function parseJson(sanitizer: DomSanitizer, json: BrandingJson | undefined, serviceName: string): Config.Branding {
            if (json === undefined) {
                return {
                    startupSplashWebPageSafeResourceUrl: undefined,
                    desktopBarLeftImageUrl: undefined,
                };
            } else {
                const origin = window.location.origin;
                let startupSplashWebPageSafeResourceUrl: SafeResourceUrl | undefined;
                const startupSplashWebPageUrl = json.startupSplashWebPageUrl;
                if (startupSplashWebPageUrl === undefined || startupSplashWebPageUrl.length === 0) {
                    startupSplashWebPageSafeResourceUrl = undefined;
                } else {
                    const uRL = URL.parse(startupSplashWebPageUrl, origin);
                    if (uRL === null) {
                        throw new ConfigError(ErrorCode.ConfigService_InvalidStartupSplashWebPageUrl, serviceName, startupSplashWebPageUrl);
                    } else {
                        startupSplashWebPageSafeResourceUrl = sanitizer.bypassSecurityTrustResourceUrl(uRL.href);
                    }
                }

                let desktopBarLeftImageUrl = json.desktopBarLeftImageUrl;
                if (desktopBarLeftImageUrl !== undefined && desktopBarLeftImageUrl.length > 0) {
                    const uRL = URL.parse(desktopBarLeftImageUrl, origin);
                    if (uRL === null) {
                        throw new ConfigError(ErrorCode.ConfigService_InvalidDesktopBarLeftImageUrl, serviceName, desktopBarLeftImageUrl);
                    } else {
                        desktopBarLeftImageUrl = uRL.href;
                    }
                }

                return {
                    startupSplashWebPageSafeResourceUrl,
                    desktopBarLeftImageUrl,
                };
            }
        }
    }
}
