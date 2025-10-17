import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, viewChild, ViewContainerRef } from '@angular/core';
import {
    AssertInternalError,
    delay1Tick,
    getErrorMessage,
    Integer,
    ModifierKey,
    ModifierKeyId
} from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    assert,
    ColorScheme,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { SplitAreaSize, SplitUnit, SplitComponent, SplitAreaComponent } from 'angular-split';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { RevRecordIndex } from 'revgrid';
import { ColorSchemeGridNgComponent } from '../../../color-scheme-grid/ng-api';
import { ColorSchemeItemPropertiesNgComponent } from '../../../color-scheme-item-properties/ng-api';
import { ColorSchemePresetCodeNgComponent } from '../../../color-scheme-preset-code/ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-color-settings',
    templateUrl: './color-settings-ng.component.html',
    styleUrls: ['./color-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SplitComponent, SplitAreaComponent, ColorSchemeGridNgComponent, SvgButtonNgComponent, ColorSchemeItemPropertiesNgComponent]
})
export class ColorSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public isPresetCodeVisible = false;
    public splitUnit: SplitUnit = 'percent';
    public gridSize: SplitAreaSize;
    public gridMinSize: SplitAreaSize;
    public splitterGutterSize = 3;

    private readonly _leftAndRightDivSignal = viewChild.required<ElementRef<HTMLElement>>('leftAndRightDiv');
    private readonly _gridComponentSignal = viewChild.required<ColorSchemeGridNgComponent>('grid');
    private readonly _saveSchemeButtonSignal = viewChild.required<SvgButtonNgComponent>('saveSchemeButton');
    private readonly _itemPropertiesComponentSignal = viewChild.required<ColorSchemeItemPropertiesNgComponent>('itemProperties');
    private readonly _presetCodeContainerSignal = viewChild.required('presetCodeContainer', { read: ViewContainerRef });

    private _leftAndRightDiv: ElementRef<HTMLElement>;
    private _gridComponent: ColorSchemeGridNgComponent;
    private _saveSchemeButton: SvgButtonNgComponent;
    private _itemPropertiesComponent: ColorSchemeItemPropertiesNgComponent;
    private _presetCodeContainer: ViewContainerRef;

    private _commandRegisterService: CommandRegisterService;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

    private _saveSchemeUiAction: IconButtonUiAction;

    private _currentRecordIndex: Integer | undefined;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++ColorSettingsNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._saveSchemeUiAction = this.createSaveSchemeUiAction();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._leftAndRightDiv = this._leftAndRightDivSignal();
        this._gridComponent = this._gridComponentSignal();
        this._saveSchemeButton = this._saveSchemeButtonSignal();
        this._itemPropertiesComponent = this._itemPropertiesComponentSignal();
        this._presetCodeContainer = this._presetCodeContainerSignal();

        delay1Tick(() => {
            this._gridComponent.recordFocusEventer = (recordIndex) => this.handleGridRecordFocusEvent(recordIndex);
            this._gridComponent.columnsViewWithsChangedEventer = () => this.updateWidths();
            const itemId = this._gridComponent.focusedRecordIndex;
            this._itemPropertiesComponent.itemId = itemId;
            this._itemPropertiesComponent.itemChangedEvent = (changedItemId) => this.handleItemPropertiesChangedEvent(changedItemId);
            // const totalWidth = this._leftAndRightDiv.nativeElement.offsetWidth;
            // this.gridSize = totalWidth - this._itemPropertiesComponent.approximateWidth;

            this.initialise();
        });
    }

    handleGuiLoadSelectChange(value: string) {
        this.colorSettings.loadColorScheme(value);
    }

    public handleSplitterDragEnd() {
        this._splitterDragged = true;
    }

    protected override finalise() {
        this._saveSchemeUiAction.finalise();
        this._resizeObserver.disconnect();
        super.finalise();
    }

    protected processSettingsChanged() {
        this._itemPropertiesComponent.processSettingsChanged();
        this._gridComponent.invalidateAll();
    }

    private handleGridRecordFocusEvent(recordIndex: RevRecordIndex | undefined) {
        this.updateCurrentRecordIndex(recordIndex);
    }

    private handleItemPropertiesChangedEvent(itemId: ColorScheme.ItemId) {
        this._gridComponent.invalidateRecord(itemId);
    }

    private handleSaveSchemeAction(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        if (ModifierKey.idSetIncludes(downKeys, ModifierKeyId.Alt)) {
            this.showPresetCode();
        }
    }

    private createSaveSchemeUiAction() {
        const commandName = InternalCommand.Id.ColorSettings_SaveScheme;
        const displayId = StringId.SaveColorSchemeCaption;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SaveColorSchemeToADifferentNameTitle]);
        action.pushIcon(IconButtonUiAction.IconId.Save);
        action.signalEvent = (signalTypeId, downKeys) => this.handleSaveSchemeAction(signalTypeId, downKeys);
        return action;
    }

    private updateCurrentRecordIndex(index: RevRecordIndex | undefined): void {
        if (index !== this._currentRecordIndex) {
            this._currentRecordIndex = index;
            this._itemPropertiesComponent.itemId = index;
        }
    }

    private initialise() {
        this._saveSchemeButton.initialise(this._saveSchemeUiAction);

        this._resizeObserver = new ResizeObserver(() => this.updateWidths());
        this._resizeObserver.observe(this._leftAndRightDiv.nativeElement);
        this._gridComponent.waitLastServerNotificationRendered(true).then(
            () => {
                this.updateWidths();
            },
            (error: unknown) => { throw AssertInternalError.createIfNotError(error, 'CSNCI21199'); }
        );

        this.processSettingsChanged();
    }

    private showPresetCode() {
        this.isPresetCodeVisible = true;

        const closePromise = ColorSchemePresetCodeNgComponent.open(this._presetCodeContainer, this.colorSettings);
        closePromise.then(
            () => {
                this.closePresetCode();
            },
            (reason: unknown) => {
                const errorText = getErrorMessage(reason);
                window.motifLogger.logError(`ColorSchemePresetCode error: ${errorText}`);
                this.closePresetCode();
            }
        );

        this.markForCheck();
    }

    private closePresetCode() {
        this._presetCodeContainer.clear();
        this.isPresetCodeVisible = false;
        this.markForCheck();
    }

    private updateWidths() {
        const gridMinWidth = this._gridComponent.calculateFixedColumnsWidth() + ColorSettingsNgComponent.extraGridFixedColumnsEmWidth * this._gridComponent.emWidth;
        this.gridMinSize = gridMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this._leftAndRightDiv.nativeElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;
            const propertiesWidth = this._itemPropertiesComponent.approximateWidth;
            const gridActiveColumnsWidth = this._gridComponent.calculateActiveColumnsWidth();
            let calculatedGridWidth: Integer;
            if (availableTotalWidth >= (propertiesWidth + gridActiveColumnsWidth)) {
                calculatedGridWidth = gridActiveColumnsWidth;
            } else {
                if (availableTotalWidth > (propertiesWidth + gridMinWidth)) {
                    calculatedGridWidth = availableTotalWidth - propertiesWidth;
                } else {
                    calculatedGridWidth = gridMinWidth;
                }
            }

            this.splitUnit = 'pixel';
            this.gridSize = calculatedGridWidth;
            this.markForCheck();
        }
    }
}

export namespace ColorSettingsNgComponent {
    export const extraGridFixedColumnsEmWidth = 2;

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(ColorSettingsNgComponent);
        assert(componentRef.instance instanceof ColorSettingsNgComponent, 'CSCC909553');
        return componentRef.instance;
    }
}
