import { Pipe, PipeTransform  } from '@angular/core';

@Pipe({
    name: 'additionalInfoFilter'
})
export class AdditionalInfoPipe implements PipeTransform {
    transform (value: any): string {
        let ret = value;
        if(value) ret = "CO request";
        return ret;
    }
}
