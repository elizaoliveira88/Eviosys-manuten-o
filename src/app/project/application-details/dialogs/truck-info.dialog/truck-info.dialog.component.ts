import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ApplicationDetailsService} from "@app/project/application-details/application-details.service";
import {SimpleTrailer_DATA} from "@shared/models/SimpleTrailer";

@Component({
  selector: 'app-truck-info.dialog',
  templateUrl: './truck-info.dialog.component.html',
  styleUrls: ['./truck-info.dialog.component.scss']
})
export class TruckInfoDialogComponent implements OnInit {

    storage = {
        selectedTruck: {
            applicationTruck: null,
            truckInfo: null
        },
        showTrailers: false,
        selectedTrailers: [],
        allTrailers: <SimpleTrailer_DATA[]>[]
    }
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<TruckInfoDialogComponent>,
              private service: ApplicationDetailsService) {
        if(data){
            this.storage.selectedTruck = data;
            this.service.getApplicationTruckTrailers(this.storage.selectedTruck.applicationTruck.id).then(res=>{
                if(res){
                    this.service.getBasicTrailers().then(allTrailers=>{
                        if(allTrailers){
                            res.forEach(el=>{
                                allTrailers.forEach(basicTrailer=>{
                                    if(parseInt(el.trailerId) === basicTrailer.id){
                                        this.storage.selectedTrailers.push(basicTrailer);
                                    }
                                })

                            })
                        }
                    });
                }
            });
        }
  }

  ngOnInit(): void {
  }

  save() {
        this.dialogRef.close(this.storage.selectedTruck);
  }

  cancel() {
      this.dialogRef.close();
  }
}
