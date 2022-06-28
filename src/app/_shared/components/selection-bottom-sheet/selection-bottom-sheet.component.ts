import {Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";

@Component({
    selector: 'app-selection-bottom-sheet',
    templateUrl: './selection-bottom-sheet.component.html',
    styleUrls: ['./selection-bottom-sheet.component.css']
})
export class BottomSheetSelectionComponent {

    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
        private bottomSheetRef: MatBottomSheetRef<BottomSheetSelectionComponent>
    ) {
        this.data = Object.assign({
            options: [],
            title: null,
            keySubTitle: null,
            keyIcon: null,
            keyTitle: 'value',
            translate: false,
            highlightKey: null,
            highlightValue: null
        }, this.data || {});
    }

    close(data) {
        this.bottomSheetRef.dismiss({
            selectedOption: data || null
        });
    }
}
