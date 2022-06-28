import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ResizeService} from '@services/resize/resize.service';

@Component({
    selector: 'search-input-table',
    templateUrl: './search-input-table.component.html',
    styleUrls: ['./search-input-table.component.css'],
    animations: [
        trigger('expandFilter', [
            state('open', style({
                width: '200px',
            })),
            state('closed', style({
                width: '0px',
            })),
            transition('open => closed', [
                animate('0.1s')
            ]),
            transition('closed => open', [
                animate('0.1s')
            ]),
        ])
    ]
})
export class SearchInputTableComponent implements OnDestroy {
    isInputVisible = false;
    isMobile;
    @Input() filter: string;
    @Output() filterChange = new EventEmitter<string>();
    subs = [];
    constructor( private resizeService: ResizeService) {
        this.subs.push(this.resizeService.toggle$.subscribe(value =>{
            this.isMobile =  value === 'MOBILE';
        }));
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => {
            sub.unsubscribe();
        })
    }

    toggleFilter() {
        this.filter = '';
        if(!this.isMobile)
            this.isInputVisible = !this.isInputVisible;
        this.onChangeFilter();
    }

    onChangeFilter() {
        this.filterChange.emit(this.filter);
    }
}
