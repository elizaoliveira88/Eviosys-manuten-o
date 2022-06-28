import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchFilter',
    pure: false
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], key: string, value:string): any {
        if (!items || !key || !value) {
            return items;
        }
        // filter items array, items which match and return true will be
        // kept, false will be filtered out
        return items.filter(item => {
            if(!item[key]) return false;
            return item[key].toLowerCase().indexOf(value.toLowerCase()) !== -1
        });
    }
}
