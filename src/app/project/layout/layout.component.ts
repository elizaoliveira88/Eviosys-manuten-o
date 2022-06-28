import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {LayoutShapesService} from "@app/project/layout/layout.shapes.service";
import {LayoutService} from "@app/project/layout/layout.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {
    CommentsDialogComponent
} from "@app/project/application-details/dialogs/comments.dialog/comments.dialog.component";
import {
    SelectSdTypeDialogComponent
} from "@app/project/layout/dialogs/select-sd-type.dialog/select-sd-type.dialog.component";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {
    CreateMissionFromSuggestionDialogComponent
} from "@app/project/layout/dialogs/create-mission-from-suggestion.dialog/create-mission-from-suggestion.dialog.component";
import {SegmentsInitDialogComponent} from "@shared/components/dialogs/segments-dialog/segments-init-dialog.component";
import {ToastService} from "@services/toast.service";
import {Project_DATA} from "@shared/models/Project";
import {
    AddElementToMissionDialogComponent
} from "@app/project/layout/dialogs/add-element-to-mission.dialog/add-element-to-mission.dialog.component";
import {
    CreateTuggerTrainMissionDialogComponent
} from "@app/project/layout/dialogs/create-tugger-train-mission.dialog/create-tugger-train-mission.dialog.component";
import {
    CreateTuggerMissionFromSuggestionDialogComponent
} from "@app/project/layout/dialogs/create-tugger-mission-from-suggestion.dialog/create-tugger-mission-from-suggestion.dialog.component";
import {
    CreateVnaMissionDialogComponent
} from "@app/project/layout/dialogs/create-vna-mission.dialog/create-vna-mission.dialog.component";
import {
    CreateMissionsFromMultipleElementsDialogComponent
} from "@app/project/layout/dialogs/create-missions-from-multiple-elements.dialog/create-missions-from-multiple-elements.dialog.component";

