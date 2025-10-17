import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, inject, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, HtmlTypes } from '@pbkware/js-utils';
import { IntegerUiAction } from '@pbkware/ui-action';
import { ColorScheme, CommandRegisterService, IconButtonUiAction, InternalCommand, ScanFormulaZenithEncodingService, StringId, Strings } from '@plxtra/motif-core';
import { CellPainterFactoryNgService, CommandRegisterNgService, SettingsNgService } from 'component-services-ng-api';
import { CaptionLabelNgComponent, ControlComponentBaseNgDirective, IntegerTextInputNgComponent, SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../ng/content-component-base-ng.directive';
import { ZenithScanFormulaViewDecodeProgressFrame } from '../zenith-scan-formula-view-decode-progress-frame';
import { SvgButtonNgComponent as SvgButtonNgComponent_1 } from '../../../../../../../../../controls/boolean/button/icon/svg-button/ng/svg-button-ng.component';
import { CaptionLabelNgComponent as CaptionLabelNgComponent_1 } from '../../../../../../../../../controls/label/caption-label/ng/caption-label-ng.component';
import { IntegerTextInputNgComponent as IntegerTextInputNgComponent_1 } from '../../../../../../../../../controls/number/integer/integer-text-input/ng/integer-text-input-ng.component';

@Component({
    selector: 'app-zenith-scan-formula-view-decode-progress',
    templateUrl: './zenith-scan-formula-view-decode-progress-ng.component.html',
    styleUrls: ['./zenith-scan-formula-view-decode-progress-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgButtonNgComponent_1, CaptionLabelNgComponent_1, IntegerTextInputNgComponent_1]
})
export class ZenithScanFormulaViewDecodeProgressNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.display') private hostDisplay = HtmlTypes.Display.None;

    displayedChangedEventer: ZenithScanFormulaViewDecodeProgressNgComponent.DisplayedChangedEventer | undefined;
    defaultWidthSetEventer: ZenithScanFormulaViewDecodeProgressNgComponent.DefaultWidthSetEventer | undefined;

    public title = Strings[StringId.ZenithScanFormulaViewDecodeProgress_Title];

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _closeButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('closeButton');
    private readonly _countLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('countLabel');
    private readonly _countControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('countControl');
    private readonly _depthLabelComponentSignal = viewChild.required<CaptionLabelNgComponent>('depthLabel');
    private readonly _depthControlComponentSignal = viewChild.required<IntegerTextInputNgComponent>('depthControl');
    private readonly _gridHostElementSignal = viewChild.required<ElementRef<HTMLElement>>('gridHost');

    private readonly _frame: ZenithScanFormulaViewDecodeProgressFrame;
    private readonly _closeUiAction: IconButtonUiAction;
    private readonly _countUiAction: IntegerUiAction;
    private readonly _depthUiAction: IntegerUiAction;

    private _closeButtonComponent: SvgButtonNgComponent;
    private _countLabelComponent: CaptionLabelNgComponent;
    private _countControlComponent: IntegerTextInputNgComponent;
    private _depthLabelComponent: CaptionLabelNgComponent;
    private _depthControlComponent: IntegerTextInputNgComponent;
    private _gridHostElement: ElementRef<HTMLElement>;

    private _defaultWidth: number | undefined;

    constructor() {
        const settingsNgService = inject(SettingsNgService);
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const cellPainterFactoryNgService = inject(CellPainterFactoryNgService);

        super(++ZenithScanFormulaViewDecodeProgressNgComponent.typeInstanceCreateCount);

        this._frame = new ZenithScanFormulaViewDecodeProgressFrame(settingsNgService.service, cellPainterFactoryNgService.service);

        const commandRegisterService = commandRegisterNgService.service;
        this._closeUiAction = this.createCloseUiAction(commandRegisterService);
        this._countUiAction = this.createCountUiAction();
        this._depthUiAction = this.createDepthUiAction();
    }

    get displayed() { return this.hostDisplay === HtmlTypes.Display.Flex; }
    set displayed(value: boolean) { this.setDisplayed(value); }
    get defaultWidth() { return this._defaultWidth; }
    get emWidth() { return this._frame.emWidth; }

    ngOnDestroy(): void {
        this._closeUiAction.finalise();
        this._countUiAction.finalise();
        this._depthUiAction.finalise();
        this._frame.finalise();
    }

    ngAfterViewInit(): void {
        this._closeButtonComponent = this._closeButtonComponentSignal();
        this._countLabelComponent = this._countLabelComponentSignal();
        this._countControlComponent = this._countControlComponentSignal();
        this._depthLabelComponent = this._depthLabelComponentSignal();
        this._depthControlComponent = this._depthControlComponentSignal();
        this._gridHostElement = this._gridHostElementSignal();

        delay1Tick(() => {
            this.initialiseComponents();
            this._frame.setupGrid(this._gridHostElement.nativeElement);
        });
    }

    setDecodeProgress(progress: ScanFormulaZenithEncodingService.DecodeProgress | undefined) {
        if (progress === undefined) {
            this._countUiAction.pushValue(undefined);
            this._countUiAction.pushDisabled();
            this._depthUiAction.pushValue(undefined);
            this._depthUiAction.pushDisabled();
            this._frame.setData(undefined);
        } else {
            this._countUiAction.pushValue(progress.tupleNodeCount);
            this._countUiAction.pushReadonly();
            this._depthUiAction.pushValue(progress.tupleNodeDepth);
            this._depthUiAction.pushReadonly();
            this._frame.setData(progress.decodedNodes);
        }

        this.checkDefaultWidth();
    }

    waitLastServerNotificationRendered(next: boolean) {
        return this._frame.waitLastServerNotificationRendered(next);
    }

    private createCloseUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ZenithScanFormulaViewDecodeProgress_Close;
        const displayId = StringId.Close;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.Close);
        action.signalEvent = () => this.handleCloseSignal();
        return action;
    }

    private createCountUiAction() {
        const action = new IntegerUiAction(false);
        action.pushDisabled();
        action.pushCaption(Strings[StringId.ZenithScanFormulaViewDecodeProgress_CountCaption]);
        action.pushTitle(Strings[StringId.ZenithScanFormulaViewDecodeProgress_CountTitle]);
        return action;
    }

    private createDepthUiAction() {
        const action = new IntegerUiAction(false);
        action.pushDisabled();
        action.pushCaption(Strings[StringId.ZenithScanFormulaViewDecodeProgress_DepthCaption]);
        action.pushTitle(Strings[StringId.ZenithScanFormulaViewDecodeProgress_DepthTitle]);
        return action;
    }

    private initialiseComponents() {
        const readonlyTextColorSchemeItemId = ColorScheme.ItemId.TextControl_Valid;
        const readonlyLabelColorSchemeItemId = ColorScheme.ItemId.Label_Valid;
        this._closeButtonComponent.initialise(this._closeUiAction);
        this._countLabelComponent.initialise(this._countUiAction);
        this._countLabelComponent.stateColorItemIdArray[ControlComponentBaseNgDirective.StateColorItemIdArray.Index.ReadOnly] = readonlyLabelColorSchemeItemId;
        this._countControlComponent.initialise(this._countUiAction);
        this._countControlComponent.stateColorItemIdArray[ControlComponentBaseNgDirective.StateColorItemIdArray.Index.ReadOnly] = readonlyTextColorSchemeItemId;
        this._depthLabelComponent.initialise(this._depthUiAction);
        this._depthLabelComponent.stateColorItemIdArray[ControlComponentBaseNgDirective.StateColorItemIdArray.Index.ReadOnly] = readonlyLabelColorSchemeItemId;
        this._depthControlComponent.initialise(this._depthUiAction);
        this._depthControlComponent.stateColorItemIdArray[ControlComponentBaseNgDirective.StateColorItemIdArray.Index.ReadOnly] = readonlyTextColorSchemeItemId;
    }

    private handleCloseSignal() {
        // this._frame.closeGridSource(true);
        this.setDisplayed(false);
        this._cdr.markForCheck();
    }

    private setDisplayed(value: boolean) {
        const hostDisplay = value ? HtmlTypes.Display.Flex : HtmlTypes.Display.None;
        if (hostDisplay !== this.hostDisplay) {
            this.hostDisplay = hostDisplay;
            this._cdr.markForCheck();

            this.checkDefaultWidth();

            if (this.displayedChangedEventer !== undefined) {
                this.displayedChangedEventer();
            }
        }
    }

    private checkDefaultWidth() {
        if (this._defaultWidth === undefined && this._frame.dataBeenSet) {
            const promise = this._frame.waitLastServerNotificationRendered(false);
            promise.then(
                () => {
                    this._defaultWidth = this._frame.calculateActiveColumnsWidth();
                    if (this.defaultWidthSetEventer !== undefined) {
                        this.defaultWidthSetEventer();
                    }
                },
                (error: unknown) => { throw AssertInternalError.createIfNotError(error, 'ZSFVDPNCCDW55598'); }
            );
        }

    }
}

export namespace ZenithScanFormulaViewDecodeProgressNgComponent {
    export type DisplayedChangedEventer = (this: void) => void;
    export type DefaultWidthSetEventer = (this: void) => void;
}
