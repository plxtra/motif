import { ChangeDetectorRef, Directive, effect, ElementRef, HostBinding, model, OnDestroy, untracked } from '@angular/core';
import { delay1Tick, HtmlTypes, Integer, MultiEvent, numberToPixels, UnreachableCaseError } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    ColorScheme,
    ColorSettings,
    GridField,
    ScalarSettings,
    SettingsService
} from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { RevFocus, RevRectangle } from 'revgrid';

@Directive()
export abstract class ControlComponentBaseNgDirective extends ComponentBaseNgDirective implements OnDestroy {
    @HostBinding('style.display') displayPropertyNoneOverride: HtmlTypes.Display | '' = ''; // no override

    readonly noneDisplayOverrideActive = model<boolean>(false);

    initialiseReady = false;
    initialiseReadyEventer: ControlComponentBaseNgDirective.InitialiseReadyEventHandler | undefined;

    readonly stateColorItemIdArray: ControlComponentBaseNgDirective.StateColorItemIdArray;

    public disabled = true;
    public readonly = true;
    public waiting = true;
    public caption = '';
    public title = '';
    public dropDownEditableSearchTerm = false;
    public placeholderText = '';
    public bkgdColor: ColorScheme.ResolvedColor;
    public foreColor: ColorScheme.ResolvedColor;

    // protected readonly exchangeSettingsArray: readonly ExchangeSettings[];

    private _uiAction: UiAction | undefined;
    private _pushEventsSubscriptionId: MultiEvent.SubscriptionId;

    private _scalarSettings: ScalarSettings;
    private _colorSettings: ColorSettings;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _stateId: UiAction.StateId;

