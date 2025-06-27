import { LogServiceModule } from './log-service';

export namespace StaticInitialise {
    export function initialise() {
        LogServiceModule.initialiseStatic();
    }
}
