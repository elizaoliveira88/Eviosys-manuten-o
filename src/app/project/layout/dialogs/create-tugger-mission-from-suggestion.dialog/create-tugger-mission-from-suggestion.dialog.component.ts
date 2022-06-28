import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-create-tugger-mission-from-suggestion.dialog',
  templateUrl: './create-tugger-mission-from-suggestion.dialog.component.html',
  styleUrls: ['./create-tugger-mission-from-suggestion.dialog.component.css']
})
export class CreateTuggerMissionFromSuggestionDialogComponent {
    bothDirPossible = false
    bothDir = false;
    stopPoints = [];
    requiredInputs = false;
    newName =  null;
    flow = null;
    inputsRequired = false;
    color = null;
    source = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<CreateTuggerMissionFromSuggestionDialogComponent>,) {
      if(this.stopPoints===null || this.stopPoints.length===0 || this.source===null) this.requiredInputs = true;
      if(data.bothDir) {
          this.bothDirPossible = JSON.parse(JSON.stringify(data.bothDir));
          this.bothDir = data.bothDir;
      }
      if(data.stopPoints){
          this.stopPoints = data.stopPoints;
      }
      if(data.name){
          this.newName = data.name;
      }
      if(data.flow){
          this.flow = data.flow;
      }
      if(data.color){
          this.color = data.color;
      }
      if(data.source){
          this.source = data.source;
      }
  }

    changeColor (){
        this.color = this.getRandomColor();
    };

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        color = this.ColorLuminance (color, 0.1);
        return color;
    }

    ColorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        let rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    }

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

    pad(n) { return ("00000000" + n).substr(-8); }
    natural_expand(a) { return a.replace(/\d+/g, this.pad); }
    natural_compare(a, b) {
        return this.natural_expand(a.el.customName).localeCompare(this.natural_expand(b.el.customName));
    }
    orderAlphabetically (){

        this.stopPoints.sort(this.natural_compare);
    };

    changePos (el, oldIndex, dir){
        if(dir==='up'){
            if(oldIndex>0) this.array_move(this.stopPoints, oldIndex, oldIndex-1);
        }else if(dir==='down'){
            if(oldIndex<this.stopPoints.length-1) this.array_move(this.stopPoints, oldIndex, oldIndex+1);
        }
    };

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    cancel() {
        this.dialogRef.close();
    }

    save () {

        var idsList = [];
        for(var p=0; p<this.stopPoints.length;p++){
            idsList.push({el:this.stopPoints[p].el.id, selected:this.stopPoints[p].selected, couplingTime: 0});
        }

        if(!this.requiredInputs && this.newName!==null && this.newName!==''){

            var newMission = {
                id: this.uuidv4(),
                type: 'tugger',
                name: this.newName,
                elements: null,
                stopPoints: idsList,
                source: null,
                destination: null,
                flow: (this.flow!==null) ? this.flow : 0,
                color: this.color,
                missionErrors:{
                    missingFlow: false,
                    missingPath: false
                },
                bothDirections : this.bothDir,
                isLoaded: (this.bothDir ? null : true),
                /*  stopsPerCycle: 0,*/
                additionalTime: 0
            };
            this.dialogRef.close(newMission);
        }else{
            this.inputsRequired = true;
        }
    };

}
