import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import { BooleanUiAction, StringUiAction } from '@pbkware/ui-action';
import {
    ActiveFaultedStatus,
    AllowedSourcedFieldsColumnLayoutDefinition,
    LockOpenNotificationChannel,
    NotificationDistributionMethod,
    StringId,
    Strings
} from '@plxtra/motif-core';
import {
    CaptionLabelNgComponent,
    IntegerTextInputNgComponent
} from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { ComponentBaseNgDirective } from '../../../../component/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-lock-open-notification-channel-properties',
    templateUrl: './lock-open-notification-channel-properties-ng.component.html',
    styleUrls: ['./lock-open-notification-channel-properties-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class LockOpenNotificationChannelPropertiesNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    editGridColumnsEventer: LockOpenNotificationChannelPropertiesNgComponent.EditGridColumnsEventer | undefined;

    public readonly typeLabel: string;
    public readonly statusLabel = Strings[StringId.Status];
    public type = '';
    public status = '';

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _enabledLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('enabledLabel');
    private readonly _enabledControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('enabledControl');
    private readonly _nameLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('nameLabel');
    private readonly _nameControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('nameControl');
    private readonly _descriptionLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('descriptionLabel');
    private readonly _descriptionControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('descriptionControl');

    private _modifier: LockOpenNotificationChannel.Modifier;

    private readonly _enabledUiAction: BooleanUiAction;
    private readonly _nameUiAction: StringUiAction;
    private readonly _descriptionUiAction: StringUiAction;

    private _enabledLabelComponent: CaptionLabelNgComponent;
    private _enabledControlComponent: IntegerTextInputNgComponent;
    private _nameLabelComponent: CaptionLabelNgComponent;
    private _nameControlComponent: IntegerTextInputNgComponent;
    private _descriptionLabelComponent: CaptionLabelNgComponent;
    private _descriptionControlComponent: IntegerTextInputNgComponent;

    private _channel: LockOpenNotificationChannel | undefined;
    private _channelFieldsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor() {
        super(++LockOpenNotificationChannelPropertiesNgComponent.typeInstanceCreateCount);

        this.typeLabel = Strings[StringId.LockOpenNotificationChannelHeader_Name];

        this._enabledUiAction = this.createEnabledUiAction();
        this._nameUiAction = this.createNameUiAction();
        this._descriptionUiAction = this.createDescriptionUiAction();

        this.pushChannelUndefined();
    }

    get channel() { return this._channel; }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this._enabledLabelComponent = this._enabledLabelComponentSignal();
        this._enabledControlComponent = this._enabledControlComponentSignal();
        this._nameLabelComponent = this._nameLabelComponentSignal();
        this._nameControlComponent = this._nameControlComponentSignal();
        this._descriptionLabelComponent = this._descriptionLabelComponentSignal();
        this._descriptionControlComponent = this._descriptionControlComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    setRootComponentInstanceId(root: ComponentBaseNgDirective.InstanceId) {
        this._modifier = root;
    }

    setLockOpenNotificationChannel(value: LockOpenNotificationChannel | undefined, finalise: boolean) {
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
                this._enabledUiAction.isValueOk() &&
                this._nameUiAction.isValueOk() &&
                this._descriptionUiAction.isValueOk()
            );
        }
    }

    cancelAllControlsEdited() {
        this._enabledUiAction.cancelEdit();
        this._nameUiAction.cancelEdit();
        this._descriptionUiAction.cancelEdit();
    }

    private initialiseComponents() {
        this._enabledLabelComponent.initialise(this._enabledUiAction);
        this._enabledControlComponent.initialise(this._enabledUiAction);
        this._nameLabelComponent.initialise(this._nameUiAction);
        this._nameControlComponent.initialise(this._nameUiAction);
        this._descriptionLabelComponent.initialise(this._descriptionUiAction);
        this._descriptionControlComponent.initialise(this._descriptionUiAction);
    }

    private finalise() {
        this._descriptionUiAction.finalise();
        this._enabledUiAction.finalise();
        this._nameUiAction.finalise();
    }

    private createEnabledUiAction() {
        const action = new BooleanUiAction(false);
        action.pushCaption(Strings[StringId.LockOpenNotificationChannelHeader_Enabled]);
        action.pushTitle(Strings[StringId.LockOpenNotificationChannelDescription_Enabled]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCCEUAC11008');
            } else {
                const value = this._enabledUiAction.value;
                if (value === undefined) {
                    throw new AssertInternalError('LONCPNCCEUAV11008');
                } else {
                    channel.setEnabled(value, this._modifier);
                }
            }
        };
        return action;
    }

    private createNameUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.LockOpenNotificationChannelHeader_Name]);
        action.pushTitle(Strings[StringId.LockOpenNotificationChannelDescription_Name]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCCNUAC11008');
            } else {
                const value = this._nameUiAction.value;
                if (value === undefined) {
                    throw new AssertInternalError('LONCPNCCNUAV11008');
                } else {
                    channel.setName(value, this._modifier);
                }
            }
        };
        return action;
    }

    private createDescriptionUiAction() {
        const action = new StringUiAction(false);
        action.pushCaption(Strings[StringId.LockOpenNotificationChannelHeader_Description]);
        action.pushTitle(Strings[StringId.LockOpenNotificationChannelDescription_Description]);
        action.commitEvent = () => {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCCDUAC11008');
            } else {
                const value = this._descriptionUiAction.value;
                channel.setDescription(value, this._modifier);
            }
        };
        return action;
    }

    private pushChannelUndefined() {
        this.type = '';
        this.status = '';
        this._enabledUiAction.pushValue(undefined);
        this._enabledUiAction.pushDisabled();
        this._nameUiAction.pushValue(undefined);
        this._nameUiAction.pushDisabled();
        this._descriptionUiAction.pushValue(undefined);
        this._descriptionUiAction.pushDisabled();
        this._cdr.markForCheck();
    }

    private pushChannelDefined(channel: LockOpenNotificationChannel) {
        this.type = NotificationDistributionMethod.idToDisplay(channel.distributionMethodId);
        this.status = ActiveFaultedStatus.idToDisplay(channel.statusId);
        this._enabledUiAction.pushValue(channel.enabled);
        this._enabledUiAction.pushValidOrMissing();
        this._nameUiAction.pushValue(channel.name);
        this._nameUiAction.pushValidOrMissing();
        this._descriptionUiAction.pushValue(channel.description);
        this._descriptionUiAction.pushValidOrMissing();
        this._cdr.markForCheck();
    }

    private processChangedFields(
        fieldIds: readonly LockOpenNotificationChannel.FieldId[],
        modifier: LockOpenNotificationChannel.Modifier | undefined
    ) {
        if (modifier === undefined || modifier !== this._modifier) {
            const channel = this._channel;
            if (channel === undefined) {
                throw new AssertInternalError('LONCPNCPCF44452')
            } else {
                const count = fieldIds.length;
                for (let i = 0; i < count; i++) {
                    const fieldId = fieldIds[i];
                    this.pushFieldId(channel, fieldId);
                }
            }
        }
    }

    private pushFieldId(channel: LockOpenNotificationChannel, fieldId: LockOpenNotificationChannel.FieldId): void {
        switch (fieldId) {
            case LockOpenNotificationChannel.FieldId.Id:
                throw new AssertInternalError('LONCPNCPFII44452', channel.id);
            case LockOpenNotificationChannel.FieldId.Valid:
                // may need in future
                break;
            case LockOpenNotificationChannel.FieldId.Enabled:
                this._enabledUiAction.pushValue(channel.enabled);
                break;
            case LockOpenNotificationChannel.FieldId.Name:
                this._nameUiAction.pushValue(channel.name);
                break;
            case LockOpenNotificationChannel.FieldId.Description:
                this._descriptionUiAction.pushValue(channel.description);
                break;
            case LockOpenNotificationChannel.FieldId.Favourite:
                // may use in future
                break;
            case LockOpenNotificationChannel.FieldId.StatusId:
                this.status = ActiveFaultedStatus.idToDisplay(channel.statusId);
                this._cdr.markForCheck();
                break;
            case LockOpenNotificationChannel.FieldId.DistributionMethodId:
                // This should never change
                this.status = NotificationDistributionMethod.idToDisplay(channel.distributionMethodId);
                this._cdr.markForCheck();
                break;
            case LockOpenNotificationChannel.FieldId.Faulted:
                // Same as status so ignore
                break;
            case LockOpenNotificationChannel.FieldId.Settings:
                // Ignore for now
                break;
            default:
                throw new UnreachableCaseError('LONCPNCPFID44452', fieldId);
        }
    }

}

export namespace LockOpenNotificationChannelPropertiesNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type EditGridColumnsEventer = (
        this: void,
        caption: string,
        allowedFieldsAndLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition
    ) => Promise<RevColumnLayoutOrReferenceDefinition | undefined>;
}
