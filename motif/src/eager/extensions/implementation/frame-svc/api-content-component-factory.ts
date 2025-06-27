import { DelayedBadnessComponentImplementation } from '../types/internal-api';
import { ApiComponentFactory } from './api-component-factory';

export interface ApiContentComponentFactory extends ApiComponentFactory {
    createDelayedBadnessComponent(): DelayedBadnessComponentImplementation;
}
