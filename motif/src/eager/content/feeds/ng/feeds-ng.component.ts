import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Injector,
    OnDestroy,
    ValueProvider,
    ViewContainerRef,
    viewChild
} from '@angular/core';
import { AssertInternalError, LockOpenListItem, ModifierKey, delay1Tick } from '@pbkware/js-utils';
import {
    ColumnLayoutOrReference,
    CommandRegisterService,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    Strings,
    assert
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens, ToastNgService } from 'component-services-ng-api';
import {
    SvgButtonNgComponent
} from 'controls-ng-api';
import { NameableColumnLayoutEditorDialogNgComponent } from '../../nameable-grid-layout-editor-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { FeedsGridNgComponent } from '../grid/ng-api';

@Component({
    selector: 'app-data-markets',
    templateUrl: './feeds-ng.component.html',
    styleUrls: ['./feeds-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FeedsNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public dialogActive = false;

    private readonly _gridComponentSignal = viewChild.required<FeedsGridNgComponent>('grid');
    private readonly _columnsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('columnsButton');
    private readonly _autoSizeColumnWidthsButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('autoSizeColumnWidthsButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _columnsUiAction: IconButtonUiAction;
    private readonly _autoSizeColumnWidthsUiAction: IconButtonUiAction;

    private _gridComponent: FeedsGridNgComponent;
    private _columnsButtonComponent: SvgButtonNgComponent;
    private _autoSizeColumnWidthsButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        commandRegisterNgService: CommandRegisterNgService,
        private readonly _toastNgService: ToastNgService,
        @Inject(CoreInjectionTokens.lockOpenListItemOpener) private readonly _opener: LockOpenListItem.Opener,
    ) {
        super(elRef, ++FeedsNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;
        this._columnsUiAction = this.createColumnsUiAction(commandRegisterService);
        this._autoSizeColumnWidthsUiAction = this.createAutoSizeColumnWidthsUiAction(commandRegisterService);
    }

    ngOnDestroy() {
        this.finalise();
    }

    ngAfterViewInit() {
        this._gridComponent = this._gridComponentSignal();
        this._columnsButtonComponent = this._columnsButtonComponentSignal();
        this._autoSizeColumnWidthsButtonComponent = this._autoSizeColumnWidthsButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();
        delay1Tick(() => this.initialiseComponentsAndMarkForCheck());
    }

    protected finalise() {
        this._columnsUiAction.finalise();
        this._autoSizeColumnWidthsUiAction.finalise();
    }

    private createColumnsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.SelectGridColumns;
        const displayId = StringId.SelectColumnsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.SelectColumnsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.SelectColumns);
        action.pushUnselected();
        action.signalEvent = () => this.openGridColumnsEditorDialog();
        return action;
    }

    private createAutoSizeColumnWidthsUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.AutoSizeGridColumnWidths;
        const displayId = StringId.AutoSizeColumnWidthsCaption;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.AutoSizeColumnWidthsTitle]);
        action.pushIcon(IconButtonUiAction.IconId.AutoSizeColumnWidths);
        action.pushUnselected();
        action.signalEvent = (signalTypeId, downKeys) => this.autoSizeColumnWidths(downKeys);
        return action;
    }

    private initialiseComponentsAndMarkForCheck() {
        this._columnsButtonComponent.initialise(this._columnsUiAction);
        this._autoSizeColumnWidthsButtonComponent.initialise(this._autoSizeColumnWidthsUiAction);
        this._cdr.markForCheck();
    }

    private openGridColumnsEditorDialog() {
        const allowedSourcedFieldsColumnLayoutDefinition = this._gridComponent.frame.createAllowedSourcedFieldsColumnLayoutDefinition();

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this._opener,
            Strings[StringId.Scans_ColumnsDialogCaption],
            allowedSourcedFieldsColumnLayoutDefinition,
        );

        closePromise.then(
            (layoutOrReferenceDefinition) => {
                if (layoutOrReferenceDefinition !== undefined) {
                    const openPromise = this._gridComponent.frame.tryOpenColumnLayoutOrReferenceDefinition(layoutOrReferenceDefinition);
                    openPromise.then(
                        (openResult) => {
                            if (openResult.isErr()) {
                                const error = ColumnLayoutOrReference.formatError(openResult.error);
                                this._toastNgService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.NotificationChannels]} ${Strings[StringId.ColumnLayout]}: ${error}`);
                            }
                        },
                        (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ENCOGCEDO58113'); }
                    );
                }
                this.closeDialog();
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'ENCOGCEDE58113'); }
        );

        this.dialogActive = true;
        this._cdr.markForCheck();
    }

    private autoSizeColumnWidths(downKeys: ModifierKey.IdSet) {
        const widenOnly = NameableColumnLayoutEditorDialogNgComponent.doesModifierKeyIdSetSpecifyWiden(downKeys);
        this._gridComponent.frame.autoSizeAllColumnWidths(widenOnly);
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this._cdr.markForCheck();
    }
}

export namespace FeedsNgComponent {
    export function create(container: ViewContainerRef, opener: LockOpenListItem.Opener) {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const injector = Injector.create({
            providers: [openerProvider],
        });

        const componentRef = container.createComponent(FeedsNgComponent, { injector });
        assert(componentRef.instance instanceof FeedsNgComponent, 'FNCC33345');
        return componentRef.instance;
    }
}
