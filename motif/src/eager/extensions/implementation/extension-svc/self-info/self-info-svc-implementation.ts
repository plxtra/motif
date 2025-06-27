import { ExtensionInfo } from '@plxtra/motif-core';
import { SelfInfoSvc } from '../../../api';
import { PublisherTypeImplementation } from '../../types/internal-api';
import { SvcImplementation } from '../svc-implementation';

export class SelfInfoSvcImplementation extends SvcImplementation implements SelfInfoSvc {

    constructor(private readonly _extensionInfo: ExtensionInfo) {
        super();
    }

    get publisherType() { return PublisherTypeImplementation.toApi(this._extensionInfo.publisherId.typeId); }
    get publisherName() { return this._extensionInfo.publisherId.name; }
    get name() { return this._extensionInfo.name; }
    get version() { return this._extensionInfo.version; }
    get shortDescription() { return this._extensionInfo.shortDescription; }
    get longDescription() { return this._extensionInfo.longDescription; }

    destroy() {
        // No resources to clean up
    }
}
