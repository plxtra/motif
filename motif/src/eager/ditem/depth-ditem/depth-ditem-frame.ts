import { AssertInternalError, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    BidAskColumnLayoutDefinitions,
    CommandRegisterService,
    DataIvemId,
    DepthStyleId,
    MarketsService,
    SettingsService,
    SymbolsService,
} from '@plxtra/motif-core';
import { DepthFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class DepthDitemFrame extends BuiltinDitemFrame {
    private _depthFrame: DepthFrame | undefined;

    constructor(
        private _componentAccess: DepthDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopInterface: DitemFrame.DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Depth, _componentAccess,
            settingsService, marketsService, commandRegisterService, desktopInterface, symbolsMgr, adi
        );
    }

    get filterActive() { return this._depthFrame === undefined ? false : this._depthFrame.filterActive; }
    get filterXrefs() { return this._depthFrame === undefined ? [] : this._depthFrame.filterXrefs; }

    get initialised() { return this._depthFrame !== undefined; }

    initialise(ditemFrameElement: JsonElement | undefined, depthFrame: DepthFrame): void {
        this._depthFrame = depthFrame;

        let depthFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const depthFrameElementResult = ditemFrameElement.tryGetElement(DepthDitemFrame.JsonName.depthFrame);
            if (depthFrameElementResult.isOk()) {
                depthFrameElement = depthFrameElementResult.value;
            }
        }
        this._depthFrame.initialise(depthFrameElement);

        // this._contentFrame.initialiseWidths();

        this.applyLinked();
    }

    override save(element: JsonElement) {
        super.save(element);

        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFS21915');
        } else {
            const depthFrameElement = element.newElement(DepthDitemFrame.JsonName.depthFrame);
            this._depthFrame.save(depthFrameElement);
        }
    }

    override finalise() {
        if (this._depthFrame !== undefined) {
            this._depthFrame.finalise();
        }
        super.finalise();
    }

    open() {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFO21915');
        } else {
            const dataIvemId = this.dataIvemId;
            if (dataIvemId === undefined) {
                this._depthFrame.close();
                this.updateLockerName('');
            } else {
                this._depthFrame.open(dataIvemId, DepthStyleId.Full);
                this.updateLockerName(this.symbolsService.dataIvemIdToDisplay(dataIvemId));
            }
            this._componentAccess.notifyOpenedClosed(dataIvemId);
        }
    }

    // loadConstructLayoutConfig() {
    //     super.loadConstructLayoutConfig();
    // }

    toggleFilterActive() {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFTFA21915');
        } else {
            this._depthFrame.toggleFilterActive();
        }
    }

    setFilter(xrefs: string[]) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFSF21915');
        } else {
            this._depthFrame.setFilter(xrefs);
        }
    }

    expand(newRecordsOnly: boolean) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFE21915');
        } else {
            this._depthFrame.openExpand = true;
            this._depthFrame.expand(newRecordsOnly);
        }
    }

    rollUp(newRecordsOnly: boolean) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFRU21915');
        } else {
            this._depthFrame.openExpand = false;
            this._depthFrame.rollup(newRecordsOnly);
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFASACW21915');
        } else {
            this._depthFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    createAllowedSourcedFieldsColumnLayoutDefinitions() {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFCAFALD21915');
        } else {
            return this._depthFrame.createAllowedSourcedFieldsColumnLayoutDefinitions();
        }
    }

    applyColumnLayoutDefinitions(layout: BidAskColumnLayoutDefinitions) {
        if (this._depthFrame === undefined) {
            throw new AssertInternalError('DDFAGLD21915');
        } else {
            this._depthFrame.applyColumnLayoutDefinitions(layout);
        }
    }

    // adviseShown() {
    //     setTimeout(() => this._contentFrame.initialiseWidths(), 200);
    // }

    protected override applyDataIvemId(dataIvemId: DataIvemId | undefined, selfInitiated: boolean): boolean {
        super.applyDataIvemId(dataIvemId, selfInitiated);
        if (dataIvemId === undefined) {
            return false;
        } else {
            this._componentAccess.pushSymbol(dataIvemId);
            this.open();
            return true;
        }
    }
}

export namespace DepthDitemFrame {
    export namespace JsonName {
        export const depthFrame = 'depthFrame';
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        pushSymbol(dataIvemId: DataIvemId): void;
        notifyOpenedClosed(dataIvemId: DataIvemId | undefined): void;
    }
}
