import { AssertInternalError, Integer, JsonElement } from '@pbkware/js-utils';
import {
    AdiService,
    BrokerageAccount,
    BrokerageAccountGroup,
    CommandRegisterService,
    MarketsService,
    SettingsService,
    StringId,
    Strings,
    SymbolsService
} from '@plxtra/motif-core';
import { ToastService } from 'component-services-internal-api';
import { BrokerageAccountsFrame } from 'content-internal-api';
import { BuiltinDitemFrame } from '../builtin-ditem-frame';
import { DitemFrame } from '../ditem-frame';

export class BrokerageAccountsDitemFrame extends BuiltinDitemFrame {
    private _brokerageAccountsFrame: BrokerageAccountsFrame | undefined;

    private _accountGroupApplying = false;
    private _currentFocusedAccountIdSetting = false;

    constructor(
        ditemComponentAccess: DitemFrame.ComponentAccess,
        settingsService: SettingsService,
        marketsService: MarketsService,
        commandRegisterService: CommandRegisterService,
        desktopAccessService: DitemFrame.DesktopAccessService,
        symbolsService: SymbolsService,
        adiService: AdiService,
        private readonly _toastService: ToastService,
    ) {
        super(BuiltinDitemFrame.BuiltinTypeId.BrokerageAccounts,
            ditemComponentAccess, settingsService, marketsService, commandRegisterService, desktopAccessService, symbolsService, adiService
        );
    }

    get initialised() { return this._brokerageAccountsFrame !== undefined; }

    initialise(ditemFrameElement: JsonElement | undefined, brokerageAccountsFrame: BrokerageAccountsFrame) {
        this._brokerageAccountsFrame = brokerageAccountsFrame;

        brokerageAccountsFrame.recordFocusedEventer = (newRecordIndex) => this.handleRecordFocusedEvent(newRecordIndex)

        let brokerageAccountsFrameElement: JsonElement | undefined;
        if (ditemFrameElement !== undefined) {
            const brokerageAccountsFrameElementResult = ditemFrameElement.tryGetElement(BrokerageAccountsDitemFrame.JsonName.brokerageAccountsFrame);
            if (brokerageAccountsFrameElementResult.isOk()) {
                brokerageAccountsFrameElement = brokerageAccountsFrameElementResult.value;
            }
        }

        brokerageAccountsFrame.initialise(this.opener, undefined, true);

        const openPromise = brokerageAccountsFrame.tryOpenJsonOrDefault(brokerageAccountsFrameElement, true);
        openPromise.then(
            (openResult) => {
                if (openResult.isErr()) {
                    this._toastService.popup(`${Strings[StringId.ErrorOpening]} ${Strings[StringId.BrokerageAccounts]}: ${openResult.error}`);
                } else {
                    this.applyLinked();
                }
            },
            (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'BADFIPR50137') }
        );
    }

    override finalise() {
        if (this._brokerageAccountsFrame !== undefined) {
            this._brokerageAccountsFrame.finalise();
        }
        super.finalise();
    }

    override save(ditemFrameElement: JsonElement) {
        super.save(ditemFrameElement);

        const brokerageAccountsFrame = this._brokerageAccountsFrame;
        if (brokerageAccountsFrame === undefined) {
            throw new AssertInternalError('BADFS50789');
        } else {
            const brokerageAccountsFrameElement = ditemFrameElement.newElement(BrokerageAccountsDitemFrame.JsonName.brokerageAccountsFrame);
            brokerageAccountsFrame.save(brokerageAccountsFrameElement);
        }
    }

    protected override applyBrokerageAccountGroup(group: BrokerageAccountGroup | undefined, selfInitiated: boolean): boolean { // override
        if (this._currentFocusedAccountIdSetting || group === undefined) {
            return false;
        } else {
            if (!BrokerageAccountGroup.isSingle(group)) {
                return false;
            } else {
                const brokerageAccountsFrame = this._brokerageAccountsFrame;
                if (brokerageAccountsFrame === undefined) {
                    throw new AssertInternalError('BDFABAG50789');
                } else {
                    this._accountGroupApplying = true;
                    try {
                        const recordList = brokerageAccountsFrame.recordList;
                        let index = -1;
                        const accountZenithCode = group.accountZenithCode;
                        const count = recordList.count;
                        for (let i = 0; i < count; i++) {
                            const record = recordList.getAt(i);
                            if (record.zenithCode === accountZenithCode) {
                                index = i;
                                break;
                            }
                        }
                        if (index === -1) {
                            return false;
                        } else {
                            brokerageAccountsFrame.focusItem(index);
                            return super.applyBrokerageAccountGroup(group, selfInitiated);
                        }
                    } finally {
                        this._accountGroupApplying = false;
                    }
                }
            }
        }
    }

    private handleRecordFocusedEvent(newRecordIndex: Integer | undefined) {
        if (newRecordIndex !== undefined) {
            const brokerageAccountsFrame = this._brokerageAccountsFrame;
            if (brokerageAccountsFrame === undefined) {
                throw new AssertInternalError('BDFHRFE10789');
            } else {
                const account = brokerageAccountsFrame.recordList.records[newRecordIndex];
                this.processAccountFocusChange(account);
            }
        }
    }

    private processAccountFocusChange(newFocusedAccount: BrokerageAccount) {
        if (!this._accountGroupApplying) {
            this._currentFocusedAccountIdSetting = true;
            try {
                this.applyDitemBrokerageAccountGroupFocus(BrokerageAccountGroup.createSingle(this._marketsService, newFocusedAccount.zenithCode), true);
            } finally {
                this._currentFocusedAccountIdSetting = false;
            }
        }
    }
}

export namespace BrokerageAccountsDitemFrame {
    export namespace JsonName {
        export const brokerageAccountsFrame = 'brokerageAccountsFrame';
    }
}
