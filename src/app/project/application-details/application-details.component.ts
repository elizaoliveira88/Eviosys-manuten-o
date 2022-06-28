import { Component, ContentChild, OnInit, TemplateRef } from '@angular/core';
import { Application, Application_DATA } from '@shared/models/Application';
import { forkJoin, Subject } from 'rxjs';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationDetailsService } from '@app/project/application-details/application-details.service';
import InputValuesJson from '../../../assets/inputValuesByApplicationTypes.json';
import InputModelInfos from '../../../assets/inputValuesModelInfos.json';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SimpleTruck_DATA } from '@shared/models/SimpleTruck';
import { takeUntil } from 'rxjs/operators';
import { ApplicationTruck_DATA_prepared } from '@shared/models/ApplicationTruck';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PromptDialogComponent } from '@shared/components/dialogs/prompt-dialog/prompt-dialog.component';
import { AddTruckDialogComponent } from '@app/project/application-details/dialogs/add-truck.dialog/add-truck.dialog.component';
import { fromPromise } from 'rxjs-compat/observable/fromPromise';
import { ConfirmDialogComponent } from '@shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { appRoutesNames } from '@app/app.routes.names';
import { routeNamesProject } from '@app/project/project.routes.names';
import { CommentsDialogComponent } from '@app/project/application-details/dialogs/comments.dialog/comments.dialog.component';
import { debounce } from 'lodash';
import { SegmentsDialogComponent } from '@shared/components/dialogs/segments-init-dialog/segments-dialog.component';
import { MatSelectChange } from '@angular/material/select';
import { ToastService } from '@services/toast.service';
import { TruckInfoDialogComponent } from '@app/project/application-details/dialogs/truck-info.dialog/truck-info.dialog.component';
import { ProjectTruck } from '@shared/models/ProjectTruck';

