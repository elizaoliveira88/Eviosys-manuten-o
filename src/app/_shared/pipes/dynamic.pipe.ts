import { Pipe, PipeTransform } from '@angular/core';

import { RemoveZeroPipe } from './remove-zero.pipe';
import { DisplayTimePipe } from './display-time.pipe';
import { YesNoPipe } from './yes-no.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import {DisplayDatePipe} from "@shared/pipes/display-date.pipe";

@Pipe({
  name: 'dynamicPipe'
})
export class DynamicPipe implements PipeTransform {

    public constructor(
        private removeZeroPipe: RemoveZeroPipe,
        private displayTimePipe: DisplayTimePipe,
        private yesNoPipe: YesNoPipe,
        private translatePipe: TranslatePipe,
        private displayDatePipe: DisplayDatePipe
    ) {
    }

    transform(value: any, pipeToken: any, pipeArgs: any): any {
        if (!pipeToken || pipeToken == '') {
            return value;
        } else {
            switch(pipeToken) {
                case 'removeZero': return this.removeZeroPipe.transform(value); break;
                case 'DisplayTime': return pipeArgs === null ? this.displayTimePipe.transform(value) : this.displayTimePipe.transform(value, ...pipeArgs); break;
                case 'DisplayDateTime': return this.displayDatePipe.transform(value);
                case 'YesNo': return this.yesNoPipe.transform(value); break;
                case 'translate': return pipeArgs === null ? this.translatePipe.transform(value) : this.translatePipe.transform(value, ...pipeArgs); break;
                default: return value;
            }
        }
    }
}
