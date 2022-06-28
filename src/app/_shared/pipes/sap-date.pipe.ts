import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';

@Pipe({
    name: 'SAPDatePipe'
})
export class SAPDatePipe implements PipeTransform {
    transform (dateInSeconds: any, utc: boolean = false): any {
        if(utc !== true) utc = false;
        if (dateInSeconds == '') return null;
        var l10 = function(val) {
            return (val < 10 ? '0':'') + val;
        };
        if(dateInSeconds instanceof Date) {
            var date = dateInSeconds;
        } else {
            var date = new Date(dateInSeconds);
        }

        if(!(date instanceof Date)) {
            return '';
        }

        if(utc == false) {
            return date.getFullYear() + '-' + l10(date.getMonth() + 1) + '-' + l10(date.getDate()) +
            'T' + l10(date.getHours()) + ':' + l10(date.getMinutes()) + ':' + l10(date.getSeconds());
        } else {
            return date.getUTCFullYear() + '-' + l10(date.getUTCMonth() + 1) + '-' + l10(date.getUTCDate()) +
            'T' + l10(date.getUTCHours()) + ':' + l10(date.getUTCMinutes()) + ':' + l10(date.getUTCSeconds());
        }
    }
}
