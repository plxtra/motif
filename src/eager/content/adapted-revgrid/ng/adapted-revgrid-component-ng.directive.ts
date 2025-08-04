import { Directive, inject } from '@angular/core';
import { Integer } from '@pbkware/js-utils';
import { SettingsService } from '@plxtra/motif-core';
import { SettingsNgService } from '../../../component-services/ng-api';
import { ContentComponentBaseNgDirective } from '../../ng/content-component-base-ng.directive';

@Directive()
/** @deprecated Remove when RowDataArrayGrid no longer is used */
export abstract class AdaptedRevgridComponentNgDirective extends ContentComponentBaseNgDirective {
    protected readonly _settingsService: SettingsService;

    private _horizontalScrollbarWidth: number;
    private _horizontalScrollbarThumbWidth: number;
    private _verticalScrollbarWidth: number;
    private _verticalScrollbarThumbWidth: number;
    private _scrollbarThumbInactiveOpacity: number;
    private _scrollbarMargin: number;
    private _gridRightAligned: boolean;

    // private _scrollbarThumbInactiveOpaqueSetTimeoutId: ReturnType<typeof setInterval> | undefined;
    // private _scrollbarThumbInactiveOpaqueExtended = false;

    constructor(typeInstanceCreateId: Integer) {
        super(typeInstanceCreateId);

        const settingsNgService = inject(SettingsNgService);
        this._settingsService = settingsNgService.service;
    }

    get horizontalScrollbarHeight() { return this._horizontalScrollbarWidth; }
    get horizontalScrollbarThumbHeight() { return this._horizontalScrollbarThumbWidth; }
    get verticalScrollbarWidth() { return this._verticalScrollbarWidth; }
    get verticalScrollbarThumbWidth() { return this._verticalScrollbarThumbWidth; }
    get scrollbarThumbInactiveOpacity() { return this._scrollbarThumbInactiveOpacity; }
    get scrollbarMargin() { return this._scrollbarMargin; }
    get gridRightAligned() { return this._gridRightAligned; }

    get horizontalScrollbarMarginedHeight() { return this._horizontalScrollbarWidth + this._scrollbarMargin; }

    abstract destroyGrid(): void;
}

// namespace CssVar {
//     export const scrollbarThumbColor = '--scrollbar-thumb-color';
//     export const scrollbarThumbInactiveOpacity = '--scrollbar-thumb-inactive-opacity';
//     export const verticalScrollbarLeft = '--vertical-scrollbar-left';
//     export const verticalScrollbarRight = '--vertical-scrollbar-right';
//     export const verticalScrollbarWidth = '--vertical-scrollbar-width';
//     export const verticalScrollbarThumbWidth = '--vertical-scrollbar-thumb-width';
//     export const horizontalScrollbarTop = '--horizontal-scrollbar-top';
//     export const horizontalScrollbarBottom = '--horizontal-scrollbar-bottom';
//     export const horizontalScrollbarWidth = '--horizontal-scrollbar-width';
//     export const horizontalScrollbarThumbWidth = '--horizontal-scrollbar-thumb-width';
//     export const scrollbarMargin = '--scrollbar-margin';
// }
