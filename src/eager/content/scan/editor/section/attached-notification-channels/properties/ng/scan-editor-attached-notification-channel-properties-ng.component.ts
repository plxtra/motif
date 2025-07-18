import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import { IntegerListSelectItemUiAction, NumberUiAction } from '@pbkware/ui-action';
import {
    LockerScanAttachedNotificationChannel,
    NotificationChannel,
    StringId,
    Strings
} from '@plxtra/motif-core';
import {
    CaptionLabelNgComponent,
    IntegerEnumInputNgComponent,
    IntegerTextInputNgComponent
} from 'controls-ng-api';
import { ComponentBaseNgDirective } from '../../../../../../../component/ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-scan-editor-attached-notification-channel-properties',
    templateUrl: './scan-editor-attached-notification-channel-properties-ng.component.html',
    styleUrls: ['./scan-editor-attached-notification-channel-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ScanEditorAttachedNotificationChannelPropertiesNgComponent extends ContentComponentBaseNgDirective implements  OnDestroy, AfterViewInit {

    public readonly channelNameLabel: string;
    public channelName = '';
    public channelId = '';

    private readonly _minimumStableLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('minimumStableLabel');
    private readonly _minimumStableControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('minimumStableControl');
    private readonly _minimumElapsedLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('minimumElapsedLabel');
    private readonly _minimumElapsedControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('minimumElapsedControl');
    private readonly _ttlLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('ttlLabel');
    private readonly _ttlControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('ttlControl');
    private readonly _urgencyLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('urgencyLabel');
    private readonly _urgencyControlComponentSignal = viewChild.required<IntegerEnumInputNgComponent>('urgencyControl');

    private _modifier: LockerScanAttachedNotificationChannel.Modifier;

    private readonly _minimumStableUiAction: NumberUiAction;
    private readonly _minimumElapsedUiAction: NumberUiAction;
    private readonly _ttlUiAction: NumberUiAction;
    private readonly _urgencyUiAction: IntegerListSelectItemUiAction;

    private _minimumStableLabelComponent: CaptionLabelNgComponent;
    private _minimumStableControlComponent: IntegerTextInputNgComponent;
    private _minimumElapsedLabelComponent: CaptionLabelNgComponent;
    private _minimumElapsedControlComponent: IntegerTextInputNgComponent;
    private _ttlLabelComponent: CaptionLabelNgComponent;
    private _ttlControlComponent: IntegerTextInputNgComponent;
    private _urgencyLabelComponent: CaptionLabelNgComponent;
    private _urgencyControlComponent: IntegerEnumInputNgComponent;

    private _channel: LockerScanAttachedNotificationChannel | undefined;
    private _channelFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
    ) {
        super(elRef, ++ScanEditorAttachedNotificationChannelPropertiesNgComponent.typeInstanceCreateCount);

        this.channelNameLabel = Strings[StringId.LockerScanAttachedNotificationChannelHeader_Name];

        this._minimumStableUiAction = this.createMinimumStableUiAction();
        this._minimumElapsedUiAction = this.createMinimumElapsedUiAction();
        this._ttlUiAction = this.createTtlUiAction();
        this._urgencyUiAction = this.createUrgencyUiAction();

        this.pushChannelUndefined();
    }

    get channel() { return this._channel; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._minimumStableLabelComponent = this._minimumStableLabelComponentSignal();
        this._minimumStableControlComponent = this._minimumStableControlComponentSignal();
        this._minimumElapsedLabelComponent = this._minimumElapsedLabelComponentSignal();
        this._minimumElapsedControlComponent = this._minimumElapsedControlComponentSignal();
        this._ttlLabelComponent = this._ttlLabelComponentSignal();
        this._ttlControlComponent = this._ttlControlComponentSignal();
        this._urgencyLabelComponent = this._urgencyLabelComponentSignal();
        this._urgencyControlComponent = this._urgencyControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    setRootComponentInstanceId(root: ComponentBaseNgDirective.InstanceId) {
        this._modifier = {
            root,
            node: this.instanceId,
        }
    }

    setAttachedNotificationChannel(value: LockerScanAttachedNotificationChannel | undefined, finalise: boolean) {
        if (this._channel !== undefined) {
            this._channel.unsubscribeFieldsChangedEvent(this._channelFieldsChangedSubscriptionId);
            this._channelFieldsChangedSubscriptionId = undefined;
            this._channel = undefined;
            if (value === undefined && !finalise) {
                this.pushChannelUndefined();
            }
        }

        if (value !== undefined) {
            this._channel = value;
            this._channelFieldsChangedSubscriptionId = value.subscribeFieldsChangedEvent(
                (fieldIds, modifier) => this.processChangedFields(fieldIds, modifier)
            );
            this.pushChannelDefined(value);
        }
    }

    areAllControlValuesOk() {
        if (this._channel === undefined) {
            return true;
        } else {
            return (
                this._minimumStableUiAction.isValueOk() &&
                this._minimumElapsedUiAction.isValueOk() &&
                this._ttlUiAction.isValueOk() &&
                this._urgencyUiAction.isValueOk()
            );
        }
    }

    cancelAllControlsEdited() {
        this._minimumStableUiAction.cancelEdit();
        this._minimumElapsedUiAction.cancelEdit();
        this._ttlUiAction.cancelEdit();
        this._urgencyUiAction.cancelEdit();
    }

    private initialiseComponents() {
        this._minimumStableLabelComponent.initialise(this._minimumStableUiAction);
        this._minimumStableControlComponent.initialise(this._minimumStableUiAction);
        this._minimumElapsedLabelComponent.initialise(this._minimumElapsedUiAction);
        this._minimumElapsedControlComponent.initialise(this._minimumElapsedUiAction);
        this._ttlLabelComponent.initialise(this._ttlUiAction);
        this._ttlControlComponent.initialise(this._ttlUiAction);
        this._urgencyLabelComponent.initialise(this._urgencyUiAction);
        this._urgencyControlComponent.initialise(this._urgencyUiAction);
    }

    private finalise() {
        this._ttlUiAction.finalise();
        this._urgencyUiAction.finalise();
        this._minimumStableUiAction.finalise();
        this._minimumElapsedUiAction.finalise();
    }

    private createMinimumStableUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_MinimumStable]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_MinimumStable]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCMSUAC45098');
            } else {
                const value = this._minimumStableUiAction.value;
                channel.setMinimumStable(value, this._modifier);
            }
        };
        return action;
    }

    private createMinimumElapsedUiAction() {
        const action = new NumberUiAction(false);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_MinimumElapsed]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_MinimumElapsed]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCMEUAC45098');
            } else {
                const value = this._minimumElapsedUiAction.value;
                channel.setMinimumElapsed(value, this._modifier);
            }
        };
        return action;
    }

    private createTtlUiAction() {
        const action = new NumberUiAction(true);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_Ttl]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_Ttl]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCTUACC45098');
            } else {
                const value = this._ttlUiAction.value;
                const changed = channel.setTtl(value, this._modifier);
                if (changed) {
                    this._ttlUiAction.valueRequired = channel.ttlRequired;
                }
            }
        };
        return action;
    }

    private createUrgencyUiAction() {
        const action = new IntegerListSelectItemUiAction(false);
        action.pushCaption(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesCaption_Urgency]);
        action.pushTitle(Strings[StringId.ScanEditorAttachedNotificationChannelPropertiesDescription_Urgency]);
        const ids = NotificationChannel.SourceSettings.Urgency.allIds;
        const list = ids.map<IntegerListSelectItemUiAction.ItemProperties>(
            (id) => (
                {
                    item: id,
                    caption: NotificationChannel.SourceSettings.Urgency.idToDisplay(id),
                    title: NotificationChannel.SourceSettings.Urgency.idToDescription(id),
                }
            )
        );
        action.pushList(list, undefined);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCCUUAC45098');
            } else {
                const value = this._urgencyUiAction.value;
                const changed = channel.setUrgency(value, this._modifier);
                if (changed) {
                    this._ttlUiAction.valueRequired = channel.ttlRequired;
                }
            }
        };
        return action;
    }

    private pushChannelUndefined() {
        this.channelName = '';
        this.channelId = '';
        this._minimumStableUiAction.pushValue(undefined);
        this._minimumStableUiAction.pushDisabled();
        this._minimumElapsedUiAction.pushValue(undefined);
        this._minimumElapsedUiAction.pushDisabled();
        this._ttlUiAction.pushValue(undefined);
        this._ttlUiAction.pushDisabled();
        this._urgencyUiAction.pushValue(undefined);
        this._urgencyUiAction.pushDisabled();
        this._cdr.markForCheck();
    }

    private pushChannelDefined(channel: LockerScanAttachedNotificationChannel) {
        this.channelId = channel.channelId;
        this.channelName = channel.name;
        this._minimumStableUiAction.pushValue(channel.minimumStable);
        this._minimumStableUiAction.pushValidOrMissing();
        this._minimumElapsedUiAction.pushValue(channel.minimumElapsed);
        this._minimumElapsedUiAction.pushValidOrMissing();
        this._ttlUiAction.pushValue(channel.ttl);
        this._ttlUiAction.pushValidOrMissing();
        this._ttlUiAction.valueRequired = channel.ttlRequired;
        this._urgencyUiAction.pushValue(channel.urgencyId);
        this._urgencyUiAction.pushValidOrMissing();
        this._cdr.markForCheck();
    }

    private processChangedFields(
        fieldIds: readonly LockerScanAttachedNotificationChannel.FieldId[],
        modifier: LockerScanAttachedNotificationChannel.Modifier | undefined
    ) {
        if (modifier === undefined || modifier.node !== this._modifier.node) {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('SEANCPNCPCF44452')
            } else {
                const count = fieldIds.length;
                for (let i = 0; i < count; i++) {
                    const fieldId = fieldIds[i];
                    this.pushFieldId(channel, fieldId);
                }
            }
        }
    }

    private pushFieldId(channel: LockerScanAttachedNotificationChannel, fieldId: LockerScanAttachedNotificationChannel.FieldId): void {
        switch (fieldId) {
            case LockerScanAttachedNotificationChannel.FieldId.ChannelId:
                throw new AssertInternalError('SEANCPNCPFII44452', channel.channelId);
            case LockerScanAttachedNotificationChannel.FieldId.Valid:
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Name:
                this.channelName = channel.name;
                this._cdr.markForCheck();
                break;
            case LockerScanAttachedNotificationChannel.FieldId.CultureCode:
                break;
            case LockerScanAttachedNotificationChannel.FieldId.MinimumStable:
                this._minimumStableUiAction.pushValue(channel.minimumStable);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.MinimumElapsed:
                this._minimumElapsedUiAction.pushValue(channel.minimumElapsed);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Ttl:
                this._ttlUiAction.pushValue(channel.ttl);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Urgency:
                this._urgencyUiAction.pushValue(channel.urgencyId);
                break;
            case LockerScanAttachedNotificationChannel.FieldId.Topic:
                break;
            default:
                throw new UnreachableCaseError('SEANCPNCPFID44452', fieldId);
        }
    }

}

export namespace ScanEditorAttachedNotificationChannelPropertiesNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;
}
