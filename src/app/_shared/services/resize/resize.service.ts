import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {BottomSheetSelectionService} from "@services/bottom-sheet-selection/bottom-sheet-selection.service";

@Injectable({
    providedIn: 'root',
})
export class ResizeService {

    displayType = 'MOBILE';
    private _toggle = new BehaviorSubject('MOBILE');
    toggle$ = this._toggle.asObservable().pipe(distinctUntilChanged());
    constructor(
        private bottomSheet: BottomSheetSelectionService
    ) {
    }

    changeWidth(x) {
        var dt = 'MOBILE';
        if (x > 800 && x < 1280) {
            dt = 'DESKTOP';
        }
        if (x >= 1280) {
            dt = 'LARGE';
        }
        if(this.displayType != dt) {
            this.displayType = dt;
            if ((dt == 'DESKTOP' || dt == 'LARGE') && this.bottomSheet.isOpen) {
                this.bottomSheet.closeBottomSheet();
            }
            this._toggle.next(this.displayType);
        }
    }
}
