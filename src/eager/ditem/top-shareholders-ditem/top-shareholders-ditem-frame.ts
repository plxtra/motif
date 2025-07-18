import { AssertInternalError, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    CommandRegisterService,
    DataIvemId,
    DataSourceDefinition,
    DataSourceOrReferenceDefinition,
    MarketsService,
    SettingsService,
    StringId,
    Strings,
    SymbolsService,
    TopShareholder,
    TopShareholderTableRecordSource
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { GridSourceFrame, LegacyTableRecordSourceDefinitionFactoryService } from 'content-internal-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class TopShareholdersDitemFrame extends BuiltinDitemFrame {

    private _gridSourceFrame: GridSourceFrame;
    private _recordSource: TopShareholderTableRecordSource;
    private _recordList: TopShareholder[];

    private _historicalDate: Date | undefined;
    private _compareDate: Date | undefined;

    constructor(
        private readonly _componentAccess: TopShareholdersDitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _tableRecordSourceDefinitionFactoryService: LegacyTableRecordSourceDefinitionFactoryService,
        private readonly _toastService: ToastService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.TopShareholders, _componentAccess,
            settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    get initialised() { return this._gridSourceFrame !== undefined; }

    initialise(gridSourceFrame: GridSourceFrame, frameElement: JsonElement | undefined): void {
        this._gridSourceFrame = gridSourceFrame;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        this._gridSourceFrame.setOpener(this.opener);
        this._gridSourceFrame.keepPreviousLayoutIfPossible = true;

        if (frameElement !== undefined) {
            const contentElementResult = frameElement.tryGetElement(TopShareholdersDitemFrame.JsonName.content);
            if (contentElementResult.isOk()) {
                const contentElement = contentElementResult.value;
                const keptLayoutElementResult = contentElement.tryGetElement(TopShareholdersDitemFrame.JsonName.keptLayout);
                if (keptLayoutElementResult.isOk()) {
                    const keptLayoutElement = keptLayoutElementResult.value;
                    const keptLayoutResult = RevColumnLayoutOrReferenceDefinition.tryCreateFromJson(keptLayoutElement);
                    if (keptLayoutResult.isOk()) {
                        this._gridSourceFrame.keptColumnLayoutOrReferenceDefinition = keptLayoutResult.value;
                    }
                }
            }
        }

        this.applyLinked();
    }

    public override finalise() {
        super.finalise();
    }

    override save(frameElement: JsonElement) {
        super.save(frameElement);

        const contentElement = frameElement.newElement(TopShareholdersDitemFrame.JsonName.content);
        const keptLayoutElement = contentElement.newElement(TopShareholdersDitemFrame.JsonName.keptLayout);
        const layoutDefinition = this._gridSourceFrame.createColumnLayoutOrReferenceDefinition();
        layoutDefinition.saveToJson(keptLayoutElement);
    }

    ensureOpened() {
        if (!this._gridSourceFrame.opened) {
            this.tryOpenGridSource();
        }
    }

    tryOpenGridSource() {
        const dataIvemId = this.dataIvemId;
        if (!this.getParamsFromGui() || dataIvemId === undefined) {
            return false;
        } else {
            const tableRecordSourceDefinition = this._tableRecordSourceDefinitionFactoryService.createTopShareholder(
                dataIvemId,
                this._historicalDate,
                this._compareDate
            );
            const dataSourceDefinition = new DataSourceDefinition(tableRecordSourceDefinition, undefined, undefined);
            const gridSourceOrReferenceDefinition = new DataSourceOrReferenceDefinition(dataSourceDefinition);
            const openPromise = this._gridSourceFrame.tryOpenGridSource(gridSourceOrReferenceDefinition, false);
            openPromise.then(
                (openResult) => {
                    if (openResult.isErr()) {
                        this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.TopShareholders]}: ${openResult.error}`);
                    } else {
                        this._recordSource = this._gridSourceFrame.grid.openedRecordSource as TopShareholderTableRecordSource;
                        this._recordList = this._recordSource.recordList;
                    }
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'TSDFTOGS44409', dataIvemId.name) }
            );
            return true;
        }
    }

    protected override applyDataIvemId(dataIvemId: DataIvemId | undefined, SelfInitiated: boolean): boolean {
        super.applyDataIvemId(dataIvemId, SelfInitiated);
        if (!this._componentAccess.canNewTableOnDataIvemIdApply()) {
            return false;
        } else {
            if (dataIvemId === undefined) {
                return false;
            } else {
                const done = this.tryOpenGridSource();
                if (done) {
                    return super.applyDataIvemId(dataIvemId, SelfInitiated);
                } else {
                    return false;
                }
            }
        }
    }

    private getParamsFromGui() {
        const params = this._componentAccess.getGuiParams();
        if (!params.valid) {
            return false;
        } else {
            this._historicalDate = params.historicalDate;
            this._compareDate = params.compareDate;
            return true;
        }
    }
}

export namespace TopShareholdersDitemFrame {
    export namespace JsonName {
        export const historicalDate = 'historicalDate';
        export const compareDate = 'compareDate';
        export const content = 'content';
        export const keptLayout = 'keptLayout';
    }

    export class GuiParams {
        valid: boolean;
        historicalDate: Date | undefined;
        compareDate: Date | undefined;
    }

    export interface TableParams {
        dataIvemId: DataIvemId;
        historicalDate: Date | undefined;
        compareDate: Date | undefined;
    }

    export interface ComponentAccess extends DitemFrame.ComponentAccess {
        getGuiParams(): GuiParams;
        notifyNewTable(params: TableParams): void;
        canNewTableOnDataIvemIdApply(): boolean;
    }
}
