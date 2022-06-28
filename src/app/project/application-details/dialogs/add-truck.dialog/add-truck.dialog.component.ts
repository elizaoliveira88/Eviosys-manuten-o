import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Application_DATA} from "@shared/models/Application";
import {Toast} from "ngx-toastr";
import {ToastService} from "@services/toast.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {ApplicationDetailsService} from "@app/project/application-details/application-details.service";
import {ProjectTruck_DATA} from "@shared/models/ProjectTruck";

@Component({
    selector: 'app-add-truck.dialog',
    templateUrl: './add-truck.dialog.component.html',
    styleUrls: ['./add-truck.dialog.component.css']
})
export class AddTruckDialogComponent implements OnInit {

    storage = {
        trucks: [],
        trucksInProject: <ProjectTruck_DATA[]>[],
        trucksInApplication: [],
        applicationData: <Application_DATA>{},
        trailerList: [],
        selectedCar: null,
        selectedTrailer: [],
        allSelectedTrucks: [],
        selectTrainTyp: 'logistic_train'
    }
    transportSystem = [
        {
            id: 'logistic_train',
            label: 'Logistic Train',
            category: 'transportSystem'
        },
        {
            id: 'ft_compact',
            label: 'FT Compact',
            category: 'transportSystem'
        },
        {
            id: 'factory_train',
            label: 'Factory Train',
            category: 'transportSystem'
        }
    ];

    filter = {
        includeSelectedCars: true, //count > 0,
        hideNonCompatibleTrucks: false,
        showTrainConfiguration: false,
        selectMultiple: false
    };

    tr = {
        category: "zero",
        class: "0",
        classification: "trugger_train",
        id: 10000,
        identification: "Anhänger auswählen",
        model: "defaultTrailer",
        pic_ID: "defaultTrailer",
        possibleApplications: ['A8']
    }

