import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TinyColor } from '@ctrl/tinycolor';
import { ModifierKey, StringBuilder, delay1Tick, tryGetErrorMessage } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    ColorScheme,
    ColorSettings,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
    assert
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { CommandRegisterNgService, ToastNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-color-scheme-preset-code',
    templateUrl: './color-scheme-preset-code-ng.component.html',
    styleUrls: ['./color-scheme-preset-code-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ColorSchemePresetCodeNgComponent extends ContentComponentBaseNgDirective implements AfterViewInit, OnDestroy {
    private static typeInstanceCreateCount = 0;

    private static readonly _tabs2 = ' '.repeat(8);
    private static readonly _tabs3 = ' '.repeat(12);

    public dialogCaption = 'Preset code for current color scheme (only for developers)';
    public presetCode = '';

    private _cdr = inject(ChangeDetectorRef);

    private readonly _returnButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('returnButton');
    private readonly _copyToClipboardButtonSignal = viewChild.required<SvgButtonNgComponent>('copyToClipboardButton');

    private readonly _toastService: ToastService;
    private readonly _commandRegisterService: CommandRegisterService;

    private _returnButtonComponent: SvgButtonNgComponent;
    private _copyToClipboardButton: SvgButtonNgComponent;


    private _returnUiAction: IconButtonUiAction;
    private _copyToClipboardUiAction: IconButtonUiAction;

    private _closeResolve: () => void;
    private _closeReject: (reason: unknown) => void;

    constructor() {
        const toastNgService = inject(ToastNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++ColorSchemePresetCodeNgComponent.typeInstanceCreateCount);

        this._toastService = toastNgService.service;
        this._commandRegisterService = commandRegisterNgService.service;

        this._returnUiAction = this.createReturnUiAction();
        this._copyToClipboardUiAction = this.createCopyToClipboardUiAction();
    }

    ngAfterViewInit() {
        this._returnButtonComponent = this._returnButtonComponentSignal();
        this._copyToClipboardButton = this._copyToClipboardButtonSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    ngOnDestroy() {
        this._returnUiAction.finalise();
        this._copyToClipboardUiAction.finalise();
    }

    open(colorSettings: ColorSettings): ColorSchemePresetCodeNgComponent.ClosePromise {
        this.generateCodeText(colorSettings);
        this._cdr.markForCheck();

        return new Promise<void>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
        });
    }

    private handleCopyToClipboardSignalAction(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        const selection = document.getSelection();
        if (selection !== null && selection.rangeCount > 0) {
            const text = selection.toString();
            if (text.length > 0) {
                const updatedPromise = navigator.clipboard.writeText(text);
                updatedPromise.then(
                    () => {/* nothing to do */},
                    (reason: unknown) => {
                        const reasonText = tryGetErrorMessage(reason);
                        const reasonSuffix = reasonText !== undefined ? `: ${reasonText}` : '';
                        this._toastService.popup(`${Strings[StringId.CopyToClipboard]} ${Strings[StringId.Error]}${reasonSuffix}`);
                    }
                );
            }
        }
    }

    private handleReturnSignalAction(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.close();
    }

    private createReturnUiAction() {
        const commandName = InternalCommand.Id.ColumnLayoutDialog_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.SubWindowReturn);
        action.signalEvent = (signalTypeId, downKeys) => this.handleReturnSignalAction(signalTypeId, downKeys);
        return action;
    }

    private createCopyToClipboardUiAction() {
        const commandName = InternalCommand.Id.ColorSchemePresetCode_CopyToClipboard;
        const displayId = StringId.CopyToClipboard;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.CopyToClipboard);
        action.signalEvent =
            (signalTypeId, downKeys) => this.handleCopyToClipboardSignalAction(signalTypeId, downKeys);
        return action;
    }


    private close() {
        this._closeResolve();
    }

    private initialiseComponents() {
        this._returnButtonComponent.initialise(this._returnUiAction);
        this._copyToClipboardButton.initialise(this._copyToClipboardUiAction);
    }

    private calculateName(color: string): string {
        const tinyColor = new TinyColor(color);
        const name = tinyColor.toName();
        if (name === false) {
            return `'${color}'`;
        } else {
            return `'${name}'`;
        }
    }

    private generateCodeText(colorSettings: ColorSettings) {
        const builder = new StringBuilder(ColorScheme.Item.idCount + 3);
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs2}const itemsObject: ItemsObject = {`);
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs3}/* eslint-disable max-len */`);
        for (let id = 0; id < ColorScheme.Item.idCount; id++) {
            let bkgdColor = colorSettings.getItemBkgd(id);
            if (bkgdColor === '') {
                bkgdColor = 'inherit';
            } else {
                bkgdColor = this.calculateName(bkgdColor);
            }
            let foreColor = colorSettings.getItemFore(id);
            if (foreColor === '') {
                foreColor = 'inherit';
            } else {
                foreColor = this.calculateName(foreColor);
            }
            const name = ColorScheme.Item.idToName(id);
            const line = `${ColorSchemePresetCodeNgComponent._tabs3}${name}: { id: ColorScheme.ItemId.${name}, ` +
                `bkgd: ${bkgdColor}, fore: ${foreColor} },`;
            builder.appendLine(line);
        }
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs3}/* eslint-enable max-len */`);
        builder.appendLine(`${ColorSchemePresetCodeNgComponent._tabs2}};`);
        builder.appendLine();
        this.presetCode = builder.toString();
    }
}

export namespace ColorSchemePresetCodeNgComponent {
    export type ClosePromise = Promise<void>;

    export function open(
        container: ViewContainerRef,
        colorSettings: ColorSettings,
    ): ClosePromise {
        container.clear();
        const componentRef = container.createComponent(ColorSchemePresetCodeNgComponent);
        assert(componentRef.instance instanceof ColorSchemePresetCodeNgComponent, 'CSPCCO232324');

        const component = componentRef.instance;

        return component.open(colorSettings);
    }
}
