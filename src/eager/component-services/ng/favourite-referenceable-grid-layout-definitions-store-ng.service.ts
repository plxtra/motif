import { Injectable } from '@angular/core';
import { RevFavouriteReferenceableColumnLayoutDefinitionsStore } from 'revgrid';
import { FavouriteReferenceableColumnLayoutDefinitionsStoreService } from '../favourite-referenceable-grid-layout-definitions-store.service';

@Injectable({
    providedIn: 'root',
})
export class FavouriteReferenceableColumnLayoutDefinitionsStoreNgService {
    private _service: RevFavouriteReferenceableColumnLayoutDefinitionsStore;

    constructor() {
        this._service = new FavouriteReferenceableColumnLayoutDefinitionsStoreService();
    }

    get service() { return this._service; }
}
