import { HistorySequenceSeries } from '@plxtra/motif-core';
import {
    HistorySequenceSeries as HistorySequenceSeriesApi,
    HistorySequenceSeriesInterface as HistorySequenceSeriesInterfaceApi,
    MultiEvent as MultiEventApi
} from '../../../../api';

export abstract class HistorySequenceSeriesImplementation implements HistorySequenceSeriesApi {
    get pointCount() { return this.actual.pointCount; }
    abstract get actual(): HistorySequenceSeries;

    finalise() {
        this.actual.finalise();
    }

    initialiseWithNullPoints() {
        this.actual.initialiseWithNullPoints();
    }

    subscribePointInsertedEvent(handler: HistorySequenceSeriesInterfaceApi.PointInsertedEventHandler) {
        return this.actual.subscribePointInsertedEvent(handler);
    }
    unsubscribePointInsertedEvent(subscriptionId: MultiEventApi.SubscriptionId) {
        this.actual.unsubscribePointInsertedEvent(subscriptionId);
    }
    subscribePointsInsertedEvent(handler: HistorySequenceSeriesInterfaceApi.PointsInsertedEventHandler) {
        return this.actual.subscribePointsInsertedEvent(handler);
    }
    unsubscribePointsInsertedEvent(subscriptionId: MultiEventApi.SubscriptionId) {
        this.actual.unsubscribePointsInsertedEvent(subscriptionId);
    }
    subscribePointUpdatedEvent(handler: HistorySequenceSeriesInterfaceApi.PointUpdatedEventHandler) {
        return this.actual.subscribePointUpdatedEvent(handler);
    }
    unsubscribePointUpdatedEvent(subscriptionId: MultiEventApi.SubscriptionId) {
        this.actual.unsubscribePointUpdatedEvent(subscriptionId);
    }
}

export namespace HistorySequenceSeriesImplementation {
    export function baseFromApi(seriesApi: HistorySequenceSeriesApi) {
        const implementation = seriesApi as HistorySequenceSeriesImplementation;
        return implementation.actual;
    }
}
