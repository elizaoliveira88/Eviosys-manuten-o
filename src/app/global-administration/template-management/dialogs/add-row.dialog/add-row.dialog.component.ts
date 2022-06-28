import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-add-row.dialog',
  templateUrl: './add-row.dialog.component.html',
  styleUrls: ['./add-row.dialog.component.css']
})
export class AddRowDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AddRowDialogComponent>) { }

  ngOnInit(): void {
  }

    selectOption (type) {
        this.dialogRef.close(type);
    };

    cancel () {
        this.dialogRef.close(null);
    };

}
