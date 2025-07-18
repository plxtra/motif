import { Result } from '../types';

/** @public */
export interface StorageSvc {
    getItem(key: string, operatorItem: boolean): Promise<Result<string | undefined>>;
    getSubNamedItem(key: string, subName: string, operatorItem: boolean): Promise<Result<string | undefined>>;
    setItem(key: string, value: string, operatorItem: boolean): Promise<Result<void>>;
    setSubNamedItem(key: string, subName: string, value: string, operatorItem: boolean): Promise<Result<void>>;
    removeItem(key: string, operatorItem: boolean): Promise<Result<void>>;
    removeSubNamedItem(key: string, subName: string, operatorItem: boolean): Promise<Result<void>>;
}