    private _readonlyAlways = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        typeInstanceCreateId: Integer,
        private _cdr: ChangeDetectorRef,
        private _settingsService: SettingsService,
        stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray,
    ) {
        super(elRef, typeInstanceCreateId);
        this._scalarSettings = this._settingsService.scalar;
        this._colorSettings = this._settingsService.color;
        // this.exchangeSettingsArray = this._settingsService.exchanges.exchanges;
        this.stateColorItemIdArray = stateColorItemIdArray.slice();
        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => this.handleSettingsChangedEvent());

        effect(() => {
            const noneDisplayOverrideActive = this.noneDisplayOverrideActive();
            untracked(() => {
                if (noneDisplayOverrideActive) {
                    if (this.displayPropertyNoneOverride !== HtmlTypes.Display.None) {
                        this.displayPropertyNoneOverride = HtmlTypes.Display.None;
                        this.markForCheck();
                    }
                } else {
                    if (this.displayPropertyNoneOverride !== '') {
                        this.displayPropertyNoneOverride = '';
                        this.markForCheck();
                    }
                }
            });
        })
    }

    // Assumes that the component has DOM display attribute !== 'none'
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    // @Input()
    // get displayed() { return this.displayPropertyNoneOverride === ''; }
    // set displayed(value: boolean) {
    //     if (value) {
    //         if (!this.displayed) {
    //             this.displayPropertyNoneOverride = '';
    //             this.markForCheck();
    //         }
    //     } else {
    //         if (this.displayed) {
    //             this.displayPropertyNoneOverride = HtmlTypes.Display.None;
    //             this.markForCheck();
    //         }
    //     }
    // }

    get readonlyAlways() { return this._readonlyAlways; }
    set readonlyAlways(value: boolean) {
        this._readonlyAlways = value;
        this.applyStateId(this.stateId);
    }

    protected get uiAction() { return this._uiAction; }
    protected get stateId() { return this._stateId; }
    protected get coreSettings() { return this._scalarSettings; }
    protected get colorSettings() { return this._colorSettings; }

    ngOnDestroy() {
        this.finalise();
    }

    setInitialiseReady() {
        this.initialiseReady = true;
        if (this.initialiseReadyEventer !== undefined) {
            this.initialiseReadyEventer();
        }
    }

    initialise(action: UiAction) {
        this.setUiAction(action);
        this.pushSettings();

        delay1Tick(() => this.markForCheck());
    }

    // used by Cell Editor
    setBounds(bounds: RevRectangle | undefined) {
        const htmlElement = this.rootHtmlElement;
        if (bounds === undefined) {
            htmlElement.style.visibility = 'hidden';
        } else {
            htmlElement.style.left = numberToPixels(bounds.x);
            htmlElement.style.top = numberToPixels(bounds.y);
            htmlElement.style.width = numberToPixels(bounds.width);
            htmlElement.style.height = numberToPixels(bounds.height);
            htmlElement.style.visibility = 'visible';
        }
    }

    focus() {
        // descendants can override
    }

    // used by Cell Editor
    processGridKeyDownEvent(event: KeyboardEvent, fromEditor: boolean, field: GridField, subgridRowIndex: number): boolean {
        if (fromEditor) {
            // Event was emitted by this editor.  Any key it can consume has effectively already been consumed
            return this.canConsumeGridKey(event.key);
        } else {
            // Cannot dispatch an event from another element to an input element
            return false;
        }
    }

    // used by Cell Editor
    protected canConsumeGridKey(key: string) {
        switch (key as RevFocus.ActionKeyboardKey) {
            case RevFocus.ActionKeyboardKey.arrowUp:
            case RevFocus.ActionKeyboardKey.arrowDown:
            case RevFocus.ActionKeyboardKey.pageUp:
            case RevFocus.ActionKeyboardKey.pageDown:
            case RevFocus.ActionKeyboardKey.tab:
            case RevFocus.ActionKeyboardKey.enter:
            case RevFocus.ActionKeyboardKey.escape:
                return false;
            default:
                return true;
        }
    }

    protected finalise() {
        if (this._uiAction !== undefined) {
            this._uiAction.unsubscribePushEvents(this._pushEventsSubscriptionId);
            this._pushEventsSubscriptionId = undefined;
        }
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
        this._settingsChangedSubscriptionId = undefined;
    }

    protected applyStateId(newStateId: UiAction.StateId) {
        this._stateId = newStateId;

        this.setStateColors(newStateId);

        switch (newStateId) {
            case UiAction.StateId.Disabled:
                this.disabled = true;
                this.readonly = this._readonlyAlways;
                this.waiting = false;
                break;
            case UiAction.StateId.Readonly:
                this.disabled = false;
                this.readonly = true;
                this.waiting = false;
                break;
            case UiAction.StateId.Waiting:
                this.disabled = false;
                this.readonly = this._readonlyAlways;
                this.waiting = true;
                break;
            case UiAction.StateId.Missing:
            case UiAction.StateId.Invalid:
            case UiAction.StateId.Valid:
            case UiAction.StateId.Accepted:
            case UiAction.StateId.Warning:
            case UiAction.StateId.Error:
                this.disabled = false;
                this.readonly = this._readonlyAlways;
                this.waiting = false;
                break;
            default:
                throw new UnreachableCaseError('UACBASI66676', newStateId);
        }

        this.markForCheck();
    }

    protected applyCaption(caption: string) {
        this.caption = caption;
        this.markForCheck();
    }

    protected applyPlaceholder(text: string) {
        this.placeholderText = text;
        this.markForCheck();
    }

    protected applyTitle(title: string) {
        this.title = title;
        this.markForCheck();
    }

    protected applySettingColors() {
        if (this._uiAction !== undefined) {
            this.setStateColors(this._uiAction.stateId);
            this.markForCheck();
        }
    }

    protected getBkgdColorCssVariableName(itemId: ColorScheme.ItemId) {
        return ColorScheme.Item.idToBkgdCssVariableName(itemId);
    }

    protected getForeColorCssVariableName(itemId: ColorScheme.ItemId) {
        return ColorScheme.Item.idToForeCssVariableName(itemId);
    }

    protected getBkgdColor(itemId: ColorScheme.ItemId) {
        return this.colorSettings.getBkgd(itemId);
    }

    protected getForeColor(itemId: ColorScheme.ItemId) {
        return this.colorSettings.getFore(itemId);
    }

    protected getDisabledBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Disabled);
    }
    protected getDisabledForeColor() {
        return this.getStateForeColor(UiAction.StateId.Disabled);
    }

    protected getReadOnlyBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Readonly);
    }
    protected getReadOnlyForeColor() {
        return this.getStateForeColor(UiAction.StateId.Readonly);
    }

    protected getMissingBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Missing);
    }
    protected getMissingForeColor() {
        return this.getStateForeColor(UiAction.StateId.Missing);
    }

    protected getInvalidBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Invalid);
    }
    protected getInvalidForeColor() {
        return this.getStateForeColor(UiAction.StateId.Invalid);
    }

    protected getAcceptedBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Accepted);
    }
    protected getAcceptedForeColor() {
        return this.getStateForeColor(UiAction.StateId.Accepted);
    }

    protected getValidBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Valid);
    }
    protected getValidForeColor() {
        return this.getStateForeColor(UiAction.StateId.Valid);
    }

    protected getWaitingBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Waiting);
    }
    protected getWaitingForeColor() {
        return this.getStateForeColor(UiAction.StateId.Waiting);
    }

    protected getWarningBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Warning);
    }
    protected getWarningForeColor() {
        return this.getStateForeColor(UiAction.StateId.Warning);
    }

    protected getErrorBkgdColor() {
        return this.getStateBkgdColor(UiAction.StateId.Error);
    }
    protected getErrorForeColor() {
        return this.getStateForeColor(UiAction.StateId.Error);
    }

    protected getStateBkgdColor(stateId: UiAction.StateId) {
        const itemId = this.getStateColorItemId(stateId);
        return this.colorSettings.getBkgd(itemId);
    }

    protected getStateForeColor(stateId: UiAction.StateId) {
        const itemId = this.getStateColorItemId(stateId);
        return this.colorSettings.getFore(itemId);
    }

    protected pushSettings() {
        const dropDownEditableSearchTerm = this._scalarSettings.control_DropDownEditableSearchTerm;
        if (dropDownEditableSearchTerm !== this.dropDownEditableSearchTerm) {
            this.dropDownEditableSearchTerm = dropDownEditableSearchTerm;
            this.markForCheck();
        }
        this.applySettingColors();
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    protected setUiAction(action: UiAction): UiAction.PushEventHandlersInterface {

        this._uiAction = action;

        const pushEventHandlersInterface = action.createPushEventHandlersInterface();

        pushEventHandlersInterface.stateChange = (oldState, newState) => this.handleStateChangePushEvent(oldState, newState);
        pushEventHandlersInterface.placeholder = (text) => this.handlePlaceholderPushEvent(text);
        pushEventHandlersInterface.title = (title) => this.handleTitlePushEvent(title);
        pushEventHandlersInterface.caption = (caption) => this.handleCaptionPushEvent(caption);
        pushEventHandlersInterface.requiredChange = () => this.handleRequiredChangePushEvent();

        this._pushEventsSubscriptionId = this._uiAction.subscribePushEvents(pushEventHandlersInterface);

        this.applyStateId(action.stateId);
        this.applyPlaceholder(action.placeholder);
        this.applyTitle(action.title);
        this.applyCaption(action.caption);

        return pushEventHandlersInterface;
    }

    protected setStateColors(stateId: UiAction.StateId) {
        this.bkgdColor = this.getStateBkgdColor(stateId);
        this.foreColor = this.getStateForeColor(stateId);
    }

    private getStateColorItemId(stateId: UiAction.StateId) {
        return this.stateColorItemIdArray[stateId];
    }

    private handleSettingsChangedEvent() {
        this.pushSettings();
    }

    private handleStateChangePushEvent(oldState: UiAction.StateId, newState: UiAction.StateId) {
        if (newState !== this.stateId) {
            this.applyStateId(newState);
        }
    }

    private handlePlaceholderPushEvent(text: string) {
        if (text !== this.placeholderText) {
            this.applyPlaceholder(text);
        }
    }

    private handleTitlePushEvent(title: string) {
        if (title !== this.title) {
            this.applyTitle(title);
        }
    }

    private handleCaptionPushEvent(caption: string) {
        if (caption !== this.caption) {
            this.applyCaption(caption);
        }
    }

    private handleRequiredChangePushEvent() {
        //
    }
}

