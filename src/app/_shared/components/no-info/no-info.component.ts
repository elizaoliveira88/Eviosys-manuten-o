import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'no-info',
    templateUrl: './no-info.component.html',
    styleUrls: ['./no-info.component.css']
})
export class NoInfoComponent implements OnInit {

    @Input() label: string = 'COMPONENTS.NO_DATA.LABEL_DEFAULT';

    constructor() {
    }

    ngOnInit(): void {
    }

}
