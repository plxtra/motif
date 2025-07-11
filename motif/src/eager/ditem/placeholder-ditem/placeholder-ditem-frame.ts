import { Json, JsonElement, Ok, Result } from '@pbkware/js-utils';
import {
    AdiService,
    CommandRegisterService,
    ErrorCode,
    MarketsService,
    PublisherId,
    SettingsService,
    StringId,
    Strings,
    SymbolsService
} from '@plxtra/motif-core';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemComponent } from '../ditem-component';
import { DitemFrame } from '../ditem-frame';

export class PlaceholderDitemFrame extends BuiltinDitemFrame {
    readonly initialised = true;

    private _placeheldDefinition: PlaceholderDitemFrame.Placeheld;
    private _invalidReason: string | undefined;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.Placeholder,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    override get builtinDitemTypeId() { return BuiltinDitemFrame.BuiltinTypeId.Placeholder; }

    get placeheld() { return this._placeheldDefinition; }

    public get placeheldExtensionPublisherType() {
        return PublisherId.Type.idToDisplay(this._placeheldDefinition.definition.extensionId.publisherId.typeId);
    }
    public get placeheldExtensionPublisher() { return this._placeheldDefinition.definition.extensionId.publisherId.name; }
    public get placeheldExtensionName() { return this._placeheldDefinition.definition.extensionId.name; }
    public get placeheldConstructionMethod() {
        return DitemComponent.ConstructionMethod.idToName(this._placeheldDefinition.definition.constructionMethodId);
    }
    public get placeheldComponentTypeName() { return this._placeheldDefinition.definition.componentTypeName; }
    public get placeheldComponentState() { return this._placeheldDefinition.state; }
    public get placeheldReason() { return this._placeheldDefinition.reason; }

    public get invalid() { return this._invalidReason !== undefined; }
    public get invalidReason() { return this._invalidReason; }

    setPlaceheld(value: PlaceholderDitemFrame.Placeheld) {
        this._placeheldDefinition = value;
    }

    override constructLoad(element: JsonElement | undefined) {
        if (element === undefined) {
            this._placeheldDefinition = this.createInvalidPlacehold(Strings[StringId.PlaceholderDitem_ComponentStateNotSpecified]);
        } else {
            const createResult = PlaceholderDitemFrame.PlaceHeld.createFromJson(element);
            if (createResult.isErr()) {
                this._placeheldDefinition = this.createInvalidPlacehold(createResult.error);
            } else {
                this._placeheldDefinition = createResult.value;
            }
        }

        // do not call super.constructLoad() as no DataIvemId or BrokerageAccountGroup
    }

    override save(element: JsonElement) {
        // const persistablePlaceheld = PlaceholderDitemFrame.Definition.toPersistable(this._placeheldDefinition) as object;
        // element.deepExtend(persistablePlaceheld as Json);
        PlaceholderDitemFrame.PlaceHeld.saveToJson(this._placeheldDefinition, element);

        // do not call super.save() as no DataIvemId or BrokerageAccountGroup
    }

    private createInvalidPlacehold(invalidReason: string): PlaceholderDitemFrame.Placeheld {
        const definition: DitemComponent.Definition = {
            extensionId: {
                publisherId: PublisherId.invalid,
                name: '',
            },
            constructionMethodId: DitemComponent.ConstructionMethodId.Invalid,
            componentTypeName: '',
        };

        return {
            definition,
            state: undefined,
            tabText: '',
            reason: '',
            invalidReason,
        };
    }
}

export namespace PlaceholderDitemFrame {
    export namespace JsonName {
        export const placeheld = 'placeheld';
    }

    export interface Placeheld {
        readonly definition: DitemComponent.Definition;
        readonly state: Json | undefined;
        readonly tabText: string;
        readonly reason: string;
        readonly invalidReason: string | undefined;
    }

    export namespace PlaceHeld {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export namespace JsonName {
            export const definition = 'definition';
            export const state = 'state';
            export const tabText = 'tabText';
            export const reason = 'reason';
            export const invalidReason = 'invalidReason';
        }

        export function createFromJson(value: JsonElement): Result<Placeheld> {
            const ditemComponentDefinitionElementResult = value.tryGetElement(JsonName.definition);
            if (ditemComponentDefinitionElementResult.isErr()) {
                const errorCode = ErrorCode.PlaceholderDitemFrameDefinition_DitemComponentIsNotSpecified;
                return ditemComponentDefinitionElementResult.createOuter(errorCode);
            } else {
                const ditemComponentDefinitionElement = ditemComponentDefinitionElementResult.value;
                const tryCreateDitemComponentResult = DitemComponent.Definition.tryCreateFromJson(ditemComponentDefinitionElement);
                if (tryCreateDitemComponentResult.isErr()) {
                    const invalidErrorCode = ErrorCode.PlaceholderDitemFrameDefinition_DitemComponentIsInvalid;
                    return tryCreateDitemComponentResult.createOuter(invalidErrorCode);
                } else {
                    const ditemCode = tryCreateDitemComponentResult.value;

                    const stateResult = value.tryGetJsonObject(JsonName.state);
                    const state = stateResult.isErr() ? undefined : stateResult.value;

                    const tabTextResult = value.tryGetString(JsonName.tabText);
                    const tabText = tabTextResult.isErr() ? ditemCode.componentTypeName : tabTextResult.value;

                    const reasonResult = value.tryGetString(JsonName.reason);
                    const reason = reasonResult.isErr() ? Strings[StringId.Unknown] : reasonResult.value;

                    const invalidReasonResult = value.tryGetString(JsonName.invalidReason);
                    const invalidReason = invalidReasonResult.isErr() ? Strings[StringId.Unknown] : invalidReasonResult.value;

                    const placeheld: Placeheld = {
                        definition: ditemCode,
                        state,
                        tabText,
                        reason,
                        invalidReason,
                    };

                    return new Ok(placeheld);
                }
            }
        }

        export function saveToJson(value: Placeheld, element: JsonElement) {
            const definitionElement = element.newElement(JsonName.definition);
            DitemComponent.Definition.saveToJson(value.definition, definitionElement);
            element.setJson(JsonName.state, value.state);
            element.setString(JsonName.tabText, value.tabText);
            element.setString(JsonName.reason, value.reason);
            element.setString(JsonName.invalidReason, value.invalidReason);
        }
    }

    export function is(builtinDitemFrame: BuiltinDitemFrame): builtinDitemFrame is PlaceholderDitemFrame {
        return builtinDitemFrame.builtinDitemTypeId === BuiltinDitemFrame.BuiltinTypeId.Placeholder;
    }
}
