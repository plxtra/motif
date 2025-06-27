import { ApiErrorImplementationModule } from './implementation/internal-api';

export namespace StaticInitialise {
    export function initialise() {
        ApiErrorImplementationModule.initialiseStatic();
    }
}
