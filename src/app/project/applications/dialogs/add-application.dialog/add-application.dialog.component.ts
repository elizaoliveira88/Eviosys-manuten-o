import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SafePipe} from "@shared/pipes/safe.pipe";

@Component({
  selector: 'app-add-application.dialog',
  templateUrl: './add-application.dialog.component.html',
  styleUrls: ['./add-application.dialog.component.scss']
})
export class AddApplicationDialogComponent implements OnInit {

    storage = {
        name: null,
        flowPlan: false,
        applicationTypes: [],
        selected: null
    }
    flowPlanTypes: number[] = [3,4,5,8];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<AddApplicationDialogComponent>,
              private safePipe: SafePipe) { }

  ngOnInit(): void {
      for (let x = 1; x <= 8; x++) {
          this.storage.applicationTypes.push({
              id: x,
              active: (x < 9),
              name: 'FUNCTIONTYPE_A' + x,
              logo: 'assets/img/Task_Pics/logisticFunctionType_A' + x + '.jpg',
              video: 'assets/video/functionType' + x + '.mp4',
              flowPlanPossible: this.flowPlanTypes.indexOf(x)>-1,
              disabled: false
          });
      }
  }

  flowPlanChanged(){
        if(this.storage.flowPlan){
            if(this.storage.selected){
                this.storage.applicationTypes.forEach(el=>{
                    if(el.id === this.storage.selected.id){
                        if(!el.flowPlanPossible){
                            this.storage.selected = null;
                        }
                    }
                });
                this.disableNonFlowPlan();
            } else {
                this.disableNonFlowPlan();
            }
        } else {
            this.enableAll();
        }
  }

  save() {
    this.dialogRef.close({
        name: this.storage.name,
        selectedType: 'A' + this.storage.selected.id,
        flowPlan: this.storage.flowPlan
    });
  }

  cancel() {
      this.dialogRef.close();
  }

  disableNonFlowPlan(){
      this.storage.applicationTypes.forEach(el=>{
          if(!el.flowPlanPossible){
              el.disabled = true;
          }
      })
  }

    enableAll(){
        this.storage.applicationTypes.forEach(el=>{
            el.disabled = false;
        })
    }

  selectType(type) {
      if(type.disabled) return;
      this.storage.selected = type;
  }
}
