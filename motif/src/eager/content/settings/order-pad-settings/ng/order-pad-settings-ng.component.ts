import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewContainerRef,
    viewChild
} from '@angular/core';
import { delay1Tick } from '@pbkware/js-utils';
import { BooleanUiAction, IntegerListSelectItemUiAction } from '@pbkware/ui-action';
import {
    OrderType,
    StringId,
    Strings,
    TimeInForce
} from '@plxtra/motif-core';
import { SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, CheckboxInputNgComponent, IntegerEnumInputNgComponent } from 'controls-ng-api';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-order-pad-settings',
    templateUrl: './order-pad-settings-ng.component.html',
    styleUrls: ['./order-pad-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class OrderPadSettingsNgComponent extends SettingsComponentBaseNgDirective implements OnInit, OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    private readonly _reviewEnabledComponentSignal = viewChild.required<CaptionLabelNgComponent>('reviewEnabledLabel');
    private readonly _reviewEnabledControlComponentSignal = viewChild.required<CheckboxInputNgComponent>('reviewEnabledControl');
    private readonly _defaultOrderTypeIdLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('defaultOrderTypeIdLabel');
    private readonly _defaultOrderTypeIdControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('defaultOrderTypeIdControl');
    private readonly _defaultTimeInForceIdLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('defaultTimeInForceIdLabel');
    private readonly _defaultTimeInForceIdControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('defaultTimeInForceIdControl');

    private _reviewEnabledUiAction: BooleanUiAction;
    private _defaultOrderTypeIdUiAction: IntegerListSelectItemUiAction;
    private _defaultTimeInForceIdUiAction: IntegerListSelectItemUiAction;

    private _reviewEnabledComponent: CaptionLabelNgComponent;
    private _reviewEnabledControlComponent: CheckboxInputNgComponent;
    private _defaultOrderTypeIdLabelComponent: CaptionLabelNgComponent;
    private _defaultOrderTypeIdControlComponent: IntegerEnumInputNgComponent;
    private _defaultTimeInForceIdLabelComponent: CaptionLabelNgComponent;
    private _defaultTimeInForceIdControlComponent: IntegerEnumInputNgComponent;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, settingsNgService: SettingsNgService) {
        super(elRef, ++OrderPadSettingsNgComponent.typeInstanceCreateCount, cdr, settingsNgService.service);

        this._reviewEnabledUiAction = this.createReviewEnabledUiAction();
        this._defaultOrderTypeIdUiAction = this.createDefaultOrderTypeIdUiAction();
        this._defaultTimeInForceIdUiAction = this.createDefaultTimeInForceIdUiAction();

        this.processSettingsChanged();
    }

    ngOnInit() {
        this.pushValues();
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._reviewEnabledComponent = this._reviewEnabledComponentSignal();
        this._reviewEnabledControlComponent = this._reviewEnabledControlComponentSignal();
        this._defaultOrderTypeIdLabelComponent = this._defaultOrderTypeIdLabelComponentSignal();
        this._defaultOrderTypeIdControlComponent = this._defaultOrderTypeIdControlComponentSignal();
        this._defaultTimeInForceIdLabelComponent = this._defaultTimeInForceIdLabelComponentSignal();
        this._defaultTimeInForceIdControlComponent = this._defaultTimeInForceIdControlComponentSignal();

        delay1Tick(() => {
            this.initialiseComponents()
            this.markForCheck();
        });
    }

    protected processSettingsChanged() {
        this.pushValues();
    }

    protected override finalise() {
        this._reviewEnabledUiAction.finalise();
        this._defaultOrderTypeIdUiAction.finalise();
        this._defaultTimeInForceIdUiAction.finalise();

        super.finalise();
    }

    private handleDefaultOrderTypeIdUiActionCommit() {
        const enumValue = this._defaultOrderTypeIdUiAction.definedValue;
        if (enumValue < 0) {
            this.userSettings.orderPad_DefaultOrderTypeId = undefined;
        } else {
            this.userSettings.orderPad_DefaultOrderTypeId = enumValue;
        }
    }

    private handleDefaultTimeInForceIdUiActionCommit() {
        const enumValue = this._defaultTimeInForceIdUiAction.definedValue;
        if (enumValue < 0) {
            this.userSettings.orderPad_DefaultTimeInForceId = undefined;
        } else {
            this.userSettings.orderPad_DefaultTimeInForceId = enumValue;
        }
    }

    private createDefaultOrderTypeIdUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.SettingCaption_OrderPad_DefaultOrderTypeId]);
        action.pushTitle(Strings[StringId.SettingTitle_OrderPad_DefaultOrderTypeId]);

        const allIds = OrderType.all;
        const allIdsCount = allIds.length;
        const list = new Array<IntegerListSelectItemUiAction.ItemProperties>(allIdsCount + 1);

        const undefinedItemProperties: IntegerListSelectItemUiAction.ItemProperties = {
            item: -1,
            caption: Strings[StringId.Undefined],
            title: Strings[StringId.DefaultOrderTypeIdNotSpecified],
        };
        list[0] = undefinedItemProperties;

        let idx = 1;
        for (let i = 0; i < allIdsCount; i++) {
            const id = allIds[i];
            const itemProperties: IntegerListSelectItemUiAction.ItemProperties = {
                item: id,
                caption: OrderType.idToDisplay(id),
                title: OrderType.idToDisplay(id),
            };
            list[idx++] = itemProperties;
        }
        action.pushList(list, undefined);
        action.commitEvent = () => this.handleDefaultOrderTypeIdUiActionCommit();
        return action;
    }

    private createDefaultTimeInForceIdUiAction() {
        const action = new IntegerListSelectItemUiAction();
        action.valueRequired = false;
        action.pushCaption(Strings[StringId.SettingCaption_OrderPad_DefaultTimeInForceId]);
        action.pushTitle(Strings[StringId.SettingTitle_OrderPad_DefaultTimeInForceId]);

        const allIds = TimeInForce.all;
        const allIdsCount = allIds.length;
        const elementPropertiesArray = new Array<IntegerListSelectItemUiAction.ItemProperties>(allIdsCount + 1);

        const undefinedItemProperties: IntegerListSelectItemUiAction.ItemProperties = {
            item: -1,
            caption: Strings[StringId.Undefined],
            title: Strings[StringId.DefaultTimeInForceIdNotSpecified],
        };
        elementPropertiesArray[0] = undefinedItemProperties;

        let idx = 1;
        for (let i = 0; i < allIdsCount; i++) {
            const id = allIds[i];
            const itemProperties: IntegerListSelectItemUiAction.ItemProperties = {
                item: id,
                caption: TimeInForce.idToDisplay(id),
                title: TimeInForce.idToDisplay(id),
            };
            elementPropertiesArray[idx++] = itemProperties;
        }
        action.pushList(elementPropertiesArray, undefined);
        action.commitEvent = () => this.handleDefaultTimeInForceIdUiActionCommit();
        return action;
    }

    private createReviewEnabledUiAction() {
        const action = new BooleanUiAction();
        action.pushCaption(Strings[StringId.SettingCaption_OrderPad_ReviewEnabled]);
        action.pushTitle(Strings[StringId.SettingTitle_OrderPad_ReviewEnabled]);
        action.commitEvent = () => {
            this.userSettings.orderPad_ReviewEnabled = this._reviewEnabledUiAction.definedValue;
        };
        return action;
    }

    private initialiseComponents() {
        this._reviewEnabledComponent.initialise(this._reviewEnabledUiAction);
        this._reviewEnabledControlComponent.initialise(this._reviewEnabledUiAction);
        this._defaultOrderTypeIdLabelComponent.initialise(this._defaultOrderTypeIdUiAction);
        this._defaultOrderTypeIdControlComponent.initialise(this._defaultOrderTypeIdUiAction);
        this._defaultTimeInForceIdLabelComponent.initialise(this._defaultTimeInForceIdUiAction);
        this._defaultTimeInForceIdControlComponent.initialise(this._defaultTimeInForceIdUiAction);
    }

    private pushValues() {
        this._reviewEnabledUiAction.pushValue(this.userSettings.orderPad_ReviewEnabled);

        const defaultOrderTypeId = this.userSettings.orderPad_DefaultOrderTypeId === undefined ?
            OrderPadSettingsNgComponent.UndefinedOrderTypeIdEnumValue :
            this.userSettings.orderPad_DefaultOrderTypeId;
        this._defaultOrderTypeIdUiAction.pushValue(defaultOrderTypeId);

        const defaultTimeInForceId = this.userSettings.orderPad_DefaultTimeInForceId === undefined ?
            OrderPadSettingsNgComponent.UndefinedTimeInForceIdEnumValue :
            this.userSettings.orderPad_DefaultTimeInForceId;
        this._defaultTimeInForceIdUiAction.pushValue(defaultTimeInForceId);
    }
}

export namespace OrderPadSettingsNgComponent {

    export const UndefinedOrderTypeIdEnumValue = -1;
    export const UndefinedTimeInForceIdEnumValue = -1;

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(OrderPadSettingsNgComponent);
        return componentRef.instance;
    }
}
