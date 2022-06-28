import { Component, OnDestroy, OnInit, HostListener, ViewChild, Input, ViewChildren, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    Router,
} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';

@Component({
    selector: 'app-home',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, OnDestroy {
    subscriptions = [];

    constructor(
        public translate: TranslateService,
        private router: Router,
        private httpClient: HttpClient,
        private cd: ChangeDetectorRef
    ) {}

    ngOnDestroy() {
        if(this.subscriptions.length > 0) {
            this.subscriptions.map(s => s.unsubscribe());
            this.subscriptions = [];
        }
    }

    ngOnInit() {
    }

}
