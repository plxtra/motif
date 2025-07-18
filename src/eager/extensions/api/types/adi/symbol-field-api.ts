/** @public */
export const enum SymbolFieldEnum {
    Code = 'Code',
    Name = 'Name',
    Short = 'Short',
    Long = 'Long',
    Ticker = 'Ticker',
    Gics = 'Gics',
    Isin = 'Isin',
    Base = 'Base',
    Ric = 'Ric',
}

/** @public */
export type SymbolField = keyof typeof SymbolFieldEnum;
