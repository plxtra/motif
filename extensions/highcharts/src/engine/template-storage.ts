import { CommaTextSvc, DataIvemId, JsonSvc, StorageSvc } from '@plxtra/motif';
import { StringId, strings } from '../i18n-strings';
import { LogService } from '../log-service';
import { Template } from './template';

export class TemplateStorage {

    private _namedTemplateNames: string[] = [];
    private _unsynchronisedSetNamedTemplateNames: string[] = [];
    private _unsynchronisedRemoveNamedTemplateNames: string[] = [];
    private _storageSynchronised: boolean;

    constructor(
        private readonly _logService: LogService,
        private readonly _storageSvc: StorageSvc,
        private readonly _commaTextSvc: CommaTextSvc,
        private readonly _jsonSvc: JsonSvc,
    ) { }

    async getNamedTemplate(name: string) {
        let templateAsStr: string | undefined;
        const getNamedTemplateResult = await this._storageSvc.getSubNamedItem(TemplateStorage.KeyName.NamedTemplate, name, false);
        if (getNamedTemplateResult.isErr()) {
            const text = `${strings[StringId.Template_GetNamedStorageError]}: "${getNamedTemplateResult.error}" [${name}]`;
            this._logService.logWarning(text);
            templateAsStr = undefined;
        } else {
            templateAsStr = getNamedTemplateResult.value;
        }

        if (templateAsStr === undefined) {
            return undefined;
        } else {
            let template: Template | undefined;
            try {
                template = JSON.parse(templateAsStr) as Template;
            } catch (e) {
                const error = e instanceof Error ? e.message : (typeof e === 'string' ? e : '?');
                const text = `${strings[StringId.Template_GetNamedParseError]}: "${error}" [${name}]`;
                this._logService.logWarning(text);
                template = undefined;
            }
            return template;
        }
    }

    async setNamedTemplate(name: string, template: object) {
        const templateAsStr = JSON.stringify(template);
        let stored = false;
        const namedTemplateResult = await this._storageSvc.setSubNamedItem(TemplateStorage.KeyName.NamedTemplate, name, templateAsStr, false);
        if (namedTemplateResult.isOk()) {
            stored = true;
        } else {
            const text = `${strings[StringId.Template_SetNamedStorageError]}: "${namedTemplateResult.error}" [${name}]`;
            this._logService.logWarning(text);
        }

        if (stored) {
            const synchronised = await this.updateNamedTemplateNamesFromStorage();
            if (!this._namedTemplateNames.includes(name)) {
                this._namedTemplateNames.push(name);
            }

            if (!synchronised) {
                if (!this._unsynchronisedSetNamedTemplateNames.includes(name)) {
                    this._unsynchronisedSetNamedTemplateNames.push(name);
                }
                const removeIdx = this._unsynchronisedRemoveNamedTemplateNames.indexOf(name);
                if (removeIdx >= 0) {
                    this._unsynchronisedRemoveNamedTemplateNames.splice(removeIdx);
                }
            } else {
                await this.pushNamedTemplateNamesToStorage();
            }
        }
    }

    async deleteNamedTemplate(name: string) {
        let stored = false;
        const namedTemplateResult = await this._storageSvc.removeSubNamedItem(TemplateStorage.KeyName.NamedTemplate, name, false);
        if (namedTemplateResult.isOk()) {
            stored = true;
        } else {
            const text = `${strings[StringId.Template_RemoveNamedStorageError]}: "${namedTemplateResult.error}" [${name}]`;
            this._logService.logWarning(text);
        }

        if (stored) {
            const synchronised = await this.updateNamedTemplateNamesFromStorage();
            const namedIdx = this._namedTemplateNames.indexOf(name);
            if (namedIdx >= 0) {
                this._namedTemplateNames.splice(namedIdx);
            }

            if (!synchronised) {
                if (!this._unsynchronisedRemoveNamedTemplateNames.includes(name)) {
                    this._unsynchronisedRemoveNamedTemplateNames.push(name);
                }
                const setIdx = this._unsynchronisedSetNamedTemplateNames.indexOf(name);
                if (setIdx >= 0) {
                    this._unsynchronisedSetNamedTemplateNames.splice(setIdx);
                }
            } else {
                await this.pushNamedTemplateNamesToStorage();
            }
        }
    }

    async getNamedTemplateNames(fromStorage = false) {
        if (!fromStorage && this._storageSynchronised) {
            return this._namedTemplateNames;
        } else {
            await this.updateNamedTemplateNamesFromStorage();
            return this._namedTemplateNames;
        }
    }

