import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    OnDestroy,
    viewChild,
    ViewContainerRef
} from '@angular/core';
import {
    AssertInternalError,
    delay1Tick,
    Integer,
} from '@pbkware/js-utils';
import {
    EditableColumnLayoutDefinitionColumnList,
} from '@plxtra/motif-core';
import { SplitAreaSize, SplitUnit } from 'angular-split';
import { RevColumnLayoutDefinition } from 'revgrid';
import { ContentComponentBaseNgDirective } from '../../../ng/content-component-base-ng.directive';
import { definitionColumnListInjectionToken } from '../../ng/grid-layout-dialog-ng-injection-tokens';
import { ColumnLayoutEditorAllowedFieldsNgComponent } from '../allowed-fields/ng-api';
import { ColumnLayoutEditorColumnsNgComponent } from '../columns/ng-api';
import { ColumnLayoutEditorFieldControlsNgComponent } from '../field-controls/ng-api';

@Component({
    selector: 'app-grid-layout-editor',
    templateUrl: './grid-layout-editor-ng.component.html',
    styleUrls: ['./grid-layout-editor-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ColumnLayoutEditorNgComponent extends ContentComponentBaseNgDirective implements OnDestroy, AfterViewInit {
    private static typeInstanceCreateCount = 0;

    public splitUnit: SplitUnit = 'percent';
    public allowedFieldsWidth: SplitAreaSize = 90;
    public allowedFieldsMinWidth: SplitAreaSize;
    public splitterGutterSize = 3;

    private readonly _allowedFieldsComponentSignal = viewChild.required<ColumnLayoutEditorAllowedFieldsNgComponent>('allowedFields');
    private readonly _fieldControlsAndColumnsElRefSignal = viewChild.required<ElementRef<HTMLDivElement>>('fieldControlsAndColumns');
    private readonly _fieldControlsComponentSignal = viewChild.required<ColumnLayoutEditorFieldControlsNgComponent>('fieldControls');
    private readonly _columnsComponentSignal = viewChild.required<ColumnLayoutEditorColumnsNgComponent>('columns');

    private _allowedFieldsComponent: ColumnLayoutEditorAllowedFieldsNgComponent;
    private _fieldControlsAndColumnsElRef: ElementRef<HTMLDivElement>;
    private _fieldControlsComponent: ColumnLayoutEditorFieldControlsNgComponent;
    private _columnsComponent: ColumnLayoutEditorColumnsNgComponent;

    private _fieldControlsAndColumnsHtmlElement: HTMLDivElement;

    private _resizeObserver: ResizeObserver;
    private _splitterDragged = false;

    constructor(
        elRef: ElementRef<HTMLElement>,
        private readonly _cdr: ChangeDetectorRef,
        @Inject(definitionColumnListInjectionToken) private readonly _columnList: EditableColumnLayoutDefinitionColumnList,
    ) {
        super(elRef, ++ColumnLayoutEditorNgComponent.typeInstanceCreateCount);
    }

    public handleSplitterDragEnd() {
        this._splitterDragged = true;
    }

    getColumnLayoutDefinition(): RevColumnLayoutDefinition {
        return this._columnList.createColumnLayoutDefinition();
    }

    ngOnDestroy() {
        this._resizeObserver.disconnect();
    }

    ngAfterViewInit(): void {
        this._allowedFieldsComponent = this._allowedFieldsComponentSignal();
        this._fieldControlsAndColumnsElRef = this._fieldControlsAndColumnsElRefSignal();
        this._fieldControlsComponent = this._fieldControlsComponentSignal();
        this._columnsComponent = this._columnsComponentSignal();

        delay1Tick(() => this.initialiseComponents());
    }

    private initialiseComponents() {
        this._fieldControlsAndColumnsHtmlElement = this._fieldControlsAndColumnsElRef.nativeElement;

        this._allowedFieldsComponent.initialise();
        this._allowedFieldsComponent.columnsViewWidthsChangedEventer = () => this.updateWidths(true);
        this._columnsComponent.initialise();
        this._fieldControlsComponent.initialise(this._allowedFieldsComponent.frame, this._columnsComponent.frame)

        this._resizeObserver = new ResizeObserver(() => this.updateWidths(false));
        this._resizeObserver.observe(this.rootHtmlElement);
        this.updateWidths(true);
    }

    private updateWidths(nextLastServerNotificationRendered: boolean) {
        const allowedFieldsMinWidth = this._allowedFieldsComponent.calculateFixedColumnsWidth() + ColumnLayoutEditorNgComponent.fixedColumnsMinExtraEmWidth * this._allowedFieldsComponent.emWidth;
        this.allowedFieldsMinWidth = allowedFieldsMinWidth;

        if (!this._splitterDragged) {
            const totalWidth = this.rootHtmlElement.offsetWidth;
            const availableTotalWidth = totalWidth - this.splitterGutterSize;
            const fieldControlsAndColumnsWidth = this._fieldControlsAndColumnsHtmlElement.offsetWidth;
            const renderedPromise = this._allowedFieldsComponent.waitLastServerNotificationRendered(nextLastServerNotificationRendered);
            renderedPromise.then(
                () => {
                    this.splitUnit = 'pixel';
                    const allowedFieldsActiveColumnsWidth = this._allowedFieldsComponent.calculateActiveColumnsWidth();
                    let calculatedAllowedFieldsWidth: Integer;
                    if (availableTotalWidth >= (fieldControlsAndColumnsWidth + allowedFieldsActiveColumnsWidth)) {
                        calculatedAllowedFieldsWidth = allowedFieldsActiveColumnsWidth;
                    } else {
                        if (availableTotalWidth > (fieldControlsAndColumnsWidth + allowedFieldsMinWidth)) {
                            calculatedAllowedFieldsWidth = availableTotalWidth - fieldControlsAndColumnsWidth;
                        } else {
                            calculatedAllowedFieldsWidth = allowedFieldsMinWidth;
                        }
                    }

                    this.allowedFieldsWidth = calculatedAllowedFieldsWidth;
                    this._cdr.markForCheck();
                },
                (reason: unknown) => { throw AssertInternalError.createIfNotError(reason, 'GLENCUWP39931'); }
            )
        }
    }
}

export namespace ColumnLayoutEditorNgComponent {
    export const fixedColumnsMinExtraEmWidth = 2;

    export function create(container: ViewContainerRef) {
        container.clear();
        const componentRef  = container.createComponent(ColumnLayoutEditorNgComponent);
        return componentRef.instance;
    }
}
