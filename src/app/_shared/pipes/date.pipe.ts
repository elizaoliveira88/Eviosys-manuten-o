import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';

@Pipe({
    name: 'DateObj'
})
export class DateFormatPipe implements PipeTransform {
    transform (value: any): Date {
        if(value == null || value == undefined || value == '') {
            return new Date();
        }
        if(!isNaN(Number(value))) return new Date(Number(value));
		value = value + ''; // to string
		if(value.toUpperCase().indexOf('DATE') > -1) { // /DATE(343235352)
			return new Date(Number((value + '').replace(/[^\d.-]/g, '')));
		} else if(value.indexOf('T') > -1) { // 2015-03-20T00:00:00
			var p = value.split('T');
			var partDate = p[0].split('-');
			var partTime = p[1].split(':');
			return new Date(Date.UTC(partDate[0],Number(partDate[1])-1,partDate[2],partTime[0],partTime[1],partTime[2]));
		} else {
			return new Date(value);
		}
    }
}
