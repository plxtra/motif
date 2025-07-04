import { CommandRegisterService, RegisteredExtension } from '@plxtra/motif-core';
import { WorkspaceService } from 'workspace-internal-api';
import { DesktopFrame } from '../../../../desktop/internal-api';
import { LocalDesktop as LocalDesktopApi, MultiEvent, WorkspaceSvc } from '../../../api';
import { LocalDesktopImplementation } from '../../types/internal-api';

export class WorkspaceSvcImplementation implements WorkspaceSvc {
    localDesktopLoadedEventer: WorkspaceSvc.LocalDesktopLoadedEventHandler | undefined;

    private _localDesktop: LocalDesktopImplementation;
    private _workspaceServiceLocalDesktopFrameLoadedSubscriptionId: MultiEvent.SubscriptionId;
    private _getLoadedLocalDesktopResolveFtns: WorkspaceSvcImplementation.GetLoadedLocalDesktopResolveFtn[]  = [];

    constructor(
        private readonly _registeredExtension: RegisteredExtension,
        private readonly _workspaceService: WorkspaceService,
        private readonly _commandRegisterService: CommandRegisterService,
    ) {
        const localDesktopFrame  = this._workspaceService.localDesktopFrame;
        if (localDesktopFrame === undefined) {
            this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId = this._workspaceService.subscribeLocalDesktopFrameLoadedEvent(
                (desktopFrame) => this.loadLocalDesktop(desktopFrame)
            );
        } else {
            this.loadLocalDesktop(localDesktopFrame);
        }
    }

    get localDesktop() { return this._localDesktop; }

    destroy() {
        this.checkUnsubscribeWorkspaceServiceLocalDesktopFrameLoadedEvent();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._localDesktop !== undefined) {
            this._localDesktop.destroy();
        }

        this.resolveGetLoadedLocalDesktop(undefined);
    }

    getLoadedLocalDesktop(): Promise<LocalDesktopApi | undefined> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._localDesktop !== undefined) {
            return Promise.resolve(this._localDesktop);
        } else {
            return new Promise(
                (resolve) => {
                    this._getLoadedLocalDesktopResolveFtns.push(resolve);
                }
            );
        }
    }

    private loadLocalDesktop(localDesktopFrame: DesktopFrame) {
        this._localDesktop = new LocalDesktopImplementation(this._registeredExtension,
            localDesktopFrame,
            this._commandRegisterService,
        );

        if (this.localDesktopLoadedEventer !== undefined) {
            this.localDesktopLoadedEventer();
        }

        this.resolveGetLoadedLocalDesktop(this._localDesktop);

        this.checkUnsubscribeWorkspaceServiceLocalDesktopFrameLoadedEvent();
    }

    private resolveGetLoadedLocalDesktop(value: LocalDesktopApi | undefined) {
        for (const ftn of this._getLoadedLocalDesktopResolveFtns) {
            ftn(value);
        }
        this._getLoadedLocalDesktopResolveFtns.length = 0;
    }

    private checkUnsubscribeWorkspaceServiceLocalDesktopFrameLoadedEvent() {
        if (this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId !== undefined) {
            this._workspaceService.unsubscribeLocalDesktopFrameLoadedEvent(this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId);
            this._workspaceServiceLocalDesktopFrameLoadedSubscriptionId = undefined;
        }
    }
}

export namespace WorkspaceSvcImplementation {
    export type GetLoadedLocalDesktopResolveFtn = (localDesktop: LocalDesktopApi | undefined) => void;
}
