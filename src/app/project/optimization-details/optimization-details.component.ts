import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { OptimizationDetailsService } from '@app/project/optimization-details/optimization-details.service';
import { Optimization_DATA } from '@shared/models/Optimization';
import { MatTableDataSource } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { Settings_DATA } from '@shared/models/UserSettings';
import { ConfirmDialogComponent } from '@shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { AddGroupDialogComponent } from '@app/project/optimization-details/dialogs/add-group.dialog/add-group.dialog.component';
import { GroupNetworkDialogComponent } from '@app/project/optimization-details/dialogs/group-network.dialog/group-network.dialog.component';
import { OptimizationTruck_DATA } from '@shared/models/OptimizationTruck';
import { OptimizationApplication_DATA } from '@shared/models/OptimizationApplication';
import { PromptDialogComponent } from '@shared/components/dialogs/prompt-dialog/prompt-dialog.component';
import { appRoutesNames } from '@app/app.routes.names';
import { routeNamesProject } from '@app/project/project.routes.names';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-optimization-details',
    templateUrl: './optimization-details.component.html',
    styleUrls: ['./optimization-details.component.css'],
})
export class OptimizationDetailsComponent implements OnInit {
    barChartOptions: ChartOptions = {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };
    barChartLegend = true;
    barChartType: ChartType = 'bar';
    barChartPlugins = [];
    barChartLabels = [
        this.translate.instant('PROJECTS.OPTIMIZATION_DETAILS.BEFOREOPT'),
        this.translate.instant('PROJECTS.OPTIMIZATION_DETAILS.AFTEROPT'),
    ];
    barChartData: ChartDataset[] = [
        {
            data: [0, 0],
            label: this.translate.instant('GLOBAL.TRUCK.FINANCEINFO.OVERALLPERSONALCOSTS'),
            stack: 'a',
        },
        {
            data: [0, 0],
            label: this.translate.instant('GLOBAL.TRUCK.FINANCEINFO.OVERALLCONSUMPTIONSCOSTS'),
            stack: 'a',
        },
        {
            data: [0, 0],
            label: this.translate.instant('GLOBAL.TRUCK.FINANCEINFO.OVERALLMAINTENANCECOSTS'),
            stack: 'a',
        },
    ];
    @ViewChild(BaseChartDirective) chart: BaseChartDirective;
    storage = {
        selectedOptimizationId: null,
        selectedOptimization: <Optimization_DATA>null,
        selectedProject: null,
        displayPerTruck: false,
        projectSettings: <Settings_DATA>null,
        currency: '€',
    };
    dataSourcePerTruck: any[] = [];

    dataSourcePre = new MatTableDataSource([]);
    dataSourcePost = new MatTableDataSource([]);
    dataSourceSavings = new MatTableDataSource([]);
    dataSourceSummary = new MatTableDataSource([]);
    sortTruck: Sort = {
        active: 'truck',
        direction: 'asc',
    };
    displayedColumnsPerTruck: string[] = ['key', 'before', 'after', 'savings', 'BTN_COLLAPSE'];
    displayedColumns: string[] = [
        'identification',
        'totalCount',
        'workload',
        'totalCountDriver',
        'totalCost',
        'BTN_COLLAPSE',
    ];
    displayedColumnsSummary: string[] = ['key', 'before', 'after', 'savings'];

