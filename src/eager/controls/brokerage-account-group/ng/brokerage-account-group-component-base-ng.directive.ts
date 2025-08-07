import { Directive, inject, input } from '@angular/core';
import { AssertInternalError, getErrorMessage, Integer, UnreachableCaseError } from '@pbkware/js-utils';
import { UiAction } from '@pbkware/ui-action';
import {
    BrokerageAccount,
    BrokerageAccountEnvironmentedId,
    BrokerageAccountGroup, BrokerageAccountGroupUiAction, BrokerageAccountsDataDefinition,
    BrokerageAccountsDataItem,
    DataItemIncubator,
    MarketsService,
    SingleBrokerageAccountGroup, StringId, Strings
} from '@plxtra/motif-core';
import { AdiNgService, MarketsNgService } from 'component-services-ng-api';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';

@Directive()
export abstract class BrokerageAccountGroupComponentBaseNgDirective extends ControlComponentBaseNgDirective {
    readonly inputId = input<string>();

    public namedGroups: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup[] = [];
    public loading = false;

    private readonly _marketsService: MarketsService;

    private readonly _dataItemIncubator: DataItemIncubator<BrokerageAccountsDataItem>;

    private _dataItem: BrokerageAccountsDataItem | undefined;

    constructor(typeInstanceCreateId: Integer, stateColorItemIdArray: ControlComponentBaseNgDirective.ReadonlyStateColorItemIdArray) {
        super(typeInstanceCreateId, stateColorItemIdArray);

        this._marketsService = inject(MarketsNgService).service;

        const adiService = inject(AdiNgService);
        this._dataItemIncubator = new DataItemIncubator<BrokerageAccountsDataItem>(adiService.service);
    }

    protected override get uiAction() { return super.uiAction as BrokerageAccountGroupUiAction; }

    protected processNamedGroupsChanged() {
        this.applyValue(this.uiAction.value, this.uiAction.edited);
    }

    protected input(text: string, valid: boolean, missing: boolean, errorText: string | undefined) {
        this.uiAction.input(text, valid, missing, errorText);
    }

    protected commitValue(value: BrokerageAccountGroup | undefined, typeId: UiAction.CommitTypeId) {
        this.uiAction.commitValue(value, typeId);
    }

    protected override setUiAction(action: BrokerageAccountGroupUiAction) {
        const pushEventHandlersInterface = super.setUiAction(action) as BrokerageAccountGroupUiAction.PushEventHandlersInterface;

        pushEventHandlersInterface.value = (value, edited) => this.handleValuePushEvent(value, edited);
        pushEventHandlersInterface.options = (options) => this.handleOptionsPushEvent(options);

        const definition = new BrokerageAccountsDataDefinition();
        const dataItemOrPromise = this._dataItemIncubator.incubateSubcribe(definition);
        if (this._dataItemIncubator.isDataItem(dataItemOrPromise)) {
            this.processDataItemIncubated(dataItemOrPromise);
        } else {
            this.applyValue(action.value, action.edited);

            dataItemOrPromise.then(
                (dataItem) => this.processDataItemIncubated(dataItem),
                (reason: unknown) => {
                    const errorText = getErrorMessage(reason);
                    throw new AssertInternalError('BAIICBC323299', errorText);
                }
            );
        }

        return pushEventHandlersInterface;
    }

    protected override finalise() {
        this._dataItemIncubator.finalise();
        super.finalise();
    }

    private handleValuePushEvent(value: BrokerageAccountGroup | undefined, edited: boolean) {
        this.applyValue(value, edited);
    }

    private handleOptionsPushEvent(options: BrokerageAccountGroupUiAction.Options) {
        this.applyOptions(options);
    }

    private createAccountNamedGroup(account: BrokerageAccount) {
        const name = account.name;
        const accountZenithCode = account.zenithCode;
        const group = BrokerageAccountGroup.createSingle(this._marketsService, accountZenithCode);
        const namedGroup: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup = {
            idDisplay: group.display,
            upperIdDisplay: group.upperDisplay,
            name,
            upperName: name.toUpperCase(),
            brokerageAccountGroup: group,
        } as const;

        return namedGroup;
    }

