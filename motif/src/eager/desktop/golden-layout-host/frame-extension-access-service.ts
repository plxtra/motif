import { ExtensionId } from '@plxtra/motif-core';
import { ExtensionsAccessService } from 'content-internal-api';
import { ExtensionDitemComponent } from 'ditem-internal-api';
import { ComponentContainer } from 'golden-layout';

export interface FrameExtensionsAccessService extends ExtensionsAccessService {
    getFrame(container: ComponentContainer, extensionId: ExtensionId, frameTypeName: string): ExtensionDitemComponent.GetResult;
    releaseFrame(component: ExtensionDitemComponent): void;
}