    constructor(
        private masterDataStore: MasterDataStore,
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private translate: TranslateService,
        private service: OptimizationDetailsService,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.storage.selectedOptimizationId = params['id'];
        });

        this.storage.selectedProject = this.masterDataStore.selectedProject;

        this.service.getOptimizationById(this.storage.selectedOptimizationId).then(
            res => {
                if (res) {
                    this.storage.selectedOptimization = res;
                    this.prepareTableData();
                    this.prepareCharts();
                }
            },
            err => {},
        );

        this.service.getProjectSettings(this.masterDataStore.selectedProject.id).then(
            res => {
                if (res) {
                    this.storage.projectSettings = res.settings;
                    if (this.storage.projectSettings.currency) {
                        this.storage.currency = this.storage.projectSettings.currency;
                    }
                }
            },
            err => {},
        );
    }
    prepareCharts() {
        const barChart = {
            labels: [],
            personalCosts: [],
            financialCosts: [],
            energyCost: [],
        };
        barChart.personalCosts.push(
            this.storage.selectedOptimization.optData[0].preOpt.costs.overallPersonalCosts,  // personalCosts pre
        );
        barChart.personalCosts.push(
            this.storage.selectedOptimization.optData[0].postOpt.costs.overallPersonalCosts // personalCosts post
        );
        barChart.financialCosts.push(
            this.storage.selectedOptimization.optData[0].preOpt.costs.overallCarCosts // financialCosts pre car costs
        );
        barChart.financialCosts.push(
            this.storage.selectedOptimization.optData[0].postOpt.costs.overallCarCosts // financialCosts post
        );
        barChart.energyCost.push(
            this.storage.selectedOptimization.optData[0].preOpt.costs.overallConsumptionsCosts +
            this.storage.selectedOptimization.optData[0].preOpt.costs.overallMaintenanceCosts // energyCost pre
        );
        barChart.energyCost.push(
            this.storage.selectedOptimization.optData[0].postOpt.costs.overallConsumptionsCosts +
            this.storage.selectedOptimization.optData[0].postOpt.costs.overallMaintenanceCosts // energyCost post
        );
        this.barChartData[0].data = barChart.personalCosts;
        this.barChartData[1].data = barChart.financialCosts;
        this.barChartData[2].data = barChart.energyCost;
        setTimeout(() => {
            //prevent empty canvas or canvas not updating
            if (this.chart) {
                this.chart.update();
            }
        }, 100);
    }
    prepareTableData() {
        let totals = {
            preOpt: 0,
            postOpt: 0,
            savings: 0,
        };
        if (this.storage.selectedOptimization && this.storage.selectedOptimization.optData) {
            /* tables: per truck */
            this.storage.selectedOptimization.optData.forEach(truckOptData => {
                let newTable = new MatTableDataSource();

                let shiftsTotalCount = {
                    before: [],
                    after: [],
                    savings: [],
                    info: [],
                };
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCount.info.push(truckOptData.preOpt.shifts[i].info);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCount.before.push(truckOptData.preOpt.shifts[i].totalCount);
                }
                for (let i = 0; i < truckOptData.postOpt.shifts.length; i++) {
                    shiftsTotalCount.after.push(truckOptData.postOpt.shifts[i].totalCount);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCount.savings.push(
                        Math.abs(truckOptData.postOpt.totalCount - truckOptData.preOpt.totalCount),
                    );
                }
                let entryTotalCount = {
                    key: 'totalCount',
                    before: truckOptData.preOpt.totalCount,
                    after: truckOptData.postOpt.totalCount,
                    savings: Math.abs(
                        truckOptData.postOpt.totalCount - truckOptData.preOpt.totalCount,
                    ),
                    shifts: shiftsTotalCount,
                };

                let shiftsWorkload = {
                    before: [],
                    after: [],
                    savings: [],
                    info: [],
                };
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsWorkload.info.push(truckOptData.preOpt.shifts[i].info);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsWorkload.before.push(truckOptData.preOpt.shifts[i].workload);
                }
                for (let i = 0; i < truckOptData.postOpt.shifts.length; i++) {
                    shiftsWorkload.after.push(truckOptData.postOpt.shifts[i].workload);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsWorkload.savings.push(
                        Math.abs(truckOptData.postOpt.workload - truckOptData.preOpt.workload),
                    );
                }
                let entryWorkload = {
                    key: 'workload',
                    before: truckOptData.preOpt.workload,
                    after: truckOptData.postOpt.workload,
                    savings: Math.abs(truckOptData.postOpt.workload - truckOptData.preOpt.workload),
                    shifts: shiftsWorkload,
                };

                let shiftsTotalCountDriver = {
                    before: [],
                    after: [],
                    savings: [],
                    info: [],
                };
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCountDriver.info.push(truckOptData.preOpt.shifts[i].info);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCountDriver.before.push(
                        truckOptData.preOpt.shifts[i].totalCountDriver,
                    );
                }
                for (let i = 0; i < truckOptData.postOpt.shifts.length; i++) {
                    shiftsTotalCountDriver.after.push(
                        truckOptData.postOpt.shifts[i].totalCountDriver,
                    );
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCountDriver.savings.push(
                        Math.abs(
                            truckOptData.postOpt.totalCountDriver -
                                truckOptData.preOpt.totalCountDriver,
                        ),
                    );
                }
                let entryTotalCountDriver = {
                    key: 'totalCountDriver',
                    before: truckOptData.preOpt.totalCountDriver,
                    after: truckOptData.postOpt.totalCountDriver,
                    savings: Math.abs(
                        truckOptData.postOpt.totalCountDriver -
                            truckOptData.preOpt.totalCountDriver,
                    ),
                    shifts: shiftsTotalCountDriver,
                };

                let shiftsTotalCost = {
                    before: [],
                    after: [],
                    savings: [],
                    info: [],
                };
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCost.info.push(truckOptData.preOpt.shifts[i].info);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCost.before.push(truckOptData.preOpt.shifts[i].totalCost);
                }
                for (let i = 0; i < truckOptData.postOpt.shifts.length; i++) {
                    shiftsTotalCost.after.push(truckOptData.postOpt.shifts[i].totalCost);
                }
                for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                    shiftsTotalCost.savings.push(
                        Math.abs(truckOptData.postOpt.totalCost - truckOptData.preOpt.totalCost),
                    );
                }
                let entryTotalCost = {
                    key: 'totalCost',
                    before: truckOptData.preOpt.totalCost,
                    after: truckOptData.postOpt.totalCost,
                    savings: Math.abs(
                        truckOptData.postOpt.totalCost - truckOptData.preOpt.totalCost,
                    ),
                    shifts: shiftsTotalCost,
                };
                newTable.data = [
                    entryTotalCount,
                    entryWorkload,
                    entryTotalCountDriver,
                    entryTotalCost,
                ];
                this.dataSourcePerTruck.push({
                    truck: truckOptData.truck,
                    optTable: newTable,
                });

                /* fill totals data for totals table */
                totals.preOpt += truckOptData.preOpt.totalCost;
                totals.postOpt += truckOptData.postOpt.totalCost;
                totals.savings += Math.abs(
                    truckOptData.postOpt.totalCost - truckOptData.preOpt.totalCost,
                );
            });

            /* tables: before, after, savings */
            let arrPre = [],
                arrPost = [],
                arrSavings = [];
            if (this.storage.selectedOptimization && this.storage.selectedOptimization.optData) {
                this.storage.selectedOptimization.optData.forEach(truckOptData => {
                    let entryPre = {
                        identification: truckOptData.truck.identification,
                        totalCount: truckOptData.preOpt.totalCount,
                        workload: truckOptData.preOpt.workload,
                        totalCountDriver: truckOptData.preOpt.totalCountDriver,
                        totalCost: truckOptData.preOpt.totalCost,
                        shifts: truckOptData.preOpt.shifts,
                        expanded: false,
                    };
                    let entryPost = {
                        identification: truckOptData.truck.identification,
                        totalCount: truckOptData.postOpt.totalCount,
                        workload: truckOptData.postOpt.workload,
                        totalCountDriver: truckOptData.postOpt.totalCountDriver,
                        totalCost: truckOptData.postOpt.totalCost,
                        shifts: truckOptData.postOpt.shifts,
                        expanded: false,
                    };

                    let arrShiftsSavings = [];
                    for (let i = 0; i < truckOptData.preOpt.shifts.length; i++) {
                        let el = {
                            info: {
                                id: truckOptData.preOpt.shifts[i].info.id,
                                name: truckOptData.preOpt.shifts[i].info.name,
                            },
                            costs: {
                                overallCarCosts:
                                    truckOptData.postOpt.shifts[i].costs.overallCarCosts -
                                    truckOptData.preOpt.shifts[i].costs.overallCarCosts,
                                overallConsumptionsCosts:
                                    truckOptData.postOpt.shifts[i].costs.overallConsumptionsCosts -
                                    truckOptData.preOpt.shifts[i].costs.overallConsumptionsCosts,
                                overallMaintenanceCosts:
                                    truckOptData.postOpt.shifts[i].costs.overallMaintenanceCosts -
                                    truckOptData.preOpt.shifts[i].costs.overallMaintenanceCosts,
                                overallPersonalCosts:
                                    truckOptData.postOpt.shifts[i].costs.overallPersonalCosts -
                                    truckOptData.preOpt.shifts[i].costs.overallPersonalCosts,
                            },
                            totalCost:
                                truckOptData.postOpt.shifts[i].totalCost -
                                truckOptData.preOpt.shifts[i].totalCost,
                            totalCount:
                                truckOptData.postOpt.shifts[i].totalCount -
                                truckOptData.preOpt.shifts[i].totalCount,
                            totalCountDriver:
                                truckOptData.postOpt.shifts[i].totalCountDriver -
                                truckOptData.preOpt.shifts[i].totalCountDriver,
                            totalNumber:
                                truckOptData.postOpt.shifts[i].totalNumber -
                                truckOptData.preOpt.shifts[i].totalNumber,
                            workload:
                                truckOptData.postOpt.shifts[i].workload -
                                truckOptData.preOpt.shifts[i].workload,
                        };
                        arrShiftsSavings.push(el);
                    }

                    let entrySavings = {
                        identification: truckOptData.truck.identification,
                        totalCount: Math.abs(
                            truckOptData.postOpt.totalCount - truckOptData.preOpt.totalCount,
                        ),
                        workload: Math.abs(
                            truckOptData.postOpt.workload - truckOptData.preOpt.workload,
                        ),
                        totalCountDriver: Math.abs(
                            truckOptData.postOpt.totalCountDriver -
                                truckOptData.preOpt.totalCountDriver,
                        ),
                        totalCost: Math.abs(
                            truckOptData.postOpt.totalCost - truckOptData.preOpt.totalCost,
                        ),
                        shifts: arrShiftsSavings,
                        expanded: false,
                    };
                    arrPre.push(entryPre);
                    arrPost.push(entryPost);
                    arrSavings.push(entrySavings);
                });
            }
            this.dataSourcePre.data = arrPre;
            this.dataSourcePost.data = arrPost;
            this.dataSourceSavings.data = arrSavings;

            this.dataSourceSummary.data = [
                {
                    key: null,
                    before: totals.preOpt,
                    after: totals.postOpt,
                    savings: totals.savings,
                },
            ];
        }
    }

    toggleTableView() {
        this.storage.displayPerTruck = !this.storage.displayPerTruck;
    }

    changeOptimizationName() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.OPTIMIZATION_DETAILS.CHANGE_OPT_NAME.TITLE',
                content: 'PROJECTS.OPTIMIZATION_DETAILS.CHANGE_OPT_NAME.CONTENT',
                name: 'PROJECTS.OPTIMIZATION_DETAILS.CHANGE_OPT_NAME.NAME',
                save: 'GLOBAL.CREATE',
            },
            value: this.storage.selectedOptimization.name,
        };
        const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }

    deleteOptimization() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.OPTIMIZATION_DETAILS.DELETE_OPT.TITLE',
                content: 'PROJECTS.OPTIMIZATION_DETAILS.DELETE_OPT.CONTENT',
                save: 'GLOBAL.CONTINUE',
            },
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }

    showUserGuidance() {}

    openAddGroup() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['mediumDialog'];
        dialogConfig.data = {
            optimizationApplications: this.storage.selectedOptimization.optimizationApplications,
        };

        const dialogRef = this.dialog.open(AddGroupDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                result.forEach(res => {
                    this.storage.selectedOptimization.optimizationApplications.forEach(oa => {
                        if (res.application.id === oa.application.id) {
                            oa.group = res.group;
                        }
                    });
                });
            }
        });
    }

    openGroupNetwork() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['mediumDialog'];
        dialogConfig.data = {
            opt: this.storage.selectedOptimization,
        };

        const dialogRef = this.dialog.open(GroupNetworkDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
            }
        });
    }

    selectAppTruck(truck: OptimizationTruck_DATA, optApp: OptimizationApplication_DATA) {
        if (!optApp.selected) return;
        optApp.optimizationTrucks.forEach(tr => {
            tr.selected = tr.id === truck.id;
        });
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

    openShifts(el) {
        el.expanded = !el.expanded;
    }
}
