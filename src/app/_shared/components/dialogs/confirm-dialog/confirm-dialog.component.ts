import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

interface Labels{
    title: string,
    content: string,
    save: string,
    cancel: string
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent  {
    form;
    labels: Labels = {
        title: 'COMPONENTS.DIALOGS.TITLE',
        content: 'COMPONENTS.DIALOGS.CONTENT',
        save: 'GLOBAL.SAVE',
        cancel: 'GLOBAL.CANCEL'
    };
    value: any = null;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<ConfirmDialogComponent>) {
        if(data.labels){
            this.labels = Object.assign(this.labels, data.labels);
        }
    }

    cancel(){
        this.dialogRef.close(null);
    }

    save(){
        this.dialogRef.close(true);
    }

}

