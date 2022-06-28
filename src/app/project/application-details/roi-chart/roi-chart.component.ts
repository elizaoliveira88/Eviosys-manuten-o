import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ChartEvent, ChartOptions, ChartType, LegendItem, TooltipItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApplicationDetailsService } from '@app/project/application-details/application-details.service';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-roi-chart',
    templateUrl: './roi-chart.component.html',
    styleUrls: ['./roi-chart.component.scss'],
    providers: [DecimalPipe],
})
export class RoiChartComponent implements OnInit {
    lineChartData: any[] = [];
    lineChartType: ChartType = 'line';
    lineChartLabels = [];
    lineChartLegend = true;
    lineChartOptions: ChartOptions = {
        responsive: true,
        animation: {
            onComplete: animation => {
                //$scope.onRoiImageChanged(animation.chartInstance.toBase64Image());
                const canvasToBase64 = animation.chart.toBase64Image();
                if (
                    this.imgShouldUpdate &&
                    canvasToBase64 &&
                    canvasToBase64 !== '' &&
                    canvasToBase64 !== 'data:,'
                )
                    this.onRoiImageChanged(canvasToBase64);
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: (context: TooltipItem<'line'>[]) => {
                        let title = '';
                        if (context[0].datasetIndex !== 0) {
                            if (context[0].parsed.x === 0)
                                title = this.translateService.instant(
                                    'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_START',
                                );
                            else if (context[0].parsed.x === 1)
                                title =
                                    context[0].parsed.x +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_YEAR',
                                    );
                            else
                                title =
                                    context[0].parsed.x +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_YEARS',
                                    );
                        } else {
                            const all = context[0].parsed.x;
                            const years = Math.floor(all);
                            const days = Math.floor(
                                (all - years) *
                                    this.storage.selectedApplication.settings.workingDays,
                            );

                            title = this.translateService.instant(
                                'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_PAYBACK',
                            );
                            if (years > 1)
                                title +=
                                    ' ' +
                                    years +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_YEARS',
                                    ) +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_AND',
                                    );
                            else if (years === 1)
                                title +=
                                    ' ' +
                                    years +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_YEAR',
                                    ) +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_AND',
                                    );

                            if (days > 1 || days === 0)
                                title +=
                                    ' ' +
                                    days +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_DAYS',
                                    );
                            else if (days === 1)
                                title +=
                                    ' ' +
                                    days +
                                    ' ' +
                                    this.translateService.instant(
                                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_INTERSECT_DAY',
                                    );
                        }
                        return title;
                    },
                    afterTitle: (context: TooltipItem<'line'>[]) => {
                        if (context[0].datasetIndex !== 0) {
                            return 'Fhz: ' + context[0].dataset.label;
                        }
                    },
                    beforeFooter: (context: TooltipItem<'line'>[]) => {
                        if (context[0].datasetIndex === 0) {
                            const multiLine = [
                                this.lineChartData[
                                    this.lineChartData[0].data[context[0].datasetIndex].line1
                                ].label,
                            ];
                            multiLine.push(
                                this.lineChartData[
                                    this.lineChartData[0].data[context[0].datasetIndex].line2
                                ].label,
                            );
                            return multiLine;
                        }
                    },
                    label: (context: TooltipItem<'line'>) => {
                        let label = this._decimalPipe.transform(context.parsed.y, '1.0-2') || '';
                        if (label !== '') {
                            label += this.storage.selectedApplication.settings?.currency
                                ? this.storage.selectedApplication.settings.currency
                                : '€';
                        }
                        return label;
                    },
                },
            },
            legend: {
                labels: {
                    filter: (item, chart) => {
                        // Logic to remove a particular legend item goes here
                        return item.text == null || !item.text.includes('Intersections');
                    },
                },
                onClick: (e: ChartEvent, legendItem: LegendItem, legend) => {
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    if (ci.isDatasetVisible(index)) {
                        ci.hide(index);
                        legendItem.hidden = true;
                    } else {
                        ci.show(index);
                        legendItem.hidden = false;
                    }
                    setTimeout(() => {
                        this.getInt();
                        //prevent empty canvas or canvas not updating
                        if (this.chart) {
                            this.chart.update();
                        }
                    }, 1000);
                },
            },
        },
        scales: {
            x: {
                type: 'linear',
                beginAtZero: true,
                min: 0,
                title: {
                    display: true,
                    text: this.translateService.instant(
                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_XLABEL',
                    ),
                },
                ticks: {
                    display: true,
                    stepSize: 0.2,
                    callback: (value, index, ticks) => {
                        return Number(value) % 1 === 0 ? value : '';
                    },
                },
            },
            y: {
                type: 'linear',
                beginAtZero: true,
                min: 0,
                title: {
                    display: true,
                    text: this.translateService.instant(
                        'PROJECTS.APPLICATION_DETAILS.CHARTS.ROICHART_YLABEL',
                    ),
                },
                ticks: {
                    display: true,
                    callback: (value, index, ticks) => {
                        const currency = this.storage.selectedApplication?.settings?.currency
                            ? this.storage.selectedApplication?.settings.currency
                            : '€';
                        return value + currency;
                    },
                },
            },
        },
    };
    chartYears = 1;
    storage: any = {};
    _val: Subject<any> = new Subject();
    private readonly unsubscribe$: Subject<void> = new Subject();
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input() imgShouldUpdate;
    @Input()
    set events(val: Subject<any>) {
        this._val = val;
    }

    constructor(
        private translateService: TranslateService,
        private service: ApplicationDetailsService,
        private _decimalPipe: DecimalPipe,
    ) {}

    ngOnInit(): void {
        this._val.pipe(takeUntil(this.unsubscribe$)).subscribe(x => {
            this.storage = x;
            this.calculateChart();
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    updateChartYears(event) {
        this.chartYears = event;
        this.calculateChart();
        this.imgShouldUpdate = true;
    }

    calculateChart() {
        const lineChart = {
            labels: Array.from({ length: this.chartYears + 1 }, (_, index) => index),
            data: [],
        };
        Object.keys(this.storage.applicationTrucksById).forEach((key: string) => {
            const truck = this.storage.applicationTrucksById[key];
            if (
                truck.financeInfo.aggregateCostYear !== null &&
                truck.financeInfo.aggregateCostYear !== undefined
            ) {
                const line = { data: [], label: truck.identification };
                line.data.push({
                    x: 0,
                    y: truck.financeInfo.oneOffCosts,
                });
                for (let i = 1; i <= this.chartYears; i++) {
                    line.data.push({
                        x: i,
                        y: truck.financeInfo.aggregateCostYear * i + truck.financeInfo.oneOffCosts,
                    });
                }
                lineChart.data.push(line);
            }
        });
        if (lineChart.data.length != 0) {
            this.lineChartLabels = lineChart.labels;
            this.lineChartData = lineChart.data;
            this.getInt();
        }
        setTimeout(() => {
            //prevent empty canvas or canvas not updating
            if (this.chart) {
                this.chart.update();
            }
        }, 100);
    }

    getInt() {
        let allInterSects = [];
        for (let i = 0; i < this.lineChartData.length; i++) {
            if (this.lineChartData[i].label !== 'Intersections') {
                for (let k = 1; k < this.lineChartData.length; k++) {
                    if (k > i && this.chart) {
                        const meta1 = this.chart.isDatasetHidden(i);
                        const meta2 = this.chart.isDatasetHidden(k);
                        if (meta1 !== true && meta2 !== true) {
                            const intersects = this.findIntersects(
                                this.lineChartData[i].data,
                                this.lineChartData[k].data,
                            );
                            const res = [];
                            for (let j = 0; j < intersects.length; j++) {
                                const item: any = {};
                                item.x = intersects[j].x;
                                item.y = intersects[j].y;
                                item.line1 = i + 1;
                                item.line2 = k + 1;
                                res.push(item);
                            }
                            if (res.length > 0) {
                                allInterSects = allInterSects.concat(res);
                            }
                        }
                    } else if (k > i) {
                        const intersects = this.findIntersects(
                            this.lineChartData[i].data,
                            this.lineChartData[k].data,
                        );
                        const res = [];
                        for (let j = 0; j < intersects.length; j++) {
                            const item: any = {};
                            item.x = intersects[j].x;
                            item.y = intersects[j].y;
                            item.line1 = i + 1;
                            item.line2 = k + 1;
                            res.push(item);
                        }
                        if (res.length > 0) {
                            allInterSects = allInterSects.concat(res);
                        }
                    }
                }
            }
        }
        const obj = {
            label: 'Intersections',
            radius: 6,
            type: 'bubble',
            data: allInterSects,
            pointBackgroundColor: 'red',
            borderColor: '#BA1126',
            pointStyle: 'crossRot',
            pointRadius: 6,
            pointHitRadius: 1,
            showLine: false,
            pointHoverRadius: 7,
            hoverBorderWidth: 3,
            borderWidth: 2,
        };
        if (this.lineChartData.length > 0 && this.lineChartData[0].label !== 'Intersections')
            this.lineChartData.unshift(obj);
        else this.lineChartData[0] = obj;
    }

    findIntersects(line1: any, line2: any) {
        const intersects = [];

        line1.forEach(function (val, idx) {
            const line1StartX = idx;
            const line1StartY = line1[idx].y;
            const line1EndX = idx + 1;

            let line1EndY = null;
            if (line1[idx + 1] !== undefined) line1EndY = line1[idx + 1].y;
            const line2StartX = idx;

            let line2StartY = null;
            if (line2[idx] !== undefined) line2StartY = line2[idx].y;
            const line2EndX = idx + 1;

            let line2EndY = null;
            if (line2[idx + 1] != undefined) line2EndY = line2[idx + 1].y;
            // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
            const result = {
                x: null,
                y: null,
                onLine1: false,
                onLine2: false,
            };
            const denominator =
                (line2EndY - line2StartY) * (line1EndX - line1StartX) -
                (line2EndX - line2StartX) * (line1EndY - line1StartY);
            if (denominator != 0) {
                let a = line1StartY - line2StartY;
                let b = line1StartX - line2StartX;
                const numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
                const numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
                a = numerator1 / denominator;
                b = numerator2 / denominator;

                // if we cast these lines infinitely in both directions, they intersect here:
                result.x = line1StartX + a * (line1EndX - line1StartX);
                result.y = line1StartY + a * (line1EndY - line1StartY);
                /*
                        // it is worth noting that this should be the same as:
                        x = line2StartX + (b * (line2EndX - line2StartX));
                        y = line2StartX + (b * (line2EndY - line2StartY));
                        */
                // if line1 is a segment and line2 is infinite, they intersect if:
                if (a > 0 && a < 1) {
                    result.onLine1 = true;
                }
                // if line2 is a segment and line1 is infinite, they intersect if:
                if (b > 0 && b < 1) {
                    result.onLine2 = true;
                }
                // if line1 and line2 are segments, they intersect if both of the above are true

                if (result.onLine1 && result.onLine2) {
                    intersects.push(result);
                }
            }
        });

        return intersects;
    }

    onRoiImageChanged(imageBase64) {
        this.service
            .updateApplication({ roiPNG: imageBase64 }, this.storage.selectedApplicationId)
            .then(
                res => {
                    this.imgShouldUpdate = false;
                },
                err => {},
            );
    }
}
