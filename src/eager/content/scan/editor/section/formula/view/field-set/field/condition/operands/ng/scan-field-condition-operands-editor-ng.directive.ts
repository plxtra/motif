import { ChangeDetectorRef, Directive, InjectionToken, OnDestroy, inject } from '@angular/core';
import { Integer, MultiEvent } from '@pbkware/js-utils';
import { ColorScheme, ColorSettings, SettingsService } from '@plxtra/motif-core';
import { ComponentInstanceId } from 'component-internal-api';
import { SettingsNgService } from 'component-services-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';
import { ScanFieldConditionOperandsEditorFrame } from '../scan-field-condition-operands-editor-frame';

@Directive({
    standalone: false
})
export abstract class ScanFieldConditionOperandsEditorNgDirective extends ContentComponentBaseNgDirective implements OnDestroy {
    protected readonly _modifier: ScanFieldConditionOperandsEditorFrame.Modifier;

    private readonly _cdr = inject(ChangeDetectorRef);
    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;

    private _frameChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _exclamationColor: string;

    private _settingsChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        typeInstanceCreateId: Integer,
        protected readonly _frame: ScanFieldConditionOperandsEditorFrame,
        modifierRoot: ComponentInstanceId
    ) {
        const settingsNgService = inject(SettingsNgService);

        super(typeInstanceCreateId);

        this._modifier = {
            root: modifierRoot,
            node: this.instanceId,
        };

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;

        this._settingsChangeSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(
            () => this.updateColor()
        );

        this._frameChangedSubscriptionId = this._frame.subscribeChangedEvent((modifierNode) => this.handleFrameChangedEvent(modifierNode));

        this.updateColor();
    }

    public get affirmativeOperatorDisplayLines() { return this._frame.affirmativeOperatorDisplayLines; }
    public get valid() { return this._frame.valid; }
    public get exclamationColor() { return this._exclamationColor }

    ngOnDestroy(): void {
        this.finalise();
    }

    protected finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangeSubscriptionId);
        this._settingsChangeSubscriptionId = undefined;
        this._frame.unsubscribeChangedEvent(this._frameChangedSubscriptionId);
        this._frameChangedSubscriptionId = undefined;
    }

    protected pushAll() {
        this.markForCheck();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    private handleFrameChangedEvent(modifierNode: ComponentInstanceId) {
        if (modifierNode !== this._modifier.node) {
            this.pushAll();
        }
    }

    private updateColor() {
        const exclamationColor = this._colorSettings.getFore(ColorScheme.ItemId.Label_Error);
        if (exclamationColor !== this._exclamationColor) {
            this._exclamationColor = exclamationColor;
            this.markForCheck();
        }
    }
}

export namespace ScanFieldConditionOperandsEditorNgDirective {
    export const frameInjectionToken = new InjectionToken<ScanFieldConditionOperandsEditorFrame>('ScanFieldConditionOperandsEditorNgDirective.FrameInjectionToken');
    export const modifierRootInjectionToken = new InjectionToken<ComponentInstanceId>('ScanFieldConditionOperandsEditorNgDirective.ModifierRootInjectionToken');
}