@Component({
    selector: 'app-application-details',
    templateUrl: './application-details.component.html',
    styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent implements OnInit {
    imgShouldUpdate = false;
    @ContentChild(TemplateRef) template: TemplateRef<any>;
    private ngUnsubscribe = new Subject();
    chartsSubject: Subject<any> = new Subject();
    inputValuesForm: FormGroup;
    pickStrategyForm: FormGroup;
    shiftInputValuesForms: FormGroup[];
    storage = {
        allApplications: [],
        selectedApplicationId: null,
        selectedProject: null,
        selectedApplication: <Application_DATA>new Application(),
        shiftInputs: [],
        selectedShift: null,
        inputValuesModel: null,
        inputsPrepared: false,
        duration: {
            durationHours: 0,
            durationMinutes: 0,
        },
        inputColumns: <string[]>[],
        expandableColumns: <string[]>[],
        inputColumnsFiltered: <string[]>[],
        displayColumns: ['0', '1', '2', '3', '4', '5', '6'],
        tableHeaders: <string[]>[],
        displayData: <any>[],
        allApplicationTrucks: <ApplicationTruck_DATA_prepared[]>[],
        allApplicationTrucksBeforeUpdate: <ApplicationTruck_DATA_prepared[]>[],
        applicationTrucksById: {},
        allTrucks: <SimpleTruck_DATA[]>[],
        expertMode: <boolean>false,
        editModes: {
            financeInfo: false,
            oneOffCosts: false,
        },
        indicator: {},
    };

    constructor(
        private masterDataStore: MasterDataStore,
        private translateService: TranslateService,
        private service: ApplicationDetailsService,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private toast: ToastService,
    ) {
        this.inputChanged = debounce(this.inputChanged, 800);

        this.inputValuesForm = new FormGroup({});
        this.pickStrategyForm = new FormGroup({});

        this.storage.inputColumns = [
            'position',
            'id',
            'identification',
            'model',
            'truckClass',
            'palletsPerDrive',
            'expertCriteria.HEADER_EXPERT',
            'expertCriteria.recordingTimeSec',
            'expertCriteria.depositTimeSec',
            'expertCriteria.recordingDepositTimeSec',
            'expertCriteria.palletsPerDrive',
            'expertCriteria.efficiencyFactor',
            'expertCriteria.speedLimit',
            'HEADER_CALC',
            'calculationResult.carNumber',
            'calculationResult.carCount',
            'calculationResult.utilization',
            'calculationResult.ratioPick',
            'calculationResult.flow',
            'calculationResult.numberLoadingDock',
            'calculationResult.timeCycle',
            'calculationResult.hourCounter',
            'calculationResult.hourCounterYear',
            'calculationResult.consumption',
            'calculationResult.actualConsumption',
            'calculationResult.totalCost',
            'calculationResult.purchaser',
            'HEADER_COST_PER_TRUCK',
            'financeInfo.buyingRent',
            'financeInfo.salesPrice',
            'financeInfo.financing',
            'financeInfo.rate',
            'financeInfo.residualValue',
            'financeInfo.rent',
            'financeInfo.maintenanceCosts',
            'financeInfo.grossPay',
            'HEADER_ONE_OFF',
            'financeInfo.oneOffCosts',
            'HEADER_COST_TOTAL',
            'financeInfo.overallCarCosts',
            'financeInfo.overallMaintenanceCosts',
            'financeInfo.overallConsumptionsCosts',
            'financeInfo.overallPersonalCosts',
            'financeInfo.aggregateCostYear',
        ];

        this.storage.expandableColumns = [
            'calculationResult.carNumber',
            'calculationResult.carCount',
            'calculationResult.utilization',
            'calculationResult.ratioPick',
            'calculationResult.flow',
            'calculationResult.numberLoadingDock',
            'calculationResult.hourCounter',
            'calculationResult.consumption',
            'calculationResult.actualConsumption',
            'calculationResult.totalCost',
            'calculationResult.purchaser',
            'financeInfo.overallCarCosts',
            'financeInfo.overallMaintenanceCosts',
            'financeInfo.overallConsumptionsCosts',
            'financeInfo.overallPersonalCosts',
            'financeInfo.aggregateCostYear',
        ];
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.storage.selectedApplicationId = params['id'];
        });

        this.storage.selectedProject = this.masterDataStore.selectedProject;

        this.masterDataStore.trucks_changed
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(trucks => {
                if (trucks) {
                    this.storage.allTrucks = trucks;
                    this.refreshData();
                }
            });

        this.storage.inputColumnsFiltered = this.storage.inputColumns.filter(el => {
            return el.indexOf('HEADER') === -1;
        });

        this.service.getApplications(this.storage.selectedProject.id).then(
            res => {
                if (res) {
                    this.storage.allApplications = res;
                }
            },
            err => {},
        );
    }

    extendInputValuesModel(model): any {
        const ret = [];
        model.forEach(box => {
            const retBox = [];
            box.values.forEach(row => {
                const retRow = [];
                row.forEach(el => {
                    if (el.hasOwnProperty('grouping')) {
                        const retElGr = {
                            grouping: [],
                        };
                        el.grouping.forEach(mod => {
                            if (mod.model) {
                                const temp = Object.assign(
                                    JSON.parse(JSON.stringify(InputModelInfos[mod.model])),
                                    mod,
                                );
                                retElGr.grouping.push(temp);
                            } else {
                                retElGr.grouping.push(mod);
                            }
                        });
                        retRow.push(retElGr);
                    } else {
                        if (el.model) {
                            let retEl = Object.assign(
                                JSON.parse(JSON.stringify(InputModelInfos[el.model])),
                                el,
                            );
                            retRow.push(retEl);
                        } else {
                            retRow.push(el);
                        }
                    }
                });
                retBox.push(retRow);
            });
            ret.push({
                name: box.name,
                float: box.float,
                values: retBox,
                hideLabel: box.hideLabel,
            });
        });
        return ret;
    }

    getValidators(modelObj): any {
        let validators = [];
        if (modelObj.hasOwnProperty('required') && modelObj.required == true) {
            validators.push(Validators.required);
        }
        if (modelObj.hasOwnProperty('min')) {
            validators.push(Validators.min(modelObj.min));
        }
        if (modelObj.hasOwnProperty('max')) {
            validators.push(Validators.max(modelObj.max));
        }
        return validators;
    }

    prepareInputValues() {
        let temp =
            InputValuesJson[
                this.normalizeApplicationType(this.storage.selectedApplication.applicationType)
            ];
        if (!temp) return;
        let tempModel = this.storage.shiftInputs.length === 0 ? temp['no-shifts'] : temp['shifts'];
        this.storage.inputValuesModel = this.extendInputValuesModel(tempModel);
        if (this.storage.inputValuesModel) {
            const controls = {};
            this.storage.inputValuesModel.forEach(box => {
                if (box.name !== 'APPLICATION_CALCINFO12') {
                    box.values.forEach(row => {
                        row.forEach(el => {
                            if (el.hasOwnProperty('grouping')) {
                                el.grouping.forEach(mod => {
                                    controls[mod.model] = new FormControl(
                                        this.storage.selectedApplication.inputValues[mod.model],
                                    );
                                    controls[mod.model].addValidators(this.getValidators(mod));
                                    if (mod.disabled) {
                                        controls[mod.model].disable();
                                    }
                                });
                            } else {
                                controls[el.model] = new FormControl(
                                    this.storage.selectedApplication.inputValues[el.model],
                                );
                                controls[el.model].addValidators(this.getValidators(el));
                                if (el.disabled) {
                                    controls[el.model].disable();
                                }
                            }
                        });
                    });
                }
            });

            if (this.storage.shiftInputs.length > 0) {
                this.shiftInputValuesForms = [];
                this.storage.shiftInputs.forEach(shift => {
                    const controlsPerShift = {
                        durationHours: new FormControl(0),
                        durationMinutes: new FormControl(0),
                    };
                    this.storage.inputValuesModel.forEach(box => {
                        if (box.name === 'APPLICATION_CALCINFO12') {
                            box.values.forEach(row => {
                                row.forEach(el => {
                                    if (el.hasOwnProperty('grouping')) {
                                        el.grouping.forEach(mod => {
                                            controlsPerShift[mod.model] = new FormControl(
                                                shift.inputValues[mod.model],
                                            );
                                            controlsPerShift[mod.model].addValidators(
                                                this.getValidators(mod),
                                            );
                                            if (mod.disabled) {
                                                controlsPerShift[mod.model].disable();
                                            }
                                        });
                                    } else {
                                        controlsPerShift[el.model] = new FormControl(
                                            shift.inputValues[el.model],
                                        );
                                        controlsPerShift[el.model].addValidators(
                                            this.getValidators(el),
                                        );
                                        if (el.disabled) {
                                            controls[el.model].disable();
                                        }
                                    }
                                });
                            });
                        }
                    });
                    const thisForm = new FormGroup(controlsPerShift);
                    thisForm.controls['durationHours'].disable();
                    thisForm.controls['durationMinutes'].disable();
                    this.shiftInputValuesForms.push(thisForm);
                });
            } else {
                controls['durationHours'] = new FormControl(0);
                controls['durationMinutes'] = new FormControl(0);
            }

            this.inputValuesForm = new FormGroup(controls);

            this.storage.inputsPrepared = true;
            if (this.storage.shiftInputs.length > 0) {
                this.selectShift(this.storage.shiftInputs[0], 0);
            }

            if (
                this.normalizeApplicationType(this.storage.selectedApplication.applicationType) ===
                    'A7' &&
                this.storage.selectedApplication.inputValues.pickStrategy
            ) {
                this.pickStrategyForm = new FormGroup({
                    horizontalLeft: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.horizontalLeft,
                        Validators.required,
                    ),
                    horizontalMiddle: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.horizontalMiddle,
                        Validators.required,
                    ),
                    horizontalRight: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.horizontalRight,
                        Validators.required,
                    ),
                    verticalBottom: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.verticalBottom,
                        Validators.required,
                    ),
                    verticalMiddle: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.verticalMiddle,
                        Validators.required,
                    ),
                    verticalTop: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.verticalTop,
                        Validators.required,
                    ),
                    key: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.key,
                        Validators.required,
                    ),
                    name: new FormControl(
                        this.storage.selectedApplication.inputValues.pickStrategy.name,
                        Validators.required,
                    ),
                });
            }

            this.checkAllDisplayRules();
            this.calcDuration(true);
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        this.service.getApplicationById(this.storage.selectedApplicationId).then(
            res => {
                if (res) {
                    this.storage.selectedApplication = res;
                    this.service
                        .getApplicationShiftInputs(this.storage.selectedApplication.id)
                        .then(
                            shiftInputs => {
                                if (shiftInputs) {
                                    this.storage.shiftInputs = shiftInputs;
                                }
                                this.prepareInputValues();
                            },
                            err => {
                                this.prepareInputValues();
                            },
                        );
                }
            },
            err => {},
        );

        this.service.getApplicationTrucks(this.storage.selectedApplicationId).then(
            res => {
                this.transformApplicationTrucks(res);
                this.chartsSubject.next(this.storage);
            },
            err => {},
        );
    }

    extendDisplayData(): void {
        if (this.storage.displayData) {
            let bool = false;
            for (let k = this.storage.allApplicationTrucks.length + 1; k < 7; k++) {
                if (bool) this.storage.displayData[0][k] = 'empty';
                else this.storage.displayData[0][k] = 'add';
                bool = true;
            }
            this.storage.tableHeaders = JSON.parse(JSON.stringify(this.storage.displayColumns));
        }
    }

    formatInputRow(row) {
        const output = {};
        output[0] = row;
        output['expanded'] = false;
        for (let i = 0; i < this.storage.allApplicationTrucks.length; ++i) {
            /*let value: any = null;
            if(row === 'hourCounterYear'){
                value = this.storage.allApplicationTrucks[i].calculationResult.hourCounter * this.storage.selectedApplication.settings.workingDays;
            } else if(row === 'identification' || row === 'model' || row === 'truckClass' || row === 'palletsPerDrive'){
                const baseTr = this.findTruckById(this.storage.allApplicationTrucks[i].truckId);
                value = baseTr[row];
            }
            if( this.storage.allApplicationTrucks[i].hasOwnProperty(row)) value = this.storage.allApplicationTrucks[i][row];
            if( this.storage.allApplicationTrucks[i].calculationResult.hasOwnProperty(row)) value = this.storage.allApplicationTrucks[i].calculationResult[row];
            if( this.storage.allApplicationTrucks[i].financeInfo.hasOwnProperty(row)) value = this.storage.allApplicationTrucks[i].financeInfo[row];
            if( this.storage.allApplicationTrucks[i].flowPlanCalculationResult.hasOwnProperty(row)) value = this.storage.allApplicationTrucks[i].flowPlanCalculationResult[row];
*/
            if (row !== 'position') {
                output[i + 1] = this.storage.allApplicationTrucks[i].id;
            } else {
                output[i + 1] = 'added';
            }
        }
        return output;
    }

    calcDuration(into: boolean) {
        if (into) {
            if (this.storage.selectedApplication.inputValues) {
                if (this.storage.shiftInputs.length > 0) {
                    let index = 0;
                    this.shiftInputValuesForms.forEach(form => {
                        const sec = this.storage.shiftInputs[index].inputValues.durationShiftSec;
                        const min = sec / 60;
                        const h = Math.floor(min / 60);
                        form.controls['durationHours'].setValue(h);
                        form.controls['durationMinutes'].setValue(min - h * 60);
                        index++;
                    });
                } else {
                    const sec = this.storage.selectedApplication.inputValues.durationShiftSec;
                    const min = sec / 60;
                    const h = Math.floor(min / 60);

                    this.inputValuesForm.controls['durationHours'].setValue(h);
                    this.inputValuesForm.controls['durationMinutes'].setValue(min - h * 60);
                }
            }
        } else {
            if (this.storage.selectedApplication.inputValues) {
                if (this.storage.shiftInputs.length > 0) {
                    let index = 0;
                    this.shiftInputValuesForms.forEach(form => {
                        let sec = 0;
                        const hours = form.controls['durationHours'].value;
                        const min = form.controls['durationMinutes'].value;
                        sec = min * 60 + hours * 60 * 60;
                        form.controls['durationShiftSec'].setValue(sec);

                        const breakBefore =
                            this.storage.shiftInputs[index].minutes -
                            this.storage.shiftInputs[index].minutesAfterBreak;
                        this.storage.shiftInputs[index].minutesAfterBreak = min + hours * 60;
                        this.storage.shiftInputs[index].minutes =
                            this.storage.shiftInputs[index].minutesAfterBreak + breakBefore;
                        index++;
                    });
                } else {
                    let sec = 0;
                    const hours = this.inputValuesForm.controls['durationHours'].value;
                    const min = this.inputValuesForm.controls['durationMinutes'].value;
                    sec = min * 60 + hours * 60 * 60;
                    this.storage.selectedApplication.inputValues.durationShiftSec = sec;
                }
            }
        }
    }

    setValue(data: any, $event: MatSlideToggleChange, options: any) {
        const model = data.model;
        this.inputValuesForm.controls[model].setValue(
            $event.checked ? options[1].value : options[0].value,
        );
        this.checkAllDisplayRules();
    }

    checkAllDisplayRules() {
        this.storage.inputValuesModel.forEach(box => {
            box.values.forEach(row => {
                row.forEach(el => {
                    let bool = true;
                    if (el.hasOwnProperty('grouping')) {
                        el.grouping.forEach(mod => {
                            if (!mod.displayRule) return;
                            for (const key in mod.displayRule) {
                                if (this.inputValuesForm.controls[key]) {
                                    if (
                                        this.inputValuesForm.controls[key].value !==
                                        mod.displayRule[key]
                                    ) {
                                        bool = false;
                                    }
                                } else {
                                    bool = false;
                                }
                            }
                            if (!bool) this.inputValuesForm.controls[mod.model].disable();
                            else this.inputValuesForm.controls[mod.model].enable();
                        });
                    } else {
                        if (!el.displayRule) return;
                        for (const key in el.displayRule) {
                            if (this.inputValuesForm.controls[key]) {
                                if (
                                    this.inputValuesForm.controls[key].value !== el.displayRule[key]
                                ) {
                                    bool = false;
                                }
                            } else {
                                bool = false;
                            }
                        }
                        if (!bool) this.inputValuesForm.controls[el.model].disable();
                        else this.inputValuesForm.controls[el.model].enable();
                    }
                });
            });
        });
    }

    addTruck() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['noHeightDialog'];
        dialogConfig.data = {
            trucks: this.storage.allTrucks,
            trucksInProject: [],
            trucksInApplication: this.storage.allApplicationTrucks,
            applicationData: this.storage.selectedApplication,
            trailerList: [],
        };

        const dialogRef = this.dialog.open(AddTruckDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const trucksToAdd = result[0].allSelectedTrucks;
                const toProjectTrucks = result[2];
                const calls = [];
                const callsProjectTrucks = [];
                trucksToAdd.forEach(truck => {
                    let prTruck = null;
                    for (let i = 0; i < result[0].trucksInProject.length; i++) {
                        if (truck.id === result[0].trucksInProject[i].truckId) {
                            prTruck = JSON.parse(JSON.stringify(result[0].trucksInProject[i]));
                        }
                    }
                    let newAppTruck = {
                        truckId: truck.id,
                    };
                    if (prTruck) {
                        newAppTruck = ProjectTruck.getNewProjectTruck(prTruck);
                    }
                    if (result[1].showTrainConfiguration && prTruck) {
                        if (result[0].selectedTrailer.length > 0) {
                            for (var tr = 0; tr < result[0].selectedTrailer.length; tr++) {
                                var trId = result[0].selectedTrailer[tr].model.id;
                                for (let i = 0; i < result[0].trucksInProject.length; i++) {
                                    if (trId === result[0].trucksInProject[i].trailerId) {
                                        newAppTruck['financeInfo'].salesPrice +=
                                            result[0].trucksInProject[i].financeInfo.salesPrice;
                                    }
                                }
                            }
                        }
                    }
                    calls.push(
                        fromPromise(
                            this.service.postApplicationTruck(
                                this.storage.selectedApplication.id,
                                newAppTruck,
                            ),
                        ),
                    );

                    if (toProjectTrucks && prTruck === null) {
                        callsProjectTrucks.push(
                            fromPromise(
                                this.service.postProjectTruck({
                                    truckId: truck.id,
                                    active: true,
                                }),
                            ),
                        );
                    }
                });
                forkJoin(callsProjectTrucks);
                forkJoin(calls).subscribe(data => {
                    let max = [];
                    if (data) {
                        //postApplicationTruckTrailer
                        data.forEach(arr => {
                            if (arr.length > max.length) max = arr;
                        });
                    }
                    if (max.length > 0) {
                        let last = max[max.length - 1];
                        if (result[0].selectedTrailer && result[0].selectedTrailer.length > 0) {
                            const trailerCalls = [];
                            result[0].selectedTrailer.forEach(el => {
                                if (el.model.category !== 'zero') {
                                    trailerCalls.push(
                                        this.service.postApplicationTruckTrailer(
                                            last.id,
                                            el.model.id,
                                        ),
                                    );
                                }
                            });
                            forkJoin(callsProjectTrucks);
                            forkJoin(trailerCalls);
                        }
                    }
                    this.transformApplicationTrucks(max);
                    this.chartsSubject.next(this.storage);
                });
            }
        });
    }

    removeTruck(i) {
        const truckToDelete = this.storage.allApplicationTrucks[i - 1];
        this.service.removeApplicationTruck(truckToDelete.id).then(
            res => {
                if (res) {
                    this.storage.allApplicationTrucks.splice(i - 1, 1);
                    this.transformApplicationTrucks(this.storage.allApplicationTrucks);
                    this.chartsSubject.next(this.storage);
                }
            },
            err => {},
        );
    }

    onClick($event: MouseEvent, row, type, i) {
        switch (type) {
            case 'ROW':
                if ($event) {
                    $event.stopPropagation();
                }
                if (this.storage.shiftInputs.length === 0) return;
                if (row[0].indexOf('HEADER') > -1 || !this.isExpandable('0', row)) return;
                if (!row.hasOwnProperty('expanded') || row.expanded == false) {
                    row.expanded = true;
                } else {
                    row.expanded = false;
                }
                type += row.expanded ? ':OPEN' : ':CLOSED';
                break;
        }
    }

    changeApplicationName() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.APPLICATION_DETAILS.CHANGE_APP_NAME.TITLE',
                content: 'PROJECTS.APPLICATION_DETAILS.CHANGE_APP_NAME.CONTENT',
                name: 'PROJECTS.APPLICATION_DETAILS.CHANGE_APP_NAME.NAME',
                save: 'GLOBAL.CREATE',
            },
            value: this.storage.selectedApplication.name,
        };
        const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service
                    .updateApplication(
                        {
                            name: result.value,
                        },
                        this.storage.selectedApplication.id,
                    )
                    .then(
                        res => {
                            this.storage.selectedApplication.name = res.name;
                        },
                        err => {},
                    );
            }
        });
    }

    archiveApplication() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.APPLICATION_DETAILS.ARCHIVE_APP.TITLE',
                content: 'PROJECTS.APPLICATION_DETAILS.ARCHIVE_APP.CONTENT',
                save: 'GLOBAL.CONTINUE',
            },
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service
                    .updateApplication(
                        {
                            archive: false,
                        },
                        this.storage.selectedApplication.id,
                    )
                    .then(
                        res => {
                            if (res) {
                                this.router.navigate([
                                    'fp',
                                    appRoutesNames.PROJECTS,
                                    this.storage.selectedProject.id,
                                    routeNamesProject.APPLICATIONS,
                                ]);
                            }
                        },
                        err => {},
                    );
            }
        });
    }

    copyApplication() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.APPLICATION_DETAILS.COPY_APP.TITLE',
                content: 'PROJECTS.APPLICATION_DETAILS.COPY_APP.CONTENT',
                name: 'PROJECTS.APPLICATION_DETAILS.COPY_APP.NAME',
                save: 'GLOBAL.CONTINUE',
            },
        };
        const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service
                    .copyApplication(
                        this.storage.selectedApplication.id,
                        this.storage.selectedProject.id,
                        result.value,
                    )
                    .then(
                        res => {
                            if (res) {
                                this.router.navigate([
                                    'fp',
                                    appRoutesNames.PROJECTS,
                                    this.storage.selectedProject.id,
                                    routeNamesProject.APPLICATIONS,
                                ]);
                            }
                        },
                        err => {},
                    );
            }
        });
    }

    deleteApplication() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.APPLICATION_DETAILS.DELETE_APP.TITLE',
                content: 'PROJECTS.APPLICATION_DETAILS.DELETE_APP.CONTENT',
                save: 'GLOBAL.CONTINUE',
            },
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.deleteApplication(this.storage.selectedApplication.id).then(
                    res => {
                        if (res) {
                            this.router.navigate([
                                'fp',
                                appRoutesNames.PROJECTS,
                                this.storage.selectedProject.id,
                                routeNamesProject.APPLICATIONS,
                            ]);
                        }
                    },
                    err => {},
                );
            }
        });
    }

    openComments() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['mediumDialog'];
        dialogConfig.data = {
            printedComment: this.storage.selectedApplication.printedComment,
            nonPrintedComment: this.storage.selectedApplication.nonPrintedComment,
        };

        const dialogRef = this.dialog.open(CommentsDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service
                    .updateApplication(
                        {
                            printedComment: result.printedComment,
                            nonPrintedComment: result.nonPrintedComment,
                        },
                        this.storage.selectedApplication.id,
                    )
                    .then(
                        res => {
                            if (res) {
                                this.storage.selectedApplication.printedComment =
                                    res.printedComment;
                                this.storage.selectedApplication.nonPrintedComment =
                                    res.nonPrintedComment;
                            }
                        },
                        err => {},
                    );
            }
        });
    }

    openExpertCriteria() {
        this.storage.expertMode = !this.storage.expertMode;
        if (this.storage.expertMode) {
        }
    }

    toggleEditMode(editMode: string) {
        this.storage.editModes[editMode] = !this.storage.editModes[editMode];
    }

    saveAndCalculate() {
        const batchUpdates = {
            applicationUpdates: [],
            applicationTruckUpdates: [],
            segmentUpdates: [],
            shiftInputUpdates: [],
        };

        /* APPLICATION */
        this.storage.selectedApplication.inputValues = Object.assign(
            this.storage.selectedApplication.inputValues,
            this.inputValuesForm.getRawValue(),
        );
        batchUpdates.applicationUpdates.push({
            id: this.storage.selectedApplication.id,
            payload: Application.toUpdateApplicationBeforeCalc(this.storage.selectedApplication),
        });

        /* SHIFT INPUT UPDATES */
        this.calcDuration(false);
        let i = 0;

        this.storage.shiftInputs.forEach(shift => {
            const temp = Object.assign(
                shift.inputValues,
                this.shiftInputValuesForms[i].getRawValue(),
            );
            const update = {
                inputValues: temp,
            };
            i++;
            batchUpdates.shiftInputUpdates.push({
                id: shift.id,
                payload: update,
            });

            /* SEGMENT UPDATES */
            if (shift.segments && shift.segments.length > 0) {
                batchUpdates.segmentUpdates.push({
                    applicationId: this.storage.selectedApplication.id,
                    shiftInputId: shift.id,
                    payload: shift.segments,
                });
            }
        });

        /* APPLICATION TRUCKS */
        for (const key in this.storage.applicationTrucksById) {
            if (this.storage.applicationTrucksById.hasOwnProperty(key)) {
                let obj = {
                    comment: this.storage.applicationTrucksById[key].comment,
                    energyConcept: this.storage.applicationTrucksById[key].energyConcept,
                    financeInfo: this.storage.applicationTrucksById[key].financeInfo,
                    flowPlanSelected: this.storage.applicationTrucksById[key].flowPlanSelected,
                    modifiedName: this.storage.applicationTrucksById[key].modifiedName,
                };

                if (this.storage.applicationTrucksById[key].expertCriteria) {
                    obj['expertCriteria'] = {
                        depositTimeSec:
                            this.storage.applicationTrucksById[key].expertCriteria.depositTimeSec,
                        recordingTimeSec:
                            this.storage.applicationTrucksById[key].expertCriteria.recordingTimeSec,
                        efficiencyFactor:
                            this.storage.applicationTrucksById[key].expertCriteria.efficiencyFactor,
                        palletsPerDrive:
                            this.storage.applicationTrucksById[key].expertCriteria.palletsPerDrive,
                        loadTime: this.storage.applicationTrucksById[key].expertCriteria.loadTime,
                        maxSpeed: this.storage.applicationTrucksById[key].expertCriteria.maxSpeed,
                        speedLimit:
                            this.storage.applicationTrucksById[key].expertCriteria.speedLimit,
                    };
                }

                batchUpdates.applicationTruckUpdates.push({
                    id: parseInt(key),
                    payload: obj,
                });
            }
        }

        // call batch service
        this.service.batchUpdateApplication(batchUpdates).then(
            res => {
                this.calculateApplication().then(
                    res => {
                        this.transformApplicationTrucks(res);
                        this.chartsSubject.next(this.storage);
                    },
                    err => {},
                );
            },
            err => {},
        );
    }

    calculateApplication(): Promise<any> {
        this.storage.allApplicationTrucksBeforeUpdate = JSON.parse(
            JSON.stringify(this.storage.allApplicationTrucks),
        );
        return this.service.calculateApplication(this.storage.selectedApplication.id);
    }

    /* ----------------- helpers */

    normalizeApplicationType(val: string): string {
        if (val) {
            if (val.charAt(0) === 'A') {
                return val;
            } else {
                return 'A' + val;
            }
        }
    }

    findTruckById(id): any {
        let val = null;
        if (this.storage.allTrucks) {
            this.storage.allTrucks.forEach(tr => {
                if (tr.id === id) val = tr;
            });
        }
        return val;
    }

    private transformApplicationTrucks(res: ApplicationTruck_DATA_prepared[]) {
        if (res) {
            this.storage.applicationTrucksById = {};
            res.forEach(tr => {
                const truck = {};
                this.storage.inputColumns.forEach(col => {
                    if (col.indexOf('HEADER') === -1) {
                        if (col === 'hourCounterYear') {
                            truck[col] =
                                tr.calculationResult.hourCounter *
                                this.storage.selectedApplication.settings.workingDays;
                        } else if (
                            col === 'identification' ||
                            col === 'model' ||
                            col === 'truckClass' ||
                            col === 'palletsPerDrive'
                        ) {
                            const baseTr = this.findTruckById(tr.truckId);
                            truck[col] = baseTr[col];
                        }
                    }
                });
                truck['expertCriteria'] = tr.expertCriteria;
                truck['calculationResult'] = tr.calculationResult;
                truck['calculationShiftResults'] = tr.calculationShiftResults;
                truck['financeInfo'] = tr.financeInfo;
                truck['financeShiftInfos'] = tr.financeShiftInfos;
                truck['flowPlanCalculationResult'] = tr.flowPlanCalculationResult;
                truck['flowPlanSelected'] = tr.flowPlanSelected;
                truck['modifiedName'] = tr.modifiedName;
                truck['comment'] = tr.comment;
                truck['additionalData'] = tr.additionalData;
                truck['truckId'] = tr.truckId;
                truck['id'] = tr.id;
                this.storage.applicationTrucksById[tr.id] = truck;
            });
            this.storage.inputColumnsFiltered.forEach(str => {
                this.storage.indicator[str] = { '0': false };
                let index = 1;
                for (const key in this.storage.applicationTrucksById) {
                    if (this.storage.applicationTrucksById.hasOwnProperty(key)) {
                        this.storage.indicator[str][index] = false;
                        index++;
                    }
                }
            });
        }
        for (let i = 0; i < res.length; i++) {
            res[i].position = i + 1;
        }
        this.storage.allApplicationTrucks = res;

        //this.storage.displayColumns = ['0'].concat(this.storage.allApplicationTrucks.map(x => x.position.toString()));
        this.storage.displayData = this.storage.inputColumns.map(x => this.formatInputRow(x));
        this.extendDisplayData();

        if (
            this.storage.allApplicationTrucksBeforeUpdate &&
            this.storage.allApplicationTrucksBeforeUpdate.length > 0
        ) {
            this.highlightIndicator();
            setTimeout(
                function () {
                    this.highlightIndicator(true);
                }.bind(this),
                600,
            );
        }
    }

    isEven(string: string): boolean {
        if (this.storage.inputColumnsFiltered) {
            return this.storage.inputColumnsFiltered.indexOf(string) % 2 == 0;
        }
    }

    hideRow(row) {
        if (row[0] === 'identification') return true;
        if (row[0] === 'position') return true;
        if (row[0] === 'id') return true;
        else {
            if (row[0].indexOf('expertCriteria') > -1) {
                if (this.storage.expertMode) return false;
                else return true;
            } else {
                return false;
            }
        }
    }

    isExpandable(column: any, element: any) {
        if (this.storage.shiftInputs.length === 0) return false;
        if (column === '0') {
            return this.storage.expandableColumns.indexOf(element['0']) > -1;
        } else return false;
    }

    isEditable(value: string) {
        if (
            value === 'financeInfo.buyingRent' ||
            value === 'financeInfo.salesPrice' ||
            value === 'financeInfo.financing' ||
            value === 'financeInfo.rate' ||
            value === 'financeInfo.residualValue' ||
            value === 'financeInfo.rent' ||
            value === 'financeInfo.maintenanceCosts' ||
            value === 'financeInfo.grossPay'
        ) {
            return this.storage.editModes.financeInfo;
        } else if (value === 'financeInfo.oneOffCosts') {
            return this.storage.editModes.oneOffCosts;
        } else {
            return false;
        }
    }

    checkBuyingRent(value: string, truckId: string) {
        if (!truckId) return true;
        if (value === 'financeInfo.rent') {
            return !this.storage.applicationTrucksById[truckId].financeInfo.buyingRent;
        }
        if (
            value === 'financeInfo.salesPrice' ||
            value === 'financeInfo.financing' ||
            value === 'financeInfo.rate' ||
            value === 'financeInfo.residualValue'
        ) {
            return this.storage.applicationTrucksById[truckId].financeInfo.buyingRent;
        } else return true;
    }

    highlightIndicator(forceFalse?: boolean) {
        this.storage.inputColumnsFiltered.forEach(str => {
            this.storage.indicator[str] = { '0': false };
            let index = 0;
            this.storage.allApplicationTrucks.forEach(tr => {
                this.storage.indicator[str][index + 1] = forceFalse
                    ? false
                    : this.checkValueForIndicator(
                          str,
                          this.storage.allApplicationTrucks[index],
                          this.storage.allApplicationTrucksBeforeUpdate[index],
                      );
                index++;
            });
        });
    }

    checkValueForIndicator(
        str: string,
        truck: ApplicationTruck_DATA_prepared,
        truckBefore: ApplicationTruck_DATA_prepared,
    ): boolean {
        if (str.indexOf('calculationResult') > -1) {
            const val = str.split('calculationResult.').pop();
            if (
                truck.calculationResult.hasOwnProperty(val) &&
                truckBefore.calculationResult.hasOwnProperty(val)
            ) {
                return truck.calculationResult[val] !== truckBefore.calculationResult[val];
            } else {
                return false;
            }
        } else if (str.indexOf('financeInfo') > -1) {
            const val = str.split('financeInfo.').pop();
            if (
                truck.financeInfo.hasOwnProperty(val) &&
                truckBefore.financeInfo.hasOwnProperty(val)
            ) {
                return truck.financeInfo[val] !== truckBefore.financeInfo[val];
            } else {
                return false;
            }
        } else return false;
    }

    selectShift(shift: any, i: number) {
        this.storage.selectedShift = shift;
        this.storage.selectedShift.index = i;
    }

    saveShiftFromForm(form: FormGroup) {
        if (form) {
            Object.keys(form.controls).forEach(key => {
                this.storage.selectedShift.inputValues[key] = form.controls[key].value;
            });
        }
    }

    openSegments(relationValue?) {
        let form = this.shiftInputValuesForms[this.storage.selectedShift.index];
        this.saveShiftFromForm(form);
        if (this.storage.selectedShift) {
            const dialogConfig = new MatDialogConfig();
            dialogConfig.autoFocus = false;
            dialogConfig.panelClass = ['largeDialog'];
            dialogConfig.data = {
                shiftInputs: [this.storage.selectedShift],
                value: relationValue ? relationValue : null,
            };

            const dialogRef = this.dialog.open(SegmentsDialogComponent, dialogConfig);
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    const inputValues = result[0].inputValues;
                    let totalFlow = 0;
                    result[0].segments.forEach(seg => {
                        totalFlow += seg.inputValues.flow;
                    });
                    this.storage.selectedShift.inputValues.flow = totalFlow;
                    form.controls['flow'].setValue(this.storage.selectedShift.inputValues.flow);
                }
            });
        }
    }

    openSegmentValues(shift, shiftInputs, value) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['mediumDialog'];
        dialogConfig.data = {
            shiftInputs: [shiftInputs],
            shiftValues: [shift],
            displayedValue: value,
        };

        const dialogRef = this.dialog.open(SegmentsDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }

    openFunction(val, relationValue?) {
        if (val === 'openSegments') {
            this.openSegments(relationValue);
        } else if (val === 'applyToAllShifts') {
            this.applyToAllShifts();
        }
    }

    applyToAllShifts() {
        if (this.shiftInputValuesForms.length > 0 && this.storage.selectedShift) {
            let formToCopy = this.shiftInputValuesForms[this.storage.selectedShift.index];
            let segmentsError = false;
            for (let k = 0; k < this.shiftInputValuesForms.length; k++) {
                let shiftForm = this.shiftInputValuesForms[k];
                if (k !== this.storage.selectedShift.index) {
                    let vals = formToCopy.getRawValue();
                    delete vals.durationHours;
                    delete vals.durationMinutes;
                    delete vals.durationShiftSec;
                    shiftForm.patchValue(vals);
                    if (
                        this.storage.selectedShift.segments &&
                        this.storage.shiftInputs[k].segments &&
                        this.storage.selectedShift.segments.length ===
                            this.storage.shiftInputs[k].segments.length
                    ) {
                        for (let i = 0; i < this.storage.shiftInputs[k].segments.length; i++) {
                            this.storage.shiftInputs[k].segments[i].inputValues = JSON.parse(
                                JSON.stringify(this.storage.selectedShift.segments[i].inputValues),
                            );
                        }
                    } else {
                        segmentsError = true;
                    }
                }
            }
            if (segmentsError) {
                this.toast.warning(
                    'PROJECTS.APPLICATION_DETAILS.COPYSHIFT_SEGMENTLENGTHWARNING_H1',
                );
            }
        }
    }

    inputChanged(row: any, isShift: boolean) {
        const model = row.model;
        let shift, form;

        if (model === 'numLorries' || model === 'numLoadsLorry') {
            if (isShift) {
                shift = this.storage.selectedShift;
                form = this.shiftInputValuesForms[shift.index];
            } else {
                form = this.inputValuesForm;
            }
            form.controls['flow'].setValue(
                form.controls['numLorries'].value * form.controls['numLoadsLorry'].value,
            );
            this.divideIntoSegments('flow', isShift);
        } else if (
            model === 'averageWeight' ||
            model === 'numLinesPicking' ||
            model === 'numItemsLine' ||
            model === 'numOrdersProcessed'
        ) {
            this.inputValuesForm.controls['load'].setValue(
                this.inputValuesForm.controls['numLinesPicking'].value *
                    this.inputValuesForm.controls['numItemsLine'].value *
                    this.inputValuesForm.controls['averageWeight'].value *
                    this.inputValuesForm.controls['numOrdersProcessed'].value,
            );

            if (this.storage.shiftInputs && this.storage.shiftInputs.length > 0) {
                for (let k = 0; k < this.storage.shiftInputs.length; k++) {
                    let tempForm = this.shiftInputValuesForms[k];
                    tempForm.controls['numbPackageDay'].setValue(
                        tempForm.controls['maxNumOrderShift'].value *
                            this.inputValuesForm.controls['numLinesPicking'].value *
                            this.inputValuesForm.controls['numItemsLine'].value,
                    );
                }
                this.divideIntoSegments('numbPackageDay', true);
            } else {
                this.inputValuesForm.controls['numbPackageDay'].setValue(
                    this.inputValuesForm.controls['maxNumOrderShift'].value *
                        this.inputValuesForm.controls['numLinesPicking'].value *
                        this.inputValuesForm.controls['numItemsLine'].value,
                );
                this.divideIntoSegments('numbPackageDay', false);
            }
        } else if (model === 'maxNumOrderShift') {
            if (this.storage.shiftInputs && this.storage.shiftInputs.length > 0) {
                for (let k = 0; k < this.storage.shiftInputs.length; k++) {
                    let tempForm = this.shiftInputValuesForms[k];
                    tempForm.controls['numbPackageDay'].setValue(
                        tempForm.controls['maxNumOrderShift'].value *
                            this.inputValuesForm.controls['numLinesPicking'].value *
                            this.inputValuesForm.controls['numItemsLine'].value,
                    );
                    this.divideIntoSegments('numbPackageDay', true);
                }
            } else {
                this.inputValuesForm.controls['numbPackageDay'].setValue(
                    this.inputValuesForm.controls['maxNumOrderShift'].value *
                        this.inputValuesForm.controls['numLinesPicking'].value *
                        this.inputValuesForm.controls['numItemsLine'].value,
                );
                this.divideIntoSegments('numbPackageDay', false);
            }
        } else if (model === 'numberOfShelfs' || model === 'lengthOfShelf') {
            this.inputValuesForm.controls['distanceInPickingZone'].setValue(
                this.inputValuesForm.controls['numberOfShelfs'].value *
                    this.inputValuesForm.controls['lengthOfShelf'].value,
            );
            if (
                this.normalizeApplicationType(this.storage.selectedApplication.applicationType) ===
                    'A6' ||
                this.normalizeApplicationType(this.storage.selectedApplication.applicationType) ===
                    'A7'
            ) {
                this.inputValuesForm.controls['distance'].setValue(
                    this.inputValuesForm.controls['distanceInPickingZone'].value +
                        this.inputValuesForm.controls['distanceDepositPallet'].value +
                        this.inputValuesForm.controls['distancePickingZone'].value +
                        this.inputValuesForm.controls['distancePickPallet'].value,
                );
            }
        } else if (
            model === 'distanceInPickingZone' ||
            model === 'distanceDepositPallet' ||
            model === 'distancePickingZone' ||
            model === 'distancePickPallet'
        ) {
            if (
                this.normalizeApplicationType(this.storage.selectedApplication.applicationType) ===
                    'A6' ||
                this.normalizeApplicationType(this.storage.selectedApplication.applicationType) ===
                    'A7'
            ) {
                this.inputValuesForm.controls['distance'].setValue(
                    this.inputValuesForm.controls['distanceInPickingZone'].value +
                        this.inputValuesForm.controls['distanceDepositPallet'].value +
                        this.inputValuesForm.controls['distancePickingZone'].value +
                        this.inputValuesForm.controls['distancePickPallet'].value,
                );
            }
        } else if (model === 'flow' || model === 'maxNumOrderShift' || model === 'numbPackageDay') {
            this.divideIntoSegments(model, false);
        }
    }

    divideIntoSegments(value: string, applyToAllShifts: boolean) {
        if (applyToAllShifts) {
            if (this.storage.shiftInputs && this.storage.shiftInputs.length > 0) {
                for (let k = 0; k < this.storage.shiftInputs.length; k++) {
                    let shift = this.storage.shiftInputs[k];
                    let form = this.shiftInputValuesForms[k];
                    let totalMin = shift.minutesAfterBreak;
                    if (shift.segments && shift.segments.length > 0) {
                        shift.segments.forEach(seg => {
                            let segDuration =
                                new Date(seg.toDate).getTime() - new Date(seg.fromDate).getTime();
                            let min = segDuration / (1000 * 60);
                            let breakTime = seg.breakTime;
                            seg.inputValues[value] =
                                Math.round(
                                    ((min - breakTime) / totalMin) *
                                        form.controls[value].value *
                                        100,
                                ) / 100;
                        });
                    }
                }
            }
        } else {
            if (this.storage.selectedShift) {
                let shift = this.storage.selectedShift;
                let form = this.shiftInputValuesForms[shift.index];
                let totalMin = shift.minutesAfterBreak;
                if (shift.segments && shift.segments.length > 0) {
                    shift.segments.forEach(seg => {
                        let segDuration =
                            new Date(seg.toDate).getTime() - new Date(seg.fromDate).getTime();
                        let min = segDuration / (1000 * 60);
                        let breakTime = seg.breakTime;
                        seg.inputValues[value] =
                            Math.round(
                                ((min - breakTime) / totalMin) * form.controls[value].value * 100,
                            ) / 100;
                    });
                }
            }
        }
    }

    activateCalcBtn(): boolean {
        let bool = true;
        if (!this.inputValuesForm || this.inputValuesForm.invalid) return false;
        if (
            this.storage.selectedApplication &&
            this.normalizeApplicationType(this.storage.selectedApplication.applicationType) ===
                'A7' &&
            (!this.pickStrategyForm || this.pickStrategyForm.invalid)
        )
            return false;
        if (!this.storage.allApplicationTrucks || this.storage.allApplicationTrucks.length < 1)
            return false;
        if (this.shiftInputValuesForms && this.shiftInputValuesForms.length > 0) {
            this.shiftInputValuesForms.forEach(f => {
                if (f.invalid) bool = false;
            });
        }
        return bool;
    }

    showUserGuidance() {}

    selectOtherApplication($event: MatSelectChange) {
        const selectedId = $event.value;
        this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() =>
                this.router.navigate([
                    'fp',
                    appRoutesNames.PROJECTS,
                    this.storage.selectedProject.id,
                    routeNamesProject.APPLICATIONS,
                    selectedId,
                ]),
            );
    }

    openTruckInfo(appTruckId) {
        let truck = this.storage.applicationTrucksById[appTruckId];
        if (this.storage.allTrucks) {
            this.storage.allTrucks.forEach(tr => {
                if (tr.id === truck.truckId) {
                    const dialogConfig = new MatDialogConfig();
                    dialogConfig.autoFocus = false;
                    dialogConfig.panelClass = ['largeDialog'];
                    dialogConfig.data = {
                        applicationTruck: JSON.parse(JSON.stringify(truck)),
                        truckInfo: JSON.parse(JSON.stringify(tr)),
                    };

                    const dialogRef = this.dialog.open(TruckInfoDialogComponent, dialogConfig);
                    dialogRef.afterClosed().subscribe(result => {
                        if (result) {
                            this.service
                                .updateApplicationTruck(
                                    {
                                        modifiedName: result.applicationTruck.modifiedName,
                                        comment: result.applicationTruck.comment,
                                    },
                                    appTruckId,
                                )
                                .then(res => {
                                    this.toast.success(
                                        'PROJECTS.APPLICATION_DETAILS.EDIT_APPLICATION_TRUCK_SUCCESS',
                                    );
                                    this.service
                                        .getApplicationTrucks(this.storage.selectedApplicationId)
                                        .then(
                                            res => {
                                                this.transformApplicationTrucks(res);
                                                this.chartsSubject.next(this.storage);
                                            },
                                            err => {},
                                        );
                                });
                        }
                    });
                }
            });
        }
    }

    getInfoColor(tr: any) {
        let color = {
            color: 'rgba(0,0,0,0.54)',
        };
        if (
            tr.calculationResult &&
            tr.calculationResult.errorMessages &&
            tr.calculationResult.errorMessages.length > 0
        ) {
            color = {
                color: 'rgba(186,17,38,1)',
            };
            return color;
        }
        if (tr.expertCriteria && tr.expertCriteria.modified) {
            color = {
                color: 'rgb(255, 142, 56)',
            };
            return color;
        }
        return color;
    }
}
