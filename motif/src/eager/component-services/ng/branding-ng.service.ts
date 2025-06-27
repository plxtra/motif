import { InjectionToken } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

export class BrandingNgService {
    constructor(readonly desktopBarLeftImageUrl: SafeResourceUrl | undefined, readonly startupSplashWebPageSafeResourceUrl: SafeResourceUrl | undefined) {
    }
}

export namespace BrandingNgService {
    export const injectionToken = new InjectionToken<BrandingNgService>('BrandingNgService');
}
