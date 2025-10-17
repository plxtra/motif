import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import { delay1Tick, JsonElement } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction, StringUiAction } from '@pbkware/ui-action';
import {
    ButtonUiAction,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { AdiNgService, CellPainterFactoryNgService, MarketsNgService, SymbolsNgService } from 'component-services-ng-api';
import { RowDataArrayGridNgComponent } from 'content-ng-api';
import {
    ButtonInputNgComponent,
    CaptionLabelNgComponent,
    IntegerEnumInputNgComponent,
    SvgButtonNgComponent,
    TextInputNgComponent
} from 'controls-ng-api';
import { BuiltinDitemNgComponentBaseNgDirective } from '../../ng/builtin-ditem-ng-component-base.directive';
import { DesktopAccessNgService } from '../../ng/desktop-access-ng.service';
import { SearchDitemFrame } from '../search-ditem-frame';

@Component({
    selector: 'app-search-ditem-ng',
    templateUrl: './search-ditem-ng.component.html',
    styleUrls: ['./search-ditem-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IntegerEnumInputNgComponent, ButtonInputNgComponent, SvgButtonNgComponent, TextInputNgComponent, CaptionLabelNgComponent, RowDataArrayGridNgComponent]
})
export class SearchDitemNgComponent extends BuiltinDitemNgComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public isMainMode = true;
    public isLayoutEditorMode = false;

    private readonly _categoryControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('categoryControl');
    private readonly _searchButtonControlComponentSignal = viewChild.required<ButtonInputNgComponent>('searchButtonControl');
    private readonly _detailsButtonControlComponentSignal = viewChild.required<ButtonInputNgComponent>('detailsButtonControl');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _locationControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('locationControl');
    private readonly _priceRangeControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('priceRangeControl');
    private readonly _keywordsControlComponentSignal = viewChild.required<TextInputNgComponent>('keywordsControl');
    private readonly _searchDescriptionLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('searchDescriptionLabel');
    private readonly _alertButtonControlComponentSignal = viewChild.required<ButtonInputNgComponent>('alertButtonControl');
    private readonly _gridComponentSignal = viewChild.required(RowDataArrayGridNgComponent);
    private readonly _layoutEditorContainerSignal = viewChild.required('layoutEditorContainer', { read: ViewContainerRef });

    private readonly _frame: SearchDitemFrame;

    private readonly _categoryUiAction: IntegerListSelectItemUiAction;
    private readonly _searchUiAction: ButtonUiAction;
    private readonly _detailsUiAction: ButtonUiAction;
    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;
    private readonly _locationUiAction: IntegerListSelectItemUiAction;
    private readonly _priceRangeUiAction: IntegerListSelectItemUiAction;
    private readonly _keywordsUiAction: StringUiAction;
    private readonly _searchDescriptionUiAction: StringUiAction;
    private readonly _alertUiAction: ButtonUiAction;

    private _categoryControlComponent: IntegerEnumInputNgComponent;
    private _searchButtonControlComponent: ButtonInputNgComponent;
    private _detailsButtonControlComponent: ButtonInputNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _locationControlComponent: IntegerEnumInputNgComponent;
    private _priceRangeControlComponent: IntegerEnumInputNgComponent;
    private _keywordsControlComponent: TextInputNgComponent;
    private _searchDescriptionLabelComponent: CaptionLabelNgComponent;
    private _alertButtonControlComponent: ButtonInputNgComponent;
    private _gridComponent: RowDataArrayGridNgComponent;
    private _layoutEditorContainer: ViewContainerRef;

    constructor() {
        super(++SearchDitemNgComponent.typeInstanceCreateCount);

        const marketsNgService = inject(MarketsNgService);
        const desktopAccessNgService = inject(DesktopAccessNgService);
        const symbolsNgService = inject(SymbolsNgService);
        const adiNgService = inject(AdiNgService);
        const cellPainterFactoryNgService = inject(CellPainterFactoryNgService);

        this._frame = new SearchDitemFrame(this, this.settingsService, marketsNgService.service, this.commandRegisterService,
            desktopAccessNgService.service, symbolsNgService.service, adiNgService.service, cellPainterFactoryNgService.service,
            this.rootHtmlElement,
        );

        this._categoryUiAction = this.createCategoryUiAction();
        this._searchUiAction = this.createSearchUiAction();
        this._detailsUiAction = this.createDetailsUiAction();
        this._columnsUiAction = this.createColumnsUiAction();
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction();
        this._locationUiAction = this.createLocationUiAction();
        this._priceRangeUiAction = this.createPriceRangeUiAction();
        this._keywordsUiAction = this.createKeywordsUiAction();
        this._searchDescriptionUiAction = this.createSearchDescriptionUiAction();
        this._alertUiAction = this.createAlertsUiAction();

        this.constructLoad(this.getInitialComponentStateJsonElement());
    }

    get ditemFrame() { return this._frame; }
    protected get stateSchemaVersion() { return SearchDitemNgComponent.stateSchemaVersion; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._categoryControlComponent = this._categoryControlComponentSignal();
        this._searchButtonControlComponent = this._searchButtonControlComponentSignal();
        this._detailsButtonControlComponent = this._detailsButtonControlComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._locationControlComponent = this._locationControlComponentSignal();
        this._priceRangeControlComponent = this._priceRangeControlComponentSignal();
        this._keywordsControlComponent = this._keywordsControlComponentSignal();
        this._searchDescriptionLabelComponent = this._searchDescriptionLabelComponentSignal();
        this._alertButtonControlComponent = this._alertButtonControlComponentSignal();
        this._gridComponent = this._gridComponentSignal();
        this._layoutEditorContainer = this._layoutEditorContainerSignal();

        delay1Tick(() => this.initialise());
    }

    protected override initialise() {
        this.initialiseComponents();
        super.initialise();
    }

    protected override finalise() {
        this._categoryUiAction.finalise();
        this._searchUiAction.finalise();
        this._detailsUiAction.finalise();
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
        this._locationUiAction.finalise();
        this._priceRangeUiAction.finalise();
        this._keywordsUiAction.finalise();
        this._searchDescriptionUiAction.finalise();
        this._alertUiAction.finalise();

        this._frame.finalise();
        super.finalise();
    }

    protected constructLoad(element: JsonElement | undefined) {
        // nothing to load
    }

    protected save(element: JsonElement) {
        // nothing to save
    }

    private createCategoryUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.SearchDitem_CategoryCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_CategoryTitle]);
        const list: IntegerListSelectItemUiAction.ItemProperties[] = [
            {
                item: 0,
                caption: Strings[StringId.SearchDitem_Category_HolidayCaption],
                title: Strings[StringId.SearchDitem_Category_HolidayTitle],
            }
        ];
        action.pushList(list, undefined);
        // action.commitEvent = () => {};
        return action;
    }

    private createSearchUiAction() {
        const commandName = InternalCommand.Id.Search;
        const displayId = StringId.SearchDitem_SearchCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.SearchDitem_SearchTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createDetailsUiAction() {
        const commandName = InternalCommand.Id.ShowSelectedSearchResultDetails;
        const displayId = StringId.Details;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.ShowSelectedAlertDetailsTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createAutoSizeColumnWidthsUiAction() {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        // action.signalEvent = () => this.handleAutoSizeColumnWidthsUiActionSignalEvent();
        return action;
    }

    private createColumnsUiAction() {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createLocationUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.SearchDitem_LocationCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_LocationTitle]);
        const list: IntegerListSelectItemUiAction.ItemProperties[] = [
            {
                item: 0,
                caption: Strings[StringId.SearchDitem_Location_UsArizonaCaption],
                title: Strings[StringId.SearchDitem_Location_UsArizonaTitle],
            }
        ];
        action.pushList(list, undefined);
        // action.commitEvent = () => {};
        return action;
    }

    private createPriceRangeUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.SearchDitem_PriceRangeCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_PriceRangeTitle]);
        const list: IntegerListSelectItemUiAction.ItemProperties[] = [
            {
                item: 0,
                caption: Strings[StringId.SearchDitem_PriceRange_10000To20000Caption],
                title: Strings[StringId.SearchDitem_PriceRange_10000To20000Title],
            }
        ];
        action.pushList(list, undefined);
        // action.commitEvent = () => {};
        return action;
    }

    private createKeywordsUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SearchDitem_KeywordsCaption]);
        action.pushTitle(Strings[StringId.SearchDitem_KeywordsTitle]);
        action.pushPlaceholder(Strings[StringId.Keywords]);
        // action.commitEvent = () => this.handleSymbolCommitEvent();
        // action.inputEvent = () => this.handleSymbolInputEvent();
        return action;
    }

    private createAlertsUiAction() {
        const commandName = InternalCommand.Id.DeleteSelectedAlert;
        const displayId = StringId.SearchDitem_AlertCaption;
        const command = this.commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new ButtonUiAction(command);
        action.pushTitle(Strings[StringId.SearchDitem_AlertTitle]);
        action.pushUnselected();
        // action.signalEvent = () => this.handleColumnsUiActionSignalEvent();
        return action;
    }

    private createSearchDescriptionUiAction() {
        const action = new StringUiAction();
        action.valueRequired = false;
        action.pushTitle(Strings[StringId.SearchDitem_SearchDescriptionTitle]);
        action.pushCaption('(Parameters: Holiday, USA - Arizona, 10000-20000)');
        return action;
    }

    private initialiseComponents() {
        this._categoryControlComponent.initialise(this._categoryUiAction);
        this._searchButtonControlComponent.initialise(this._searchUiAction);
        this._detailsButtonControlComponent.initialise(this._detailsUiAction);
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._locationControlComponent.initialise(this._locationUiAction);
        this._priceRangeControlComponent.initialise(this._priceRangeUiAction);
        this._keywordsControlComponent.initialise(this._keywordsUiAction);
        this._searchDescriptionLabelComponent.initialise(this._searchDescriptionUiAction);
        this._alertButtonControlComponent.initialise(this._alertUiAction);

        // this._frame.open();
    }
}

export namespace SearchDitemNgComponent {
    export const stateSchemaVersion = '2';
}