declare const Ramani: any;

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    editor = null;
    historySize = null;
    warehouseDesign = null;
    extractedData = null;
    selectedProject: Project_DATA = null;
    storage = {
        projectShifts: [],
        selectedAction: null,
        selectedCat: null,
        changedFlow: false,
        selectedElements: [],
        suggestedPathOptions: [],
        allMissions:[],
        selectedItemCopy: null,
        showItemMenu: false,
        typeCount: {},
        allElements: [],
        suggestedDestinations: [],
        noBg: false,
        showMissions: true,
        infoMessage:null,
        btnEnabled: {
            refLine: false,
            source: false,
            destination: false,
            sourceDestination: false,
            line: false,
            curve: false,
            gate: false,
            wall: false,
            stopPoint: false
        },
        showHeatMap: false,
        showElementExpert: false,
        showCreateMission: false,
        processDuration : null,
        hasShifts: false,
        heatMap:{
            total:0,
            elements:{}
        },
        altPressed: false,
        checkElementInMultiSelect: function(id){
            for(let k=0; k<this.storage.selectedElements.length;k++){
                if(this.storage.selectedElements[k] !== undefined && this.storage.selectedElements[k] !== null &&
                    this.storage.selectedElements[k].id === id) return true;
            }
            return false;
        }.bind(this),
    }
    cleanCopy = JSON.parse(JSON.stringify(this.storage));
    selectedColor = '#BA1126';
    followingColor = '#75b10d';
    layoutChanges: boolean = false;
    actionMapping = {
        line: Ramani.SHAPETYPES.PATH,
        curve:Ramani.SHAPETYPES.CURVE,
        wall:Ramani.SHAPETYPES.WALL,
        source:Ramani.SHAPETYPES.SOURCE,
        destination:Ramani.SHAPETYPES.DESTINATION,
        sourceDestination:Ramani.SHAPETYPES.SOURCE_DESTINATION,
        gate:Ramani.SHAPETYPES.GATE,
        background: Ramani.SHAPETYPES.IMAGE,
        refLine:Ramani.SHAPETYPES.REFLINE,
        stopPoint:Ramani.SHAPETYPES.TUGGERSTOPPOINT
    }

    sourceDestinationAttr = this.layoutShapesService.getMappedObj();
    typeParamsMapping = this.layoutShapesService.getTypeParamsMapping();

    colors = {
        source:{
            defaultLineColorNormal : '#ba1026',
            defaultFillColorNormal : '#d8d8d8'
        },
        destination:{
            defaultLineColorNormal : '#636363',
            defaultFillColorNormal: '#d8d8d8'
        },
        sd:{
            defaultLineColorNormal : '#ba1026',
            defaultFillColorNormal: '#afafaf'
        },
        other:{
            defaultLineColorNormal : '#000000',
            defaultFillColorNormal : '#d8d8d8'
        },
        general:{
            defaultLineColorHover : 'rgba(186,16,38,0.7)',
            defaultLineColorSelected : '#ba1026'
        },
        rl:{
            defaultLineColorNormal : '#26942e',
            defaultFillColorNormal : '#26942e'
        }
    };

    constructor(private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private layoutShapesService: LayoutShapesService,
                private service: LayoutService,
                private dialog: MatDialog,
                private toast: ToastService) {

        this.selectedProject = this.masterDataStore.selectedProject;
        if(this.selectedProject){
            this.service.getProjectShiftInputs(this.selectedProject.id).then(res=>{
                if(res){
                    this.storage.projectShifts = res;
                }
                this.storage.hasShifts = this.storage.projectShifts.length>0;
            }, err=>{

            });
        }

    }

    ngOnInit(): void {
        let baseContainer = document.getElementById('baseContainer');
        if(baseContainer !==undefined && baseContainer !== null){
            if(!this.editor){
                this.editor = new Ramani({id: 'baseContainer',defaultColor: {
                        lineNormal: '#000000',
                        lineHover: 'black',
                        lineSelected: this.selectedColor,
                        fillNormal: '#d8d8d8',
                        connection: this.selectedColor
                    },
                    backgroundGridBackgroundColor: '#FFFFFF',
                    backgroundGridLineColor: '#ebebeb'});

                this.editor.addListenerOnSelectShape(c=> {
                    if(c!==-1 && c.length>0){
                        this.itemSelected(c);
                    }else{
                        this.itemSelected(null);
                    }
                });

                this.editor.addListenerOnAddShape(c=>{
                    if(c && c!==-1){
                        this.layoutChanges = true;
                        this.itemCreated(c);
                    }
                });

                this.editor.addListenerOnChangeShape(c=>{
                    if(c!==-1){
                        this.layoutChanges = true;
                        this.itemChanged(c);
                    }
                });

                this.editor.addListenerOnChangeEndShape(c=>{
                    if(c!==-1){
                        this.layoutChanges = true;
                        this.itemChangeEnd(c);
                    }
                });

                this.editor.addListenerOnAddEndShape(c=>{
                    if(c!==-1){
                        this.layoutChanges = true;
                        this.changeBtnAvailability();
                        this.itemCreateEnd(c);
                    }
                });

                this.editor.addListenerOnActionClicked(c=>{
                    let defaultCurveRadius = 1.5;

                    if (!c.hasOwnProperty('shapeStyle') || c.shapeStyle !== 'T') {
                        // TODO: dialog
                        /*$mdDialog.show({
                            controller: function callbackController(this, $mdDialog, defaultCurveRadius) {
                                this.cancel = function (){
                                    $mdDialog.hide('CANCEL');
                                };
                                this.selectOption = function (bool){
                                    $mdDialog.hide([bool, this.storage.radius]);
                                };

                                this.storage = {
                                    radius: defaultCurveRadius
                                };
                            },
                            templateUrl: 'templates/' + this.selectedTheme + '/dialogs/warehouseDesigner_callbackDialog.html',
                            locals: {
                                type: 'curve',
                                defaultCurveRadius: defaultCurveRadius
                            },
                            clickOutsideToClose: true
                        }).then(function (response) {
                            c.call({shortenPath:response[0], radius:response[1]}).then(function(){
                                this.deselectAllElements();
                                this.$emit("itemsDeleted");
                            });

                        },function(err){
                        });*/
                    } else if (c.hasOwnProperty('shapeStyle') && c.shapeStyle === 'T') {
                        c.call({shortenPath:false, radius:defaultCurveRadius}).then(function(){
                            //this.deselectAllElements();
                            //this.itemsDeleted();
                        });
                    }
                });

                this.selectCategory('move');

                this.service.loadWarehouseDesign(this.selectedProject.id).then(res=>{
                    if(res && res.warehouseDesign){
                        this.storage.processDuration = res.processDurationAfterBreak;
                        this.importWarehouseDesign(res.warehouseDesign.layout);
                        this.importMissions(res.warehouseDesign.extractedData);
                    }
                }, err=>{

                });
            }
        }
        document.addEventListener('keydown', this.keyDownListener.bind(this));
        document.addEventListener('keyup', this.keyUpListener.bind(this));
    }

    importWarehouseDesign(string: string){
        if(string){
            this.warehouseDesign = JSON.parse(string);
            if(this.warehouseDesign.hasOwnProperty('layer')){
                this.editor.importSavedMap(this.warehouseDesign).then(res=>{
                    this.storage.allElements = this.warehouseDesign.layer.base.shapes;
                    this.historySize = this.editor.getHistorySize();
                    this.storage.typeCount = this.countShapeTypes(this.storage.allElements);
                    this.changeBtnAvailability();
                },err=>{

                });
            }
        }
    }

    importMissions(string: string){
        if(string){
            this.storage.allMissions = JSON.parse(string);
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    keyDownListener (e) {
        if(e.code === 'AltLeft' || e.code === 'AltRight') {
            this.storage.selectedCat = 'move';
            this.editor.switchAction(Ramani.ACTION.MOVE);
        }
        else if(e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            this.storage.altPressed = true;
        }
        else if(e.code === 'Enter') {
            this.storage.selectedCat = 'select';
            this.editor.switchAction(Ramani.ACTION.SELECT);
        }
    }

    keyUpListener (e){
        if(e.code === 'AltLeft' || e.code === 'AltRight') {
            this.storage.selectedCat = 'select';
            this.editor.switchAction(Ramani.ACTION.SELECT);
        }
        else if(e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.storage.altPressed = false;
    }

    zoom(direction: string) {
        if(direction === '+') this.editor.zoomIn();
        else if(direction === '-') this.editor.zoomOut();
    }

    selectAction(type: string) {
        this.selectCategory('create');
        this.storage.selectedAction = type;
        this.editor.switchShapeType(this.actionMapping[type]);
    }

    deselectAction(type: string) {
        this.storage.selectedAction = null;
    }

    selectCategory(type: string) {
        this.storage.selectedCat = type;

        if(type==='select'){
            this.editor.switchAction(Ramani.ACTION.SELECT);
        } else if(type==='create'){
            this.editor.switchAction(Ramani.ACTION.CREATE);
        } else if(type==='move'){
            this.editor.switchAction(Ramani.ACTION.MOVE);
        }
    }

    deselectCategory(type: string) {
        this.storage.selectedCat = null;
    }

    deselectAll(){
        this.storage.selectedElements = [];
        this.storage.showElementExpert = false;
    }

    itemSelected(c?) {
        if(c){
            this.showHeatMap();
            this.storage.changedFlow = false;
            //this.resetDefaultColors();
            let allSel = JSON.parse(JSON.stringify(c));
            this.storage.selectedElements = [];
            this.storage.suggestedPathOptions = [];
            this.storage.showElementExpert = false;

            if(allSel.length===1){

                let el = this.findElementById(allSel[0].id);
                if(el!==null && !this.checkItemSelected(allSel[0].id) ){
                    this.storage.selectedElements = [el];
                    this.storage.selectedItemCopy = JSON.parse(JSON.stringify(this.storage.selectedElements[0]));
                    this.getSuggestedDestinations();
                }
            }else{
                // this.storage.selectedElements[0] = null;
                for(let k=0; k<allSel.length; k++){
                    let el = this.findElementById(allSel[k].id);
                    if(el!==null && !this.checkItemSelected(allSel[k].id)){
                        this.storage.selectedElements.push(el);
                    }
                }
            }
            this.checkMultiSelect();
            this.storage.showItemMenu = true;
        } else {
            this.storage.showItemMenu = false;
            this.storage.selectedElements = [];
            this.storage.showElementExpert = false;
            this.checkMultiSelect();
        }
    }

    debounce(func, wait, immediate?) {
        let timeout;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    itemCreated(c) {
        //this.setSourceDestinationAttr(c);
        if(c.type==='S:TSP'){
            if(!this.storage.typeCount.hasOwnProperty(c.type)) this.storage.typeCount[c.type]=1;
            else this.storage.typeCount[c.type]++;

            let name = this.translateService.instant( c.params.customName) + ' ' + (this.storage.typeCount[c.type]);
            this.editor.changeShapeParameter(c.id, {customName:name}).then(res=>{
            },function(err){
            });
        }

        let debounceFct = this.debounce(function() {
            let getFromEditor = this.editor.exportJSONObjects();
            this.storage.allElements = getFromEditor.layer.base.shapes;
            this.storage.typeCount = this.countShapeTypes(this.storage.allElements);
            let escapeObj = {};
            for(let k=0; k<this.storage.allElements.length; k++){
                let el = this.storage.allElements[k];
                if(el.customName === el.type){
                    if(!escapeObj.hasOwnProperty(el.type)){
                        escapeObj[el.type] = [el];
                    }else escapeObj[el.type].push(el);
                }
            }
            for (let key in escapeObj) {
                if (escapeObj.hasOwnProperty(key)) {
                    let arr = escapeObj[key];
                    let maxNr = this.storage.typeCount[key];
                    for(let i=0; i<arr.length;i++){
                        let el = arr[i];
                        let customName = this.translateService.instant( el.type) + ' ' +(maxNr-(arr.length-i-1));
                        this.editor.changeShapeParameter(el.id, {customName:customName}).then(res=>{
                        },function(err){
                        });
                    }
                }
            }

            //TODO: sort order
            //this.storage.allElements = $filter('sortEditorElements')(this.storage.allElements);
            this.historySize = this.editor.getHistorySize();
        }.bind(this), 200);
        debounceFct();
    }

    itemChanged(c) {
        let getFromEditor = this.editor.exportJSONObjects();

        if(!this.storage.typeCount.hasOwnProperty(c.type)) this.storage.typeCount[c.type]=0;
        this.historySize = this.editor.getHistorySize();
        if(this.findElementById(c.id) === null){
            this.storage.allElements = getFromEditor.layer.base.shapes;
            // this.storage.allElements = $filter('sortEditorElements')(this.storage.allElements);
            this.storage.selectedElements[0] = this.findElementById(c.id);
        }else{
            this.storage.selectedElements[0] = this.findElementById(c.id);
            if( this.storage.selectedElements[0].customName ===  this.storage.selectedElements[0].type){
                if(this.storage.selectedElements[0].type==='S:S'){
                    let addSdNum = 0;
                    if(this.storage.typeCount['S:SD']!==undefined) addSdNum = this.storage.typeCount['S:SD'];
                    this.storage.selectedElements[0].customName = this.getCharacter(this.storage.typeCount['S:S']+addSdNum-1);
                }
                else if(this.storage.selectedElements[0].type==='S:D'){
                    let addSdNum = 0;
                    if(this.storage.typeCount['S:SD']!==undefined) addSdNum = this.storage.typeCount['S:SD'];
                    this.storage.selectedElements[0].customName = (this.storage.typeCount[this.storage.selectedElements[0].type]+addSdNum).toString();
                }else if(this.storage.selectedElements[0].type==='S:SD'){
                    let addSNum = 0;
                    if(this.storage.typeCount['S:S']!==undefined) addSNum = this.storage.typeCount['S:S'];
                    let addDNum = 0;
                    if(this.storage.typeCount['S:D']!==undefined) addDNum = this.storage.typeCount['S:D'];
                    this.storage.selectedElements[0].customName = this.getCharacter(addSNum+this.storage.typeCount['S:SD']-1 ) + ' & ' + (this.storage.typeCount['S:SD']+addDNum); //'SD' + (this.storage.typeCount[this.storage.selectedElements[0].type]);
                }else{
                    this.storage.selectedElements[0].customName = this.translateService.instant( this.storage.selectedElements[0].customName) + ' ' + (this.storage.typeCount[this.storage.selectedElements[0].type]);
                }
                // this.storage.selectedElements[0].customName = this.translateService.instant( this.storage.selectedElements[0].customName) + ' ' + (this.storage.elementCounter[ this.storage.selectedElements[0].type]+1);
            }
        }
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null) this.changeAttributes('customName');
    }

    itemChangeEnd(c) {
        //refresh allElements
        let getFromEditor = this.editor.exportJSONObjects();
        this.storage.allElements = getFromEditor.layer.base.shapes;
        this.historySize = this.editor.getHistorySize();
        this.storage.selectedElements[0] = this.findElementById(c.id);
    }

    changeBtnAvailability() {
        let getFromEditor = this.editor.exportJSONObjects();
        if(getFromEditor.hasOwnProperty('layer') && getFromEditor.layer.hasOwnProperty('base') && getFromEditor.layer.base.hasOwnProperty('shapes') && getFromEditor.layer.base.shapes!==null){
            let shapes = getFromEditor.layer.base.shapes;
            let hasBg = false;
            let hasRefLine = false;
            for(let k=0; k<shapes.length;k++){
                if(shapes[k].type === "S:RL") hasRefLine = true;
                if(shapes[k].type === "S:I") hasBg = true;

                if(hasRefLine && hasBg) break;
            }

            if(shapes.length>0 && !hasBg) this.storage.noBg = true;

            if(this.storage.noBg || hasBg){
                //step1: done
                this.storage.btnEnabled.refLine = true;
                if(hasRefLine){
                    //step2: done
                    this.storage.btnEnabled = {
                        refLine: true,
                        source: true,
                        destination: true,
                        sourceDestination: true,
                        line: true,
                        curve: true,
                        gate: true,
                        wall: true,
                        stopPoint: true
                    };
                }else{
                    this.storage.btnEnabled = {
                        refLine: true,
                        source: false,
                        destination: false,
                        sourceDestination: false,
                        line: false,
                        curve: false,
                        gate: false,
                        wall: false,
                        stopPoint: false
                    };
                }
            }else{
                this.storage.btnEnabled = {
                    refLine: false,
                    source: false,
                    destination: false,
                    sourceDestination: false,
                    line: false,
                    curve: false,
                    gate: false,
                    wall: false,
                    stopPoint: false
                };
                if(this.storage.noBg){
                    this.storage.btnEnabled.refLine = true;
                }
            }

            if((this.storage.selectedAction === 'source' && !this.storage.btnEnabled.source) ||
                (this.storage.selectedAction === 'destination' && !this.storage.btnEnabled.destination) ||
                (this.storage.selectedAction === 'sourceDestination' && !this.storage.btnEnabled.sourceDestination) ||
                (this.storage.selectedAction === 'curve' && !this.storage.btnEnabled.curve) ||
                (this.storage.selectedAction === 'gate' && !this.storage.btnEnabled.gate) ||
                (this.storage.selectedAction === 'source' && !this.storage.btnEnabled.source) ||
                (this.storage.selectedAction === 'wall' && !this.storage.btnEnabled.wall) ||
                (this.storage.selectedAction === 'stopPoint' && !this.storage.btnEnabled.stopPoint)){
                this.storage.selectedAction = null;
            }
        }
    }

    itemCreateEnd(c) {
        this.storage.selectedElements[0] = this.findElementById(c.id);
        let getFromEditor = this.editor.exportJSONObjects();
        this.storage.allElements = getFromEditor.layer.base.shapes;
        this.historySize = this.editor.getHistorySize();

        if(c){
            if(c.type === 'S:S' || c.type === 'S:D' || c.type === 'S:SD'){
                const dialogConfig = new MatDialogConfig();
                dialogConfig.disableClose = true;
                dialogConfig.autoFocus = false;
                dialogConfig.panelClass = ['smallDialog'];
                dialogConfig.data = {
                    shape: c
                }

                const dialogRef = this.dialog.open(SelectSdTypeDialogComponent, dialogConfig);
                dialogRef.afterClosed().subscribe(response => {
                    if (response) {
                        let type = null;
                        if(c.type=== 'S:S'){
                            type = this.sourceDestinationAttr.source[response];
                        }else if(c.type=== 'S:D'){
                            type = this.sourceDestinationAttr.destination[response];
                        }else if(c.type=== 'S:SD'){
                            type = this.sourceDestinationAttr.sd[response];
                        }

                        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
                            let obj = {};
                            if(this.storage.selectedElements[0].type==='S:S') obj['sourceType']= response;
                            else if(this.storage.selectedElements[0].type==='S:D') obj['destinationType']= response;
                            else if(this.storage.selectedElements[0].type==='S:SD') obj['sdType']= response;

                            for (let key in type) {
                                if (type.hasOwnProperty(key)) {
                                    if(type[key].hasOwnProperty('disabled')){
                                        obj[key] = type[key].disabled;
                                    }else{
                                        obj[key] = type[key].value;
                                    }
                                }
                            }

                            this.editor.changeShapeParameter(this.storage.selectedElements[0].id, {userKeys:obj}).then(res=>{
                                let getFromEditor = this.editor.exportJSONObjects();
                                this.storage.allElements = getFromEditor.layer.base.shapes;

                                this.storage.selectedElements = [this.findElementById(this.storage.selectedElements[0].id)];

                            },function(err){
                            });
                        }
                    }
                });
            }
            else if(c.type==='S:I'){
                if(!this.storage.typeCount.hasOwnProperty(c.type)) this.storage.typeCount[c.type]=1;
                else this.storage.typeCount[c.type]++;
                let name = this.translateService.instant( c.params.customName) + ' ' + (this.storage.typeCount[c.type]);
                this.editor.changeShapeParameter(c.id, {customName:name}).then(res=>{
                },function(err){
                });
            }else if(c.type==='S:RL'){
                this.editor.changeShapeParameter(c.id, {defaultLineWidth:4}).then(res=>{
                },function(err){
                });
            }
        }
        // this.storage.allElements = $filter('sortEditorElements')(this.storage.allElements);

        this.storage.typeCount = this.countShapeTypes(this.storage.allElements);
    }

    countShapeTypes(allEl): any{
        let ret = {};
        if(allEl!==undefined && allEl!==null){
            for(let k=0; k<allEl.length; k++){
                if(ret.hasOwnProperty(allEl[k].type)) ret[allEl[k].type]++;
                else ret[allEl[k].type] = 1;
            }
        }
        return ret;
    }

    getCharacter (n) {
        if(n>25){
            n=n-25;
            return 'A'+String.fromCharCode(97 + n).toUpperCase();
        }
        else return String.fromCharCode(97 + n).toUpperCase();
    }

    changeAttributes (attr) {
        let item = JSON.parse(JSON.stringify(this.storage.selectedItemCopy));

        //FIRST DIFFERENTIATE DIRECTION PARAMS
        if(attr==='directionAB' || attr==='singleDirection'){

            if(attr==='directionAB'){
                let tempStart = JSON.parse(JSON.stringify((this.storage.selectedElements[0].positionStart)));
                let tempEnd = JSON.parse(JSON.stringify((this.storage.selectedElements[0].positionEnd)));

                this.storage.selectedElements[0].positionStart = tempEnd;
                this.storage.selectedElements[0].positionEnd = tempStart;

                this.editor.changeShapeParameter(this.storage.selectedElements[0].id, 'positionStart', this.storage.selectedElements[0]['positionStart']).then(res=> {
                });
                this.editor.changeShapeParameter(this.storage.selectedElements[0].id, 'positionEnd', this.storage.selectedElements[0]['positionEnd']).then(res=> {
                });
            }else{
                this.editor.changeShapeParameter(this.storage.selectedElements[0].id, 'singleDirection', this.storage.selectedElements[0]['singleDirection']).then(res=> {
                });
            }
        }else if(this.storage.selectedElements[0].type==='S:TSP' && attr === 'couplingTime'){
            this.editor.changeShapeParameter(this.storage.selectedElements[0].id, attr, this.storage.selectedElements[0].userKeys[attr]).then(res=>{
            },function(err){
            });
        } else{
            //ALL OTHER PARAMS
            if(attr==='locked'){
                this.storage.selectedElements[0][attr] = !this.storage.selectedElements[0][attr];
            }

            this.editor.changeShapeParameter(this.storage.selectedElements[0].id, attr, this.storage.selectedElements[0][attr]).then(res=>{
                //this.storage.selectedItemCopy = angular.copy(this.storage.selectedElements[0]);
            },function(err){
            });
        }
        this.layoutChanges = true;
    };

    setSourceDestinationAttr(c){
        let paramsToAdd = {};
        if(c.type==='S:S'){
            paramsToAdd['sourceType'] = null; //'singlePositions'
        }else if(c.type==='S:D'){
            paramsToAdd['destinationType'] = null; // 'singlePositions'
        }else if(c.type==='S:SD'){
            paramsToAdd['sdType'] =  null; //'vna'
        }
        this.editor.changeShapeParameter(c.id, {userKeys:paramsToAdd}).then(res=>{
        },function(err){
        });
    };

    updateUserKeys (key,value){
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null && this.storage.selectedElements[0].hasOwnProperty('userKeys')){
            this.storage.selectedElements[0].userKeys[key] = value;

            //automatically calculated inputs:
            if(key==='numberLanesSideBySide'){
                if(this.storage.selectedElements[0].userKeys.hasOwnProperty('numberPickLocations')){
                    if(this.storage.selectedElements[0].userKeys.hasOwnProperty('depthBufferLane')){
                        this.storage.selectedElements[0].userKeys.numberPickLocations = this.storage.selectedElements[0].userKeys.numberLanesSideBySide * this.storage.selectedElements[0].userKeys.depthBufferLane;
                    }
                }else if(this.storage.selectedElements[0].userKeys.hasOwnProperty('numberDropLocation')){
                    if(this.storage.selectedElements[0].userKeys.hasOwnProperty('depthBufferLane')){
                        this.storage.selectedElements[0].userKeys.numberDropLocation = this.storage.selectedElements[0].userKeys.numberLanesSideBySide * this.storage.selectedElements[0].userKeys.depthBufferLane;
                    }
                }
            }else if(key==='depthBufferLane'){
                if(this.storage.selectedElements[0].userKeys.hasOwnProperty('numberPickLocations')){
                    if(this.storage.selectedElements[0].userKeys.hasOwnProperty('numberLanesSideBySide')){
                        this.storage.selectedElements[0].userKeys.numberPickLocations = this.storage.selectedElements[0].userKeys.numberLanesSideBySide * this.storage.selectedElements[0].userKeys.depthBufferLane;
                    }
                }else if(this.storage.selectedElements[0].userKeys.hasOwnProperty('numberDropLocation')){
                    if(this.storage.selectedElements[0].userKeys.hasOwnProperty('numberLanesSideBySide')){
                        this.storage.selectedElements[0].userKeys.numberDropLocation = this.storage.selectedElements[0].userKeys.numberLanesSideBySide * this.storage.selectedElements[0].userKeys.depthBufferLane;
                    }
                }
            } else if (key==='handoverType'){
                if(this.storage.selectedElements[0].userKeys.hasOwnProperty('distanceToHandoverLocation')){
                    if(value === 'HANDOVERTYPE_TOPBOTTOM'){
                        if(this.storage.selectedElements[0].userKeys.hasOwnProperty('rackLength')){
                            this.storage.selectedElements[0].userKeys.distanceToHandoverLocation = this.storage.selectedElements[0].userKeys.rackLength;
                        }
                    } else {
                        this.storage.selectedElements[0].userKeys.distanceToHandoverLocation = 0;
                    }

                }
            }
            else if (key==='rackLength'){
                if(this.storage.selectedElements[0].userKeys.hasOwnProperty('handoverType') && this.storage.selectedElements[0].userKeys.hasOwnProperty('distanceToHandoverLocation')){
                    if(this.storage.selectedElements[0].userKeys.handoverType === 'HANDOVERTYPE_TOPBOTTOM') {
                        this.storage.selectedElements[0].userKeys.distanceToHandoverLocation = value;
                    }
                }
            }

            this.editor.changeShapeParameter(this.storage.selectedElements[0].id, {userKeys:this.storage.selectedElements[0].userKeys}).then(res=>{
                let getFromEditor = this.editor.exportJSONObjects();
                this.layoutChanges = true;
                this.storage.allElements = getFromEditor.layer.base.shapes;
            },function(err){
            });
        }
    };

    saveSourceDestination (a){
        let type = JSON.parse(JSON.stringify(a));
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            let obj = {};
            if(this.storage.selectedElements[0].type==='S:S') obj['sourceType']= this.storage.selectedElements[0].userKeys['sourceType'];
            else if(this.storage.selectedElements[0].type==='S:D') obj['destinationType']= this.storage.selectedElements[0].userKeys['destinationType'];
            else if(this.storage.selectedElements[0].type==='S:SD') obj['sdType']= this.storage.selectedElements[0].userKeys['sdType'];

            for (let key in type) {
                if (type.hasOwnProperty(key)) {
                    if(type[key].hasOwnProperty('disabled')){
                        obj[key] = type[key].disabled;
                    }else{
                        obj[key] = type[key].value;
                    }
                }
            }
            this.editor.changeShapeParameter(this.storage.selectedElements[0].id, {userKeys:obj}).then(res=>{
                let getFromEditor = this.editor.exportJSONObjects();
                this.storage.allElements = getFromEditor.layer.base.shapes;
                this.storage.selectedElements = [this.findElementById(this.storage.selectedElements[0].id)];
            },function(err){
            });
        }
    };

    itemsDeleted(){
        for(let i=0; i<this.storage.allMissions.length; i++){
            let mi = this.storage.allMissions[i];

            if(mi.hasOwnProperty("source") && mi.source!==null){
                if(!this.editor.checkShapeId(mi.source)) {
                    mi.source = null;
                }
            }
            if(mi.hasOwnProperty("destination") && mi.destination!==null){
                if(!this.editor.checkShapeId(mi.destination)) {
                    mi.destination = null;
                }
            }
            if(mi.hasOwnProperty("elements") && mi.elements!==null && mi.elements.length>0){
                for(let k=0; k<mi.elements.length;k++){
                    let el = mi.elements[k];
                    if(!this.editor.checkShapeId(el)) {
                        mi.elements.splice(k,1);
                    }
                }
            }
        }
    }

    showInput (key, type): boolean{
        let el = this.sourceDestinationAttr[type][this.storage.selectedElements[0].userKeys[type+'Type']][key];
        if(el.hasOwnProperty('condition') && el.condition!==''){
            let con = el.condition;
            let conVal = this.storage.selectedElements[0].userKeys[con];
            if (conVal==="TRIGGERCONDITIONS_PUSHBUTTONS" || conVal==="TRIGGERCONDITIONS_SENSORS"){
                return true;
            }else  return false;
        }
        else if(el.expert){
            if(this.storage.showElementExpert) return true;
            else return false;
        }else return true;
    };

    displayParams(attr): boolean{
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            let obj = this.typeParamsMapping[this.storage.selectedElements[0].type];
            if(obj!==undefined && obj!==null) {
                return (obj.indexOf(attr)>-1);
            }
            else return false;
        } else {
            return false;
        }
    };

    setIsLoadedNull(){
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            if(this.storage.selectedElements[0].hasOwnProperty('isLoaded')) this.storage.selectedElements[0].isLoaded = null;
        }
    };

    calcMissionsTotalLength (elements, source, dest){
        let res:any = 0;
        if(elements!==undefined && elements!==null){
            for(let k=0; k<elements.length;k++){
                if(elements[k].hasOwnProperty('display') && elements[k].display.hasOwnProperty('length')) res += Number(elements[k].display.length);
            }
        }
        if (source && source.userKeys.hasOwnProperty('rackLength') && source.userKeys.rackLength !== null){
            res += (source.userKeys.rackLength / 2);
        }
        if (dest && dest.userKeys.hasOwnProperty('rackLength') && dest.userKeys.rackLength !== null){
            res += (dest.userKeys.rackLength / 2);
        }
        res = res.toFixed(2);
        return res;
    };

    openShifts(){
        let newInit = null;
        if( this.storage.changedFlow ) {
            newInit = this.storage.selectedElements[0].flow;
        }

        if(this.storage.hasShifts){
            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = false;
            dialogConfig.panelClass = ['mediumDialog'];
            dialogConfig.data = {
                shifts:JSON.parse(JSON.stringify(this.storage.projectShifts)),
                displayedValue: null,
                processDurationShifts: this.storage.processDuration,
                flow: this.storage.selectedElements[0].flow,
                flowSegments: this.storage.selectedElements[0].flowSegments,
                newInit: newInit
            }

            const dialogRef = this.dialog.open(SegmentsInitDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(res => {
                this.storage.changedFlow = false;
                if (res) {
                    let flowSegments = [];
                    let max = 0;
                    for(let k=0; k<res.length;k++){
                        let sh = res[k];
                        let shSegments = [];
                        if(sh.hasOwnProperty('segments') && sh.segments!==null){
                            for(let i=0; i<sh.segments.length;i++){
                                let seg = sh.segments[i];
                                shSegments.push(seg);
                                if(seg.inputValues.flow>max) max = seg.inputValues.flow;
                            }
                        }
                        flowSegments.push(shSegments);
                    }

                    let mission = this.findMissionById (this.storage.selectedElements[0].id);
                    mission.flow = max;
                    mission.flowSegments = flowSegments;
                    this.selectMission(mission);
                }
            });
        }

    }

    changeMission (type){
        let mission = this.findMissionById (this.storage.selectedElements[0].id);
        if(type==='flow'){
            this.storage.changedFlow = true;
            mission.flow = this.storage.selectedElements[0].flow;
            this.openShifts();
            this.checkErrors();
        }else if (type==='name'){
            mission.name = this.storage.selectedElements[0].name;
        }else if (type==='stopPoints'){
            let ids = [];
            for(let i=0; i<this.storage.selectedElements[0].stopPoints.length;i++){
                ids.push({el:this.storage.selectedElements[0].stopPoints[i].el.id, selected: this.storage.selectedElements[0].stopPoints[i].selected, couplingTime: this.storage.selectedElements[0].stopPoints[i].couplingTime});
            }
            mission.stopPoints = ids;
        }else mission[type] = this.storage.selectedElements[0][type];
        this.layoutChanges = true;
    };

    selectMission (mission){
        //deselect shapes
        this.editor.deselectAllShapes();
        this.storage.changedFlow = false;

        let idList = [];
        this.storage.selectedElements = [];
        this.storage.showElementExpert = false;

        let item = {
            id:mission.id,
            source:null,
            destination:null,
            type: 'normal',
            elements:[],
            stopPoints: [],
            name:null,
            flow:0,
            flowSegments: [],
            color:'',
            missionErrors:{
                missingFlow: false,
                missingPath: false
            },
            bothDirections : null,
            isLoaded: null,
            /*  stopsPerCycle: 0,*/
            additionalTime: 0
        };

        if(mission.hasOwnProperty('flow') && mission.flow!==null) item.flow = mission.flow;
        /*if(mission.hasOwnProperty('stopsPerCycle') && mission.stopsPerCycle!==null) item.stopsPerCycle = mission.stopsPerCycle;*/
        if(mission.hasOwnProperty('additionalTime') && mission.additionalTime!==null) item.additionalTime = mission.additionalTime;
        if(mission.hasOwnProperty('type') && mission.type!==null && mission.type!=='') item.type = mission.type;
        if(mission.hasOwnProperty('isVNA') && mission.isVNA!==null) {
            if(mission.isVNA) item.type = 'vna';
        }

        if(mission.hasOwnProperty('bothDirections') && mission.bothDirections!==null) item.bothDirections = mission.bothDirections;
        if(mission.hasOwnProperty('isLoaded') && mission.isLoaded!==null) item.isLoaded = mission.isLoaded;
        if(mission.hasOwnProperty('flowSegments') && mission.flowSegments!==null) item.flowSegments = mission.flowSegments;
        if(mission.hasOwnProperty('name') && mission.name!==null) item.name = mission.name;
        if(mission.hasOwnProperty('source') && mission.source!==null) {
            item.source = this.findElementById(mission.source);
            idList.push(mission.source);
        }
        if(mission.hasOwnProperty('destination') && mission.destination!==null) {
            item.destination = this.findElementById(mission.destination);
            idList.push(mission.destination);
        }
        if(mission.hasOwnProperty('color') && mission.color!==null) item.color = mission.color;
        if(mission.hasOwnProperty('missionErrors') && mission.missionErrors!==null) item.missionErrors = mission.missionErrors;

        if(mission.hasOwnProperty('elements')){
            for(let k=0; k<mission.elements.length;k++){
                item.elements.push(this.findElementById(mission.elements[k]));
                idList.push(mission.elements[k]);
            }
        }

        if(mission.hasOwnProperty('stopPoints') && mission.stopPoints!==undefined && mission.stopPoints!==null){
            for(let k=0; k<mission.stopPoints.length;k++){
                item.stopPoints.push({el:this.findElementById(mission.stopPoints[k].el), selected: mission.stopPoints[k].selected, couplingTime: mission.stopPoints[k].couplingTime});
                idList.push(mission.stopPoints[k].el);
            }
        }

        for(let i=0; i<idList.length;i++){
            this.editor.changeShapeParameter(idList[i], 'lineColorNormal', mission.color);
        }

        this.storage.selectedElements[0] = item;

        this.storage.showItemMenu = true;
        //this.storage.missionErrors.missingPath = !this.checkMissionPath();
        this.checkErrors();
        //this.checkMissionPath(mission);
    };

    changeMissionColor (){
        if(this.storage.selectedElements!==null && this.storage.selectedElements!==undefined && this.storage.selectedElements.length===1 && this.storage.selectedElements[0].hasOwnProperty('elements')){
            if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                for(let l=0; l<this.storage.allMissions.length;l++){
                    if(this.storage.allMissions[l].id === this.storage.selectedElements[0].id){
                        this.storage.allMissions[l].color = this.getRandomColor();
                        let elements = this.storage.allMissions[l].elements;
                        for(let k=0; k<elements.length; k++){
                            this.editor.changeShapeParameter(elements[k], 'lineColorNormal', this.storage.allMissions[l].color);
                        }
                        this.selectMission(this.storage.allMissions[l]);
                    }
                }
            }
        }
    };

    selectElement (opts){

        let selectedElements = JSON.parse(JSON.stringify(this.storage.selectedElements));

        let idList = [];
        for(let i=0;i<selectedElements.length;i++){
            idList.push(selectedElements[i].id);
        }
        this.storage.changedFlow = false;

        if(this.storage.altPressed){
            //multiSelect
            if(this.storage.checkElementInMultiSelect(opts.id)){

                let pos = idList.indexOf(opts.id);
                if(pos > -1){
                    idList.splice(pos,1);
                }
            }else{
                idList.push(opts.id);
            }
            //this.checkMultiSelect();
        }else{
            idList = [opts.id];
        }
        this.editor.selectShapes(idList);
    };

    removeSourceFromMission (){
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                for(let l=0; l<this.storage.allMissions.length;l++){
                    if(this.storage.allMissions[l].id === this.storage.selectedElements[0].id){
                        if(this.storage.allMissions[l].hasOwnProperty('source')){
                            this.storage.allMissions[l].source = null;
                            this.selectMission(this.storage.allMissions[l]);
                            this.checkErrors();
                            this.layoutChanges = true;
                        }
                    }
                }
            }
        }
    };

    removeDestinationFromMission (){
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                for(let l=0; l<this.storage.allMissions.length;l++){
                    if(this.storage.allMissions[l].id === this.storage.selectedElements[0].id){
                        if(this.storage.allMissions[l].hasOwnProperty('destination')){
                            this.storage.allMissions[l].destination = null;
                            this.selectMission(this.storage.allMissions[l]);
                            this.checkErrors();
                            this.layoutChanges = true;
                        }
                    }
                }
            }
        }
    };

    removeMissionElement (el, isStopPoint?) {
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){

            if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                for(let l=0; l<this.storage.allMissions.length;l++){
                    if(this.storage.allMissions[l].id === this.storage.selectedElements[0].id){

                        if(isStopPoint!==undefined && isStopPoint!==null && isStopPoint===true){
                            for(let k=0; k<this.storage.allMissions[l].stopPoints.length;k++){
                                if(this.storage.allMissions[l].stopPoints[k].el === el.id){
                                    this.storage.allMissions[l].stopPoints.splice(k,1);
                                    this.selectMission(this.storage.allMissions[l]);
                                    this.checkErrors();
                                    //this.storage.selectedElements[0] = this.storage.allMissions[l];
                                }
                            }
                        }else{
                            for(let k=0; k<this.storage.allMissions[l].elements.length;k++){
                                if(this.storage.allMissions[l].elements[k] === el.id){
                                    this.storage.allMissions[l].elements.splice(k,1);
                                    this.selectMission(this.storage.allMissions[l]);
                                    this.checkErrors();
                                    //this.storage.selectedElements[0] = this.storage.allMissions[l];
                                }
                            }
                        }
                    }
                }
            }
            this.showHeatMap();
            this.layoutChanges = true;
        }
    };

    showHeatMap (){

        this.storage.showHeatMap = !this.storage.showHeatMap;

        if(this.storage.showHeatMap){
            this.storage.heatMap = {
                total:0,
                elements:{
                }
            };
            if(this.storage.allElements!==null && this.storage.allElements!==undefined){
                for(let k=0; k<this.storage.allElements.length;k++){

                    if(this.storage.allElements[k].type==='S:P' || this.storage.allElements[k].type==='S:C'){
                        let elId = this.storage.allElements[k].id;
                        this.storage.heatMap.elements[elId]={
                            count:0,
                            percent:0
                        };
                        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                            this.storage.heatMap.total = this.storage.allMissions.length;
                            for(let i=0; i<this.storage.allMissions.length;i++){
                                if(this.storage.allMissions[i].hasOwnProperty('elements') && this.storage.allMissions[i].elements!==null){
                                    let missionElements = this.storage.allMissions[i].elements;
                                    if(missionElements.indexOf(elId)>-1) this.storage.heatMap.elements[elId].count++;
                                }
                            }
                        }
                    }
                }
            }

            for (let key in this.storage.heatMap.elements) {
                if (this.storage.heatMap.elements.hasOwnProperty(key)) {
                    this.storage.heatMap.elements[key].percent = Math.round((this.storage.heatMap.elements[key].count / this.storage.heatMap.total) * 100);

                    let color='#71d207';
                    if(this.storage.heatMap.elements[key].percent>25 && this.storage.heatMap.elements[key].percent<=50) color='#e6c20e';
                    else if(this.storage.heatMap.elements[key].percent>50 && this.storage.heatMap.elements[key].percent<=75) color='#e06e0d';
                    else if(this.storage.heatMap.elements[key].percent>75) color='#ba1026';

                    this.editor.changeShapeParameter(key, 'lineColorNormal', color);

                    // arr.push({id:key,color:color})
                }
            }

        }else{
            this.resetDefaultColors();
        }

    };

    resetDefaultColors(){
        this.editor.resetColor();
    };

    toggleMissionsElements(bool){
        this.storage.showMissions = bool;
        this.checkErrors();
    };

    checkPathBtn (){
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            let mission = this.findMissionById (this.storage.selectedElements[0].id);
            this.checkMissionPath(mission, true);
        }
    };

    elementInMission (elId, mission): string{
        if(mission!==undefined && mission!==null){
            if(mission.destination!==undefined && mission.destination!==null && mission.destination.id === elId){
                return 'destination';
            }
            if(mission.source!==undefined && mission.source!==null && mission.source.id === elId){
                return 'source';
            }
            if(mission.hasOwnProperty('elements') && mission.elements!==null){
                for(let p=0;p<mission.elements.length;p++){
                    if(mission.elements[p].hasOwnProperty('id') && mission.elements[p].id === elId) return 'element';
                    else if(!mission.elements[p].hasOwnProperty('id') && (mission.elements[p]===elId)) return 'element';
                }
            }
            else return null;
        }else return null;

    };

    findMissionById (id){
        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
            for(let k=0; k<this.storage.allMissions.length;k++){
                if(this.storage.allMissions[k].id === id) return this.storage.allMissions[k];
            }
        }
        return null;
    };

    findElementById (id){

        // always update all elements first
        let getFromEditor = this.editor.exportJSONObjects();
        this.storage.allElements = getFromEditor.layer.base.shapes;
        //if(this.storage.orderElements) this.storage.allElements = $filter('sortEditorElements')(this.storage.allElements);
        this.storage.typeCount = this.countShapeTypes(this.storage.allElements);

        if(this.storage.allElements!== undefined && this.storage.allElements!==null){
            for(let k=0;k<this.storage.allElements.length;k++){
                if(this.storage.allElements[k].id === id) return this.storage.allElements[k];
            }
        }
        return null;
    };

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    doExport (type) {
        if(type === 'json'){
            this.editor.exportJSON();
            //this.$emit("exportJSON");
        }else if(type === 'dxf'){
            //this.$emit("exportDXF");
            this.editor.exportToDXF();
        }
    };

    doImportJSON () {
        this.editor.importJSON().then(val=>{
            let getFromEditor = this.editor.exportJSONObjects();
            this.storage.allElements = getFromEditor.layer.base.shapes;
            this.storage.typeCount = this.countShapeTypes(this.storage.allElements);
        });

    };

    centerMap (){
        this.editor.centerView();
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

    getSuggestedDestinations () {
        this.storage.suggestedDestinations = [];
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            for(let k=0; k<this.storage.allElements.length;k++){
                if(this.storage.allElements[k].type==='S:D' || this.storage.allElements[k].type==='S:SD'){
                    if((this.storage.allElements[k].userKeys.hasOwnProperty('sdType') && this.storage.allElements[k].userKeys.sdType==='tuggerTrain') || (this.storage.allElements[k].id !== this.storage.selectedElements[0].id)) this.storage.suggestedDestinations.push(this.storage.allElements[k]);
                }
            }
        }
    };

    cpLength(a, b){
        return a.length - b.length;
    };

    getSuggestedMissionsToDestination (val) {
        let dest = val.value;
        let allPaths = [];
        if(this.storage.selectedElements[0]!==undefined && this.storage.selectedElements[0]!==null){
            if(this.storage.selectedElements[0].hasOwnProperty('userKeys') && this.storage.selectedElements[0].userKeys.hasOwnProperty('sdType') && this.storage.selectedElements[0].userKeys.sdType === 'tuggerTrain'){
            }else{
                // NO TUGGER TRAIN
                this.editor.findPath(this.storage.selectedElements[0].id, {targetShapeIds:[dest.id]}).then(res=>{
                    if(res!==undefined && res!==null){
                        res.sort(this.cpLength);

                        for(let k=0; k<res.length; k++){
                            let list = res[k];
                            if(list.length>1){
                                let obj = {
                                    ids: list,
                                    destination: this.findElementById(list[list.length-1]),
                                    color: this.getRandomColor(),
                                    exists: false,
                                    isTugger: false,
                                    name: this.findElementById(list[0]).customName + '->' + this.findElementById(list[list.length-1]).customName
                                };
                                let check = this.checkIfSuggestionExists(obj);
                                if(check!==null) {
                                    obj.color = check;
                                    obj.exists = true;
                                }
                                allPaths.push(obj);
                            }
                        }
                        this.storage.suggestedPathOptions = allPaths;
                    }
                },function(){
                });
            }

        }
    };

    checkBothDirections (suggestion, selEl?, selMi?){
        let bothDir = true;
        if(suggestion!==undefined && suggestion!=null){
            if(suggestion.hasOwnProperty('ids')){
                for(let k=0; k<suggestion.ids.length; k++){
                    let el = this.findElementById(suggestion.ids[k]);
                    if(el.type==='S:P' || el.type==='S:C'){
                        if(el.singleDirection) bothDir = false;
                    }
                }
                return bothDir;
            }
        }
        else if(selEl !== undefined && selEl!==null){
            for(let k=0; k<selEl.length; k++){
                let el = selEl[k];
                if(el.type==='S:P' || el.type==='S:C'){
                    if(el.singleDirection) bothDir = false;
                }
            }
            return bothDir;
        }
        else if(selMi !== undefined && selMi!==null){
            if(selMi.hasOwnProperty('elements')){
                for(let k=0; k<selMi.elements.length; k++){
                    let el = selMi.elements[k];
                    if(el.type==='S:P' || el.type==='S:C'){
                        if(el.singleDirection) bothDir = false;
                    }
                }
                return bothDir;
            }else return false;

        }
        return false;
    };

    checkErrors(){
        //this.checkAllMissionPaths();
        this.checkMissionFlow();
    }

    checkMissionFlow (){
        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
            for(let k=0;k<this.storage.allMissions.length;k++){
                let current = this.storage.allMissions[k];
                current.missionErrors.missingFlow = current.flow <= 0;
            }
        }
    };

    checkAllMissionPaths (){
        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
            for(let k=0;k<this.storage.allMissions.length;k++){
                let current = this.storage.allMissions[k];
                this.checkMissionPath(current);
            }
        }
    };

    checkMissionPath (mission, preventSkip?){
        if(preventSkip!==undefined && preventSkip===true){
            let selectedMission = null;
            if(mission!==undefined && mission!==null){
                selectedMission = mission;
            }
            this.editor.findPath(selectedMission.source,{targetShapeIds:[selectedMission.destination]}).then(res=>{
                let anyFoundPath = false;
                for(let k=0; k<res.length; k++){
                    let currentPath = res[k];
                    let missionPathBool = true;
                    for(let i=0; i<currentPath.length; i++){
                        if(currentPath[i]!==selectedMission.source && currentPath[i]!==selectedMission.destination && selectedMission.elements.indexOf(currentPath[i])===-1){
                            missionPathBool = false;
                        }
                    }
                    if(missionPathBool) {
                        anyFoundPath=true;break;
                    }
                }
                //selectedMission.missionErrors.missingPath = !anyFoundPath;
            },function(err){
            });

        }
    };

    checkIfSuggestionExists (mi){
        if(mi !== undefined && mi!==null){
            if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                for(let k=0; k<this.storage.allMissions.length;k++){
                    let bool = true;
                    let createdMission = this.storage.allMissions[k];
                    if(mi.ids!==null && mi.ids.length>0 && createdMission.source !== mi.ids[0]) bool = false;
                    else if(createdMission.destination !== mi.destination.id) bool = false;
                    else if(mi.ids!==null && mi.ids.length>0) {
                        for(let i=1; i<mi.ids.length-1;i++){
                            if(createdMission.elements.indexOf(mi.ids[i])===-1) bool = false;
                        }
                    }
                    if(bool) return createdMission.color;
                }
                return null;
            }else return null;
        }
    };

    highlightSuggestedMission (mi){
        this.showHeatMap();
        //this.resetDefaultColors();
        if(mi!==undefined){
            for(let k=1; k<mi.ids.length; k++){
                this.editor.changeShapeParameter(mi.ids[k], 'lineColorNormal', mi.color);
            }
        }
    };

    checkSelectedMissionHighlight (){
        this.showHeatMap();
        //this.resetDefaultColors();
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null && this.storage.selectedElements.length===1 && this.storage.selectedElements[0].hasOwnProperty('elements')){
            if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
                for(let k=0; k<this.storage.allMissions.length;k++){
                    if(this.storage.allMissions[k].id === this.storage.selectedElements[0].id){
                        this.highlightMission(this.storage.allMissions[k]);
                    }
                }
            }
        }
    }

    highlightMission (mi){
        if(mi!==undefined){
            if(mi.source!==undefined && mi.source!==null && mi.source!=='') this.editor.changeShapeParameter(mi.source, 'lineColorNormal', mi.color);
            if(mi.destination!==undefined && mi.destination!==null && mi.destination!=='') this.editor.changeShapeParameter(mi.destination, 'lineColorNormal', mi.color);
            if(mi.elements!==undefined && mi.elements!==null && mi.elements.length>0){
                for(let k=0; k<mi.elements.length; k++){
                    this.editor.changeShapeParameter(mi.elements[k], 'lineColorNormal', mi.color);
                }
            }
            if(mi.stopPoints!==undefined && mi.stopPoints!==null && mi.stopPoints.length>0){
                for(let k=0; k<mi.stopPoints.length; k++){
                    this.editor.changeShapeParameter(mi.stopPoints[k].el, 'lineColorNormal', mi.color);
                }
            }
        }
    };

    resetHighlightMission (mi){
        if(mi!==undefined){
            if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null && this.storage.selectedElements.length>0 && this.storage.selectedElements[0].id !== mi.id){
                if(mi.source!==undefined && mi.source!==null && mi.source!=='') this.editor.resetColor(mi.source);
                if(mi.destination!==undefined && mi.destination!==null && mi.destination!=='')  this.editor.resetColor(mi.destination);
                if(mi.elements!==undefined && mi.elements!==null && mi.elements.length>0){
                    for(let k=0; k<mi.elements.length; k++){
                        this.editor.resetColor(mi.elements[k]);
                    }
                }
                if(mi.stopPoints!==undefined && mi.stopPoints!==null && mi.stopPoints.length>0){
                    for(let k=0; k<mi.stopPoints.length; k++){
                        this.editor.resetColor(mi.stopPoints[k].el);
                    }
                }
            }else if(this.storage.selectedElements.length===0){
                if(mi.source!==undefined && mi.source!==null && mi.source!=='') this.editor.resetColor(mi.source);
                if(mi.destination!==undefined && mi.destination!==null && mi.destination!=='')  this.editor.resetColor(mi.destination);
                if(mi.elements!==undefined && mi.elements!==null && mi.elements.length>0){
                    for(let k=0; k<mi.elements.length; k++){
                        this.editor.resetColor(mi.elements[k]);
                    }
                }
                if(mi.stopPoints!==undefined && mi.stopPoints!==null && mi.stopPoints.length>0){
                    for(let k=0; k<mi.stopPoints.length; k++){
                        this.editor.resetColor(mi.stopPoints[k].el);
                    }
                }
            }
        }
    }

    highlightElement (el){
        if(el!==undefined && el!==null && el.hasOwnProperty('id')){
            this.editor.changeShapeParameter([el.id], 'lineColorNormal', this.colors.general.defaultLineColorHover);
        }
    }

    resetHighlightElement (el){
        //1.) reset color to default, 2.) check if mission is selected and color mission
        this.editor.resetColor([el.id]);
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null && this.storage.selectedElements.length===1 && this.storage.selectedElements[0].hasOwnProperty('elements') ){
            let mi = this.findMissionById(this.storage.selectedElements[0].id);
            this.highlightMission(mi);
        }else{
            this.showHeatMap();
        }
    }

    resetHighlightSuggestedMission (mi){
        if(mi!==undefined){
            for(let k=1; k<mi.ids.length; k++){
                this.editor.resetColor(mi.ids[k]);
            }
        }
    }

    checkItemSelected(id){
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null){
            for(let k=0; k<this.storage.selectedElements.length;k++){
                if(this.storage.selectedElements[k].id === id) return true;
            }
            return false;
        }else return false;
    }

    checkMultiSelect (){
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null){

            //check to combine two paths into curve
            if(this.storage.selectedElements.length === 2){
                let el1 = this.storage.selectedElements[0];
                let el2 = this.storage.selectedElements[1];
                if(el1.type === 'S:P' && el2.type === 'S:P'){

                    this.editor.couldAddRoundingShape(el1.id,el2.id).then(res=>{
                        if(res!==null){
                            this.storage.infoMessage = null;
                        }
                    },function(err){
                        this.storage.infoMessage = this.translateService.instant('WAREHOUSEDESIGNER_INFO1');
                    });
                }
            }

            let allPath = true;
            let count={
                s:0,
                d:0,
                sd:0
            };
            for(let k=0;k<this.storage.selectedElements.length;k++){
                if(this.storage.selectedElements[k].type !== 'S:P' && this.storage.selectedElements[k].type !== 'S:C' && this.storage.selectedElements[k].type !== 'S:D' && this.storage.selectedElements[k].type !== 'S:S' && this.storage.selectedElements[k].type !== 'S:SD' && this.storage.selectedElements[k].type !== 'S:TSP' ){
                    allPath = false; break;
                }else{
                    if(this.storage.selectedElements[k].type === 'S:S') count.s++;
                    else if(this.storage.selectedElements[k].type === 'S:D') count.d++;
                    else if(this.storage.selectedElements[k].type === 'S:SD') count.sd++;
                }
            }
            if(count.s+count.sd>2 || count.s+count.d+count.sd>2 || count.d+count.sd>2 || count.s+count.d>2 || count.d>1 || count.s>1){
                allPath = false;
            }

            this.storage.showCreateMission = allPath;
        }
    };

    createCurve (shortenPath){
        let missionsEl1 = this.checkMissionsOfPathElement(this.storage.selectedElements[0]);
        let missionsEl2 = this.checkMissionsOfPathElement(this.storage.selectedElements[1]);
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null){
            this.editor.addCurve(this.storage.selectedElements[0].id,this.storage.selectedElements[1].id, {'shortenPath':shortenPath}).then(res=>{
                //refresh allElements
                let newItems = this.detectNewElements();
                this.renameNewItemsAndRefresh(newItems);


                let common = [];

                for(let k=0; k<missionsEl1.length;k++){
                    if(missionsEl2.indexOf(missionsEl1[k])>-1) common.push(missionsEl1[k]);
                }
                for(let i=0; i<common.length; i++){
                    let mi =  this.findMissionById(common[i]);
                    mi.elements.push(res.id);
                }

            });
        }
    };

    detectNewElements (){
        let oldList =JSON.parse(JSON.stringify(this.storage.allElements));
        let getFromEditor = this.editor.exportJSONObjects();
        let newList = getFromEditor.layer.base.shapes;
        let newItems = [];
        for(let k=0; k<newList.length;k++){
            let i1 = newList[k].id;
            let bool = false;
            for(let l=0; l<oldList.length; l++){
                let i2=oldList[l].id;
                if(i1===i2){
                    bool=true;
                    break;
                }
            }
            if(!bool){
                newItems.push(newList[k]);
            }
        }
        return newItems;
    };

    renameNewItemsAndRefresh (newItems){
        this.layoutChanges = true;
        for(let k=0; k<newItems.length; k++){
            let current = newItems[k];

            //change name
            if( current.customName ===  current.type){

                if(current.type==='S:P' || current.type==='S:C'){
                    if(!this.storage.typeCount.hasOwnProperty(current.type)) this.storage.typeCount[current.type]=0;
                    current.customName = this.translateService.instant(current.customName) + ' ' + (this.storage.typeCount[current.type]+1);
                    this.editor.changeShapeParameter(current.id, 'customName', current.customName);
                    this.storage.typeCount[current.type]++;
                }
            }
        }
        let getFromEditor = this.editor.exportJSONObjects();
        this.storage.allElements = getFromEditor.layer.base.shapes;
        //this.storage.allElements = $filter('sortEditorElements')(this.storage.allElements);
        this.storage.typeCount = this.countShapeTypes(this.storage.allElements);

    };

    createCrossRoad (){
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null){
            this.editor.addCrossRoad(this.storage.selectedElements[0].id,this.storage.selectedElements[1].id).then(res=>{
                let newItems = this.detectNewElements();
                this.renameNewItemsAndRefresh(newItems);
            });
        }
    };

    createTJunction (){
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null){
            this.editor.addThreeWayJunction(this.storage.selectedElements[0].id,this.storage.selectedElements[1].id).then(res=>{
                //refresh allElements
                let newItems = this.detectNewElements();
                this.renameNewItemsAndRefresh(newItems);
            });
        }
    };

    checkMissionsOfPathElement (el){
        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
            let res = [];
            for(let k=0; k<this.storage.allMissions.length;k++){
                if(this.storage.allMissions[k].elements.indexOf(el.id)>-1) res.push(this.storage.allMissions[k].id);
            }
            return res;
        }  else{
            return [];
        }
    };

    closeSelectedItemMenu (){
        this.storage.showItemMenu = false;
    };

    undo() {
        this.editor.undo().then(res=>{
            this.historySize = this.editor.getHistorySize();
        },function(err){});
    };

    removeElementFromAllMissions (el){
        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null){
            for(let k=0; k<this.storage.allMissions.length;k++){
                let m = this.storage.allMissions[k];

                if(m.source!==null && m.source === el.id){
                    m.source = null;
                }else if(m.destination!==null && m.destination === el.id){
                    m.destination = null;
                }else if(m.elements!==null){
                    for(let l=0;l<m.elements.length;l++){
                        if(m.elements[l]===el.id){
                            m.elements.splice(l,1);
                        }
                    }
                }
            }
        }
    }

    copyElement (){

        let el = JSON.parse(JSON.stringify(this.storage.selectedElements[0]));
        el.id = this.uuidv4();
        el.positionStart.x += 1000;
        el.positionStart.y += 1000;
        el.positionEnd.x += 1000;
        el.positionEnd.y += 1000;

        this.editor.importJSONObjects([el]).then(res=>{
            // success WAREHOUSEDESIGNER_ELEMENTCOPIED_SUCCESS
        },function(err){
        });
    };

    copyMultipleElements (){

        let elements = JSON.parse(JSON.stringify(this.storage.selectedElements));

        if(elements!==undefined && elements!==null){
            for(let k=0; k<elements.length;k++){
                let el = this.storage.selectedElements[k];
                el.id = this.uuidv4();
                el.positionStart.x += 1000;
                el.positionStart.y += 1000;
                el.positionEnd.x += 1000;
                el.positionEnd.y += 1000;

                this.editor.importJSONObjects([el]).then(res=>{
                },function(err){
                });

                if(k===elements.length-1) {
                    // success WAREHOUSEDESIGNER_ELEMENTSCOPIED_SUCCESS
                }
            }
        }
    };

    deselectAllElements (){
        this.editor.deselectAllShapes();
        this.deselectAll();
    };

    addMissionFromElements() {
        if(this.storage.selectedElements!==undefined && this.storage.selectedElements!==null && this.storage.showCreateMission) {
            let bothDir = this.checkBothDirections(null, this.storage.selectedElements);

            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = false;
            dialogConfig.panelClass = ['largeDialog'];
            dialogConfig.data = {
                selectedElements: this.storage.selectedElements,
                bothDir: bothDir
            };

            const dialogRef = this.dialog.open(CreateMissionsFromMultipleElementsDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.layoutChanges = true;
                    if(res.hasOwnProperty('flow') && res.flow>0) {
                        //this.storage.changedFlow = true;
                        this.initSegments(res).then(newMi=>{
                            res = newMi;
                            this.storage.allMissions.push(res);
                            this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                            this.showHeatMap();
                            this.layoutChanges = true;
                        });
                    }else{
                        this.storage.allMissions.push(res);
                        this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                        this.showHeatMap();
                        this.layoutChanges = true;
                    }
                }
            });
        }
    }

    removeSelectedItem() {
        if(this.storage.selectedElements[0]!==null) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = false;
            dialogConfig.panelClass = ['noHeightDialog'];
            dialogConfig.data = {
                labels: {
                    title: "PROJECTS.LAYOUT.DELETEITEM_H1",
                    content: "PROJECTS.LAYOUT.DELETEITEM_D1",
                    save: "GLOBAL.REMOVE"
                }
            };

            const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.editor.deleteShape(this.storage.selectedElements[0].id).then(res=>{
                        this.closeSelectedItemMenu();
                        let getFromEditor = this.editor.exportJSONObjects();
                        this.storage.allElements = getFromEditor.layer.base.shapes;
                        this.storage.typeCount = this.countShapeTypes(this.storage.allElements);
                        this.toast.success("WAREHOUSEDESIGNER_DELETEITEM_SUCCESS");
                        //delete element from mission if exists
                        this.removeAllMissingElements();
                        this.checkErrors();

                        this.storage.selectedElements = [];
                        this.storage.showElementExpert = false;
                        this.storage.selectedItemCopy = null;
                    },err=>{
                        this.toast.error("WAREHOUSEDESIGNER_DELETEITEM_ERROR");
                    });
                }
            });
        }
    }

    createMissionFromSuggestion(mi: any) {
        if(mi!==undefined){
            if(mi.hasOwnProperty('isTugger') && mi.isTugger===true){
                this.createTuggerMission (mi);
                return;
            }
            let bothDir = this.checkBothDirections(mi);
            let source = this.findElementById(mi.ids[0]);
            let path = JSON.parse(JSON.stringify(mi.ids));
            let name = source.customName + ' -> ' + mi.destination.customName;
            if(mi.hasOwnProperty('name') && mi.name!==null) name = mi.name;
            if(path.length>2){
                path.splice(0,1);
                path.splice(path.length-1,1);

                const dialogConfig = new MatDialogConfig();
                dialogConfig.autoFocus = false;
                dialogConfig.panelClass = ['noHeightDialog'];
                dialogConfig.data = {
                    bothDir: bothDir,
                    name: name,
                    color: mi.color
                };

                const dialogRef = this.dialog.open(CreateMissionFromSuggestionDialogComponent, dialogConfig);
                dialogRef.afterClosed().subscribe(res => {
                    if (res) {
                        res.id = this.uuidv4();
                        res.elements = path;
                        res.source = mi.ids[0];
                        res.destination = mi.ids[mi.ids.length-1];
                        this.layoutChanges = true;
                        if(res.hasOwnProperty('flow') && res.flow>0) {
                            //this.storage.changedFlow = true;
                            this.initSegments(res).then(newMi=>{
                                res = newMi;
                                this.storage.allMissions.push(res);
                                this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                                this.showHeatMap();
                                this.layoutChanges = true;
                            });
                        }else{
                            this.storage.allMissions.push(res);
                            this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                            this.showHeatMap();
                            this.layoutChanges = true;
                        }
                    }
                });
            }
        }
    }

    initSegmentsFct(mi, shift, middle, count){
        let segments = [];
        let breakTime = shift.minutes - shift.minutesAfterBreak;

        let segLength = this.storage.processDuration;
        let breakTimeRest = JSON.parse(JSON.stringify(breakTime));
        let brTime = JSON.parse(JSON.stringify(breakTime));

        for(let i=0; i<count; i++){
            let frDate = new Date(shift.fromDate);
            if(i>0){
                frDate = shift.segments[i-1].toDate;
            }
            let isDate = frDate instanceof Date;


            if(!isDate){
                frDate = new Date(frDate);
            }

            if(i>=middle && breakTimeRest>0){
                //let fl = 0;
                if(breakTime >= segLength){
                    brTime = segLength;
                    //fl = 0;
                    breakTimeRest -= segLength;
                    //if(breakTimeRest>0)count++;
                }else{
                    brTime = breakTimeRest;
                    breakTimeRest=0;
                    //fl = (1 - (brTime / segLength)) * mi.flow;
                }
                segments.push({
                    fromDate: frDate.getTime(),
                    toDate:frDate.getTime() + (this.storage.processDuration*60000), // new Date(frDate.getTime() + breakTime*60000),
                    inputValues:{
                        flow:mi.flow
                    },
                    breakTime: brTime
                });
            }else{
                segments.push({
                    fromDate: frDate.getTime(),
                    toDate:frDate.getTime() + (this.storage.processDuration*60000),
                    inputValues:{
                        flow:mi.flow
                    },
                    breakTime: 0
                });
            }

        }
        return segments;
    }

    initSegments(mi): Promise<any>{
        return new Promise((resolve, reject) => {
            if ( this.storage.hasShifts ) {
                mi.flowSegments = [];
                for(let i=0; i<this.storage.projectShifts.length; i++){
                    let shift = this.storage.projectShifts[i];
                    if(this.storage.processDuration!==undefined && this.storage.processDuration!==null){
                        let count = shift.minutes/this.storage.processDuration;
                        let middle = Math.round(count/2);
                        let seg = this.initSegmentsFct(mi, shift, middle,count);
                        mi.flowSegments.push(seg);
                    }
                }
                resolve(mi);
            }else{
                resolve(mi);
            }
        });
    }

    addVNAMission() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['largeDialog'];
        dialogConfig.data = {
            name: 'VNA Rack Mission',
            selEl: this.storage.selectedElements[0]
        };

        const dialogRef = this.dialog.open(CreateVnaMissionDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.layoutChanges = true;
                if(res.hasOwnProperty('flow') && res.flow>0) {
                    //this.storage.changedFlow = true;
                    this.initSegments(res).then(newMi=>{
                        res = newMi;
                        this.storage.allMissions.push(res);
                        this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                        this.showHeatMap();
                    });
                }else{
                    this.storage.allMissions.push(res);
                    this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                    this.showHeatMap();
                }
            }
        });
    }

    addTuggerTrainMission() {
        let source = this.storage.selectedElements[0];
        let allStopPoints = [];
        if(this.storage.allElements!==undefined && this.storage.allElements!==null){
            for(let k=0; k<this.storage.allElements.length; k++){
                if(this.storage.allElements[k].type === 'S:TSP'
                    // || (this.storage.allElements[k].type === 'S:SD' && this.storage.allElements[k].userKeys.hasOwnProperty('sdType') && this.storage.allElements[k].userKeys.sdType==='tuggerTrain'
                ) allStopPoints.push(this.storage.allElements[k]);
            }
        }

        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['largeDialog'];
        dialogConfig.data = {
            source: source,
            allStopPoints: allStopPoints,
            findElementById: this.findElementById,
            editor: this.editor
        };

        const dialogRef = this.dialog.open(CreateTuggerTrainMissionDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.layoutChanges = true;
                if(res.hasOwnProperty('flow') && res.flow>0) {
                    //this.storage.changedFlow = true;
                    this.initSegments(res).then(newMi=>{
                        res = newMi;
                        this.storage.allMissions.push(res);
                        this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                        this.showHeatMap();
                        this.layoutChanges = true;
                    });
                }else{
                    this.storage.allMissions.push(res);
                    this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                    this.showHeatMap();
                    this.layoutChanges = true;
                }
            }
        });
    }

    addToMission() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['largeDialog'];
        dialogConfig.data = {
            allMissions: this.storage.allMissions,
            selectedElement: this.storage.selectedElements[0],
            editor: this.editor
        };

        const dialogRef = this.dialog.open(AddElementToMissionDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.storage.allMissions=result;
                this.showHeatMap();
                this.layoutChanges = true;
                this.checkErrors();
            }
        });
    }

    deleteMission() {
        if(this.storage.allMissions!==undefined && this.storage.allMissions!==null) {
            let deleteIndex = null;
            for (let l = 0; l < this.storage.allMissions.length; l++) {
                if (this.storage.allMissions[l].id === this.storage.selectedElements[0].id) {
                    deleteIndex = l;
                }
            }

            if(deleteIndex!==null){

                const dialogConfig = new MatDialogConfig();
                dialogConfig.autoFocus = false;
                dialogConfig.panelClass = ['smallDialog'];
                dialogConfig.data = {
                    labels: {
                        title: "PROJECTS.LAYOUT.DELETEMISSION_H1",
                        content: "PROJECTS.LAYOUT.DELETEMISSION_D1",
                        save: "GLOBAL.REMOVE"
                    }
                };

                const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
                dialogRef.afterClosed().subscribe(result => {
                    if (result) {
                        this.storage.allMissions.splice(deleteIndex,1);
                        this.storage.selectedElements = [];
                        this.storage.showElementExpert = false;
                        this.storage.showItemMenu = false;
                    }
                });
            }
            this.showHeatMap();
            this.layoutChanges = true;
            this.checkErrors();
        }
    }

    saveLayout(){
        this.editor.getImage({excludeImages:false}).then(res=>{
            let flowPlanImages = {
                img_flowPlanLayout : res
            };
            this.service.patchFlowPlanImages(flowPlanImages,this.selectedProject.id).then(function(res){
            },function(err){
            });
        },function(err){});

        let toSaveMissions = this.storage.allMissions;
        let getFromEditor = this.editor.exportJSONObjects();

        this.service.patchWarehouseDesign({layout: JSON.stringify(getFromEditor), extractedData: JSON.stringify(toSaveMissions)},this.selectedProject.id).then(res=>{

        }, err=>{

        });
    };

    renewLayout (){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.LAYOUT.NEW_T1",
                content: "PROJECTS.LAYOUT.NEW_D1",
                save: "GLOBAL.CONTINUE"
            }
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                if(this.editor!==undefined && this.editor!==null){
                    this.editor.clearMap();
                    this.changeBtnAvailability();
                }
                this.storage = JSON.parse(JSON.stringify(this.cleanCopy));
                this.saveLayout();
            }
        })
    };

    createTuggerMission(mi: any) {
        if(mi) {
            let bothDir = this.checkBothDirections(mi);
            let source = this.findElementById(mi.destination.id);
            let stopPoints = [];
            let flow = 0;
            if (mi.hasOwnProperty('flow') && mi.flow !== null) flow = mi.flow;
            let path = JSON.parse(JSON.stringify(mi.ids));
            if (path.length > 2) {
                for (let p = 0; p < path.length; p++) {
                    let e = this.findElementById(path[p]);
                    if (e.type === 'S:TSP') {
                        stopPoints.push({el: e, selected: true, couplingTime: 0});
                    }
                }

                const dialogConfig = new MatDialogConfig();
                dialogConfig.autoFocus = false;
                dialogConfig.panelClass = ['smallDialog'];
                dialogConfig.data = {
                    name: mi.name,
                    color: mi.color,
                    bothDir: bothDir,
                    stopPoints: stopPoints,
                    source: source,
                    flow: flow
                };

                const dialogRef = this.dialog.open(CreateTuggerMissionFromSuggestionDialogComponent, dialogConfig);
                dialogRef.afterClosed().subscribe(res => {
                    if (res) {
                        this.layoutChanges = true;
                        res.elements = path;
                        res.source = mi.ids[0];
                        res.destination = mi.ids[mi.ids.length-1];

                        if(res.hasOwnProperty('flow') && res.flow>0) {
                            //this.storage.changedFlow = true;
                            this.initSegments(res).then(newMi=>{
                                res = newMi;
                                this.storage.allMissions.push(res);
                                this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                                this.showHeatMap();
                                this.layoutChanges = true;
                            });
                        }else{
                            this.storage.allMissions.push(res);
                            this.selectMission(this.storage.allMissions[this.storage.allMissions.length-1]);
                            this.showHeatMap();
                            this.layoutChanges = true;
                        }
                    }
                });
            }
        }
    }

    removeAllMissingElements() {
        for(let i=0; i<this.storage.allMissions.length; i++){
            let mi = this.storage.allMissions[i];

            if(mi.hasOwnProperty("source") && mi.source!==null){
                if(!this.editor.checkShapeId(mi.source)) {
                    mi.source = null;
                }
            }
            if(mi.hasOwnProperty("destination") && mi.destination!==null){
                if(!this.editor.checkShapeId(mi.destination)) {
                    mi.destination = null;
                }
            }
            if(mi.hasOwnProperty("elements") && mi.elements!==null && mi.elements.length>0){
                for(let k=0; k<mi.elements.length;k++){
                    let el = mi.elements[k];
                    if(!this.editor.checkShapeId(el)) {
                        mi.elements.splice(k,1);
                    }
                }
            }
        }
    }
}
