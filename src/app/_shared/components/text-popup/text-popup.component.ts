import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  text: string | string[];
  title: string;
  subtitle?: string;
}

@Component({
  selector: 'text-popup',
  templateUrl: 'text-popup.component.html',
})
export class TextPopup {

    options = {
        text: [],
        rows: []
    };
    constructor(
        public dialogRef: MatDialogRef<TextPopup>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        if(this.data && this.data.hasOwnProperty('text')) {
            if(typeof this.data.text == 'string') {
                this.options.text = this.data.text.split('\r\n');
            } else {
                this.options.rows = this.data.text;
            }
        }
    }

    closePopup(): void {
        this.dialogRef.close();
    }
}
