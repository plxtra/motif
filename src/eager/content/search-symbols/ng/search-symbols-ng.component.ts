import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DelayedBadnessGridSourceNgDirective } from '../../delayed-badness-grid-source/ng-api';
import { ContentNgService } from '../../ng/content-ng.service';
import { SearchSymbolsFrame } from '../search-symbols-frame';

@Component({
    selector: 'app-search-symbols',
    templateUrl: './search-symbols-ng.component.html',
    styleUrls: ['./search-symbols-ng.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SearchSymbolsNgComponent extends DelayedBadnessGridSourceNgDirective {
    private static typeInstanceCreateCount = 0;

    declare frame: SearchSymbolsFrame;

    constructor() {
        const contentNgService = inject(ContentNgService);

        const frame = contentNgService.createSearchSymbolsFrame();
        super(++SearchSymbolsNgComponent.typeInstanceCreateCount, frame);
        frame.setComponentAccess(this);
    }
}

// export namespace SearchSymbolsNgComponent {
//     export function create(container: ViewContainerRef) {
//         container.clear();

//         const componentRef = container.createComponent(SearchSymbolsNgComponent);

//         const instance = componentRef.instance;
//         if (!(instance instanceof SearchSymbolsNgComponent)) {
//             throw new AssertInternalError('FCCI59923112141');
//         } else {
//             return instance;
//         }
//     }
// }
