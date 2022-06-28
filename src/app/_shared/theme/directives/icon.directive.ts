import { Directive, Input, OnDestroy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';

@Directive({
    selector: 'mat-icon[parcelIcon]',
})
export class ParcelIconDirective implements OnDestroy {
    private baseIcon: string;
    private namespace: string;
    private subscriptions: Subscription[] = [];

    @Input() set parcelIcon(iconName: string) {
        this.baseIcon = iconName;
        this.updateIcon();
    }

    constructor(private readonly _matIcon: MatIcon, private themeService: ThemeService) {
        var t = themeService.getActiveTheme();
        if (t != null) {
            this.namespace = t.name;
        }
        this.subscriptions.push(
            themeService.themeChanged.subscribe(newTheme => {
                if (!newTheme) return;
                this.namespace = newTheme.name;
                this.updateIcon();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => {
            sub.unsubscribe();
        });
    }

    private updateIcon() {
        if (!this.baseIcon) return;
        if (!this.namespace) {
            this._matIcon.svgIcon = this.baseIcon;
        } else {
            this._matIcon.svgIcon = this.namespace + ':' + this.baseIcon;
        }
    }
}
