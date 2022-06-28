import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-segments-dialog',
  templateUrl: './segments-init-dialog.component.html',
  styleUrls: ['./segments-init-dialog.component.scss']
})
export class SegmentsInitDialogComponent implements OnInit {
    processDurationShifts = null;
    shiftData = [];
    expandMenu = [];
    isInput = false;
    flow = 0;
    hasValues = true;
    error = false;
    breakTimeError = false;
    reInit = false;
    displayedValue: string = null;
    breakTime = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<SegmentsInitDialogComponent>) {

      this.processDurationShifts = data.processDurationShifts;
      if(data.shifts!==undefined && data.shifts!==null){
          this.shiftData = data.shifts;
          this.isInput = true;
      }else if (data.shift!==undefined && data.shift!==null){
          this.shiftData = [data.shift];
          console.log(this.shiftData);
          if(this.shiftData[0].hasOwnProperty('segments') && this.shiftData[0].segments.length>0){
              let dFrom = new Date(this.shiftData[0].segments[0].fromDate);
              let dFrom2 = this.shiftData[0].fromDate;

              let dTo = new Date(this.shiftData[0].segments[this.shiftData[0].segments.length-1].toDate);
              let dTo2 = this.shiftData[0].toDate;

              if( dFrom.getTime()!==dFrom2.getTime() ||  dTo.getTime()!==dTo2.getTime()) this.reInit = true;
              //  if($scope.shiftData[0].segments[0].fromDate)
          }
      }

      if(this.data.flow!==undefined && this.data.flow!==null){
          this.flow = this.data.flow;
      }

      let toDate = new Date(this.shiftData[0].toDate);
      let fromDate = new Date(this.shiftData[0].fromDate);
      let diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
      this.shiftData[0].minutes = diffTime / (60 * 1000);
      this.breakTime = this.shiftData[0].minutes - this.shiftData[0].minutesAfterBreak;

      for(let k=0; k< this.shiftData.length; k++) {
          let shift = this.shiftData[k];
          if (this.shiftData.length === 1 || k===0) this.expandMenu.push(true);
          else this.expandMenu.push(false);

          shift.fromDate = new Date(shift.fromDate);
          shift.toDate = new Date(shift.toDate);

          let count = shift.minutes/this.data.processDurationShifts;
          let middle = Math.round(count/2);
          if((!this.isInput &&  this.shiftData[0].segments.length===0 ) || this.reInit) this.initSegments(middle,count);
          else this.loopExistingSegments(this.data.newInit);
      }
  }

  ngOnInit(): void {


  }

    cancel() {
      this.dialogRef.close();
    }

    save() {
        this.dialogRef.close(this.shiftData);
    }

    initSegments(shift, middle,count?){
        shift.segments = [];
        this.error = shift.minutes % this.processDurationShifts>0;

        let segLength = this.processDurationShifts;
        let breakTimeRest = JSON.parse(JSON.stringify(this.breakTime));
        let brTime = JSON.parse(JSON.stringify(this.breakTime));

        for(let i=0; i<count; i++){
            let frDate = new Date(shift.fromDate.getTime());
            if(i>0){
                frDate = shift.segments[i-1].toDate;
            }
            let isDate = frDate instanceof Date;
            if(!isDate){
                frDate = new Date(frDate);
            }

            if(i>=middle && breakTimeRest>0){
                if(breakTimeRest > segLength){
                    brTime = segLength;
                    breakTimeRest -= segLength;
                    //if(breakTimeRest>0)count++;
                }else{
                    brTime = breakTimeRest;
                    breakTimeRest = 0;
                }
                shift.segments.push({
                    fromDate: frDate,
                    toDate: new Date(frDate.getTime() + (this.processDurationShifts*60000)), // new Date(frDate.getTime() + breakTime*60000),
                    inputValues:{
                        flow:0
                    },
                    breakTime: brTime
                });
            }else{
                shift.segments.push({
                    fromDate: frDate,
                    toDate: new Date(frDate.getTime() + (this.processDurationShifts*60000)),
                    inputValues:{
                        flow:0
                    },
                    breakTime: 0
                });
            }

        }
    }

    countSegments (){
        let total = 0;
        let allZero = true;
        for(let i=0; i<this.shiftData.length; i++){
            let sh = this.shiftData[i];
            if(sh.hasOwnProperty('segments') && sh.segments!==null){
                for(let l=0; l<sh.segments.length; l++){
                    let seg = sh.segments[l];
                    if(seg.inputValues.flow>-1) total ++;
                    if(i===0 && l===0 && seg.flow>0) {
                        allZero = false;
                    }
                }
            }

        }
        if(allZero) this.hasValues = false;
        return total;
    }

    loopExistingSegments(newInit){
        let ctn = this.countSegments();
        if(!this.hasValues){
            for(let i=0; i<this.shiftData.length; i++){
                let sh = this.shiftData[i];
                if(sh.hasOwnProperty('segments') && sh.segments!==null){
                    for(let l=0; l<sh.segments.length; l++){
                        let seg = sh.segments[l];
                        if(newInit!==null) {
                            seg.inputValues.flow = newInit;
                        }
                        else{
                            if(this.data.flowSegments!==undefined && this.data.flowSegments!==null && this.data.flowSegments.length>0 && this.data.flowSegments.hasOwnProperty(i)){
                                seg.inputValues.flow = this.data.flowSegments[i][l].inputValues.flow;
                            }
                        }
                    }
                }

            }
        }
    }

    checkEmpty (value){
        if(value===undefined || value===null || value==='') return 0;
        else return value;
    };

    toggleItem  (index){
        this.expandMenu[index]=  !this.expandMenu[index];
    };

    array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    }


    moveBreak (dir, i){
        if(!this.error){
            var index = -1;
            for(var k=0; k<this.shiftData[i].segments.length; k++){
                if(this.shiftData[i].segments[k].inputValues.flow === -1){
                    index = k;
                }
            }

            var count = this.shiftData[i].minutesAfterBreak/this.data.processDurationShifts;

            if(dir==='up'){
                if(index!==-1 && index>0){
                    this.array_move(this.shiftData[i].segments,index,index-1);
                    this.initSegments(index-1,count);
                }
            }else if(dir==='down'){
                if(index!==-1 && index<this.shiftData[i].segments.length-1){
                    this.array_move(this.shiftData[i].segments,index,index+1);
                    this.initSegments(index+1,count);
                }
            }
        }
    };

    checkBreakTime(shIndex, index){
        if(this.shiftData[shIndex].segments[index].breakTime===null || this.shiftData[shIndex].segments[index].breakTime===undefined) this.shiftData[shIndex].segments[index].breakTime = 0;

        if( this.shiftData[shIndex].segments[index].breakTime>this.data.processDurationShifts) {
            this.shiftData[shIndex].segments[index].breakTime =JSON.parse(JSON.stringify(this.data.processDurationShifts));
        }
    };
}
