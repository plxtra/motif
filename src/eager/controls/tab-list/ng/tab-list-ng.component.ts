import { ChangeDetectionStrategy, Component, InjectionToken, OnDestroy, inject } from '@angular/core';
import { HtmlTypes, Integer, ModifierKey } from '@pbkware/js-utils';
import { ColorScheme, ColorSettings } from '@plxtra/motif-core';
import { ControlComponentBaseNgDirective } from '../../ng/control-component-base-ng.directive';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-tab-list',
    templateUrl: './tab-list-ng.component.html',
    styleUrls: ['./tab-list-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'tablist'
    },
    imports: [NgStyle]
})
export class TabListNgComponent extends ControlComponentBaseNgDirective implements OnDestroy {
    private static typeInstanceCreateCount = 0;

    public readonly tabs: TabListNgComponent.Tab[] = [];
    public borderColor: string;

    constructor() {
        super(++TabListNgComponent.typeInstanceCreateCount, ControlComponentBaseNgDirective.textControlStateColorItemIdArray);

        const initialTabDefinitions = inject(TabListNgComponent.tabDefinitionsInjectionToken, { optional: true });

        if (initialTabDefinitions !== null) {
            this.setTabs(initialTabDefinitions);
        }

        this.applySettings();
    }

    setTabs(tabDefinitions: readonly TabListNgComponent.TabDefinition[]) {
        const tabs = this.tabs;

        for (const tab of tabs) {
            tab.updateActive(false, undefined);
        }

        const newCount = tabDefinitions.length;
        tabs.length = newCount;

        let activeSet = false;
        for (let i = 0; i < newCount; i++) {
            const tabDefinition = tabDefinitions[i];
            if (tabDefinition.initialActive) {
                if (activeSet) {
                    tabDefinition.initialActive = false;
                } else {
                    activeSet = true;
                }
            }
            const tab = this.createTab(tabDefinition);
            tabs[i] = tab;
        }

        this.markForCheck();

        return tabs;
    }

    insertTab(index: Integer, tabDefinition: TabListNgComponent.TabDefinition) {
        if (tabDefinition.initialActive) {
            for (const tab of this.tabs) {
                tab.updateActive(false, undefined);
            }
        }
        const tab = this.createTab(tabDefinition);
        this.tabs.splice(index, 0, tab);

        this.markForCheck();

        return tab;
    }

    deleteTab(index: Integer) {
        const tabs = this.tabs;
        const tab = tabs[index];
        tab.updateActive(false, undefined);
        tabs.splice(index, 1);

        this.markForCheck();
    }

    private createTab(tabDefinition: TabListNgComponent.TabDefinition): TabListNgComponent.Tab {
        const tab = new TabListNgComponent.Tab(this.colorSettings, tabDefinition);

        tab.requestActiveChangeEventer = (event) => this.activateTab(tab, undefined);
        tab.clickEventer = (event) => this.activateTab(tab, event);

        return tab;
    }

    private activateTab(tab: TabListNgComponent.Tab, event: MouseEvent | undefined) {
        if (!tab.active) {
            const tabs = this.tabs;
            for (const tabElement of tabs) {
                tabElement.updateActive(false, undefined);
            }

            let downKeys: ModifierKey.IdSet | undefined
            if (event === undefined) {
                downKeys = undefined;
            } else {
                downKeys = ModifierKey.IdSet.create(event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
            }
            tab.updateActive(true, downKeys)

            this.markForCheck();
        }
    }

    private applySettings() {
        this.borderColor = this.colorSettings.getFore(ColorScheme.ItemId.Tab_ActiveBorder);
        this.markForCheck();
    }
}

export namespace TabListNgComponent {
    export interface TabDefinition {
        caption: string;
        initialDisabled: boolean,
        initialActive: boolean;
        activeChangedEventer: TabDefinition.ActiveChangedEventer;
    }

    export namespace TabDefinition {
        export type ActiveChangedEventer = (this: void, tab: Tab, downKeys: ModifierKey.IdSet | undefined) => void;
    }

    export class Tab {
        clickEventer: Tab.ClickEventer;
        requestActiveChangeEventer: Tab.RequestActiveChangeEventer;
        private readonly _activeChangedEventer: TabDefinition.ActiveChangedEventer;

        private _caption: string;
        private _disabled: boolean;
        private _active: boolean;
        private _bkgdColor: ColorScheme.ResolvedColor;
        private _foreColor: ColorScheme.ResolvedColor;
        private _borderStyle: HtmlTypes.BorderStyle;

        constructor(
            private readonly _colorSettings: ColorSettings,
            tabDefinition: TabDefinition
        ) {
            const disabled = tabDefinition.initialDisabled;
            const active = tabDefinition.initialActive;
            this._caption = tabDefinition.caption;
            this._disabled = disabled;
            this._active = active;
            this._bkgdColor = this.calculateTabBkgdColor(disabled, active);
            this._foreColor = this.calculateTabForeColor(disabled, active);
            this._borderStyle = this.calculateBorderStyle(disabled, active);
            this._activeChangedEventer = tabDefinition.activeChangedEventer;
        }

        get caption() { return this._caption; }
        get active() { return this._active; }
        get disabled() { return this._disabled; }
        get bkgdColor() { return this._bkgdColor; }
        get foreColor() { return this._foreColor; }
        get borderStyle() { return this._borderStyle; }

        activate() {
            this.requestActiveChangeEventer(true);
        }

        updateActive(value: boolean, downKeys: ModifierKey.IdSet | undefined) {
            if (value !== this._active) {
                this._active = value;
                const disabled = this.disabled;
                this._bkgdColor = this.calculateTabBkgdColor(disabled, value);
                this._foreColor = this.calculateTabForeColor(disabled, value);
                this._borderStyle = this.calculateBorderStyle(disabled, value);
                this._activeChangedEventer(this, downKeys);
            }
        }

        private calculateTabBkgdColor(disabled: boolean, active: boolean) {
            const colorSettings = this._colorSettings;
            if (disabled) {
                return colorSettings.getBkgd(ColorScheme.ItemId.Tab_Disabled);
            } else {
                if (active) {
                    return colorSettings.getBkgd(ColorScheme.ItemId.Tab_Active);
                } else {
                    return colorSettings.getBkgd(ColorScheme.ItemId.Tab_Inactive);
                }
            }
        }

        private calculateTabForeColor(disabled: boolean, active: boolean) {
            const colorSettings = this._colorSettings;
            if (disabled) {
                return colorSettings.getFore(ColorScheme.ItemId.Tab_Disabled);
            } else {
                if (active) {
                    return colorSettings.getFore(ColorScheme.ItemId.Tab_Active);
                } else {
                    return colorSettings.getFore(ColorScheme.ItemId.Tab_Inactive);
                }
            }
        }

        private calculateBorderStyle(disabled: boolean, active: boolean) {
            if (disabled || !active) {
                return HtmlTypes.BorderStyle.Hidden;
            } else {
                return HtmlTypes.BorderStyle.Solid;
            }
        }
    }

    export namespace Tab {
        export type ClickEventer = (this: void, event: MouseEvent) => void;
        export type RequestActiveChangeEventer = (this: void, newActive: boolean) => void;
    }

    export const tabDefinitionsTokenName = 'tabDefinitions';
    export const tabDefinitionsInjectionToken = new InjectionToken<TabDefinition[]>(tabDefinitionsTokenName);
}
