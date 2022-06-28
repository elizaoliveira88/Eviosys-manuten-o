import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-segments-dialog',
  templateUrl: './segments-dialog.component.html',
  styleUrls: ['./segments-dialog.component.scss']
})
export class SegmentsDialogComponent implements OnInit {

    displayedValue: string = null;
    value: string = null;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<SegmentsDialogComponent>) {
      if(data.displayedValue){
          this.displayedValue = data.displayedValue;
      }
      if(data.value){
          this.value = data.value;
          console.log(data, this.value);
      } else {
          this.value = 'flow'
      }
  }

  ngOnInit(): void {
  }

    cancel() {
      this.dialogRef.close();
    }

    save() {
        this.dialogRef.close(this.data);
    }
}
