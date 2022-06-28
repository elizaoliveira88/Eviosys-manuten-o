import {
    Component,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';

export interface VisualStatusBarStorage {
    total: number,
    completed: number,
    error: number,
    inProgress: number,
    loading: boolean
}

@Component({
    selector: 'ito-visual-status-bar',
    templateUrl: './visual-status-bar.component.html',
    styleUrls: ['./visual-status-bar.component.css']
})
export class VisualStatusBarComponent implements OnChanges {
    @Input('data') data: Partial<VisualStatusBarStorage>;

    visualStatusBarStorage: VisualStatusBarStorage = {
        total: 3,
        completed: 1,
        inProgress: 1,
        error: 1,
        loading: true
    };

    _setData(data) {
        if(data){
            if(data.total===0){
                this.visualStatusBarStorage = {
                    total: 3,
                    completed: 1,
                    inProgress: 1,
                    error: 1,
                    loading: true
                };
            } else {
                this.visualStatusBarStorage = Object.assign(this.visualStatusBarStorage, data);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        setTimeout(function(){
            this._setData(changes.data.currentValue);
        }.bind(this),0);

    }
}
