import { BrokerageAccountGroup, DataIvemId, SingleBrokerageAccountGroup } from '../adi';
import { MenuBar } from '../controls/menu-bar-api';
import { Frame } from '../frame/frame-api';
import { JsonValue } from '../sys';

/** @public */
export interface LocalDesktop {
    readonly lastFocusedDataIvemId: DataIvemId | undefined;
    readonly lastFocusedBrokerageAccountGroup: BrokerageAccountGroup | undefined;
    readonly lastSingleBrokerageAccountGroup: SingleBrokerageAccountGroup | undefined;

    readonly menuBar: MenuBar;

    dataIvemId: DataIvemId | undefined;
    brokerageAccountGroup: BrokerageAccountGroup | undefined;

    // editOrderRequest(orderPad: OrderPad): void;

    getFrameEventer: LocalDesktop.GetFrameEventHandler | undefined;
    releaseFrameEventer: LocalDesktop.ReleaseFrameEventHandler | undefined;

    readonly frames: Frame[];

    createFrame(frameTypeName: string, tabText?: string, initialState?: JsonValue,
        preferredLocation?: LocalDesktop.PreferredLocation
    ): Frame;
    destroyFrame(frame: Frame): void;
    destroyAllFrames(): void;
}

/** @public */
export namespace LocalDesktop {
    export type GetFrameEventHandler = (this: void, frameSvcProxy: Frame.SvcProxy) => Frame;
    export type ReleaseFrameEventHandler = (this: void, frame: Frame) => void;

    export const enum PreferredLocationEnum {
        FirstTabset = 'FirstTabset',
        NextToFocused = 'NextToFocused',
    }
    export type PreferredLocation = keyof typeof PreferredLocationEnum;
}
