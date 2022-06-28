import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';

@Pipe({
    name: 'removewhitespaces'
})
export class RemoveWhiteSpacesPipe implements PipeTransform {
    transform(value: string, args?: any): string {
        return value.replace(/ /g, '');
    }
}
