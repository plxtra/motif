import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { EagerRootNgModule } from 'root-ng-api';
import { environment } from './environments/environment';

if (environment.prodMode) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(EagerRootNgModule)
    .catch((err: unknown) => console.log(err));
