import { AfterViewInit, ChangeDetectionStrategy, Component, inject, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick } from '@pbkware/js-utils';
import { CommandRegisterService, IconButtonUiAction, InternalCommand, StringId, Strings } from '@plxtra/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from 'controls-ng-api';
import { ContentComponentBaseNgDirective } from '../../../../../../../../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-delete-scan-field-condition',
    templateUrl: './delete-scan-field-condition-ng.component.html',
    styleUrls: ['./delete-scan-field-condition-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SvgButtonNgComponent]
})
export class DeleteScanFieldConditionNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    deleteEventer: DeleteScanFieldConditionNgComponent.DeleteEventer | undefined;

    private readonly _deleteControlComponentSignal = viewChild.required<SvgButtonNgComponent>('deleteControl');

    private readonly _deleteMeUiAction: IconButtonUiAction;

    private _deleteControlComponent: SvgButtonNgComponent;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++DeleteScanFieldConditionNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;
        this._deleteMeUiAction = this.createDeleteMeUiAction(commandRegisterService);
    }

    ngOnDestroy(): void {
        this._deleteMeUiAction.finalise();
        delay1Tick(() => this._deleteControlComponent.initialise(this._deleteMeUiAction));
    }

    ngAfterViewInit(): void {
        this._deleteControlComponent = this._deleteControlComponentSignal();
    }

    private createDeleteMeUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanFieldCondition_DeleteMe;
        const displayId = StringId.ScanFieldConditionOperandsEditorCaption_DeleteMe;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushTitle(Strings[StringId.ScanFieldConditionOperandsEditorTitle_DeleteMe]);
        action.pushIcon(IconButtonUiAction.IconId.Delete);
        action.pushUnselected();
        action.signalEvent = () => {
            if (this.deleteEventer === undefined) {
                throw new AssertInternalError('DSFCNCCDMUIA60912');
            } else {
                this.deleteEventer();
            }
        }

        return action;
    }
}

export namespace DeleteScanFieldConditionNgComponent {
    // eslint-disable-next-line prefer-const
    export let typeInstanceCreateCount = 0;

    export type DeleteEventer = (this: void) => void;
}
