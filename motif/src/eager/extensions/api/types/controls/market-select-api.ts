import { Market } from '../adi';
import { MarketUiAction } from '../ui-action';
import { ControlComponent } from './control-component-api';

/** @public */
export interface MarketSelect<T extends Market> extends MarketUiAction<T>, ControlComponent {

}
