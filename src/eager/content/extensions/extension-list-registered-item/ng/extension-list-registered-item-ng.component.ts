import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ExtensionInfo, PublisherId } from '@plxtra/motif-core';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';

@Component({
    selector: 'app-extension-list-registered-item',
    templateUrl: './extension-list-registered-item-ng.component.html',
    styleUrls: ['./extension-list-registered-item-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExtensionListRegisteredItemNgComponent extends ContentComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    readonly installSignalEmitter = output();
    protected readonly _info = input.required<ExtensionInfo>();

    constructor() {
        super(++ExtensionListRegisteredItemNgComponent.typeInstanceCreateCount);
    }

    public get abbreviatedPublisherTypeDisplay() { return PublisherId.Type.idToAbbreviatedDisplay(this._info().publisherId.typeId); }
    public get publisherName() { return this._info().publisherId.name; }
    public get name() { return this._info().name; }
    public get version() { return this._info().version; }
    public get description() { return this._info().shortDescription; }

    public handleInstallClick() {
        this.installSignalEmitter.emit();
    }
}
