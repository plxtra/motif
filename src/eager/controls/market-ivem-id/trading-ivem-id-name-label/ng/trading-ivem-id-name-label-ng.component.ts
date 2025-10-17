import { ChangeDetectionStrategy, Component, OnDestroy, inject, input } from '@angular/core';
import { AssertInternalError } from '@pbkware/js-utils';
import { SymbolDetailCacheService, TradingIvemId, TradingMarket } from '@plxtra/motif-core';
import { SymbolDetailCacheNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../../ng/control-component-base-ng.directive';
import { ReadonlyMarketIvemIdNgDirective } from '../../ng/readonly-market-ivem-id-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-trading-ivem-id-name-label',
    templateUrl: './trading-ivem-id-name-label-ng.component.html',
    styleUrls: ['./trading-ivem-id-name-label-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgStyle]
})
export class TradingIvemIdNameLabelNgComponent extends ReadonlyMarketIvemIdNgDirective<TradingMarket> implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    readonly for = input<string>();

    private readonly _symbolDetailCacheService: SymbolDetailCacheService;
    private activePromiseId = 0;

    constructor() {
        super(
            ++TradingIvemIdNameLabelNgComponent.typeInstanceCreateCount,
            ControlComponentBaseNgDirective.labelStateColorItemIdArray,
        );

        const symbolDetailCacheNgService = inject(SymbolDetailCacheNgService);
        this._symbolDetailCacheService = symbolDetailCacheNgService.service;
    }

    override ngOnDestroy() {
        this.finalise();
    }

    protected override applyValue(value: TradingIvemId | undefined, edited: boolean, selectAll: boolean) {
        super.applyValue(value, edited, selectAll);

        if (value === undefined) {
            this.checkApplyCaption('');
        } else {
            const promise = this.applyTradingIvemId(value);
            AssertInternalError.throwErrorIfPromiseRejected(promise, 'SNLNCAVA43344');
        }
    }

    private checkApplyCaption(value: string) {
        if (value !== this.caption) {
            this.applyCaption(value);
        }
    }

    private async applyTradingIvemId(value: TradingIvemId) {
        this.checkApplyCaption('');
        const dataIvemId = this._symbolsService.tryGetBestDataIvemIdFromTradingIvemId(value);
        if (dataIvemId !== undefined) {
            const promiseId = ++this.activePromiseId;
            const detail = await this._symbolDetailCacheService.getDataIvemId(dataIvemId);
            if (detail !== undefined && promiseId === this.activePromiseId) {
                const caption = detail.exists ? detail.name : '';
                this.checkApplyCaption(caption);
            }
        }
    }
}
