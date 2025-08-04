import { ChangeDetectionStrategy, Component, OnDestroy, inject, input } from '@angular/core';
import { AssertInternalError } from '@pbkware/js-utils';
import { DataIvemId, DataMarket, SymbolDetailCacheService } from '@plxtra/motif-core';
import { SymbolDetailCacheNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { ReadonlyMarketIvemIdNgDirective } from '../../ng/readonly-market-ivem-id-ng.directive';

@Component({
    selector: 'app-data-ivem-id-name-label',
    templateUrl: './data-ivem-id-name-label-ng.component.html',
    styleUrls: ['./data-ivem-id-name-label-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class DataIvemIdNameLabelNgComponent extends ReadonlyMarketIvemIdNgDirective<DataMarket> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    private readonly _symbolDetailCacheService: SymbolDetailCacheService;
    private activePromiseId = 0;

    constructor() {
        super(
            ++DataIvemIdNameLabelNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
        );

        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);
        this._symbolDetailCacheService = symbolDetailCacheNgService.service;
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(value: DataIvemId | undefined, edited: boolean, selectAll: boolean) {
        super.applyValue(value, edited, selectAll);

        if (value === undefined) {
            this.checkApplyCaption('');
        } else {
            const promise = this.applyDataIvemId(value);
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'SNLNCAVA43344');
        }
    }

    private checkApplyCaption(value: string) {
        if (value !== this.caption) {
            this.applyCaption(value);
        }
    }

    private async applyDataIvemId(value: DataIvemId) {
        this.checkApplyCaption('');
        const promiseId = ++this.activePromiseId;
        const detail = await this._symbolDetailCacheService.getDataIvemId(value);
        if (detail !== undefined && promiseId === this.activePromiseId) {
            const caption = detail.exists ? detail.name : '';
            this.checkApplyCaption(caption);
        }
    }
}
