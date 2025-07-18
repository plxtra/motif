import { FeedStatus } from '@plxtra/motif-core';
import {
    FeedStatus as FeedStatusApi,
    FeedStatusHandle as FeedStatusHandleApi,
    FeedStatusSvc
} from '../../../api';
import { CorrectnessImplementation, FeedStatusImplementation } from '../../types/internal-api';

export class FeedStatusSvcImplementation implements FeedStatusSvc {
    toCorrectness(id: FeedStatusApi) {
        const feedStatusId = FeedStatusImplementation.fromApi(id);
        const correctnessId = FeedStatus.idToCorrectnessId(feedStatusId);
        return CorrectnessImplementation.toApi(correctnessId);
    }

    toDisplay(id: FeedStatusApi) {
        const feedStatusId = FeedStatusImplementation.fromApi(id);
        return FeedStatus.idToDisplay(feedStatusId);
    }

    toHandle(id: FeedStatusApi) {
        return FeedStatusImplementation.fromApi(id);
    }

    fromHandle(handle: FeedStatusHandleApi) {
        return FeedStatusImplementation.toApi(handle);
    }

    handleToDisplay(handle: FeedStatusHandleApi) {
        return FeedStatus.idToDisplay(handle);
    }
}
