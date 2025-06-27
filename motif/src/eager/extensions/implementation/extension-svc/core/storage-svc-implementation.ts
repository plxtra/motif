import { Result } from '@pbkware/js-utils';
import { AppStorageService, KeyValueStore, RegisteredExtension } from '@plxtra/motif-core';
import { StorageSvc } from '../../../api';

export class StorageSvcImplementation implements StorageSvc {
    private _keyPrefix: string;

    constructor(private readonly _registeredExtension: RegisteredExtension, private readonly _storageService: AppStorageService) {
        this._keyPrefix = KeyValueStore.Key.Extensions + ':' + this._registeredExtension.persistKey + ':';
    }

    getItem(key: string, operatorItem: boolean): Promise<Result<string | undefined>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.getItem(actualKey, operatorItem);
    }

    getSubNamedItem(key: string, subName: string, operatorItem: boolean): Promise<Result<string | undefined>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.getSubNamedItem(actualKey, subName, operatorItem);
    }

    setItem(key: string, value: string, operatorItem: boolean): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.setItem(actualKey, value, operatorItem);
    }

    setSubNamedItem(key: string, subName: string, value: string, operatorItem: boolean): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.setSubNamedItem(actualKey, subName, value, operatorItem);
    }

    removeItem(key: string, operatorItem: boolean): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.removeItem(actualKey, operatorItem);
    }

    removeSubNamedItem(key: string, subName: string, operatorItem: boolean): Promise<Result<void>> {
        const actualKey = this.generateActualKey(key);
        return this._storageService.removeSubNamedItem(actualKey, subName, operatorItem);
    }

    private generateActualKey(key: string) {
        return this._keyPrefix + key;
    }
}
