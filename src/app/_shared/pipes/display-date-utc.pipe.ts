import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MasterDataStore } from '@app/_shared/provider/MasterData.store';

@Pipe({
    name: 'DisplayDateUTC'
})
export class DisplayDateUTCPipe implements PipeTransform {
    constructor(
        private masterDataStore: MasterDataStore,
        private datePipe: DatePipe
    ) { }

    public getNumberValue (value: any): number {
        if(value instanceof Date && !isNaN(value.valueOf())) return value.getTime();
        if(!isNaN(Number(value))) return Number(value);
		value = value + ''; // to string
		if(value.toUpperCase().indexOf('DATE') > -1) { // /DATE(343235352)
			return Number((value + '').replace(/[^\d.-]/g, ''));
        } else if(value.indexOf('T') > -1) { // 2015-03-20T00:00:00
			var p = value.split('T');
			var partDate = p[0].split('-');
			var partTime = p[1].split(':');
			return Date.UTC(partDate[0],Number(partDate[1])-1,partDate[2],partTime[0],partTime[1],partTime[2]);
        } else if(!isNaN(new Date(value).getTime())) {
            return new Date(value).getTime();
		} else {
			return value;
		}
    }

    transform (value: any): string {
        var time = this.getNumberValue(value);
        return this.datePipe.transform(new Date(time), this.masterDataStore.timeFormat.Datfm + ' HH:mm','+0000');
    }
}
