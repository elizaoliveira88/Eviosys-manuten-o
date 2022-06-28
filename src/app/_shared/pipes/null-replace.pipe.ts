import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'noNull'
})
export class NullReplacePipe implements PipeTransform {
    transform (val: any): any {
       if(val === null || val===undefined) return '-';
       else return val;
    }
}
