import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, input, OnDestroy, viewChild } from '@angular/core';
import { delay1Tick, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';
import {
    ColorScheme,
    ColorSettings,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    SettingsService,
    StringId,
    Strings
} from '@plxtra/motif-core';
import { CommandRegisterNgService, SettingsNgService } from 'component-services-ng-api';
import { IntegerEnumInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-expandable-collapsible-lined-heading',
    templateUrl: './expandable-collapsible-lined-heading-ng.component.html',
    styleUrls: ['./expandable-collapsible-lined-heading-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExpandableCollapsibleLinedHeadingNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly headingText = input.required<string>();
    readonly genericText = input<string>();
    readonly genericSelectorWidth = input<string>();
    readonly genericSelectorCaption = input<string>();

    public lineColor: string;

    expandEventer: ExpandableCollapsibleLinedHeadingNgComponent.ExpandEventer;
    restoreEventer: ExpandableCollapsibleLinedHeadingNgComponent.RestoreEventer;
    collapseEventer: ExpandableCollapsibleLinedHeadingNgComponent.CollapseEventer;

    genericSelectorComponent: IntegerEnumInputNgComponent | undefined;

    private readonly _genericSelectorComponentSignal = viewChild<IntegerEnumInputNgComponent>('genericSelector');
    private readonly _expandButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('expandButton');
    private readonly _restoreButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('restoreButton');
    private readonly _collapseButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('collapseButton');

    private readonly _commandRegisterService: CommandRegisterService;

    private readonly _settingsService: SettingsService;
    private readonly _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _expandUiAction: IconButtonUiAction;
    private readonly _restoreUiAction: IconButtonUiAction;
    private readonly _collapseUiAction: IconButtonUiAction;

    private _expandButtonComponent: SvgButtonNgComponent;
    private _restoreButtonComponent: SvgButtonNgComponent;
    private _collapseButtonComponent: SvgButtonNgComponent;

    private _stateId: ExpandableCollapsibleLinedHeadingNgComponent.StateId;
    private _genericText: string | undefined;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        settingsNgService: SettingsNgService,
        commandRegisterNgService: CommandRegisterNgService
    ) {
        super(elRef, ++ExpandableCollapsibleLinedHeadingNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;

        this._expandUiAction = this.createExpandUiAction();
        this._restoreUiAction = this.createRestoreUiAction();
        this._collapseUiAction = this.createCollapseUiAction();

        this._settingsService = settingsNgService.service;
        this._colorSettings = this._settingsService.color;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.updateColors());
        this.updateColors();
    }

    get stateId() { return this._stateId; }
    set stateId(value: ExpandableCollapsibleLinedHeadingNgComponent.StateId) {
        this._stateId = value;
        switch (value) {
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Expanded: {
                this._expandUiAction.pushDisabled();
                this._restoreUiAction.pushValidOrMissing();
                this._collapseUiAction.pushValidOrMissing();
                break;
            }
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Restored: {
                this._expandUiAction.pushValidOrMissing();
                this._restoreUiAction.pushDisabled();
                this._collapseUiAction.pushValidOrMissing();
                break;
            }
            case ExpandableCollapsibleLinedHeadingNgComponent.StateId.Collapsed: {
                this._expandUiAction.pushValidOrMissing();
                this._restoreUiAction.pushValidOrMissing();
                this._collapseUiAction.pushDisabled();
                break;
            }
            default:
                throw new UnreachableCaseError('ECLHNCSSID11109', value);
        }
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit(): void {
        this.genericSelectorComponent = this._genericSelectorComponentSignal();
        this._expandButtonComponent = this._expandButtonComponentSignal();
        this._restoreButtonComponent = this._restoreButtonComponentSignal();
        this._collapseButtonComponent = this._collapseButtonComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    setGenericText(value: string) {
        this._genericText = value;
        this._cdr.markForCheck();
    }

    private createExpandUiAction() {
        const commandName = InternalCommand.Id.ExpandSection;
        const displayId = StringId.Expand;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ExpandSection]);
        action.pushIcon(IconButtonUiAction.IconId.ExpandVertically);
        action.pushUnselected();
        action.signalEvent = () => this.expandEventer();
        return action;
    }

    private createRestoreUiAction() {
        const commandName = InternalCommand.Id.RestoreSection;
        const displayId = StringId.Restore;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.RestoreSection]);
        action.pushIcon(IconButtonUiAction.IconId.RestoreVertically);
        action.pushUnselected();
        action.signalEvent = () => this.restoreEventer();
        return action;
    }

    private createCollapseUiAction() {
        const commandName = InternalCommand.Id.CollapseSection;
        const displayId = StringId.Collapse;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.CollapseSection]);
        action.pushIcon(IconButtonUiAction.IconId.CollapseVertically);
        action.pushUnselected();
        action.signalEvent = () => this.collapseEventer();
        return action;
    }

    private initialiseComponents() {
        this._expandButtonComponent.initialise(this._expandUiAction);
        this._restoreButtonComponent.initialise(this._restoreUiAction);
        this._collapseButtonComponent.initialise(this._collapseUiAction);
    }

    private finalise() {
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this._expandUiAction.finalise();
        this._restoreUiAction.finalise();
        this._collapseUiAction.finalise();
    }

    private updateColors() {
        this.lineColor = this._colorSettings.getFore(ColorScheme.ItemId.SectionDividerLine);
    }
}

export namespace ExpandableCollapsibleLinedHeadingNgComponent {
    export const enum StateId {
        Expanded,
        Restored,
        Collapsed,
    }

    export type ExpandEventer = (this: void) => void;
    export type RestoreEventer = (this: void) => void;
    export type CollapseEventer = (this: void) => void;
}
