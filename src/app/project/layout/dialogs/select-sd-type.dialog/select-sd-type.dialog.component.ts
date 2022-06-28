import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LayoutShapesService} from "@app/project/layout/layout.shapes.service";

@Component({
  selector: 'app-select-sd-type.dialog',
  templateUrl: './select-sd-type.dialog.component.html',
  styleUrls: ['./select-sd-type.dialog.component.css']
})
export class SelectSdTypeDialogComponent implements OnInit {
    storage = {
        type: null,
        selectedType: null,
        allTypes:{}
    };
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<SelectSdTypeDialogComponent>,
              private layoutShapesService: LayoutShapesService) { }

  ngOnInit(): void {
      this.storage.type = this.data.shape.type

      if(this.data.shape.type=== 'S:S'){
          this.storage.allTypes = this.layoutShapesService.getSourceTypes();
      }else if(this.data.shape.type=== 'S:D'){
          this.storage.allTypes = this.layoutShapesService.getDestinationTypes();
      }else if(this.data.shape.type=== 'S:SD'){
          this.storage.allTypes = this.layoutShapesService.getSdTypes();
      }
  }

  save(): void{
    this.dialogRef.close(this.storage.selectedType);
  }

}
