import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';

@Pipe({
    name: 'removeZero'
})
export class RemoveZeroPipe implements PipeTransform {
    transform (input: any): any {
        input = input + '';
		if(isNaN(Number(input))) {
			return input.replace(/^(0+)/g, '');
		}
		return Number(input);
    }
}