    async getDataIvemIdRememberedTemplate(dataIvemId: DataIvemId): Promise<Template | undefined> {
        const jsonElement = this._jsonSvc.createJsonElement();
        dataIvemId.saveToJson(jsonElement);
        const dataIvemIdAsJsonStr = jsonElement.stringify()
        let templateAsStr: string | undefined;
        const rememberedTemplateResult = await this._storageSvc.getSubNamedItem(TemplateStorage.KeyName.LitIvemIdRememberedTemplate, dataIvemIdAsJsonStr, false);
        if (rememberedTemplateResult.isErr()) {
            const text = `${strings[StringId.Template_GetRememberedStorageError]}: "${rememberedTemplateResult.error}" [${dataIvemId.name}]`;
            this._logService.logWarning(text);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            templateAsStr = undefined;
        }

        // if (templateAsStr === undefined) {
            return undefined;
        // } else {
        //     let template: Template | undefined;
        //     try {
        //         template = JSON.parse(templateAsStr) as Template;
        //     } catch (e) {
        //         const text = `${strings[StringId.Template_GetRememberedParseError]}: "${e.message}" [${litIvemId.name}]`;
        //         this._logService.logWarning(text);
        //         template = undefined;
        //     }
        //     return template;
        // }
    }

    async setDataIvemIdRememberedTemplate(dataIvemId: DataIvemId, template: object) {
        const dataIvemIdJsonElement = this._jsonSvc.createJsonElement();
        dataIvemId.saveToJson(dataIvemIdJsonElement);
        const dataIvemIdAsJsonStr = dataIvemIdJsonElement.stringify()

        const templateAsStr = JSON.stringify(template);
        const setRememberedTemplateResult = await this._storageSvc.setSubNamedItem(TemplateStorage.KeyName.LitIvemIdRememberedTemplate, dataIvemIdAsJsonStr, templateAsStr, false);
        if (setRememberedTemplateResult.isErr()) {
            const text = `${strings[StringId.Template_SetRememberedStorageError]}: "${setRememberedTemplateResult.error}" [${dataIvemId.name}]`;
            this._logService.logWarning(text);
        }
    }

    private async updateNamedTemplateNamesFromStorage() {
        let namesAsCommaText: string | undefined;
        let namesGotten = false;
        const getNamedTemplatesNamesResult = await this._storageSvc.getItem(TemplateStorage.KeyName.NamedTemplateNames, false);
        if (getNamedTemplatesNamesResult.isOk()) {
            namesAsCommaText = getNamedTemplatesNamesResult.value;
            namesGotten = true;
        } else {
            const text = `${strings[StringId.Template_GetNamedTemplateNamesStorageError]}: "${getNamedTemplatesNamesResult.error}"`;
            this._logService.logWarning(text);
            namesAsCommaText = undefined;
        }

        if (namesGotten) {
            if (namesAsCommaText === undefined) {
                this._namedTemplateNames.length = 0;
            } else {
                const commaTextResult = this._commaTextSvc.toStringArrayWithResult(namesAsCommaText, true);
                if (commaTextResult.isOk()) {
                    this._namedTemplateNames = commaTextResult.value;
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const text = `${strings[StringId.Template_GetNamedTemplateNamesParseError]}: "${commaTextResult.error}"`;
                    this._namedTemplateNames.length = 0;
                }
            }
            this._storageSynchronised = true;
        } else {
            let pushRequired = this.mergeUnsynchronised();
            if (pushRequired) {
                pushRequired = !await this.pushNamedTemplateNamesToStorage();
            }
            if (!pushRequired) {
                this._unsynchronisedSetNamedTemplateNames.length = 0;
                this._unsynchronisedRemoveNamedTemplateNames.length = 0;
                this._storageSynchronised = false;
            }
        }

        return namesGotten;
    }

    private async pushNamedTemplateNamesToStorage() {
        let succeeded = false;
        const commaTextStr = this._commaTextSvc.fromStringArray(this._namedTemplateNames);
        const setNamedTemplateNamesResult = await this._storageSvc.setItem(TemplateStorage.KeyName.NamedTemplateNames, commaTextStr, false);
        if (setNamedTemplateNamesResult.isOk()) {
            succeeded = true;
        } else {
            const text = `${strings[StringId.Template_SetNamedTemplateNamesStorageError]}: "${setNamedTemplateNamesResult.error}"`;
            this._logService.logWarning(text);
        }

        return succeeded;
    }

    private mergeUnsynchronised() {
        let pushRequired = this.mergeUnsynchronisedSet();
        if (this.mergeUnsynchronisedRemove()) {
            pushRequired = true;
        }
        return pushRequired;
    }

    private mergeUnsynchronisedSet() {
        let pushRequired = false;
        for (const name of this._unsynchronisedSetNamedTemplateNames) {
            if (!this._namedTemplateNames.includes(name)) {
                this._namedTemplateNames.push(name);
                pushRequired = true;
            }
        }
        return pushRequired;
    }

    private mergeUnsynchronisedRemove() {
        let pushRequired = false;
        for (const name of this._unsynchronisedRemoveNamedTemplateNames) {
            const idx = this._namedTemplateNames.indexOf(name);
            if (idx >= 0) {
                this._namedTemplateNames.splice(idx);
                pushRequired = true;
            }
        }
        return pushRequired;
    }
}

export namespace TemplateStorage {
    export const enum KeyName {
        NamedTemplateNames = 'named-template-names',
        NamedTemplate = 'named-template',
        LitIvemIdRememberedTemplate = 'lit-ivem-id-remembered-template',
    }
}
