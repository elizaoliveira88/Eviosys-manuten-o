import { MatBottomSheet } from "@angular/material/bottom-sheet";
import {Injectable} from "@angular/core";
import {BottomSheetSelectionComponent} from "@shared/components/selection-bottom-sheet/selection-bottom-sheet.component";

@Injectable({
    providedIn: 'root'
})

export class BottomSheetSelectionService {
    public isOpen = false;
    constructor(
        public bottomSheet: MatBottomSheet,
    ) {
    }

    openBottomSheet(sheetData) {
        this.isOpen = true;
        var bottomSheetSelection = this.bottomSheet.open(BottomSheetSelectionComponent, {
            data: sheetData
        });
        bottomSheetSelection.afterDismissed().toPromise().then(function(opt) {
            this.isOpen = false;
        }.bind(this), function(err) {});
        return bottomSheetSelection;
    }

    closeBottomSheet() {
        this.isOpen = false;
        this.bottomSheet.dismiss();
    }
}
