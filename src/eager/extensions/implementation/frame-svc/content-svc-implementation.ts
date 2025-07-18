import { Integer } from '@pbkware/js-utils';
import {
    ApiError as ApiErrorApi,
    ContentComponent as ContentComponentApi,
    ContentSvc,
    DelayedBadnessComponent as DelayedBadnessComponentApi
} from '../../api';
import {
    ApiErrorImplementation,
    ContentComponentImplementation
} from '../types/internal-api';
import { ApiContentComponentFactory } from './api-content-component-factory';

export class ContentSvcImplementation implements ContentSvc {
    private _components: ContentComponentImplementation[] = [];

    constructor(private readonly _componentFactory: ApiContentComponentFactory) { }

    get components() { return this._components; }

    public destroyAllComponents() {
        const count = this._components.length;

        for (let i = count - 1; i >= 0; i--) {
            const component = this._components[i];
            this.destroyComponentAtIndex(i, component);
        }
    }

    public destroyComponent(component: ContentComponentApi) {
        const componentImplementation = component as ContentComponentImplementation;
        const idx = this._components.indexOf(componentImplementation);
        if (idx < 0) {
            throw new ApiErrorImplementation(ApiErrorApi.CodeEnum.UnknownContentComponent);
        } else {
            this.destroyComponentAtIndex(idx, componentImplementation);
        }
    }

    public createDelayedBadnessComponent(): DelayedBadnessComponentApi {
        const component = this._componentFactory.createDelayedBadnessComponent();
        this._components.push(component);
        return component;
    }

    private destroyComponentAtIndex(idx: Integer, component: ContentComponentImplementation) {
        this._components.splice(idx, 1);
        this._componentFactory.destroyComponent(component);
    }
}
