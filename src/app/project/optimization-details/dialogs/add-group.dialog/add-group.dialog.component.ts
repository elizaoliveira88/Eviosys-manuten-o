import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-add-group.dialog',
  templateUrl: './add-group.dialog.component.html',
  styleUrls: ['./add-group.dialog.component.css']
})
export class AddGroupDialogComponent implements OnInit {
    allAppsAndTrucks = [];
    groups = [];
  constructor(public dialogRef: MatDialogRef<AddGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
      if(data.optimizationApplications){
          data.optimizationApplications.forEach(el=>{
              this.allAppsAndTrucks.push({
                  application: JSON.parse(JSON.stringify(el.application)),
                  group: el.group
              });
          })
      }
      for(let k=0; k<this.allAppsAndTrucks.length; k++){
          let app = this.allAppsAndTrucks[k].application;
          if(!this.allAppsAndTrucks[k].hasOwnProperty('group') || this.allAppsAndTrucks[k].group===null)
              this.allAppsAndTrucks[k]['group']='-1';
          else{
              if(this.groups.indexOf(this.allAppsAndTrucks[k].group) === -1) this.groups.push(this.allAppsAndTrucks[k].group);
          }

      }
      if(this.groups.indexOf('-1') === -1 )this.groups.unshift('-1');
      this.groups = this.sort(this.groups);
  }

    addGroup(){
      let addedGroup = null;
      for(let i=1; i<=this.allAppsAndTrucks.length;i++){
          if(this.groups.indexOf(i)===-1){
              addedGroup = i;
              this.groups.push(i);
              i=this.allAppsAndTrucks.length+1;
          }
      }
      if(addedGroup){
          for(let k=0; k<this.allAppsAndTrucks.length;k++){
              if(this.allAppsAndTrucks[k].group==='-1'){
                  this.allAppsAndTrucks[k].group = addedGroup;
              }
          }
      }
        this.groups = this.sort(this.groups);
    };

  ngOnInit(): void {
  }

  cancel(){
      this.dialogRef.close();
  }

  save(){
      this.dialogRef.close(this.allAppsAndTrucks);
  }

  sort(array){
      return array.sort(function(a, b) {
          return a - b;
      });
  }

    /* ----------------- helpers */

    normalizeApplicationType(val: string): string{
        if(val){
            if(val.charAt(0)==='A'){
                return val;
            } else {
                return 'A'+val;
            }
        }
    }
}
