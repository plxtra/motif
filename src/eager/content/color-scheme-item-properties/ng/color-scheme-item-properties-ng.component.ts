import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject, viewChild } from '@angular/core';
import { isReadable as tinyColorIsReadable, readability as tinyColorReadability } from '@ctrl/tinycolor';
import { EnumInfoOutOfOrderError, Integer, UnreachableCaseError, delay1Tick } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction, NumberUiAction } from '@pbkware/ui-action';
import {
    ColorScheme,
    ColorSettings,
    StringId,
    Strings,
} from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, IntegerCaptionedRadioNgComponent, NumberInputNgComponent } from 'controls-ng-api';
import { ColorControlsNgComponent } from '../../color-controls/ng-api';
import { MultiColorPickerNgComponent } from '../../multi-color-picker/ng/multi-color-picker-ng.component';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-item-properties',
    templateUrl: './color-scheme-item-properties-ng.component.html',
    styleUrls: ['./color-scheme-item-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ColorSchemeItemPropertiesNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private _cdr = inject(ChangeDetectorRef);

    private static typeInstanceCreateCount = 0;

    itemChangedEvent: ColorSchemeItemPropertiesComponent.ItemChangedEvent;

    public hasBkgd = true;
    public hasFore = true;

    private readonly _bkgdControlsSignal = viewChild.required<ColorControlsNgComponent>('bkgdControls');
    private readonly _multiPickerSignal = viewChild.required<MultiColorPickerNgComponent>('multiPicker');
    private readonly _foreControlsSignal = viewChild.required<ColorControlsNgComponent>('foreControls');
    private readonly _readabilityLabelSignal = viewChild.required<CaptionLabelNgComponent>('readabilityLabel');
    private readonly _readabilityInputSignal = viewChild.required<NumberInputNgComponent>('readabilityControl');
    private readonly _hueSaturationRadioSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('hueSaturationRadio');
    private readonly _valueSaturationRadioSignal = viewChild.required<IntegerCaptionedRadioNgComponent>('valueSaturationRadio');

    private _bkgdControls: ColorControlsNgComponent;
    private _multiPicker: MultiColorPickerNgComponent;
    private _foreControls: ColorControlsNgComponent;
    private _readabilityLabel: CaptionLabelNgComponent;
    private _readabilityInput: NumberInputNgComponent;
    private _hueSaturationRadio: IntegerCaptionedRadioNgComponent;
    private _valueSaturationRadio: IntegerCaptionedRadioNgComponent;

    private _colorSettings: ColorSettings;
    private _readabilityUiAction: NumberUiAction;
    private _pickerTypeUiAction: IntegerListSelectItemUiAction;

    private _itemId: ColorScheme.ItemId | undefined;
    private _width: Integer;

    constructor() {
        const settingsNgService = inject(SettingsNgService);

        super(++ColorSchemeItemPropertiesNgComponent.typeInstanceCreateCount);

        this._colorSettings = settingsNgService.service.color;

        this._readabilityUiAction = this.createReadbilityUiAction();
        this._pickerTypeUiAction = this.createPickerTypeUiAction();
    }

    get approximateWidth() { return this._multiPicker.approximateWidth; }

    get itemId() { return this._itemId; }
    set itemId(value: ColorScheme.ItemId | undefined) {
        this._itemId = value;
        let hasBkgd: boolean;
        let hasFore: boolean;
        if (this._itemId === undefined) {
            hasBkgd = false;
            hasFore = false;
        } else {
            hasBkgd = ColorScheme.Item.idHasBkgd(this._itemId);
            hasFore = ColorScheme.Item.idHasFore(this._itemId);
        }

        let checkRequired = false;
        if (hasBkgd !== this.hasBkgd) {
            this.hasBkgd = hasBkgd;
            checkRequired = true;
        }

        if (hasFore !== this.hasFore) {
            this.hasFore = hasFore;
            checkRequired = true;
        }

        if (checkRequired) {
            this.markForCheck();
        }

        this._bkgdControls.itemId = value;
        this._foreControls.itemId = value;

        this.updateReadability();
    }

    ngAfterViewInit() {
        this._bkgdControls = this._bkgdControlsSignal();
        this._multiPicker = this._multiPickerSignal();
        this._foreControls = this._foreControlsSignal();
        this._readabilityLabel = this._readabilityLabelSignal();
        this._readabilityInput = this._readabilityInputSignal();
        this._hueSaturationRadio = this._hueSaturationRadioSignal();
        this._valueSaturationRadio = this._valueSaturationRadioSignal();

        this._bkgdControls.bkdgFore = ColorScheme.BkgdForeId.Bkgd;
        this._bkgdControls.position = ColorControlsNgComponent.Position.Top;
        this._bkgdControls.itemChangedEventer = (itemId) => this.handleItemChangedEvent(itemId);
        this._bkgdControls.colorInternallyChangedEventer = (rgb) => this._multiPicker.setColor(ColorScheme.BkgdForeId.Bkgd, rgb);
        this._bkgdControls.requestActiveInPickerEventer = () => this._multiPicker.requestActive(ColorScheme.BkgdForeId.Bkgd);
        this._bkgdControls.colorHiddenInPickerChangedEventer =
            (hidden) => this._multiPicker.setColorHidden(ColorScheme.BkgdForeId.Bkgd, hidden);

        this._foreControls.bkdgFore = ColorScheme.BkgdForeId.Fore;
        this._foreControls.position = ColorControlsNgComponent.Position.Bottom;
        this._foreControls.itemChangedEventer = (itemId) => this.handleItemChangedEvent(itemId);
        this._foreControls.colorInternallyChangedEventer = (rgb) => this._multiPicker.setColor(ColorScheme.BkgdForeId.Fore, rgb);
        this._foreControls.requestActiveInPickerEventer = () => this._multiPicker.requestActive(ColorScheme.BkgdForeId.Fore);
        this._foreControls.colorHiddenInPickerChangedEventer =
            (hidden) => this._multiPicker.setColorHidden(ColorScheme.BkgdForeId.Fore, hidden);

        this._multiPicker.inputChangeEventer = (backForeId, rgb) => {
            switch (backForeId) {
                case ColorScheme.BkgdForeId.Bkgd:
                    this._bkgdControls.setColor(rgb);
                    break;
                case ColorScheme.BkgdForeId.Fore:
                    this._foreControls.setColor(rgb);
                    break;
                default:
                    throw new UnreachableCaseError('CSIPNCNAVI67723', backForeId);
            }
        };

        this._multiPicker.activeChangedEventer = (backForeId) => {
            this._bkgdControls.setActiveInPicker(backForeId === ColorScheme.BkgdForeId.Bkgd);
            this._foreControls.setActiveInPicker(backForeId === ColorScheme.BkgdForeId.Fore);
        };

        this._pickerTypeUiAction.pushValue(this._multiPicker.pickerType);

        delay1Tick(() => this.initialiseControls());
    }

    ngOnDestroy() {
        this.finalise();
    }

    processSettingsChanged() {
        this._bkgdControls.processSettingsChanged();
        this._foreControls.processSettingsChanged();
        this.updateReadability();
    }

    private handleItemChangedEvent(itemId: ColorScheme.ItemId) {
        this.itemChangedEvent(itemId);
        this.updateReadability();
    }

    private markForCheck() {
        this._cdr.markForCheck();
    }

    private createReadbilityUiAction() {
        const action = new NumberUiAction();
        action.pushTitle(Strings[StringId.ColorSchemeItemProperties_ReadabilityTitle]);
        action.pushCaption(Strings[StringId.ColorSchemeItemProperties_ReadabilityCaption]);
        action.pushReadonly();
        return action;
    }

    private createPickerTypeUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.pushCaption(Strings[StringId.ColorSchemeItemProperties_PickerTypeCaption]);
        action.pushTitle(Strings[StringId.ColorSchemeItemProperties_PickerTypeTitle]);

        const entryCount = ColorSchemeItemPropertiesComponent.PickerType.idCount;
        const list = new Array<IntegerListSelectItemUiAction.ItemProperties>(entryCount);
        for (let id = 0; id < entryCount; id++) {
            list[id] = {
                item: id,
                caption: ColorSchemeItemPropertiesComponent.PickerType.idToCaption(id),
                title: ColorSchemeItemPropertiesComponent.PickerType.idToTitle(id),
            };
        }

        action.pushList(list);
        action.commitEvent = () => { this._multiPicker.pickerType = this._pickerTypeUiAction.definedValue; };
        return action;
    }

    private initialiseControls() {
        this._readabilityLabel.initialise(this._readabilityUiAction);
        this._readabilityInput.initialise(this._readabilityUiAction);
        this._readabilityInput.readonlyAlways = true;
        this._hueSaturationRadio.initialiseEnum(this._pickerTypeUiAction, MultiColorPickerNgComponent.PickerTypeId.HueSaturation);
        this._valueSaturationRadio.initialiseEnum(this._pickerTypeUiAction, MultiColorPickerNgComponent.PickerTypeId.ValueSaturation);
    }

    private updateReadability() {
        if (this._itemId === undefined) {
            this._readabilityUiAction.pushDisabled();
            this._readabilityUiAction.pushValue(undefined);
        } else {
            if (!this.hasBkgd || !this.hasFore) {
                this._readabilityUiAction.pushDisabled();
                this._readabilityUiAction.pushValue(undefined);
            } else {
                const resolvedBkgdColor = this._colorSettings.getBkgd(this._itemId);
                const resolvedForeColor = this._colorSettings.getFore(this._itemId);
                const value = tinyColorReadability(resolvedBkgdColor, resolvedForeColor);
                this._readabilityUiAction.pushValue(value);

                const isReadable = tinyColorIsReadable(resolvedBkgdColor, resolvedForeColor);
                if (isReadable) {
                    this._readabilityUiAction.pushReadonly();
                } else {
                    this._readabilityUiAction.pushError(Strings[StringId.NotReadable]);
                }
            }
        }
    }

    private finalise() {
        this._readabilityUiAction.finalise();
        this._pickerTypeUiAction.finalise();
    }
}