export namespace ControlComponentBaseNgDirective {
    export type StateColorItemIdArray = ColorScheme.ItemId[];
    export type ReadonlyStateColorItemIdArray = readonly ColorScheme.ItemId[];

    export namespace StateColorItemIdArray {
        export const enum Index {
            Disabled,
            ReadOnly,
            Missing,
            Invalid,
            Valid,
            Accepted,
            Waiting,
            Warning,
            Error,
        }
    }

    export const textControlStateColorItemIdArray: ReadonlyStateColorItemIdArray = [
        ColorScheme.ItemId.TextControl_Disabled,
        ColorScheme.ItemId.TextControl_ReadOnly,
        ColorScheme.ItemId.TextControl_Missing,
        ColorScheme.ItemId.TextControl_Invalid,
        ColorScheme.ItemId.TextControl_Valid,
        ColorScheme.ItemId.TextControl_Accepted,
        ColorScheme.ItemId.TextControl_Waiting,
        ColorScheme.ItemId.TextControl_Warning,
        ColorScheme.ItemId.TextControl_Error,
    ];

    export const readonlyValidTextControlStateColorItemIdArray: ReadonlyStateColorItemIdArray = [
        ColorScheme.ItemId.TextControl_Disabled,
        ColorScheme.ItemId.TextControl_Valid,
        ColorScheme.ItemId.TextControl_Missing,
        ColorScheme.ItemId.TextControl_Invalid,
        ColorScheme.ItemId.TextControl_Valid,
        ColorScheme.ItemId.TextControl_Accepted,
        ColorScheme.ItemId.TextControl_Waiting,
        ColorScheme.ItemId.TextControl_Warning,
        ColorScheme.ItemId.TextControl_Error,
    ];

    export const clickControlStateColorItemIdArray: ReadonlyStateColorItemIdArray = [
        ColorScheme.ItemId.ClickControl_Disabled,
        ColorScheme.ItemId.ClickControl_ReadOnly,
        ColorScheme.ItemId.ClickControl_Missing,
        ColorScheme.ItemId.ClickControl_Invalid,
        ColorScheme.ItemId.ClickControl_Valid,
        ColorScheme.ItemId.ClickControl_Accepted,
        ColorScheme.ItemId.ClickControl_Waiting,
        ColorScheme.ItemId.ClickControl_Warning,
        ColorScheme.ItemId.ClickControl_Error,
    ];

    export const labelStateColorItemIdArray: ReadonlyStateColorItemIdArray = [
        ColorScheme.ItemId.Label_Disabled,
        ColorScheme.ItemId.Label_ReadOnly,
        ColorScheme.ItemId.Label_Missing,
        ColorScheme.ItemId.Label_Invalid,
        ColorScheme.ItemId.Label_Valid,
        ColorScheme.ItemId.Label_Accepted,
        ColorScheme.ItemId.Label_Waiting,
        ColorScheme.ItemId.Label_Warning,
        ColorScheme.ItemId.Label_Error,
    ];

    export type InitialiseReadyEventHandler = (this: void) => void;
}
