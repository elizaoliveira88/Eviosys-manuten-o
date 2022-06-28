import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-add-element-to-mission.dialog',
  templateUrl: './add-element-to-mission.dialog.component.html',
  styleUrls: ['./add-element-to-mission.dialog.component.css']
})
export class AddElementToMissionDialogComponent implements OnInit {
    allM = [];
    selectedElement = null;
    selectedMission = null;
    newName = null;
    inputsRequired = false;
    sd = false;
    replace = false;
    storage = {
        sdAttr: null
    };
    adjacentShapes = [];
    adjacentMissions = [];
    addOptions = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<AddElementToMissionDialogComponent>,
                private translateService: TranslateService) {

        this.selectedElement = data.selectedElement;
        if(data.allMissions!==undefined && data.allMissions!==null){
            for(let k=0; k<data.allMissions.length; k++){
                let cur = data.allMissions[k];
                this.allM.push({
                    id:cur.id,
                    name: cur.name,
                    elements: cur.elements,
                    stopPoints: cur.stopPoints,
                    type: cur.type,
                    source:cur.source,
                    destination:cur.destination,
                    flow:cur.flow,
                    flowSegments:cur.flowSegments,
                    color:cur.color,
                    missionErrors:cur.missionErrors,
                    bothDirections : cur.bothDirections,
                    isLoaded: cur.isLoaded,
                    /*  stopsPerCycle: cur.stopsPerCycle,*/
                    additionalTime: cur.additionalTime
                });
            }
        }
    }

  ngOnInit(): void {
        this.checkAdjacentMissions(this.selectedElement).then(res=>{
            this.adjacentShapes = res;
            //collect adjacent missions from adjacentshapes
            if(this.allM!==undefined && this.allM!==null){
                for(let k=0; k<this.allM.length;k++){
                    let bool = false;
                    let currentMission = this.allM[k];
                    if(currentMission.hasOwnProperty('source') && this.adjacentShapes.indexOf(currentMission.source)>-1) bool=true;
                    if(currentMission.hasOwnProperty('destination') && this.adjacentShapes.indexOf(currentMission.destination)>-1) bool=true;
                    if(currentMission.hasOwnProperty('elements') && currentMission.elements!==null){
                        for(let i=0; i<currentMission.elements.length;i++){
                            if(this.adjacentShapes.indexOf(currentMission.elements[i])>-1) bool = true;
                        }
                    }
                    if(bool){
                        this.adjacentMissions.push(currentMission.id);
                    }
                }

            }
        },err=>{
            this.adjacentShapes = [];
        });

      if(this.allM!==undefined && this.allM!==null){
          for(let k=0; k<this.allM.length;k++){
              let found = false;
              let currentMission = this.allM[k];
              let index = this.adjacentMissions.indexOf(currentMission.id);
              if(index>-1){
                  if(currentMission.hasOwnProperty('source') && currentMission.source===this.selectedElement.id) found=true;
                  if(currentMission.hasOwnProperty('destination') && currentMission.destination===this.selectedElement.id) found=true;
                  if(currentMission.hasOwnProperty('elements') && currentMission.elements!==null){
                      for(let i=0; i<currentMission.elements.length;i++){
                          if(currentMission.elements[i]===this.selectedElement.id) found = true;
                      }
                  }
                  if(found){
                      this.adjacentMissions.splice(index,1);
                  }
              }

          }
      }

      this.addOptions=[{id:0, name:this.translateService.instant('PROJECTS.LAYOUT.ADDELEMENTTOMISSIONDIALOG_NEW'), elements:[], source:null, destination:null}];

  }

    checkAdjacentMissions (el): Promise<any>{
        return new Promise((resolve, reject) => {
            let res = [];
            if(el!==undefined && el!==null && this.allM!==undefined && this.allM!==null && this.allM.length>0){
                this.data.editor.findPath(el.id, {targetShapeTypes:['S:C','S:P','S:S','S:D','S:SD']}).then(function(arr){
                    if(arr!==undefined && arr!==null){
                        for(let k=0;k<arr.length;k++){
                            let pathArr = arr[k];
                            if(pathArr.length>1){
                                if(res.indexOf(pathArr[1])===-1) res.push(pathArr[1]);
                            }
                        }
                    }
                    resolve(res);
                },function(err){
                    resolve(res);
                });
            }else  resolve(res);
        });
    };

    cancel() {
        this.dialogRef.close();
    }

    reset (){
        this.sd=false;
        this.storage.sdAttr=null;
        this.replace=false;
    };


    elementInMission(elId, mission){
        if(mission!==undefined && mission!==null){
            if(mission.elements.hasOwnProperty(elId)) return true;
        }
        return false;
    }

    saveAndReplace(){
        if(this.selectedElement.type==='S:D'){
            this.selectedMission.destination = this.selectedElement.id;
        }else if(this.selectedElement.type==='S:S'){
            this.selectedMission.source = this.selectedElement.id;
        }else if(this.selectedElement.type==='S:SD' && this.selectedMission.type==='tugger'){
            this.selectedMission.source = this.selectedElement.id;
        }
        this.dialogRef.close(this.allM);
    };

    save(){

        if(this.selectedMission.id === 0 && this.newName!==undefined && this.newName!==null && this.newName.length>0){

            if(this.selectedElement.type==='S:S'){
                this.selectedMission = {
                    id:this.uuidv4(),
                    name: JSON.parse(JSON.stringify(this.newName)),
                    elements: [],
                    stopPoints: [],
                    type: 'normal',
                    source:null,
                    destination:null,
                    flow:0,
                    flowSegments:[],
                    color:this.getRandomColor(),
                    missionErrors:{
                        missingFlow: false,
                        missingPath: false
                    },
                    bothDirections : false,
                    isLoaded: true,
                    /* stopsPerCycle: 0,*/
                    additionalTime: 0
                };
                this.selectedMission.source = this.selectedElement.id;
                this.allM.push(this.selectedMission);
                this.dialogRef.close(this.allM);
            }else if(this.selectedElement.type==='S:D'){
                this.selectedMission = {
                    id:this.uuidv4(),
                    name: JSON.parse(JSON.stringify(this.newName)),
                    elements: [],
                    stopPoints: [],
                    type: 'normal',
                    source:null,
                    destination:null,
                    flow:0,
                    flowSegments:[],
                    color:this.getRandomColor(),
                    missionErrors:{
                        missingFlow: false,
                        missingPath: false
                    },
                    bothDirections : false,
                    isLoaded: true,
                    /*  stopsPerCycle: 0,*/
                    additionalTime: 0
                };
                this.selectedMission.destination = this.selectedElement.id;
                this.allM.push(this.selectedMission);
                this.dialogRef.close(this.allM);
            }else if(this.selectedElement.type==='S:TSP'){
                this.selectedMission = {
                    id:this.uuidv4(),
                    name: JSON.parse(JSON.stringify(this.newName)),
                    elements: [],
                    stopPoints: [],
                    type: 'normal',
                    source:null,
                    destination:null,
                    flow:0,
                    flowSegments:[],
                    color:this.getRandomColor(),
                    missionErrors:{
                        missingFlow: false,
                        missingPath: false
                    },
                    bothDirections : false,
                    isLoaded: true,
                    /* stopsPerCycle: 0,*/
                    additionalTime: 0
                };
                this.selectedMission.stopPoints.push({el:this.selectedElement.id, selected: true, couplingTime: 0});
                this.allM.push(this.selectedMission);
                this.dialogRef.close(this.allM);
            }else if(this.selectedElement.type==='S:SD'){
                //ask
                this.sd = true;
            }else{
                this.selectedMission = {
                    id:this.uuidv4(),
                    name: JSON.parse(JSON.stringify(this.newName)),
                    elements: [],
                    stopPoints: [],
                    type: 'normal',
                    source:null,
                    destination:null,
                    flow:0,
                    flowSegments:[],
                    color:this.getRandomColor(),
                    missionErrors:{
                        missingFlow: false,
                        missingPath: false
                    },
                    bothDirections : false,
                    isLoaded: true,
                    /* stopsPerCycle: 0,*/
                    additionalTime: 0
                };
                this.selectedMission.elements.push(this.selectedElement.id);
                this.allM.push(this.selectedMission);
                this.dialogRef.close(this.allM);
            }
        }else{
            if(this.selectedMission.id === 0){
                //new mission no name
                this.inputsRequired = true;
            }else {
                //existing mission
                if(this.selectedElement.type==='S:S'){
                    if(this.selectedMission.source===null) {
                        this.selectedMission.source = this.selectedElement.id;
                        this.dialogRef.close(this.allM);
                    }
                    else {
                        //ask to replace
                        this.replace = true;
                    }
                }else if(this.selectedElement.type==='S:D'){
                    if(this.selectedMission.destination===null) {
                        this.selectedMission.destination = this.selectedElement.id;
                        this.dialogRef.close(this.allM);
                    }
                    else {
                        //ask to replace
                        this.replace = true;
                    }
                }else if(this.selectedElement.type==='S:TSP'){

                    let stopPointsInclude = false;
                    for(let b=0; b<this.selectedMission.stopPoints.length;b++){
                        if(this.selectedMission.stopPoints[b].el === this.selectedElement.id) {
                            stopPointsInclude = true;
                            break;
                        }
                    }
                    if(!stopPointsInclude) {
                        this.selectedMission.stopPoints.push({el:this.selectedElement.id, selected: true, couplingTime: 0});
                        this.dialogRef.close(this.allM);
                    }else{
                        this.dialogRef.close(this.allM);
                    }
                }else if(this.selectedElement.type==='S:SD'){
                    //ask -> ask
                    if(this.selectedMission.type!=='tugger') this.sd = true;
                    else {
                        if(this.selectedMission.source===null) {
                            this.selectedMission.source = this.selectedElement.id;
                            this.dialogRef.close(this.allM);
                        }else{
                            this.replace = true;
                        }
                    }
                }else{
                    //elementInMission
                    if(!this.elementInMission(this.selectedElement.id,this.selectedMission)){
                        this.selectedMission.elements.push(this.selectedElement.id);
                        this.dialogRef.close(this.allM);
                    }
                }
            }
        }

    };

    saveSd(){
        if(this.storage.sdAttr==='source'){
            if(this.selectedMission.id === 0){
                this.selectedMission = {
                    id:this.uuidv4(),
                    name: JSON.parse(JSON.stringify(this.newName)),
                    elements: [],
                    stopPoints: [],
                    type: 'normal',
                    source:this.selectedElement.id,
                    destination:null,
                    flow:0,
                    flowSegments:[],
                    color:this.getRandomColor(),
                    missionErrors:{
                        missingFlow: false,
                        missingPath: false
                    },
                    bothDirections : false,
                    isLoaded: true,
                    /* stopsPerCycle: 0,*/
                    additionalTime: 0
                };
                this.allM.push(this.selectedMission);
            }else{
                this.selectedMission.source = this.selectedElement.id;
            }
            this.dialogRef.close(this.allM);
        }else if(this.storage.sdAttr==='destination'){
            if(this.selectedMission.id === 0){
                this.selectedMission = {
                    id:this.uuidv4(),
                    name: JSON.parse(JSON.stringify(this.newName)),
                    elements: [],
                    stopPoints: [],
                    type: 'normal',
                    source:null,
                    destination:this.selectedElement.id,
                    flow:0,
                    flowSegments:[],
                    color:this.getRandomColor(),
                    missionErrors:{
                        missingFlow: false,
                        missingPath: false
                    },
                    bothDirections : false,
                    isLoaded: true,
                    /* stopsPerCycle: 0,*/
                    additionalTime: 0
                };
                this.allM.push(this.selectedMission);
            }else{
                this.selectedMission.destination = this.selectedElement.id;
            }
            this.dialogRef.close(this.allM);
        }
    };

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

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
}
