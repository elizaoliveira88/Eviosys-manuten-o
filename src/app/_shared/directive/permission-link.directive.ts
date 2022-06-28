import { Directive, ElementRef, HostListener, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { AccessControllService } from '@shared/services/access-controll/access-controll.service';

@Directive({
  selector: 'permission-link'
})
export class PermissionLinkDirective implements AfterViewInit {

    @Input('permission-visible') permissionVisible: string;
    @Output('onClick') callback: EventEmitter<any> = new EventEmitter();

    constructor(
        private el: ElementRef,
        public acs: AccessControllService
    ) {
    }

    @HostListener('click', ['$event'])
    clickEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        if(this.acs.isVisible(this.permissionVisible)) {
            this.callback.emit(event);
        }
    }

    ngAfterViewInit(): void {
        if(this.acs.isVisible(this.permissionVisible)) {
            this.el.nativeElement.classList.add('lindeRed');
            this.el.nativeElement.classList.add('gm5');
        }
    }
}

/*
    <permission-link permission-visible="Orders/" (onClick)="callme()">A</permission-link>
*/
