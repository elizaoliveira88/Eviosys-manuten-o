import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {TrucksService} from "@app/project/trucks/trucks.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProjectTruck} from "@shared/models/ProjectTruck";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-project-truck-details.dialog',
  templateUrl: './project-truck-details.dialog.component.html',
  styleUrls: ['./project-truck-details.dialog.component.scss']
})
export class ProjectTruckDetailsDialogComponent implements OnInit {

    storage = {
        selectedTruck: null,
        selectedMenu: 'financeInfo',
        batteryTypeOptions: ["BATTERYTYPE_LTO","BATTERYTYPE_LEADACID","BATTERYTYPE_GEL"],
        batteryChargeTypes: ["BATTERYCHARGETYPE_ONBOARD","BATTERYCHARGETYPE_BATTERYCHANGE"]
    }

    financeDataGroup: FormGroup;
    expertCriteriaGroup: FormGroup;
    energyConceptGroup: FormGroup;

  constructor(public dialogRef: MatDialogRef<ProjectTruckDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private service: TrucksService,
              private dialog: MatDialog) {
        if(this.data.truck){
            this.storage.selectedTruck = new ProjectTruck(this.data.truck);
        }else if(this.data.truckId) {
            this.storage.selectedTruck = new ProjectTruck();
            this.storage.selectedTruck.truckId = this.data.truckId;
        }else if(this.data.trailerId) {
            this.storage.selectedTruck = new ProjectTruck();
            this.storage.selectedTruck.truckId = null;
            this.storage.selectedTruck.trailerId = this.data.trailerId;
        }
  }

  ngOnInit(): void {
      this.financeDataGroup = new FormGroup({
          salesPrice: new FormControl(this.storage.selectedTruck.financeInfo.salesPrice, [Validators.min(0)]),
          financingMonth: new FormControl(this.storage.selectedTruck.financeInfo.financingMonth, [Validators.min(0)]),
          rate: new FormControl(this.storage.selectedTruck.financeInfo.rate, [Validators.min(0)]),
          rent: new FormControl(this.storage.selectedTruck.financeInfo.rent, [Validators.min(0)]),
          maintenanceCosts: new FormControl(this.storage.selectedTruck.financeInfo.maintenanceCosts, [Validators.min(0)]),
          residualValue: new FormControl(this.storage.selectedTruck.financeInfo.residualValue, [Validators.min(0)]),
          grossPay: new FormControl(this.storage.selectedTruck.financeInfo.grossPay, [Validators.min(0)])
      });

      this.expertCriteriaGroup = new FormGroup({
          recordingTimeSec: new FormControl(this.storage.selectedTruck.expertCriteria.recordingTimeSec, [Validators.min(0)]),
          efficiencyFactor: new FormControl(this.storage.selectedTruck.expertCriteria.efficiencyFactor, [Validators.min(0),Validators.max(100)]),
          depositTimeSec: new FormControl(this.storage.selectedTruck.expertCriteria.depositTimeSec, [Validators.min(0)]),
          palletsPerDrive: new FormControl(this.storage.selectedTruck.expertCriteria.palletsPerDrive, [Validators.min(0)])
      });

      this.energyConceptGroup = new FormGroup({
          batteryType: new FormControl(this.storage.selectedTruck.energyConcept.batteryType),
          batteryChargeType: new FormControl(this.storage.selectedTruck.energyConcept.batteryChargeType),
          batteryCapacity: new FormControl(this.storage.selectedTruck.energyConcept.batteryCapacity, [Validators.min(0)]),
          batteryVoltage: new FormControl(this.storage.selectedTruck.energyConcept.batteryVoltage, [Validators.min(0)])
      });
  }

  cancel() {
      this.dialogRef.close();
  }

  save() {
      let data = {
          expertCriteria: this.expertCriteriaGroup.getRawValue(),
          financeInfo: this.financeDataGroup.getRawValue(),
          energyConcept: this.energyConceptGroup.getRawValue()
      }
      this.storage.selectedTruck = Object.assign(this.storage.selectedTruck, data);
      if(this.data.truck){
          // patch
          const dialogConfig = new MatDialogConfig();
          dialogConfig.autoFocus = false;
          dialogConfig.panelClass = ['smallDialog'];
          dialogConfig.data = {
              labels: {
                  title: "PROJECTS.TRUCKS.ACTIVATE_TRUCK.TITLE",
                  content: "PROJECTS.TRUCKS.ACTIVATE_TRUCK.CONTENT",
                  save: "PROJECTS.TRUCKS.ACTIVATE_TRUCK.ACTIVATE",
                  cancel: "PROJECTS.TRUCKS.ACTIVATE_TRUCK.KEEP"
              }
          };

          if(!this.storage.selectedTruck.active){
              const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
              dialogRef.afterClosed().subscribe(result => {
                  if (result) {
                      this.storage.selectedTruck.active = true;
                  }
                  this.service.patchProjectTruck(this.storage.selectedTruck,this.storage.selectedTruck.id).then(data=>{
                      this.dialogRef.close(true);
                  }, err => {

                  });
              });
          } else {
              this.service.patchProjectTruck(this.storage.selectedTruck,this.storage.selectedTruck.id).then(data=>{
                  this.dialogRef.close(true);
              }, err => {

              });
          }
      } else if(this.data.truckId || this.data.trailerId){
          // post
          delete this.storage.selectedTruck.id;
          delete this.storage.selectedTruck.creationDate;
          if(this.data.trailerId) {
              delete this.storage.selectedTruck.truckId;
              delete this.storage.selectedTruck.expertCriteria;
          } else {
              delete this.storage.selectedTruck.trailerId;
          }
          this.storage.selectedTruck.active = true;
          this.service.postProjectTruck(this.storage.selectedTruck).then(data=>{
              this.dialogRef.close(true);
          }, err => {

          });
      }
  }

    select(type){
        this.storage.selectedMenu = type;
    }

}
