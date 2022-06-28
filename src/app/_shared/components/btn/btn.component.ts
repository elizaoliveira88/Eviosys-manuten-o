import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-btn',
    templateUrl: './btn.component.html',
    styleUrls: ['./btn.component.css']
})
export class BtnComponent implements OnInit {

    @Input() label: string;
    @Input() icon: string = null;
    @Input() size: string = 'big';
    @Input() style: string = 'solid';
    @Output() clicked = new EventEmitter<MouseEvent>();

    constructor() {
    }

    ngOnInit(): void {
    }

    btnClicked(event) {
        this.clicked.emit(event);
    }

}
