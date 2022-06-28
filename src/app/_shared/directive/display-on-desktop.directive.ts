import { Directive, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { ResizeService } from '@services/resize/resize.service';

@Directive({ selector: '[displayOnDesktop]'})
export class DisplayOnDesktopDirective implements OnDestroy {

    private hasRendereView = false;
    subs = [];
    constructor(
        private templateRef: TemplateRef<any>,
        private vcr: ViewContainerRef,
        private resizeService: ResizeService
    ) {
        this.subs.push(this.resizeService.toggle$.subscribe(function(tpl) {
            if ((tpl == 'DESKTOP' || tpl == 'LARGE') && !this.hasRendereView) {
                this.vcr.createEmbeddedView(this.templateRef);
                this.hasRendereView = true;
            } else if ((tpl != 'DESKTOP' && tpl != 'LARGE') && this.hasRendereView) {
                this.vcr.clear();
                this.hasRendereView = false;
            }
        }.bind(this)));
    }

    ngOnDestroy() {
        this.subs.forEach(sub => {
            sub.unsubscribe();
        })
    }
}