export namespace ColorSchemeItemPropertiesComponent {
    export type ItemChangedEvent = (itemId: ColorScheme.ItemId) => void;

    export namespace PickerType {
        type Id = MultiColorPickerNgComponent.PickerTypeId;

        interface Info {
            readonly id: Id;
            readonly captionId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof MultiColorPickerNgComponent.PickerTypeId]: Info };

        const infosObject: InfosObject = {
            HueSaturation: {
                id: MultiColorPickerNgComponent.PickerTypeId.HueSaturation,
                captionId: StringId.ColorSchemeItemProperties_HueSaturationCaption,
                titleId: StringId.ColorSchemeItemProperties_HueSaturationTitle,
            },
            ValueSaturation: {
                id: MultiColorPickerNgComponent.PickerTypeId.ValueSaturation,
                captionId: StringId.ColorSchemeItemProperties_ValueSaturationCaption,
                titleId: StringId.ColorSchemeItemProperties_ValueSaturationTitle,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                if (infos[i].id !== i as MultiColorPickerNgComponent.PickerTypeId) {
                    throw new EnumInfoOutOfOrderError('ColorSchemeItemPropertiesComponent.PickerType', i, idToCaption(i));
                }
            }
        }

        function idToCaptionId(id: Id) {
            return infos[id].captionId;
        }

        export function idToCaption(id: Id) {
            return Strings[idToCaptionId(id)];
        }

        function idToTitleId(id: Id) {
            return infos[id].titleId;
        }

        export function idToTitle(id: Id) {
            return Strings[idToTitleId(id)];
        }
    }
}
