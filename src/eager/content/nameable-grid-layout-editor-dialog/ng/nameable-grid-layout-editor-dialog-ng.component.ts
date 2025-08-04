import { AfterViewInit, ChangeDetectionStrategy, Component, InjectionToken, Injector, OnDestroy, ValueProvider, ViewContainerRef, inject, viewChild } from '@angular/core';
import { LockOpenListItem, ModifierKey, ModifierKeyId, delay1Tick } from '@pbkware/js-utils';
import {
    AllowedSourcedFieldsColumnLayoutDefinition,
    CommandRegisterService,
    EditableColumnLayoutDefinitionColumnList,
    IconButtonUiAction,
    InternalCommand,
    StringId
} from '@plxtra/motif-core';
import { CommandRegisterNgService, CoreInjectionTokens } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { RevColumnLayoutOrReferenceDefinition } from 'revgrid';
import { ColumnLayoutEditorNgComponent, allowedFieldsInjectionToken, definitionColumnListInjectionToken, oldLayoutDefinitionInjectionToken } from '../../grid-layout-dialog/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-nameable-grid-layout-editor-dialog',
    templateUrl: './nameable-grid-layout-editor-dialog-ng.component.html',
    styleUrls: ['./nameable-grid-layout-editor-dialog-ng.component.scss'],
    providers: [{ provide: definitionColumnListInjectionToken, useClass: EditableColumnLayoutDefinitionColumnList }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NameableColumnLayoutEditorDialogNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly caption = inject(NameableColumnLayoutEditorDialogNgComponent.captionInjectionToken);
    private readonly _definitionColumnList = inject<EditableColumnLayoutDefinitionColumnList>(definitionColumnListInjectionToken, { self: true });

    private readonly _editorComponentSignal = viewChild.required<ColumnLayoutEditorNgComponent>('editor');
    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');

    private _editorComponent: ColumnLayoutEditorNgComponent;
    private _okButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _closeResolve: (value: RevColumnLayoutOrReferenceDefinition | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const _allowedFields = inject(allowedFieldsInjectionToken);
        const _oldLayoutDefinition = inject<AllowedSourcedFieldsColumnLayoutDefinition>(oldLayoutDefinitionInjectionToken);

        super(++NameableColumnLayoutEditorDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._definitionColumnList.load(_allowedFields, _oldLayoutDefinition, _oldLayoutDefinition.fixedColumnCount);
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    ngAfterViewInit(): void {
        this._editorComponent = this._editorComponentSignal();
        this._okButtonComponent = this._okButtonComponentSignal();
        this._cancelButtonComponent = this._cancelButtonComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    open(): NameableColumnLayoutEditorDialogNgComponent.ClosePromise {
        return new Promise<RevColumnLayoutOrReferenceDefinition | undefined>((resolve) => {
            this._closeResolve = resolve;
        });
    }

    private handleOkSignal() {
        this.close(true);
    }

    private handleCancelSignal() {
        this.close(false);
    }

    private createOkUiAction() {
        const commandName = InternalCommand.Id.ColumnLayoutDialog_Ok;
        const displayId = StringId.Ok;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnOk);
        action.signalEvent = () => this.handleOkSignal();
        return action;
    }

    private createCancelUiAction() {
        const commandName = InternalCommand.Id.ColumnLayoutDialog_Cancel;
        const displayId = StringId.Cancel;
        const command = this._commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCancelSignal();
        return action;
    }

    private initialiseComponents() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
    }

    private close(ok: boolean) {
        if (ok) {
            const columnLayoutDefinition = this._editorComponent.getColumnLayoutDefinition();
            const columnLayoutOrReferenceDefinition = new RevColumnLayoutOrReferenceDefinition(columnLayoutDefinition);
            this._closeResolve(columnLayoutOrReferenceDefinition);
        } else {
            this._closeResolve(undefined);
        }
    }
}

export namespace NameableColumnLayoutEditorDialogNgComponent {
    export type ClosePromise = Promise<RevColumnLayoutOrReferenceDefinition | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('NameableColumnLayoutEditorDialogNgComponent.Caption');

    export function open(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedSourcedFieldsColumnLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition,
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
        const allowedFieldsProvider: ValueProvider = {
            provide: allowedFieldsInjectionToken,
            useValue: allowedSourcedFieldsColumnLayoutDefinition.allowedFields,
        };
        const oldLayoutDefinitionProvider: ValueProvider = {
            provide: oldLayoutDefinitionInjectionToken,
            useValue: allowedSourcedFieldsColumnLayoutDefinition,
        };
        const injector = Injector.create({
            providers: [openerProvider, captionProvider, allowedFieldsProvider, oldLayoutDefinitionProvider],
        });

        const componentRef = container.createComponent(NameableColumnLayoutEditorDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component.open();
    }

    export function doesModifierKeyIdSetSpecifyWiden(idSet: ModifierKey.IdSet) {
        return ModifierKey.idSetIncludes(idSet, ModifierKeyId.Shift);
    }
}