    applicationType = null;
    addToProject = true;
    isInProject = false;
    searchTruck = null;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<AddTruckDialogComponent>,
                private toast: ToastService,
                private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private service: ApplicationDetailsService) {

        this.storage.trucks = data.trucks;
        this.storage.trucksInApplication = data.trucksInApplication;
        this.storage.applicationData = data.applicationData;

        this.initializeTrailers();


        this.storage.trucks.forEach(truck => {
            if (typeof truck.possibleApplications === 'string' || truck.possibleApplications instanceof String) {
                truck.possibleApplications = truck.possibleApplications.split(';');
            }
            truck.possibleApplications.forEach(app => {
                if (app.indexOf('_') > -1) {
                    truck.possibleApplications.push(app.split('_')[0]);
                }
            });
        });


        this.service.getProjectTrucks().then(res => {
            this.storage.trucksInProject = res;
            let count = 0;
            for (let i = 0; i < this.storage.trucksInProject.length; i++) {
                if (this.storage.trucksInProject[i].active) {
                    count++;
                }
            }
        }, err => {

        });


        if (this.storage.applicationData.hasOwnProperty('flowPlan') && this.storage.applicationData.flowPlan === true) {
            this.filter = {
                includeSelectedCars: true, //count > 0,
                hideNonCompatibleTrucks: false,
                showTrainConfiguration: false,
                selectMultiple: false
            };
        } else {
            this.filter = {
                includeSelectedCars: false, //count > 0,
                hideNonCompatibleTrucks: true,
                showTrainConfiguration: false,
                selectMultiple: false
            };
        }


        if ((this.normalizeApplicationType(this.storage.applicationData.applicationType) === 'A1') && (this.storage.applicationData.inputValues.stackNoStack === 'stack' || this.storage.applicationData.inputValues.stackNoStack === 'noStack')) {
            if (this.storage.applicationData.inputValues.stackNoStack === 'stack') {
                this.applicationType = this.normalizeApplicationType(this.storage.applicationData.applicationType) + '_2';
            } else {
                this.applicationType = this.normalizeApplicationType(this.storage.applicationData.applicationType) + '_1';
            }
        } else {
            this.applicationType = this.normalizeApplicationType(this.storage.applicationData.applicationType);
        }
    }

    ngOnInit(): void {
    }

    normalizeApplicationType(val: string): string {
        if (val) {
            if (val.charAt(0) === 'A') {
                return val;
            } else {
                return 'A' + val;
            }
        }
    }

    removeSelectedTruck(id) {
        for (let i = 0; i < this.storage.allSelectedTrucks.length; i++) {
            if (this.storage.allSelectedTrucks[i].id === id) {
                this.storage.allSelectedTrucks.splice(i, 1);
            }
        }
    };

    resetSelectedTruck() {
        // $mdSelect.hide();
        if (!this.filter.selectMultiple) this.storage.allSelectedTrucks = [];
        if (this.storage.selectedCar) this.storage.allSelectedTrucks.push(this.storage.selectedCar);
        this.storage.selectedCar = null;
    };

    clearSearchTerm() {
        this.searchTruck = '';
    };


    initializeTrailers() {
        let number = 4;
        this.storage.selectedTrailer = [];
        for (let i = 0; i < number; i++) {
            this.storage.selectedTrailer.push(
                {
                    'id': i,
                    'model': JSON.parse(JSON.stringify(this.tr))
                })
        }
    }

    chooseTrain() {
        this.storage.selectedCar = null;
        if(this.storage.trailerList.length===0 && this.filter.showTrainConfiguration){
            this.service.getBasicTrailers().then(res => {
                this.storage.trailerList = res;
            }, err => {

            });
        }
    };

    chooseTrailerTyp(typ) {
        this.storage.selectTrainTyp = typ;
        this.initializeTrailers();
    };

    isTrailerVisible(trailer) {
        let retValue = true;
        if (trailer.category === this.storage.selectTrainTyp || trailer.category === 'zero') {
            if (this.filter.includeSelectedCars) {
                retValue = false;

                this.storage.trucksInProject.forEach(tia => {
                    if (tia.trailerId === trailer.id && tia.active) {
                        retValue = true;
                    }
                });

            } else {
                retValue = true;
            }
        } else {
            retValue = false;
        }
        return retValue;
    };


    switchValueChange() {
        this.storage.selectedCar = null;
    };

    checkTruckDisable(id) {
        for (let i = 0; i < this.storage.allSelectedTrucks.length; i++) {
            if (this.storage.allSelectedTrucks[i].id === id) return true;
        }
        return false;
    };

    changeCarSelection(optTrailer?) {
        if (this.filter.selectMultiple) {
            if (this.storage.selectedCar) {
                if ((this.storage.allSelectedTrucks.length + Object.keys(this.storage.trucksInApplication).length) <= 5) {
                    if (this.storage.allSelectedTrucks.length <= 6) this.storage.allSelectedTrucks.push(this.storage.selectedCar);
                    // $mdSelect.hide();
                    this.storage.selectedCar = null;
                } else {
                    //$mdSelect.hide();
                    this.storage.selectedCar = null;
                    this.toast.error('ERROR_ADDTRUCK_MULTIPLE');
                }

            }
        }

        if (optTrailer !== null && optTrailer !== undefined && optTrailer === 'trailer') {
        } else if(this.storage.selectedCar) {
            let prTr = this.isInProjectTrucks(this.storage.selectedCar.id);
            this.isInProject = prTr!==null && prTr.active;
        }
    };

    isInProjectTrucks(id): ProjectTruck_DATA {
        let ret = null;
        if(this.storage.trucksInProject){
            this.storage.trucksInProject.forEach(tr=>{
                if(tr.id === id){
                    ret = tr;
                }
            });
        }
        return ret;
    }

    isVisible(truck) {
        let type = this.applicationType;
        if (this.filter.showTrainConfiguration === false && this.applicationType === 'A8') {
            type = 'A6';
        }
        if (this.filter.includeSelectedCars === false && this.filter.hideNonCompatibleTrucks === false) return true;

        let retValue = true;

        //let fistChars = angular.copy(type).substring(0,2);
        if (this.filter.hideNonCompatibleTrucks === true) {
            if (type === 'A1_1' || type === 'A1_2') {
                retValue = !(truck.possibleApplications.indexOf('A1_1') === -1 && truck.possibleApplications.indexOf('A1_2') === -1);
            } else {
                retValue = truck.possibleApplications.indexOf(type) !== -1;
            }
        }

        if (retValue === true && this.filter.includeSelectedCars === true) {
            retValue = false;
            this.storage.trucksInProject.forEach(tia => {
                if (tia.truckId === truck.id && tia.active) {
                    retValue = true;
                }
            });
        }
        return retValue;
    };

    changAddToProject(bool) {
        this.addToProject = bool;
    };

    cancel() {
        this.dialogRef.close();
    };

    save() {
        if(this.filter.selectMultiple && this.storage.selectedCar && this.storage.allSelectedTrucks.length===0){
            this.storage.allSelectedTrucks.push(this.storage.selectedCar);
        } else if(!this.filter.selectMultiple && this.storage.selectedCar && this.storage.allSelectedTrucks.length===0){
            this.storage.allSelectedTrucks.push(this.storage.selectedCar);
        }
        this.dialogRef.close([this.storage, this.filter, this.addToProject]);
    };


}