    private createAccountNamedGroupFromZenithCode(accountZenithCode: string) {
        if (this._dataItem === undefined) {
            return undefined;
        } else {
            const account = this._dataItem.getAccount(accountZenithCode);
            if (account === undefined) {
                return undefined;
            } else {
                return this.createAccountNamedGroup(account);
            }
        }
    }

    private createAllNamedGroup() {
        const name = BrokerageAccountGroupComponentBaseNgDirective.allName;
        const group = BrokerageAccountGroup.createAll();
        const namedGroup: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup = {
            idDisplay: group.display,
            upperIdDisplay: group.upperDisplay,
            name,
            upperName: name.toUpperCase(),
            brokerageAccountGroup: group,
        } as const;

        return namedGroup;
    }

    private createErrorNamedGroup(errorText: string) {
        const errorIdDisplay = `<<${Strings[StringId.Error]}>>`;
        const name = `${Strings[StringId.Error]}: ${errorText}`;
        const accountZenithCode = BrokerageAccountEnvironmentedId.unknownZenithCode;
        const group = BrokerageAccountGroup.createSingle(this._marketsService, accountZenithCode);
        const namedGroup: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup = {
            idDisplay: errorIdDisplay,
            upperIdDisplay: errorIdDisplay.toUpperCase(),
            name,
            upperName: name.toUpperCase(),
            brokerageAccountGroup: group,
        } as const;

        return namedGroup;
    }

    private processDataItemIncubated(dataItem: BrokerageAccountsDataItem | undefined) {
        if (dataItem !== undefined) {
            this._dataItem = dataItem;
            if (this._dataItem.error) {
                this.namedGroups = [this.createErrorNamedGroup(this._dataItem.errorText)];
            } else {
                // We should really use a cache of groups which shadows DataItem
                // Fix in future
                let idx = 0;
                const accounts = dataItem.records;
                let length = accounts.length;
                if (this.uiAction.options.allAllowed) {
                    length++;
                }
                this.namedGroups = new Array<BrokerageAccountGroupComponentBaseNgDirective.NamedGroup>(length);

                if (this.uiAction.options.allAllowed) {
                    this.namedGroups[idx++] = this.createAllNamedGroup();
                }

                for (let i = 0; i < accounts.length; i++) {
                    const account = dataItem.records[i];
                    this.namedGroups[idx++] = this.createAccountNamedGroup(account);
                }
            }
            this.processNamedGroupsChanged();
        }
    }

    private applyValue(value: BrokerageAccountGroup | undefined, edited: boolean) {
        if (value === undefined) {
            this.applyValueAsNamedGroup(undefined, edited);
        } else {
            switch (value.typeId) {
                case BrokerageAccountGroup.TypeId.Single: {
                    const singleGroup = value as SingleBrokerageAccountGroup;
                    const keyNamedGroup = this.createAccountNamedGroupFromZenithCode(singleGroup.accountZenithCode);
                    this.applyValueAsNamedGroup(keyNamedGroup, edited);
                    break;
                }
                case BrokerageAccountGroup.TypeId.All: {
                    if (this.uiAction.options.allAllowed) {
                        const allNamedGroup = this.createAllNamedGroup();
                        this.applyValueAsNamedGroup(allNamedGroup, edited);
                    } else {
                        this.applyValueAsNamedGroup(undefined, edited);
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('BAGCBDAV77763439', value.typeId);
            }
        }
    }

    private applyOptions(options: BrokerageAccountGroupUiAction.Options) {
        this.processDataItemIncubated(this._dataItem);
    }

    protected abstract applyValueAsNamedGroup(
        value: BrokerageAccountGroupComponentBaseNgDirective.NamedGroup | undefined,
        edited: boolean
    ): void;
}

export namespace BrokerageAccountGroupComponentBaseNgDirective {
    export interface NamedGroup {
        readonly idDisplay: string;
        readonly upperIdDisplay: string;
        readonly name: string;
        readonly upperName: string;
        readonly brokerageAccountGroup: BrokerageAccountGroup;
    }

    export const allName = '<All Accounts>';
}
