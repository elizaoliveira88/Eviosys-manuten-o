import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

interface Labels{
    title: string,
    name: string,
    content: string,
    save: string
}
@Component({
  selector: 'app-prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.css']
})

export class PromptDialogComponent implements OnInit {
    form;
    labels: Labels = {
        title: 'COMPONENTS.DIALOGS.TITLE',
        name: 'COMPONENTS.DIALOGS.NAME',
        content: 'COMPONENTS.DIALOGS.CONTENT',
        save: 'GLOBAL.SAVE'
    };
    value: any = null;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<PromptDialogComponent>) {
        if(data.labels){
            this.labels = data.labels;
        }
        if(data.value){
            this.value = data.value;
        }
    }

    ngOnInit(): void {
        let initial = null;
        if(this.value !== null && this.value !== undefined) {
            initial = this.value;
        }
        this.form = new FormGroup({
            value: new FormControl(initial, [Validators.required]),
        });
    }

    cancel(){
        this.dialogRef.close(null);
    }

    save(){
        if(this.form.valid){
            this.dialogRef.close(this.form.getRawValue());
        }
    }

}

