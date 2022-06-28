import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Theme, listOfThemes } from '../models/themes';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    public themeChanged = new BehaviorSubject<Theme | null>(null);
    private themeStyleSheet: HTMLStyleElement = document.createElement('style');

    constructor() {
        document.body.classList.add('theme-PARCEL');
        this.setActiveTheme(listOfThemes[0]);

        // WebKit hack
        this.themeStyleSheet.type = 'text/css';
        this.themeStyleSheet.id = 'parcelWrap';
        this.themeStyleSheet.appendChild(document.createTextNode(''));
        document.head.appendChild(this.themeStyleSheet);
    }

    getAvailableThemes(): Theme[] {
        return listOfThemes;
    }

    getActiveTheme(): Theme | null {
        return this.themeChanged.value;
    }

    setActiveTheme(theme: Theme): void {
        if (!this.themeStyleSheet['sheet']) return;

        var oldTheme = this.getActiveTheme();

        if (oldTheme == theme) return;

        if (oldTheme) {
            document.body.classList.remove(oldTheme.cssClassName);
        }
        document.body.classList.add(theme.cssClassName);

        var rules: string[] = [];
        Object.keys(theme.properties).forEach(property => {
            //document.documentElement.style.setProperty(property, theme.properties[property]);
            rules.push(property + ':' + theme.properties[property] + ';');
        });

        if (this.themeStyleSheet['sheet']['cssRules'].length > 0) {
            this.themeStyleSheet['sheet'].deleteRule(0);
        }
        this.themeStyleSheet['sheet'].insertRule(':root{' + rules.join(' ') + '}');

        this.themeChanged.next(theme);
    }
}
