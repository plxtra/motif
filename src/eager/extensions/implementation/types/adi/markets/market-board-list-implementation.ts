import { MarketBoard, MarketsService } from '@plxtra/motif-core';
import { MarketBoard as MarketBoardApi, MarketBoardList as MarketBoardListApi } from '../../../../api';
import { ReadonlyApiComparableListImplementation } from '../../sys/internal-api';
import { DataMarketImplementation } from './data-market-api-implementation';
import { ExchangeImplementation } from './exchange-api-implementation';
import { MarketBoardImplementation } from './market-board-api-implementation';
import { TradingMarketImplementation } from './trading-market-api-implementation';

export class MarketBoardListImplementation extends ReadonlyApiComparableListImplementation<MarketBoardApi, MarketBoard> implements MarketBoardListApi {
    declare readonly actual: MarketsService.MarketBoards;

    override itemToApi(value: MarketBoard): MarketBoardApi {
        return MarketBoardImplementation.toApi(value, ExchangeImplementation, DataMarketImplementation, TradingMarketImplementation);
    }
    override itemFromApi(value: MarketBoardApi): MarketBoard {
        return MarketBoardImplementation.fromApi(value);
    }
    override itemArrayToApi(value: MarketBoard[]): MarketBoardApi[] {
        const count = value.length;
        const result = new Array<MarketBoardApi>(count);
        for (let i = 0; i < count; i++) {
            const tradingMarket = value[i];
            result[i] = this.itemToApi(tradingMarket);
        }
        return result;
    }
}

export namespace MarketBoardListImplementation {
    export function toApi(value: MarketsService.MarketBoards): MarketBoardListApi {
        return new MarketBoardListImplementation(value);
    }

    export function fromApi(value: MarketBoardListApi): MarketsService.MarketBoards {
        const implementation = value as MarketBoardListImplementation;
        return implementation.actual;
    }
}
