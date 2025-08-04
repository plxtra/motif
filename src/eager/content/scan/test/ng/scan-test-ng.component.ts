import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, inject, OnDestroy, viewChild } from '@angular/core';
import { AssertInternalError, delay1Tick, HtmlTypes, Integer, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '@pbkware/js-utils';
import {
    CommandRegisterService,
    DataIvemId,
    DataIvemIdExecuteScanDataDefinition,
    DataMarket,
    IconButtonUiAction,
    InternalCommand,
    RankedDataIvemIdList,
    ScanEditor,
    ScanTargetTypeId,
    StringId,
    Strings,
    ZenithEncodedScanFormula,
} from '@plxtra/motif-core';
import { CommandRegisterNgService } from 'component-services-ng-api';
import { SvgButtonNgComponent } from '../../../../controls/ng-api';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { ScanTestMatchesFrame } from '../internal-api';
import { ScanTestMatchesNgComponent } from '../matches/ng-api';

@Component({
    selector: 'app-scan-test',
    templateUrl: './scan-test-ng.component.html',
    styleUrls: ['./scan-test-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ScanTestNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    @HostBinding('style.display') hostDisplay: HtmlTypes.Display = HtmlTypes.Display.None;

    displayedChangedEventer: ScanTestNgComponent.DisplayedChangedEventer | undefined;

    public title = Strings[StringId.Test];
    public matchCount = '';

    private readonly _cdr = inject(ChangeDetectorRef);

    private readonly _closeButtonComponentSignal = viewChild.required<SvgButtonNgComponent>('closeButton');
    private readonly _matchesComponentSignal = viewChild.required<ScanTestMatchesNgComponent>('matches');

    private _closeButtonComponent: SvgButtonNgComponent;
    private _matchesComponent: ScanTestMatchesNgComponent;

    private _matchesFrame: ScanTestMatchesFrame;
    private _rankedDataIvemIdList: RankedDataIvemIdList | undefined;
    private _rankedDataIvemIdListListChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _closeUiAction: IconButtonUiAction;

    private _usable = false;

    constructor() {
        const commandRegisterNgService = inject(CommandRegisterNgService);

        super(++ScanTestNgComponent.typeInstanceCreateCount);

        const commandRegisterService = commandRegisterNgService.service;
        this._closeUiAction = this.createCloseUiAction(commandRegisterService);
    }

    get displayed() { return this.hostDisplay === HtmlTypes.Display.Flex; }
    get emWidth() { return this._matchesComponent.emWidth; }
    get approximateWidth() { return this.rootHtmlElement.offsetWidth; }

    ngOnDestroy() {
        this._closeUiAction.finalise();
        this._matchesFrame.gridSourceOpenedEventer = undefined;
        this.finaliseMatchesInfo();
    }

    ngAfterViewInit(): void {
        this._closeButtonComponent = this._closeButtonComponentSignal();
        this._matchesComponent = this._matchesComponentSignal();

        delay1Tick(() => {
            this._closeButtonComponent.initialise(this._closeUiAction);

            this._matchesComponent.initialise();
            this._matchesFrame = this._matchesComponent.frame;
            this._matchesFrame.gridSourceOpenedEventer = () => this.initialiseMatchesInfo();
        });
    }

    execute(
        name: string,
        description: string,
        targetTypeId: ScanTargetTypeId,
        targetMarkets: readonly DataMarket[] | undefined,
        targetDataIvemIds: readonly DataIvemId[] | undefined,
        maxMatchCount: Integer,
        zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode,
        zenithRank: ZenithEncodedScanFormula.NumericTupleNode | undefined,
    ) {
        this.finaliseMatchesInfo();

        const definition = new DataIvemIdExecuteScanDataDefinition();
        definition.targetTypeId = targetTypeId;
        const targetsResult = ScanEditor.calculateTargets(targetTypeId, targetMarkets, targetDataIvemIds);
        if (targetsResult.isErr()) {
            throw new AssertInternalError('SCNCE55016', targetsResult.error);
        } else {
            definition.targets = targetsResult.value;
            definition.maxMatchCount = maxMatchCount;
            definition.zenithCriteria = zenithCriteria;
            definition.zenithRank = zenithRank;

            this._matchesFrame.executeTest(name, description, 'ExecuteScan', definition);

            this.setDisplayed(true);
            this._cdr.markForCheck();
        }
    }

    private handleCloseSignal() {
        this.finaliseMatchesInfo();
        this._matchesFrame.closeGridSource(true);
        this.setDisplayed(false);
        this._cdr.markForCheck();
    }

    private createCloseUiAction(commandRegisterService: CommandRegisterService) {
        const commandName = InternalCommand.Id.ScanTest_Close;
        const displayId = StringId.Close;
        const command = commandRegisterService.getOrRegisterInternalCommand(commandName, displayId);
        const action = new IconButtonUiAction(command);
        action.pushIcon(IconButtonUiAction.IconId.ReturnCancel);
        action.signalEvent = () => this.handleCloseSignal();
        return action;
    }

    private initialiseMatchesInfo() {
        this.finaliseMatchesInfo();
        this._rankedDataIvemIdList = this._matchesFrame.rankedDataIvemIdList;
        this._rankedDataIvemIdListListChangeSubscriptionId = this._rankedDataIvemIdList.subscribeListChangeEvent(
            (listChangeTypeId, idx, count) => { this.processMatchesInfoChange(listChangeTypeId, idx, count) }
        );

        this._usable = this._rankedDataIvemIdList.usable;
        this.updateMatchCount();
    }

    private finaliseMatchesInfo() {
        if (this._rankedDataIvemIdList !== undefined) {
            this._rankedDataIvemIdList.unsubscribeListChangeEvent(this._rankedDataIvemIdListListChangeSubscriptionId);
            this._rankedDataIvemIdListListChangeSubscriptionId = undefined;

            this._rankedDataIvemIdList = undefined;
        }
    }

    private processMatchesInfoChange(listChangeTypeId: UsableListChangeTypeId, idx: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this._usable = false;
                break;
            case UsableListChangeTypeId.Usable:
                this._usable = true;
                break;
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Insert:
            case UsableListChangeTypeId.BeforeReplace:
            case UsableListChangeTypeId.AfterReplace:
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
            case UsableListChangeTypeId.Remove:
            case UsableListChangeTypeId.Clear:
                break;
            default:
                throw new UnreachableCaseError('STNCPMIC84184', listChangeTypeId);
        }
        this.updateMatchCount();
    }

    private updateMatchCount() {
        let newMatchCount: string;
        if (this._rankedDataIvemIdList === undefined) {
            newMatchCount = '';
        } else {
            if (this._usable) {
                newMatchCount = this._rankedDataIvemIdList.count.toString();
            } else {
                newMatchCount = '?';
            }
        }

        if (newMatchCount !== this.matchCount) {
            this.matchCount = newMatchCount;
            this._cdr.markForCheck();
        }
    }

    private setDisplayed(value: boolean) {
        const hostDisplay = value ? HtmlTypes.Display.Flex : HtmlTypes.Display.None;
        if (hostDisplay !== this.hostDisplay) {
            this.hostDisplay = hostDisplay;
            this._cdr.markForCheck();

            if (this.displayedChangedEventer !== undefined) {
                this.displayedChangedEventer();
            }
        }
    }
}

export namespace ScanTestNgComponent {
    export type DisplayedChangedEventer = (this: void) => void;
}
