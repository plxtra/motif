import { AssertInternalError, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    AllowedSourcedFieldsColumnLayoutDefinition,
    CommandRegisterService,
    DataIvemId,
    MarketsService,
    SettingsService,
    SymbolsService
} from '@plxtra/motif-core';
import { TradesFrame } from 'content-internal-api';
import { RevColumnLayoutDefinition } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class TradesDitemFrame extends BuiltinDitemFrame {
    private _tradesFrame: TradesFrame | undefined;

    constructor(
        private _componentAccess: TradesDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsMgr: SymbolsService,
        adi: AdiService
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Trades, _componentAccess,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsMgr, adi
        );
    }

    get initialised() { return this._tradesFrame !== undefined; }

    initialise(ditemFrameElement: JsonElement | undefined, tradesFrame: TradesFrame): void {
        this._tradesFrame = tradesFrame;

        let tradesFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const tradesFrameElementResult = ditemFrameElement.tryGetElement(TradesDitemFrame.JsonName.tradesFrame);
            if (tradesFrameElementResult.isOk()) {
                tradesFrameElement = tradesFrameElementResult.value;
            }
        }
        this._tradesFrame.initialise(tradesFrameElement);

        this.applyLinked();
    }

    override finalise() {
        if (this._tradesFrame !== undefined) {
            this._tradesFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFS44407');
        } else {
            const tradesFrameElement = ditemFrameElement.newElement(TradesDitemFrame.JsonName.tradesFrame);
            this._tradesFrame.saveLayoutToConfig(tradesFrameElement);
        }
    }

    open() {
        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFO44407');
        } else {
            const dataIvemId = this.dataIvemId;
            if (dataIvemId === undefined) {
                this._tradesFrame.close();
                this._componentAccess.notifyOpenedClosed(undefined, undefined);
            } else {
                const historicalDate = this._componentAccess.getHistoricalDate();
                this._tradesFrame.open(dataIvemId, historicalDate);

                this.updateLockerName(this.symbolsService.dataIvemIdToDisplay(dataIvemId));
                this._componentAccess.notifyOpenedClosed(dataIvemId, historicalDate);
            }
        }
    }

    historicalDateCommit() {
        if (this.dataIvemId !== undefined) {
            this.open();
        }
    }

    autoSizeAllColumnWidths(widenOnly: boolean) {
        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFASACW44407');
        } else {
            this._tradesFrame.autoSizeAllColumnWidths(widenOnly);
        }
    }

    createAllowedSourcedFieldsColumnLayoutDefinition(): AllowedSourcedFieldsColumnLayoutDefinition | undefined {
        if (this._tradesFrame === undefined) {
            throw new AssertInternalError('TDFCAFALD44407');
        } else {
            return this._tradesFrame.createAllowedSourcedFieldsColumnLayoutDefinition();
        }
    }

    applyColumnLayoutDefinition(layoutDefinition: RevColumnLayoutDefinition): void {
        if (this._tradesFrame === undefined) {
            throw new Error('Condition not handled [ID:5326171853]');
        } else {
            this._tradesFrame.applyColumnLayoutDefinition(layoutDefinition);
        }
    }

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

export namespace TradesDitemFrame {
    export namespace JsonName {
        export const tradesFrame = 'tradesFrame';
    }

    export type OpenedEventHandler = (this: void) => void;

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        getHistoricalDate(): Date | undefined;
        pushSymbol(dataIvemId: DataIvemId): void;
        notifyOpenedClosed(dataIvemId: DataIvemId | undefined, historicalDate: Date | undefined): void;
    }
}
