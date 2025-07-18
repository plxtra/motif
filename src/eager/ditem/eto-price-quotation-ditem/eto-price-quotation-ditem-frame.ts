import { Integer, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    CommandRegisterService,
    MarketsService,
    SettingsService,
    SymbolsService
} from '@plxtra/motif-core';
import { GridSourceFrame, WatchlistFrame } from 'content-internal-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class EtoPriceQuotationDitemFrame extends BuiltinDitemFrame {
    private _watchlistFrame: WatchlistFrame;
    private _callPutGridSourceFrame: GridSourceFrame;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.EtoPriceQuotation,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._callPutGridSourceFrame !== undefined; }

    initialise(
        watchlistFrame: WatchlistFrame,
        callPutFrame: GridSourceFrame,
        frameJsonElement: JsonElement | undefined
    ): void {
        this._watchlistFrame = watchlistFrame;

        this._callPutGridSourceFrame = callPutFrame;

        if (frameJsonElement === undefined) {
            this.initialiseWatchlist(undefined);
            this.initialiseCallPut(undefined);
        } else {
            const watchlistJsonElementResult = frameJsonElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.watch);
            if (watchlistJsonElementResult.isErr()) {
                this.initialiseWatchlist(undefined);
            } else {
                this.initialiseWatchlist(watchlistJsonElementResult.value);
            }

            const callPutJsonElementResult = frameJsonElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.callPut);
            if (callPutJsonElementResult.isErr()) {
                this.initialiseCallPut(undefined);
            } else {
                this.initialiseCallPut(callPutJsonElementResult.value);
            }
        }

        // something

        this.applyLinked();
    }

    override save(frameElement: JsonElement) {
        super.save(frameElement);

        const watchElement = frameElement.newElement(EtoPriceQuotationDitemFrame.JsonName.watch);
        this.saveWatchCallPut(this._watchlistFrame, watchElement);
        const callPutElement = frameElement.newElement(EtoPriceQuotationDitemFrame.JsonName.callPut);
        this.saveWatchCallPut(this._callPutGridSourceFrame, callPutElement);
    }

    private handleRecordFocusEvent(newRecordIndex: Integer | undefined, oldRecordIndex: Integer | undefined) {
        // ToDo
    }

    private handleRecordFocusClickEvent(recordIndex: Integer, fieldIndex: Integer) {
        // ToDo
    }

    private handleRecordFocusDblClickEvent(recordIndex: Integer, fieldIndex: Integer) {
        // ToDo
    }

    private handleRequireDefaultTableDefinitionEvent() {
        // ToDo
    }

    private initialiseWatchlist(jsonElement: JsonElement | undefined) {
        let keptColumnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition | undefined;
        if (jsonElement !== undefined) {
            const elementResult = jsonElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.watch);
            if (elementResult.isOk()) {
                const watchElement = elementResult.value;
                const keptLayoutElementResult = watchElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.keptLayout);
                if (keptLayoutElementResult.isOk()) {
                    const keptLayoutElement = keptLayoutElementResult.value;
                    const keptLayoutResult = RevColumnLayoutOrReferenceDefinition.tryCreateFromJson(keptLayoutElement);
                    if (keptLayoutResult.isOk()) {
                        keptColumnLayoutOrReferenceDefinition = keptLayoutResult.value;
                    }
                }
            }
        }

        this._watchlistFrame.initialise(this.opener, keptColumnLayoutOrReferenceDefinition, true);
    }

    private initialiseCallPut(jsonElement: JsonElement | undefined) {
        let keptColumnLayoutOrReferenceDefinition: RevColumnLayoutOrReferenceDefinition | undefined;
        if (jsonElement !== undefined) {
            const elementResult = jsonElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.callPut);
            if (elementResult.isOk()) {
                const callPutElement = elementResult.value;
                const keptLayoutElementResult = callPutElement.tryGetElement(EtoPriceQuotationDitemFrame.JsonName.keptLayout);
                if (keptLayoutElementResult.isOk()) {
                    const keptLayoutElement = keptLayoutElementResult.value;
                    const keptLayoutResult = RevColumnLayoutOrReferenceDefinition.tryCreateFromJson(keptLayoutElement);
                    if (keptLayoutResult.isOk()) {
                        this._callPutGridSourceFrame.keptColumnLayoutOrReferenceDefinition = keptLayoutResult.value;
                    }
                }
            }
        }

        this._callPutGridSourceFrame.initialise(this.opener, keptColumnLayoutOrReferenceDefinition, true);
    }

    private saveWatchCallPut(frame: GridSourceFrame, element: JsonElement) {
        const keptLayoutElement = element.newElement(EtoPriceQuotationDitemFrame.JsonName.keptLayout);
        const layoutDefinition = frame.createColumnLayoutOrReferenceDefinition();
        layoutDefinition.saveToJson(keptLayoutElement);
    }
}

export namespace EtoPriceQuotationDitemFrame {
    export namespace JsonName {
        export const watch = 'watch';
        export const callPut = 'callPut';
        export const keptLayout = 'keptLayout';
    }
}
