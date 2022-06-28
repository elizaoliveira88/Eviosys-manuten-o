import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'card-table-switch',
    templateUrl: './card-table-switch.component.html',
    styleUrls: ['./card-table-switch.component.css']
})
export class CardTableSwitchComponent implements OnInit {

    @Input() value: boolean;
    @Output() valueChange = new EventEmitter<string>();

    constructor() {
    }

    ngOnInit(): void {
    }
}
