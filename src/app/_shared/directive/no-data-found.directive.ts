import { Directive, OnChanges, SimpleChanges, OnDestroy, ElementRef, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from "@angular/material/table";

@Directive({
  selector: 'no-data-found'
})
export class NoDataFoundDirective implements OnDestroy, AfterViewInit, OnChanges {

    @Input('data') availableData: Array<any>;
    @Input('dataSource') availableDataSource: MatTableDataSource<any>;
    @Input('promise') isLoadingPromise: Promise<any>;
    @Input('no-data-text') noDataText: string = 'GLOBAL.NO_DATA_FOUND';
    activeSubscriptions = [];

    constructor(
        private el: ElementRef,
        public translate: TranslateService
    ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        this._setStatus();
    }

    _setState(type) {
        switch(type) {
            case 'loading':
                this.el.nativeElement.classList.remove('hidden');
                this.el.nativeElement.classList.add('loading-data');
                this.el.nativeElement.classList.remove('no-data');
                this.el.nativeElement.innerText = this.translate.instant('LOADING_DATA');
                break;
            case 'no-data':
                this.el.nativeElement.classList.remove('hidden');
                this.el.nativeElement.classList.remove('loading-data');
                this.el.nativeElement.classList.add('no-data');
                this.el.nativeElement.innerText = this.translate.instant(this.noDataText);
                break;
            case 'has-data':
            default:
                this.el.nativeElement.classList.add('hidden');
                this.el.nativeElement.classList.remove('loading-data');
                this.el.nativeElement.classList.remove('no-data');
                this.el.nativeElement.innerText = '';
                break;
        }
    }

    _hasData() {
        if(this.availableData != undefined){
            if (this.availableData instanceof Array) {
                if(this.availableData.length > 0) {
                    return true;
                }
            } else if(this.availableData != null) {
                return true;
            }
        }

        if(this.availableDataSource != undefined &&  this.availableDataSource.hasOwnProperty('filteredData') && this.availableDataSource.filteredData.length > 0) {
            return true;
        }

        return false;
    }

    _setStatus() {
        if(this.isLoadingPromise != undefined) {
            this._setState('loading');
            this.isLoadingPromise.finally(function() {
                this._setState(this._hasData() ? 'has-data' : 'no-data');
            }.bind(this));
        } else if(this._hasData()) {
            this._setState('has-data');
        } else {
            this._setState('no-data');
        }
    }

    ngAfterViewInit(): void {
        this._setStatus();
        if(this.availableDataSource != undefined){
            this.activeSubscriptions.push(this.availableDataSource.connect().subscribe(content => {
                this._setStatus();
            }));
        }
    }

    ngOnDestroy() {
        this.activeSubscriptions.forEach(element => {
            element.unsubscribe();
        });
    }
}
