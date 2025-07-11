import { BrokerageAccountGroup, DataIvemId, Frame, JsonElement } from '../types';
import { ContentSvc } from './content-svc';
import { ControlsSvc } from './controls-svc';

/** @public */
export interface FrameSvc extends Frame.SvcProxy {
    readonly frameTypeName: string;
    readonly initialPersistState: JsonElement | undefined;

    readonly width: number;
    readonly height: number;

    readonly focused: boolean;
    readonly shown: boolean;

    tabText: string;

    readonly dataIvemId: DataIvemId | undefined;
    readonly olddataIvemId: DataIvemId | undefined;

    readonly dataIvemIdValid: boolean;
    readonly olddataIvemIdValid: boolean;

    dataIvemIdLinkable: boolean;
    dataIvemIdLinked: boolean;

    allBrokerageAccountGroupSupported: boolean;

    readonly brokerageAccountGroup: BrokerageAccountGroup | undefined;
    readonly oldbrokerageAccountGroup: BrokerageAccountGroup | undefined;

    brokerageAccountGroupLinkable: boolean;
    brokerageAccountGroupLinked: boolean;

    // readonly ditemCommandProcessor

    primary: boolean;

    readonly controlsSvc: ControlsSvc;
    readonly contentSvc: ContentSvc;

    savePersistStateEventer: FrameSvc.SavePersistStateEventHandler | undefined;
    shownEventer: FrameSvc.ShownEventHandler | undefined;
    hiddenEventer: FrameSvc.HiddenEventHandler | undefined;
    focusedEventer: FrameSvc.FocusedEventHandler | undefined;
    blurredEventer: FrameSvc.BlurredEventHandler | undefined;
    resizedEventer: FrameSvc.ResizedEventHandler | undefined;
    applySymbolEventer: FrameSvc.ApplySymbolEventHandler | undefined;
    symbolLinkedChangedEventer: FrameSvc.SymbolLinkedChangedEventHandler | undefined;
    applyBrokerageAccountGroupEventer: FrameSvc.ApplyBrokerageAccountGroupEventHandler | undefined;
    brokerageAccountGroupLinkedChangedEventer: FrameSvc.BrokerageAccountGroupLinkedChangedEventHandler | undefined;
    primaryChangedEventer: FrameSvc.PrimaryChangedEventHandler | undefined;

    focus(): void;
    blur(): void;
    destroyAllComponents(): void;

    setDataIvemId(value: DataIvemId, force?: boolean): void;
    setBrokerageAccountGroup(value: BrokerageAccountGroup, force?: boolean): void;
}

/** @public */
export namespace FrameSvc {
    export type SavePersistStateEventHandler = (this: void, element: JsonElement) => void;
    export type ShownEventHandler = (this: void) => void;
    export type HiddenEventHandler = (this: void) => void;
    export type FocusedEventHandler = (this: void) => void;
    export type BlurredEventHandler = (this: void) => void;
    export type ResizedEventHandler = (this: void) => void;
    export type ApplySymbolEventHandler = (this: void, dataIvemId: DataIvemId | undefined, selfInitiated: boolean) => boolean;
    export type SymbolLinkedChangedEventHandler = (this: void) => void;
    export type ApplyBrokerageAccountGroupEventHandler = (this: void, group: BrokerageAccountGroup | undefined,
        selfInitiated: boolean
    ) => boolean;
    export type BrokerageAccountGroupLinkedChangedEventHandler = (this: void) => void;
    export type PrimaryChangedEventHandler = (this: void) => void;
}
