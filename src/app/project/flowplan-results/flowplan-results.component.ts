import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {FlowplanResultsService} from "@app/project/flowplan-results/flowplan-results.service";
import {ApplicationTruck_DATA} from "@shared/models/ApplicationTruck";
import {
    FlowPlanApplication_DATA,
    FlowPlanApplicationTruck_DATA,
    FlowPlanTruckSet
} from "@shared/models/FlowPlanTruckSet";
import {takeUntil} from "rxjs/operators";
import {SimpleTruck_DATA} from "@shared/models/SimpleTruck";
import {Project_DATA} from "@shared/models/Project";
import { ChartOptions, ChartType } from 'chart.js';

@Component({
    selector: 'app-flowplan-results',
    templateUrl: './flowplan-results.component.html',
    styleUrls: ['./flowplan-results.component.scss']
})
export class FlowplanResultsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    Math = Math;
    parseFloat = parseFloat;
    storage = {
        selectedProject: null,
        projectData: <Partial<Project_DATA>>null,
        flowPlanTrucks: <FlowPlanApplicationTruck_DATA[]>[],
        flowPlanApplications: <FlowPlanApplication_DATA[]>[],
        allTrucks: <SimpleTruck_DATA[]>[],
        tablesPerTruck: {},
        chartsPerTruck: {},
        chartOptions: <ChartOptions[]>[{
            responsive: true,
        },{
            responsive: true,
        }],
        collapsableMenu:{}
    }

    constructor(private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private service: FlowplanResultsService) {

        this.storage.selectedProject = masterDataStore.selectedProject;
    }

    ngOnInit(): void {
        this.masterDataStore.trucks_changed.pipe(
            takeUntil(this.ngUnsubscribe)
        ).subscribe(trucks=>{
            if(trucks){
                this.storage.allTrucks = trucks;
                this.refreshData();
            }
        });

    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        this.storage.collapsableMenu[-1] = true;
        this.service.getFlowPlanResults(this.storage.selectedProject.id).then(res=>{
            if(res){
                this.storage.projectData = res.project;
                this.storage.flowPlanApplications = res.applications;

                this.storage.flowPlanApplications.forEach(app=>{
                    app.applicationTrucks.forEach(tr=>{
                        if(tr.flowPlanSelected){
                            this.storage.collapsableMenu[tr.id] = true;
                            this.storage.tablesPerTruck[tr.id] = [];
                            this.storage.chartsPerTruck[tr.id] = [];
                            tr.truckName = this.findTruckName(tr.truckId);
                            tr.truckClassification = this.findTruckClassification(tr.truckId);

                            let table1 = [];
                            table1.push({calcNumberCars:tr.flowPlanCalculationResult.calcNumberCarsM2, name: tr.truckName, calcUtilizationRate: tr.flowPlanCalculationResult.calcUtilizationRateM2});
                            table1.push({calcNumberCars:tr.flowPlanCalculationResult.calcNumberCarsM1, name: tr.truckName, calcUtilizationRate: tr.flowPlanCalculationResult.calcUtilizationRateM1});
                            table1.push({calcNumberCars:tr.flowPlanCalculationResult.calcNumberCars, name: tr.truckName, calcUtilizationRate: tr.flowPlanCalculationResult.calcUtilizationRate});
                            table1.push({calcNumberCars:tr.flowPlanCalculationResult.calcNumberCarsP1, name: tr.truckName, calcUtilizationRate: tr.flowPlanCalculationResult.calcUtilizationRateP1});
                            table1.push({calcNumberCars:tr.flowPlanCalculationResult.calcNumberCarsP2, name: tr.truckName, calcUtilizationRate: tr.flowPlanCalculationResult.calcUtilizationRateP2});
                            this.storage.tablesPerTruck[tr.id].push(table1);

                            let table2 = [];
                            table2.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE2.D1', value: this.storage.projectData.processDurationAfterBreak});
                            table2.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE2.D2', value: tr.flowPlanCalculationResult.requiredLoadsPerCycle});
                            table2.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE2.D3', value: tr.flowPlanCalculationResult.possibleLoadsPerCycle});
                            table2.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE2.D4', value: tr.flowPlanCalculationResult.emptyCycleRate});
                            this.storage.tablesPerTruck[tr.id].push(table2);

                            let table3 = [];
                            table3.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE3.D1', value: tr.expertCriteria.efficiencyFactor});
                            table3.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE3.D2', value: tr.expertCriteria.recordingTimeSec});
                            table3.push({label: 'PROJECTS.FLOWPLANRESULTS.TABLE3.D3', value: tr.expertCriteria.depositTimeSec});
                            this.storage.tablesPerTruck[tr.id].push(table3);

                            let arr = [];

                            let val = tr.flowPlanCalculationResult.calcUtilizationRateM2;
                            if(val>0) arr.push(val);
                            else arr.push(0);

                            let val2 = tr.flowPlanCalculationResult.calcUtilizationRateM1;
                            if(val2>0) arr.push(val2);
                            else arr.push(0);

                            let val3 = tr.flowPlanCalculationResult.calcUtilizationRate;
                            if(val3>0) arr.push(val3);
                            else arr.push(0);

                            let val4 = tr.flowPlanCalculationResult.calcUtilizationRateP1;
                            if(val4>0) arr.push(val4);
                            else arr.push(0);

                            let val5 = tr.flowPlanCalculationResult.calcUtilizationRateP2;
                            if(val5>0) arr.push(val5);
                            else arr.push(0);

                            let greyColor = getComputedStyle(document.documentElement)
                                .getPropertyValue('--gray-300');
                            let highlightColor = getComputedStyle(document.documentElement)
                                .getPropertyValue('--brand-500');
                            let highlightColorSecond = getComputedStyle(document.documentElement)
                                .getPropertyValue('--brand-700');

                            let dataSet =  [{
                                data: arr,
                                label: 'AGV Quantity' ,
                                backgroundColor:[greyColor,greyColor,highlightColor,greyColor,greyColor],
                                hoverBackgroundColor:[highlightColorSecond,highlightColorSecond,highlightColorSecond,highlightColorSecond,highlightColorSecond]
                            }];
                            this.storage.chartsPerTruck[tr.id].push({
                                dataSet: dataSet,
                                labels: [
                                    (tr.flowPlanCalculationResult.calcNumberCarsM2 > 0) ? tr.flowPlanCalculationResult.calcNumberCarsM2 : '---',
                                    (tr.flowPlanCalculationResult.calcNumberCarsM1 > 0) ? tr.flowPlanCalculationResult.calcNumberCarsM1 : '---',
                                    (tr.flowPlanCalculationResult.calcNumberCars > 0) ? tr.flowPlanCalculationResult.calcNumberCars : '---',
                                    (tr.flowPlanCalculationResult.calcNumberCarsP1 > 0) ? tr.flowPlanCalculationResult.calcNumberCarsP1 : '---',
                                    (tr.flowPlanCalculationResult.calcNumberCarsP2 > 0) ? tr.flowPlanCalculationResult.calcNumberCarsP2 : '---'
                                ]
                            });



                            let emptyMissionRate = (tr.flowPlanCalculationResult.hasOwnProperty('emptyCycleRate') && tr.flowPlanCalculationResult.emptyCycleRate!==undefined && tr.flowPlanCalculationResult.emptyCycleRate!==null) ? tr.flowPlanCalculationResult.emptyCycleRate : 0;
                            let idleRate = 1 - tr.flowPlanCalculationResult.calcUtilizationRate;
                            let blockRate = app.flowPlanValues.assessedBlockingTime/100;
                            let lossRate = 0;
                            let loadedMissionRate = (tr.flowPlanCalculationResult.hasOwnProperty('loadedMissionRate') && tr.flowPlanCalculationResult.loadedMissionRate!==undefined && tr.flowPlanCalculationResult.loadedMissionRate!==null) ? tr.flowPlanCalculationResult.loadedMissionRate : (1-emptyMissionRate-idleRate-blockRate-lossRate);

                            let arr2 =  [emptyMissionRate, loadedMissionRate, idleRate, blockRate];
                            let dataSet2 =  [{
                                data: arr2,
                                label: 'Analysis of vehicle activity' ,
                                backgroundColor:[greyColor,
                                    highlightColor,
                                    '#e4e4e4',
                                    '#e46777'],
                                hoverBackgroundColor:[highlightColorSecond,highlightColorSecond,highlightColorSecond,highlightColorSecond]
                            }];
                            this.storage.chartsPerTruck[tr.id].push({
                                dataSet: dataSet2,
                                labels: [
                                    this.translateService.instant('PROJECTS.FLOWPLANRESULTS.FLOWPLANRESULTS_PIE_EMPTYMISSIONRATE'),
                                    this.translateService.instant('PROJECTS.FLOWPLANRESULTS.FLOWPLANRESULTS_PIE_LOADEDMISSIONRATE'),
                                    this.translateService.instant('PROJECTS.FLOWPLANRESULTS.FLOWPLANRESULTS_PIE_IDLERATE'),
                                    this.translateService.instant('PROJECTS.FLOWPLANRESULTS.FLOWPLANRESULTS_PIE_BLOCKRATE'),
                                ]
                            });

                            tr.application = app;
                            this.storage.flowPlanTrucks.push(tr);
                        }
                    })
                });
            }
        },err=>{

        });
    }

    toggleCollapsableMenu(id){
        this.storage.collapsableMenu[id] = !this.storage.collapsableMenu[id];
    }

    findTruckName(truckId) {
        let name = "";
        if(this.storage.allTrucks){
            this.storage.allTrucks.forEach(tr=>{
                if(tr.id === truckId) name = tr.identification;
            })
        }
        return name;
    }

    findTruckClassification(truckId) {
        let classification = "";
        if(this.storage.allTrucks){
            this.storage.allTrucks.forEach(tr=>{
                if(tr.id === truckId) classification = tr.classification;
            })
        }
        return classification;
    }

    enablePricing() {
        // collect elements/trucks from warehouse/applications
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
