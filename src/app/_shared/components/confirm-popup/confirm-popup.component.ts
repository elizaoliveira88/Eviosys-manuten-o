import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  lable: string;
  title: string;
  info?: string;
  buttonTextYes?: string;
  buttonTextNo?: string;
}

@Component({
  selector: 'confirm-popup',
  templateUrl: 'confirm-popup.component.html',
  styleUrls: ['confirm-popup.component.css']
})
export class ConfirmPopup {

    constructor(
        public dialogRef: MatDialogRef<ConfirmPopup>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        if(data.info == null) {
            data.info = '';
        }
        if(data.buttonTextNo == null) {
            data.buttonTextNo = 'NO';
        }
        if(data.buttonTextYes == null) {
            data.buttonTextYes = 'YES';
        }
    }

    closePopup(type): void {
        this.dialogRef.close(type);
    }
}
