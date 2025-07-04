import {
    Integer,
    MultiEvent,
} from '@pbkware/js-utils';
import {
    ExtensionHandle,
    ExtensionInfo,
    ExtStringId,
    RegisteredExtension,
    StringId
} from '@plxtra/motif-core';

export interface ExtensionsAccessService {
    readonly internalHandle: ExtensionHandle;
    readonly internalRegisteredExtensionInfo: ExtensionInfo;

    readonly installedArray: RegisteredExtension[];
    readonly installedCount: Integer;
    readonly uninstalledBundledArray: ExtensionInfo[];
    readonly uninstalledBundledCount: Integer;

    getRegisteredExtensionInfo(handle: ExtensionHandle): ExtensionInfo;

    installExtension(info: ExtensionInfo, loadAlso: boolean): void;
    uninstallExtension(handle: ExtensionHandle): void;

    getInstalledExtension(idx: Integer): RegisteredExtension;
    getUninstalledBundledExtensionInfo(idx: Integer): ExtensionInfo;
    findInstalledExtension(publisher: string, name: string): RegisteredExtension | undefined;

    internalToExtStringId(internalStringId: StringId): ExtStringId;

    subscribeInstalledListChangedEvent(handler: ExtensionsAccessService.InstalledListChangedEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeInstalledListChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeUninstalledBundledListChangedEvent(
        handler: ExtensionsAccessService.UnInstalledBundledListChangedEventHandler
    ): MultiEvent.DefinedSubscriptionId;
    unsubscribeUninstalledBundledListChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;

    subscribeInstallErrorEvent(handler: ExtensionsAccessService.InstallErrorEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeInstallErrorEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace ExtensionsAccessService {
    export const enum ListChangeTypeId {
        Insert,
        Remove,
    }
    export type InstalledListChangedEventHandler = (this: void, listChangeTypeId: ListChangeTypeId, idx: Integer,
        extension: RegisteredExtension, listTransitioning: boolean
    ) => void;
    export type UnInstalledBundledListChangedEventHandler = (this: void, listChangeTypeId: ListChangeTypeId, idx: Integer,
        info: ExtensionInfo, listTransitioning: boolean
    ) => void;
    export type InstallErrorEventHandler = (this: void, info: ExtensionInfo, errorText: string) => void;
}
