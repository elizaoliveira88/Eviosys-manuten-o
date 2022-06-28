import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {
    ConfigureTruckDialogComponent
} from "@app/project/pricing/dialogs/configure-truck.dialog/configure-truck.dialog.component";

@Component({
  selector: 'app-standard-config.dialog',
  templateUrl: './standard-config.dialog.component.html',
  styleUrls: ['./standard-config.dialog.component.css']
})
export class StandardConfigDialogComponent implements OnInit {

    standardComponents = [];
  constructor(public dialogRef: MatDialogRef<ConfigureTruckDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,) {
      this.standardComponents = data.standardComponents.basetruck.concat(data.standardComponents.automation);
  }

  ngOnInit(): void {
  }

  close(){
    this.dialogRef.close();
  }

}
