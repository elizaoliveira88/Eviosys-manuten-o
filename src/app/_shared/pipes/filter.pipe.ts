import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'filter',
    pure: false
})

export class FilterPipe implements PipeTransform {
    transform(value: any, keyValue: any): any{
        if(value!== undefined && value!== null && keyValue.key && keyValue.value){
            return value.filter(el=>{
                if(el.hasOwnProperty(keyValue.key)){
                    if(!keyValue.value[keyValue.key])return true;
                    let bool = el[keyValue.key].toLowerCase().indexOf(keyValue.value[keyValue.key].toLowerCase())>-1;
                    if(keyValue.strict){
                        bool = el[keyValue.key]===keyValue.value[keyValue.key];
                    }
                    return bool;
                } else {
                    return false;
                }
            })
        }
        return value;
    }
}
