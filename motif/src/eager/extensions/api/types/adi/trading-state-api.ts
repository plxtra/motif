/** @public */
export interface TradingState {
    readonly name: string;
    readonly allows: TradingState.Allows;
    readonly reason: TradingState.Reason;
}

/** @public */
export namespace TradingState {
    export const enum AllowEnum {
        /** Orders may be placed */
        OrderPlace = 'OrderPlace',
        /** Orders may be amended. */
        OrderAmend = 'OrderAmend',
        /** Orders may be cancelled. */
        OrderCancel = 'OrderCancel',
        /** Orders may be moved. */
        OrderMove = 'OrderMove',
        /** Orders will be automatically matched and Trades occur. */
        Match = 'Match',
        /** Trades may be reported or cancelled. */
        ReportCancel = 'ReportCancel',
    }

    export type Allow = keyof typeof AllowEnum;
    export type Allows = readonly Allow[];

    export const enum ReasonEnum {
        /** The reason is unknown. */
        Unknown = 'Unknown',
        /** State is a normal part of the order life-cycle. */
        Normal = 'Normal',
        /** This state represents a suspension. */
        Suspend = 'Suspend',
        /** This state represents a temporary trading halt. */
        TradingHalt = 'TradingHalt',
        /** This state represents a pending news release. */
        NewsRelease = 'NewsRelease',
    }

    export type Reason = keyof typeof ReasonEnum;
}
