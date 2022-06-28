import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    ChartDataset,
    ChartEvent,
    ChartOptions,
    ChartType,
    LegendItem,
    TooltipItem,
} from 'chart.js';
import { Subject } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { takeUntil } from 'rxjs/operators';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-trucks-chart',
    templateUrl: './trucks-chart.component.html',
    styleUrls: ['./trucks-chart.component.scss'],
    providers: [DecimalPipe],
})
export class TrucksChartComponent implements OnInit, OnDestroy {
    barChartLegend = true;
    barChartLabels = [];
    barChartType: ChartType = 'bar';
    barChartData: ChartDataset[] = [];
    barChartOptions: ChartOptions = {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: (context: TooltipItem<'line'>[]) => {
                        let label = '';
                        let total = 0;
                        context.forEach(dataSet => {
                            if (label === '') {
                                label = dataSet.label;
                            }
                            total += dataSet.parsed.y;
                        });
                        label =
                            label +
                            ' ' +
                            this._decimalPipe.transform(total, '1.0-2') +
                            (this.storage.selectedApplication.settings?.currency
                                ? this.storage.selectedApplication.settings.currency
                                : '€');

                        return label;
                    },
                    label: (context: TooltipItem<'line'>) => {
                        let label =
                            context.dataset.label +
                                ' ' +
                                this._decimalPipe.transform(context.parsed.y, '1.0-2') || '';
                        if (label !== '') {
                            label += this.storage.selectedApplication.settings?.currency
                                ? this.storage.selectedApplication.settings.currency
                                : '€';
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                beginAtZero: true,
                min: 0,
                title: {
                    display: true,
                    text: this.translateService.instant(
                        'PROJECTS.APPLICATION_DETAILS.CHARTS.BARCHART_YLABEL',
                    ),
                },
            },
        },
    };
    storage: any = {};
    _val: Subject<any> = new Subject();
    private readonly ngUnsubscribe: Subject<void> = new Subject();
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
    @Input()
    set events(val: Subject<any>) {
        this._val = val;
    }
    constructor(private translateService: TranslateService, private _decimalPipe: DecimalPipe) {
        this.barChartData = [
            {
                data: [],
                label: this.translateService.instant(
                    'PROJECTS.APPLICATION_DETAILS.CHARTS.PERSONAL_COST',
                ),
                stack: 'a',
            },
            {
                data: [],
                label: this.translateService.instant(
                    'PROJECTS.APPLICATION_DETAILS.CHARTS.FINANCE_COST',
                ),
                stack: 'a',
            },
            {
                data: [],
                label: this.translateService.instant(
                    'PROJECTS.APPLICATION_DETAILS.CHARTS.MAINTENANCE_COST',
                ),
                stack: 'a',
            },
        ];
    }

    ngOnInit(): void {
        this._val.pipe(takeUntil(this.ngUnsubscribe)).subscribe(x => {
            this.storage = x;
            this.calculateChart();
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    calculateChart() {
        const barChart = {
            labels: [],
            personalCosts: [],
            financialCosts: [],
            energyCost: [],
        };
        Object.keys(this.storage.applicationTrucksById).forEach((key: string) => {
            const truck = this.storage.applicationTrucksById[key];
            barChart.labels.push(truck.identification);
            barChart.personalCosts.push(
                (
                    truck.financeInfo.overallPersonalCosts /
                    this.storage.selectedApplication.settings.workingDays
                ).toFixed(2),
            );
            barChart.financialCosts.push(
                (
                    truck.financeInfo.overallCarCosts /
                    this.storage.selectedApplication.settings.workingDays
                ).toFixed(2),
            );
            barChart.energyCost.push(
                (
                    (truck.financeInfo.overallMaintenanceCosts +
                        truck.financeInfo.overallConsumptionsCosts) /
                    this.storage.selectedApplication.settings.workingDays
                ).toFixed(2),
            );
        });
        if (barChart.labels.length != 0) {
            this.barChartLabels = barChart.labels;
            this.barChartData[0].data = barChart.personalCosts;
            this.barChartData[1].data = barChart.financialCosts;
            this.barChartData[2].data = barChart.energyCost;
        }
        setTimeout(() => {
            //prevent empty canvas or canvas not updating
            if (this.chart) {
                this.chart.update();
            }
        }, 100);
    }
}
