import { NgModule, ModuleWithProviders } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

import { ThemeService } from './services/theme.service';
import { ParcelIconDirective } from './directives/icon.directive';
import { Theme, listOfThemes, parcelIcons } from './models/themes';

@NgModule({
    imports: [],
    declarations: [ParcelIconDirective],
    exports: [ParcelIconDirective],
    providers: [],
})
export class ThemeModule {
    static forRoot(): ModuleWithProviders<ThemeModule> {
        return {
            ngModule: ThemeModule,
            providers: [ThemeService],
        };
    }

    private brandIcons: { [key: string]: any[] };

    constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
        // defaults
        /* ...shortcut or more work ? works with and without this code ...
        parcelIcons.forEach((iconName: string) => {
            matIconRegistry.addSvgIcon(iconName, domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/parcel/' + iconName + '.svg'));
        });

        listOfThemes.forEach((theme: Theme) => {
            theme.iconSet.forEach((iconName: string) => {
                matIconRegistry.addSvgIconInNamespace(theme.name, iconName, domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/' + theme.name.toLowerCase() + '/' + iconName + '.svg'));
            });
        });
*/
        matIconRegistry.addSvgIconResolver((name: string, namespace: string) => {
            if (!namespace) {
                if (parcelIcons.indexOf(name) > -1) {
                    return domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/parcel/' + name + '.svg');
                }
                return null;
            }

            var themeOfNamespace: Theme | undefined = listOfThemes.find(x => x.name == namespace);
            if (themeOfNamespace) {
                switch (name) {
                    case 'Brand_Logo':
                        return domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/brandLogos/' + namespace.toLowerCase() + '.svg');
                        break;
                    default:
                        if (themeOfNamespace.iconSet.indexOf(name) > -1) {
                            return domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/' + namespace.toLowerCase() + '/' + name + '.svg');
                        }
                        break;
                }
            }

            if (parcelIcons.indexOf(name) > -1) {
                return domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/parcel/' + name + '.svg');
            }
            return null;
        });
    }
}
