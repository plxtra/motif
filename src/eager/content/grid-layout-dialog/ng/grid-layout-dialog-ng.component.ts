import { AfterViewInit, ChangeDetectionStrategy, Component, inject, InjectionToken, Injector, OnDestroy, ValueProvider, viewChild, ViewContainerRef } from '@angular/core';
import { delay1Tick, LockOpenListItem } from '@pbkware/js-utils';
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
import { RevColumnLayoutDefinition } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';
import { ColumnLayoutEditorNgComponent } from '../editor/ng-api';
import { allowedFieldsInjectionToken, definitionColumnListInjectionToken, oldLayoutDefinitionInjectionToken } from './grid-layout-dialog-ng-injection-tokens';

@Component({
    selector: 'app-grid-layout-dialog',
    templateUrl: './grid-layout-dialog-ng.component.html',
    styleUrls: ['./grid-layout-dialog-ng.component.scss'],
    providers: [{ provide: definitionColumnListInjectionToken, useClass: EditableColumnLayoutDefinitionColumnList }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgButtonNgComponent]
})
export class ColumnLayoutDialogNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    readonly caption = inject(ColumnLayoutDialogNgComponent.captionInjectionToken);
    private readonly _opener = inject<LockOpenListItem.Opener>(CoreInjectionTokens.lockOpenListItemOpener);
    private readonly _oldLayoutDefinition = inject<AllowedSourcedFieldsColumnLayoutDefinition>(oldLayoutDefinitionInjectionToken);
    private readonly _definitionColumnList = inject<EditableColumnLayoutDefinitionColumnList>(definitionColumnListInjectionToken, { self: true });

    private readonly _subDialogContainerSignal = viewChild.required('subDialog', { read: ViewContainerRef });
    private readonly _okButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('okButton');
    private readonly _cancelButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('cancelButton');

    private _subDialogContainer: ViewContainerRef;
    private _okButtonComponent: SvgButtonNgComponent;
    private _cancelButtonComponent: SvgButtonNgComponent;

    private _commandRegisterService: CommandRegisterService;

    private _okUiAction: IconButtonUiAction;
    private _cancelUiAction: IconButtonUiAction;

    private _editor: ColumnLayoutEditorNgComponent;

    private _closeResolve: (value: RevColumnLayoutDefinition | undefined) => void;
    private _closeReject: (reason: unknown) => void;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);
        const allowedFields = inject(allowedFieldsInjectionToken);

        super(++ColumnLayoutDialogNgComponent.typeInstanceCreateCount);

        this._commandRegisterService = commandRegisterNgService.service;
        this._okUiAction = this.createOkUiAction();
        this._cancelUiAction = this.createCancelUiAction();

        this._definitionColumnList.load(allowedFields, this._oldLayoutDefinition, this._oldLayoutDefinition.fixedColumnCount);
    }

    ngOnDestroy() {
        this._okUiAction.finalise();
        this._cancelUiAction.finalise();
    }

    ngAfterViewInit(): void {
        this._subDialogContainer = this._subDialogContainerSignal();
        this._okButtonComponent = this._okButtonComponentSignal();
        this._cancelButtonComponent = this._cancelButtonComponentSignal();

        delay1Tick(() => this.initialise());
    }

    waitClose(): ColumnLayoutDialogNgComponent.ClosePromise {
        return new Promise<RevColumnLayoutDefinition | undefined>((resolve, reject) => {
            this._closeResolve = resolve;
            this._closeReject = reject;
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

    private initialise() {
        this._okButtonComponent.initialise(this._okUiAction);
        this._cancelButtonComponent.initialise(this._cancelUiAction);
        this.showEditor();
    }

    private close(ok: boolean) {
        if (ok) {
            this._closeResolve(this._editor.getColumnLayoutDefinition());
        } else {
            this._closeResolve(undefined);
        }
    }

    private showEditor() {
        this._subDialogContainer.clear();
        this._editor = ColumnLayoutEditorNgComponent.create(this._subDialogContainer);
    }
}

export namespace ColumnLayoutDialogNgComponent {
    export type ClosePromise = Promise<RevColumnLayoutDefinition | undefined>;
    export const captionInjectionToken = new InjectionToken<string>('ColumnLayoutDialogNgComponent.Caption');

    export function create(
        container: ViewContainerRef,
        opener: LockOpenListItem.Opener,
        caption: string,
        allowedSourcedFieldsColumnLayoutDefinition: AllowedSourcedFieldsColumnLayoutDefinition,
    ): ColumnLayoutDialogNgComponent {
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

        const componentRef = container.createComponent(ColumnLayoutDialogNgComponent, { injector });
        const component = componentRef.instance;

        return component;
    }
}
