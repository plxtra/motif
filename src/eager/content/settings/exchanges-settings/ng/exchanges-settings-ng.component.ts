import { ChangeDetectionStrategy, Component, ViewContainerRef } from '@angular/core';
import { ExchangeSettings } from '@plxtra/motif-core';
import { SettingsComponentBaseNgDirective } from '../../ng/settings-component-base-ng.directive';

@Component({
    selector: 'app-exchanges-settings',
    templateUrl: './exchanges-settings-ng.component.html',
    styleUrls: ['./exchanges-settings-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExchangesSettingsNgComponent extends SettingsComponentBaseNgDirective {
    private static typeInstanceCreateCount = 0;

    public settingsArray: ExchangeSettings[];

    constructor() {
        super(++ExchangesSettingsNgComponent.typeInstanceCreateCount);

        const exchangesSettings = this.settingsService.exchanges;
        this.settingsArray = exchangesSettings.settingsArray;

        this.processSettingsChanged();
    }

    protected processSettingsChanged() {
        this.markForCheck();
    }
}

export namespace ExchangesSettingsNgComponent {
    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef = container.createComponent(ExchangesSettingsNgComponent);
        return componentRef.instance;
    }
}
