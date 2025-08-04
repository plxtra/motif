import { ChangeDetectorRef, Directive, InjectionToken, inject } from '@angular/core';
import { Integer, Json, JsonElement, MultiEvent } from '@pbkware/js-utils';
import { ColorScheme, CommandRegisterService, SettingsService } from '@plxtra/motif-core';
import { ComponentBaseNgDirective } from 'component-ng-api';
import { CommandRegisterNgService, SettingsNgService } from 'component-services-ng-api';
import { ComponentContainer } from 'golden-layout';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemComponent } from '../ditem-component';
import { DitemFrame } from '../ditem-frame';

@Directive()
export abstract class BuiltinDitemNgComponentBaseNgDirective extends ComponentBaseNgDirective
    implements DitemFrame.ComponentAccess, DitemComponent {

    readonly container: ComponentContainer;
    protected readonly settingsService: SettingsService;
    protected readonly commandRegisterService: CommandRegisterService;

    private readonly _cdr: ChangeDetectorRef;

    private _focused = false;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(typeInstanceCreateId: Integer, generateUniqueId = true) {
        super(typeInstanceCreateId, generateUniqueId);

        this._cdr = inject(ChangeDetectorRef);

        const settingsNgService = inject(SettingsNgService);
        this.settingsService = settingsNgService.service;
        const commandRegisterNgService = inject(CommandRegisterNgService);
        this.commandRegisterService = commandRegisterNgService.service;

        const container = inject<ComponentContainer>(BuiltinDitemNgComponentBaseNgDirective.goldenLayoutContainerInjectionToken);
        this.container = container;
        container.stateRequestEvent = () => this.handleContainerStateRequestEvent();
        container.addEventListener('show', this._containerShownEventListener);
        container.addEventListener('hide', this._containerHideEventListener);
        container.addEventListener('focus', this._containerFocusEventListener);
        container.addEventListener('blur', this._containerBlurEventListener);

        this.initialiseFocusDetectionHandling();
    }

    get focused() { return this._focused; }

    abstract get ditemFrame(): BuiltinDitemFrame;
    protected abstract get stateSchemaVersion(): string;

    focus() {
        this.container.focus();
    }

    blur() {
        this.container.blur();
    }

    public processSymbolLinkedChanged() {
        // descendants can override as necessary
    }

    public processBrokerageAccountGroupLinkedChanged() {
        // descendants can override as necessary
    }

    public processPrimaryChanged() {
        // descendants can override as necessary
    }

    protected initialise() {
        this._settingsChangedSubscriptionId = this.settingsService.subscribeSettingsChangedEvent(
            () => this.applySettings()
        );
        this.applySettings();
    }

    protected finalise() {
        this.settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);

        this.container.stateRequestEvent = undefined;

        this.container.removeEventListener('show', this._containerShownEventListener);
        this.container.removeEventListener('hide', this._containerHideEventListener);
        this.container.removeEventListener('focus', this._containerFocusEventListener);
        this.container.removeEventListener('blur', this._containerBlurEventListener);

        this.finaliseFocusDetectionHandling();
    }

    protected applySettings() {
        const containerBkgdColor = this.settingsService.color.getBkgd(ColorScheme.ItemId.Layout_SinglePaneContent);
        this.container.element.style.setProperty('background-color', containerBkgdColor);
    }

    protected initialiseFocusDetectionHandling() {
        this.rootHtmlElement.addEventListener('click', this._containerElementClickListener, { capture: true });
        this.rootHtmlElement.addEventListener('focusin', this._containerElementFocusinListener, { capture: true });
    }

    protected finaliseFocusDetectionHandling() {
        this.rootHtmlElement.removeEventListener('click', this._containerElementClickListener);
        this.rootHtmlElement.removeEventListener('focusin', this._containerElementFocusinListener);
    }

    protected getInitialComponentStateJsonElement() {
        const json = this.container.initialState as Json | undefined;
        return json === undefined ? undefined : new JsonElement(json);
    }

    protected tryGetChildFrameJsonElement(element: JsonElement | undefined) {
        if (element === undefined) {
            return undefined;
        } else {
            const frameResult = element.tryGetElement(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.frame);
            if (frameResult.isErr()) {
                return undefined;
            } else {
                return frameResult.value;
            }
        }
    }

    protected createChildFrameJsonElement(element: JsonElement) {
        return element.newElement(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.frame);
    }

    protected tryGetStateSchemaVersion(element: JsonElement) {
        return element.tryGetString(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.schemaVersion);
    }

    protected markForCheck() {
        this._cdr.markForCheck();
    }

    protected setTitle(baseTabDisplay: string, contentName: string | undefined) {
        let title: string;
        if (contentName === undefined || contentName === '') {
            title = baseTabDisplay;
        } else {
            title = `${baseTabDisplay}: ${contentName}`;
        }
        this.container.setTitle(title);
    }

    protected processShown() {
        // descendants can override as necessary
    }

    protected processHidden() {
        // descendants can override as necessary
    }

    protected processFocused() {
        this._focused = true;
        // descendants can override as necessary
    }

    protected processBlurred() {
        this._focused = false;
        // descendants can override as necessary
    }

    private _containerShownEventListener = () => this.processShown();
    private _containerHideEventListener = () => this.processHidden();
    private _containerFocusEventListener = () => this.processFocused();
    private _containerBlurEventListener = () => this.processBlurred();

    private _containerElementClickListener = () => this.focus();
    private _containerElementFocusinListener = () => this.focus();

    private handleContainerStateRequestEvent() {
        const element = new JsonElement();
        element.setString(BuiltinDitemNgComponentBaseNgDirective.DitemJsonName.schemaVersion, this.stateSchemaVersion);
        this.save(element);
        return element.json;
    }

    protected abstract save(element: JsonElement): void;
}

export namespace BuiltinDitemNgComponentBaseNgDirective {
    export namespace DitemJsonName {
        export const frame = 'frame';
        export const schemaVersion = 'schemaVersion';
    }

    export type SaveLayoutConfigEventHandler = (this: void) => JsonElement | undefined;

    const goldenLayoutContainerTokenName = 'GoldenLayoutContainer';
    export const goldenLayoutContainerInjectionToken = new InjectionToken<ComponentContainer>(goldenLayoutContainerTokenName);
}
