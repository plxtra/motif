import { AfterViewInit, ChangeDetectionStrategy, Component, inject, InjectionToken, Injector, ValueProvider, viewChild, ViewContainerRef } from '@angular/core';
import { AssertInternalError, delay1Tick, LockOpenListItem } from '@pbkware/js-utils';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    CommandRegisterService,
    DataIvemId,
    IconButtonUiAction,
    InternalCommand,
    StringId,
    UiComparableList,
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { NameableColumnLayoutEditorDialogNgComponent } from '../../../nameable-grid-layout-editor-dialog/ng-api';
import { DataIvemIdListEditorNgDirective } from '../../ng/data-ivem-id-list-editor-ng.directive';

@Component({
    selector: 'app-data-ivem-id-list-editor-dialog',
    templateUrl: './data-ivem-id-list-editor-dialog-ng.component.html',
    styleUrls: ['./data-ivem-id-list-editor-dialog-ng.component.scss'],
    providers: [DataIvemIdListEditorNgDirective.initialCustomGridSettingsProvider],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataIvemIdListEditorDialogNgComponent extends DataIvemIdListEditorNgDirective implements AfterViewInit{
    private static typeInstanceCreateCount = 0;

    public dialogActive = false;

    readonly caption = inject(DataIvemIdListEditorDialogNgComponent.captionInjectionToken);

    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _dialogContainerSignal = viewChild.required('dialogContainer', { read: ViewContainerRef });

    private readonly _okUiAction: IconButtonUiAction;

    private _okButtonComponent: SvgButtonNgComponent;
    private _dialogContainer: ViewContainerRef;

    private _columnsEditCaption: string;
    private _closeResolve: DataIvemIdListEditorDialogNgComponent.CloseResolve;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++DataIvemIdListEditorDialogNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction(commandRegisterService);
    }

    open(columnsEditCaption: string): DataIvemIdListEditorDialogNgComponent.ClosePromise {
        this._columnsEditCaption = columnsEditCaption;
        return new Promise<void>((resolve) => {
            this._closeResolve = resolve;
        });
    }

    protected override finalise() {
        this._okUiAction.finalise();
        super.finalise();
    }

    protected override processAfterViewInit(): void {
        super.processAfterViewInit();

        this._okButtonComponent = this._okButtonComponentSignal();
        this._dialogContainer = this._dialogContainerSignal();

        delay1Tick(() => this.initialiseDialogComponents());
    }

    protected override editGridColumns(allowedSourcedFieldsColumnLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition) {
        this.dialogActive = true;

        // We cannot just return the promise from the dialog as we need to close the dialog as well.
        // So return a separate promise which is resolved when dialog is closed.
        let definitonResolveFtn: (this: void, definition: RevColumnLayoutOrReferenceDefinition | undefined) => void;

        const definitionPromise = new Promise<RevColumnLayoutOrReferenceDefinition | undefined>(
            (resolve) => {
                definitonResolveFtn = resolve;
            }
        )

        this.enabled = false;

        const closePromise = NameableColumnLayoutEditorDialogNgComponent.open(
            this._dialogContainer,
            this.opener,
            this._columnsEditCaption,
            allowedSourcedFieldsColumnLayoutDefinition,
        );
        closePromise.then(
            (definition) => {
                definitonResolveFtn(definition);
                this.closeDialog();
                this.enabled = true;
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'LIILEDNCEGC50987'); }
        );

        this._cdr.markForCheck();

        return definitionPromise;
    }

    private createOkUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ColumnLayoutDialog_Ok;
        const displayId = StringId.Ok;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => {
            this.close(true);
        }
        return action;
    }

    private initialiseDialogComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
    }

    private close(ok: boolean) {
        if (ok) {
            this._closeResolve();
        } else {
            this._closeResolve();
        }
    }

    private closeDialog() {
        this._dialogContainer.clear();
        this.dialogActive = false;
        this._cdr.markForCheck();
    }
}

export namespace DataIvemIdListEditorDialogNgComponent {
    export type ClosePromise = Promise<void>;
    export type CloseResolve = (this: void) => void;
    export const captionInjectionToken = new InjectionToken<string>('DataIvemIdListEditorDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        list: UiComparableList<DataIvemId>,
        columnsEditCaption: string,
    ): ClosePromise {
        container.clear();

        const openerProvider: ValueProvider = {
            provide: CoreInjectionTokens.lockOpenListItemOpener,
            useValue: opener,
        };
        const captionProvider: ValueProvider = {
            provide: captionInjectionToken,
            useValue: caption,
        }
        const listProvider: ValueProvider = {
            provide: DataIvemIdListEditorNgDirective.listInjectionToken,
            useValue: list,
        }
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, listProvider],
        });

        const componentRef = container.createComponent(DataIvemIdListEditorDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component.open(columnsEditCaption);
    }
}
