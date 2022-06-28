import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'YesNo'
})
export class YesNoPipe implements PipeTransform {
    constructor(private translate: TranslateService) { }

    transform(status: string | boolean): string {
        if(status === true || status === 'true' || status === 'X') {
            return this.translate.instant('YES');
        } else {
            return this.translate.instant('NO');
        }
    }
}
