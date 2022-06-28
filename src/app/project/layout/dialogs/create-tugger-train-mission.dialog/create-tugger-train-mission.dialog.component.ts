import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastService} from "@services/toast.service";

@Component({
  selector: 'app-create-tugger-train-mission.dialog',
  templateUrl: './create-tugger-train-mission.dialog.component.html',
  styleUrls: ['./create-tugger-train-mission.dialog.component.css']
})
export class CreateTuggerTrainMissionDialogComponent {
    tuggerStorage = {
        name: null,
        color:this.getRandomColor(),
        bothDirections:false,
        source: null,
        allStopPoints: [],
        flow:null,
        selectedStopPointsInOrder: [],
        requiredInputs: false
    };
    color = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CreateTuggerTrainMissionDialogComponent>,
              private toast: ToastService) {
      this.tuggerStorage.source = data.source;
      this.tuggerStorage.allStopPoints = data.allStopPoints;
  }

    addNewStop (){
        let length = JSON.parse(JSON.stringify(this.tuggerStorage.selectedStopPointsInOrder)).length;
        this.tuggerStorage.selectedStopPointsInOrder.push({index: length, stopPoint:null});
    };

    cancel () {
        this.dialogRef.close();
    };

    changeColor (){
        this.color = this.getRandomColor();
    };

    array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            let k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing

    }

    pad(n) { return ("00000000" + n).substr(-8); }
    natural_expand(a) { return a.replace(/\d+/g, this.pad); }

    changePos (el, oldIndex, dir){
        if(dir==='up'){
            if(oldIndex>0) this.array_move(this.tuggerStorage.selectedStopPointsInOrder, oldIndex, oldIndex-1);
        }else if(dir==='down'){
            if(oldIndex<this.tuggerStorage.selectedStopPointsInOrder.length-1) this.array_move(this.tuggerStorage.selectedStopPointsInOrder, oldIndex, oldIndex+1);
        }
    };

    removeStop (index){
        if(this.tuggerStorage.selectedStopPointsInOrder!==null && this.tuggerStorage.selectedStopPointsInOrder.length>index){
            this.tuggerStorage.selectedStopPointsInOrder.splice(index,1);
        }
    };

    findElementById (id){

        // always update all elements first
        let getFromEditor = this.data.editor.exportJSONObjects();
        let allEl= getFromEditor.layer.base.shapes;
        if(allEl!== undefined && allEl!==null){
            for(let k=0;k<allEl.length;k++){
                if(allEl[k].id === id) return allEl[k];
            }
        }
        return null;
    };

    findPathBetweenStops (start, stop){
        return new Promise((resolve, reject) => {
            let pathIds = [];
            this.data.editor.findPath(start,{targetShapeIds:[stop]}).then(data=>{
                if(data.length>0){
                    let res = null;
                    let shortest = 0;
                    if(data.length>1){
                        for(let g=0;g<data.length;g++){
                            let d = 0;
                            for(let h=0; h<data[g].length;h++){
                                let el = this.findElementById(data[g][h]);
                                if(el.type==='S:P') d += parseFloat(el.display.length);
                            }
                            if(res===null || d<shortest) {
                                res = data[g];
                                shortest = d;
                            }
                        }
                    }
                    if(data[0]!==null && data[0].length>2){
                        let res = data[0];
                        res.splice(res.length-1,1);
                        res.splice(0,1);
                        resolve(res);
                    }else resolve([]);
                }else reject();
            },err=>{
                resolve([]);
            });
        });
    }

    finish(totalPath,idsListOrig){
        let newMission = {
            id: this.uuidv4(),
            type: 'tugger',
            name: this.tuggerStorage.name,
            elements: totalPath,
            stopPoints: idsListOrig,
            source: this.tuggerStorage.source.id,
            destination: this.tuggerStorage.source.id,
            flow: (this.tuggerStorage.flow!==null) ? this.tuggerStorage.flow : 0,
            color: this.tuggerStorage.color,
            missionErrors:{
                missingFlow: false,
                missingPath: false
            },
            bothDirections : this.tuggerStorage.bothDirections,
            isLoaded: (this.tuggerStorage.bothDirections ? null : true),
            /*  stopsPerCycle: 0,*/
            additionalTime: 0
        };
        this.dialogRef.close(newMission);
    }

    loopList (idsList,totalPath,idsListOrig){
        this.findPathBetweenStops(idsList[0].el,idsList[1].el).then(res1=>{
            totalPath = totalPath.concat(res1);
            totalPath.push(idsList[1].el);
            idsList.splice(0,1);
            if(idsList.length>1) this.loopList(idsList,totalPath,idsListOrig);
            else{
                //lastElement
                this.findPathBetweenStops(idsList[0].el,this.tuggerStorage.source.id).then(res=>{
                    totalPath = totalPath.concat(res);
                    totalPath.push(this.tuggerStorage.source.id);
                    this.finish(totalPath,idsListOrig);
                }, err=> {
                    let el = this.findElementById(idsList[0].el);
                    this.toast.error('PROJECTS.LAYOUT.TUGGERMISSION_PATHNOTFOUND',{
                        val1: el.customName,
                        val2:this.tuggerStorage.source.customName
                    });
                });
            }
        }, err=> {
            let el = this.findElementById(idsList[0].el);
            let el2 = this.findElementById(idsList[1].el);
            this.toast.error('PROJECTS.LAYOUT.TUGGERMISSION_PATHNOTFOUND',{
                val1: el.customName,
                val2:el2.customName
            });
        });
    }

    save () {

        if(this.tuggerStorage.name!==undefined && this.tuggerStorage.name!==null && this.tuggerStorage.name!==''){
            this.tuggerStorage.requiredInputs=false;


            let idsList = [];

            for(let p=0; p<this.tuggerStorage.selectedStopPointsInOrder.length;p++){
                if(this.tuggerStorage.selectedStopPointsInOrder[p]!==undefined && this.tuggerStorage.selectedStopPointsInOrder[p]!==null && this.tuggerStorage.selectedStopPointsInOrder[p].stopPoint!==null)
                    idsList.push({el:this.tuggerStorage.selectedStopPointsInOrder[p].stopPoint.id, couplingTime: 0, selected: true});
            }
            let idsListOrig =JSON.parse(JSON.stringify(idsList));
            let totalPath = [];

            if(idsList.length>0){
                this.findPathBetweenStops(this.tuggerStorage.source.id,idsList[0].el).then(res=>{
                    totalPath.push(this.tuggerStorage.source.id);
                    totalPath = totalPath.concat(res);
                    totalPath.push(idsList[0].el);

                    if(idsList.length>1) this.loopList(idsList,totalPath,idsListOrig);
                    else{
                        //lastElement
                        this.findPathBetweenStops(idsList[0].el,this.tuggerStorage.source.id).then(res=>{
                            totalPath = totalPath.concat(res);
                            totalPath.push(this.tuggerStorage.source.id);
                            this.finish(totalPath,idsListOrig);
                        }, err=>{
                            let el = this.findElementById(idsList[0].el);
                            this.toast.error('PROJECTS.LAYOUT.TUGGERMISSION_PATHNOTFOUND',{
                                val1: el.customName,
                                val2: this.tuggerStorage.source.customName
                            });
                        });
                    }

                }, err=>{
                    let el = this.findElementById(idsList[0].el);
                    this.toast.error('PROJECTS.LAYOUT.TUGGERMISSION_PATHNOTFOUND', {
                        val1: this.tuggerStorage.source.customName,
                        val2: el.customName
                    });
                });
            }else{
                this.toast.error('PROJECTS.LAYOUT.TUGGERMISSION_NOPATH');
            }
        }else{
            this.tuggerStorage.requiredInputs=true;
        }


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

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
