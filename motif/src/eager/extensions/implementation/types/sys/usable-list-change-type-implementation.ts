import { UnreachableCaseError, UsableListChangeTypeId } from '@pbkware/js-utils';
import { UsableListChangeType as UsableListChangeTypeApi, UsableListChangeTypeEnum as UsableListChangeTypeEnumApi } from '../../../api';

export namespace UsableListChangeTypeImplementation {
    export function toApi(value: UsableListChangeTypeId): UsableListChangeTypeApi {
        switch (value) {
            case UsableListChangeTypeId.Unusable: return UsableListChangeTypeEnumApi.Unusable;
            case UsableListChangeTypeId.PreUsableAdd: return UsableListChangeTypeEnumApi.PreUsableAdd;
            case UsableListChangeTypeId.PreUsableClear: return UsableListChangeTypeEnumApi.PreUsableClear;
            case UsableListChangeTypeId.Usable: return UsableListChangeTypeEnumApi.Usable;
            case UsableListChangeTypeId.Insert: return UsableListChangeTypeEnumApi.Insert;
            case UsableListChangeTypeId.BeforeReplace: return UsableListChangeTypeEnumApi.BeforeReplace;
            case UsableListChangeTypeId.AfterReplace: return UsableListChangeTypeEnumApi.AfterReplace;
            case UsableListChangeTypeId.BeforeMove: return UsableListChangeTypeEnumApi.BeforeMove;
            case UsableListChangeTypeId.AfterMove: return UsableListChangeTypeEnumApi.AfterMove;
            case UsableListChangeTypeId.Remove: return UsableListChangeTypeEnumApi.Remove;
            case UsableListChangeTypeId.Clear: return UsableListChangeTypeEnumApi.Clear;
            default: throw new UnreachableCaseError('ULCTITA39997', value);
        }
    }

    export function fromApi(value: UsableListChangeTypeApi): UsableListChangeTypeId {
        const enumValue = value as UsableListChangeTypeEnumApi;
        switch (enumValue) {
            case UsableListChangeTypeEnumApi.Unusable: return UsableListChangeTypeId.Unusable;
            case UsableListChangeTypeEnumApi.PreUsableAdd: return UsableListChangeTypeId.PreUsableAdd;
            case UsableListChangeTypeEnumApi.PreUsableClear: return UsableListChangeTypeId.PreUsableClear;
            case UsableListChangeTypeEnumApi.Usable: return UsableListChangeTypeId.Usable;
            case UsableListChangeTypeEnumApi.Insert: return UsableListChangeTypeId.Insert;
            case UsableListChangeTypeEnumApi.BeforeReplace: return UsableListChangeTypeId.BeforeReplace;
            case UsableListChangeTypeEnumApi.AfterReplace: return UsableListChangeTypeId.AfterReplace;
            case UsableListChangeTypeEnumApi.BeforeMove: return UsableListChangeTypeId.BeforeMove;
            case UsableListChangeTypeEnumApi.AfterMove: return UsableListChangeTypeId.AfterMove;
            case UsableListChangeTypeEnumApi.Remove: return UsableListChangeTypeId.Remove;
            case UsableListChangeTypeEnumApi.Clear: return UsableListChangeTypeId.Clear;
            default: throw new UnreachableCaseError('ULCTIFA39997', enumValue);
        }
    }
}
