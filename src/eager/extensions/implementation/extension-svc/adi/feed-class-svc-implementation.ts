import { FeedClass } from '@plxtra/motif-core';
import {
    FeedClass as FeedClassApi,
    FeedClassHandle as FeedClassHandleApi,
    FeedClassSvc
} from '../../../api';
import { FeedClassImplementation } from '../../types/internal-api';

export class FeedClassSvcImplementation implements FeedClassSvc {
    toName(id: FeedClassApi) {
        const feedClassId = FeedClassImplementation.fromApi(id);
        return FeedClass.idToName(feedClassId);
    }

    toDisplay(id: FeedClassApi) {
        const feedClassId = FeedClassImplementation.fromApi(id);
        return FeedClass.idToDisplay(feedClassId);
    }

    toHandle(id: FeedClassApi) {
        return FeedClassImplementation.fromApi(id);
    }

    fromHandle(handle: FeedClassHandleApi) {
        return FeedClassImplementation.toApi(handle);
    }

    handleToName(handle: FeedClassHandleApi) {
        return FeedClass.idToName(handle);
    }

    handleToDisplay(handle: FeedClassHandleApi) {
        return FeedClass.idToDisplay(handle);
    }
}
