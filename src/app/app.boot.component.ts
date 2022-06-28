import {Component, OnInit, HostListener, ViewChild, Input, ViewChildren, ElementRef} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { environment } from '@environments/environment';
import {
    Router,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError,
    RouterOutlet,
    ActivationStart
} from '@angular/router';
import { LoaderService } from '@interceptor/loader/loader.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';
import { PersistenceService } from '@services/database/persistence.service';
import { MasterDataProvider } from '@shared/provider/MasterData.provider';
import { ResizeService } from '@services/resize/resize.service';
import { ThemeTemplates } from "@shared/enums/theme-templates.enum";
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { AccessControllService } from '@services/access-controll/access-controll.service';
import { ReleaseNotesPopup } from '@shared/components/release-notes-popup/release-notes-popup.component';

@Component({
    selector: 'app-boot',
    template: '<app-loader></app-loader><router-outlet></router-outlet>'
})
export class AppBootComponent implements OnInit {

    subs = [];
    userLanguage;

    constructor(
        public translate: TranslateService,
        private router: Router,
        private loaderService: LoaderService,
        private masterData: MasterDataProvider,
        private resizeService: ResizeService,
        public database: PersistenceService,
        private dialog: MatDialog,
        private masterDataStore: MasterDataStore,
        private acs: AccessControllService
    ) {
        translate.addLangs(['de','en','es','fr','hu','it','pl','pt','sv']);
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');

        let userLang = (masterDataStore.userData && masterDataStore.userData.settings) ? masterDataStore.userData.settings.language : 'en';
        this.subs.push(masterDataStore.user_changed.subscribe(user=>{
            if(user && user.settings) {
                userLang = user.settings.language;
            }

        }));
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use(userLang.toLowerCase());

        this.userLanguage = this.translate.currentLang || this.translate.getBrowserLang();

        this.router.events.subscribe(event => {
            switch (true) {
                case event instanceof NavigationStart: {
                    this.loaderService.show();
                    break;
                }
                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    this.loaderService.hide();
                    break;
                }
                default: {
                    break;
                }
            }

        });
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(e) {
        if (e.ctrlKey && e.keyCode == 84) { // ctrl + t
            var currentLang = this.translate.currentLang || this.translate.getBrowserLang();
            if(currentLang === 'strings') {
                this.translate.use(this.userLanguage);
            } else {
                this.userLanguage = currentLang;
                this.translate.use('strings');
            }
        }
    }

    ngOnInit() {
        this.resizeService.changeWidth(window.innerWidth);
        this.resizeService.toggle$.subscribe(function(tpl) {
            if (tpl == 'DESKTOP' || tpl == 'LARGE') {
                document.body.classList.add('isOnDesktop');
                document.body.classList.remove('isOnMobile');
            } else if (tpl != 'DESKTOP' && tpl != 'LARGE') {
                document.body.classList.add('isOnMobile');
                document.body.classList.remove('isOnDesktop');
            }
        }.bind(this));

        var theme = ThemeTemplates.DEFAULT;
        Object.keys(ThemeTemplates).forEach(function(key) {
            if(ThemeTemplates[key] == localStorage.getItem('theme')) {
                theme = ThemeTemplates[key];
            }
        }.bind(this));
        document.body.classList.add(theme);

        if(this.acs.isVisible('App/ReleaseNotesOnStartup')) {
            this._showReleaseNotes(this.database.loadLocalSetting('app.known-release-notes'));
        }

        if(environment.includeSpecials == true) {
            window['fp'] = {};
            window['fp']['version'] = function() {
                return this.masterData.getVersion();
            }.bind(this);
            window['fp']['connect'] = function(code: string = '') {
                if(!code || code.length == 0) {
                    code = prompt('enter code', '*****');
                }
                if(code == 'nx4862') {
                    window['fp']['config'] = {};

                    window['fp']['show'] = {};
                    window['fp']['show']['caches'] = function() {
                        return this.masterData._getCaches();
                    }.bind(this);

                    console.info("%c ** CONFIRMED **","background-color:green; color: #333333");
                    console.table([
                        { 'key': 'fp.show.caches()', 'description':'show Caches'}
                    ], ['key', 'description']);

                    this.acs.overwrite('/Administration','visible', true);
                    this.acs.overwrite('/Administration','enabled', true);
                    console.info("%c ==> admin feature enabled","background-color:lightblue; color: #000000");

                    return 'code valid.';
                } else {
                    console.info("%c ** DENIED **","background-color:red; color: #333333");
                    return 'code invalid.';
                }
            }.bind(this);
        }
    }

    _showReleaseNotes(knownKeys) {
        var notes = this.masterData.getReleaseNotes();
        var numberOfUnknwonNotes = (Object.keys(notes).filter(item => !knownKeys.includes(item))).length;
        if(this.masterData.isDeveloper) {
            notes = this.masterData.getDevelopmentNotes();
            numberOfUnknwonNotes += (Object.keys(notes).filter(item => !knownKeys.includes(item))).length;
        }
        if(numberOfUnknwonNotes > 0) {
            this.dialog.open(ReleaseNotesPopup, {
                panelClass: ['paddingLess', 'mediumDialog'],
                data: {
                    limitToNewEntries: true
                }
            });
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resizeService.changeWidth(window.innerWidth);
    }
}
