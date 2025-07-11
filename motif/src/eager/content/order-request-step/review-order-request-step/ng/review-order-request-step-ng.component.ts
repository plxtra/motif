import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    Type,
    ValueProvider,
    ViewContainerRef,
    viewChild
} from '@angular/core';
import { OrderPad, OrderRequestDataDefinition } from '@plxtra/motif-core';
import { ContentNgService } from '../../../ng/content-ng.service';
import { OrderRequestStepComponentNgDirective } from '../../ng/order-request-step-component-ng.directive';
import { ReviewAmendOrderRequestNgComponent } from '../review-amend-order-request/ng/review-amend-order-request-ng.component';
import { ReviewCancelOrderRequestNgComponent } from '../review-cancel-order-request/ng/review-cancel-order-request-ng.component';
import { ReviewMoveOrderRequestNgComponent } from '../review-move-order-request/ng/review-move-order-request-ng.component';
import { ReviewOrderRequestStepFrame } from '../review-order-request-step-frame';
import { ReviewPlaceOrderRequestNgComponent } from '../review-place-order-request/ng/review-place-order-request-ng.component';
import { ReviewOrderRequestComponentNgDirective } from './review-order-request-component-ng.directive';

@Component({
    selector: 'app-review-order-request-step',
    templateUrl: './review-order-request-step-ng.component.html',
    styleUrls: ['./review-order-request-step-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ReviewOrderRequestStepNgComponent extends OrderRequestStepComponentNgDirective implements AfterViewInit, ReviewOrderRequestStepFrame.ComponentAccess {
    private static typeInstanceCreateCount = 0;

    private readonly _reviewContainerSignal = viewChild.required('reviewContainer', { read: ViewContainerRef });

    private readonly _frame: ReviewOrderRequestStepFrame;

    private _reviewContainer: ViewContainerRef;

    private _requestTypeComponent: ReviewOrderRequestComponentNgDirective;

    constructor(elRef: ElementRef<HTMLElement>, cdr: ChangeDetectorRef, private readonly _contentService: ContentNgService) {
        super(elRef, ++ReviewOrderRequestStepNgComponent.typeInstanceCreateCount, cdr);
        this._frame = this._contentService.createReviewOrderRequestStepFrame(this);
    }

    get frame() { return this._frame; }

    ngAfterViewInit(): void {
        this._reviewContainer = this._reviewContainerSignal();
    }

    setZenithMessageActive(value: boolean) {
        this._requestTypeComponent.setZenithMessageActive(value);
    }

    public reviewPlace(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewPlaceOrderRequestNgComponent, zenithMessageActive);
    }

    public reviewAmend(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewAmendOrderRequestNgComponent, zenithMessageActive);
    }

    public reviewMove(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewMoveOrderRequestNgComponent, zenithMessageActive);
    }

    public reviewCancel(orderPad: OrderPad, definition: OrderRequestDataDefinition, zenithMessageActive: boolean) {
        this.review(orderPad, definition, ReviewCancelOrderRequestNgComponent, zenithMessageActive);
    }

    private review<T extends ReviewOrderRequestComponentNgDirective>(
        orderPad: OrderPad,
        definition: OrderRequestDataDefinition,
        componentType: Type<T>,
        zenithMessageActive: boolean,
    ) {
        this._reviewContainer.clear();

        const orderPadProvider: ValueProvider = {
            provide: ReviewOrderRequestComponentNgDirective.orderPadInjectionToken,
            useValue: orderPad,
        };
        const definitionProvider: ValueProvider = {
            provide: ReviewOrderRequestComponentNgDirective.definitionInjectionToken,
            useValue: definition,
        };
        const injector = Injector.create({
            providers: [orderPadProvider, definitionProvider],
        });
        const componentRef = this._reviewContainer.createComponent(componentType, { injector });
        this._requestTypeComponent = componentRef.instance;

        this._requestTypeComponent.setZenithMessageActive(zenithMessageActive);

        this.markForCheck();
    }
}
