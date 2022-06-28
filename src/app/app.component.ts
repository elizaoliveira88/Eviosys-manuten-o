import {Component, OnInit, OnDestroy, HostListener, ViewChild, Input, ViewChildren, ElementRef} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { environment } from '@environments/environment';
import {
    Router,
    NavigationEnd, NavigationStart,
} from '@angular/router';
import { appRoutesNames } from './app.routes.names';
import { MatSidenav } from '@angular/material/sidenav';
import { MasterDataProvider } from '@shared/provider/MasterData.provider';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { SidenavService } from '@services/sidenav/sidenav.service';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { AccessControllService } from '@services/access-controll/access-controll.service';
import { ToastService } from '@shared/services/toast.service';
import { DialogAbout } from '@shared/components/about-popup/about-popup.component';
import {MainMenuModel} from '@shared/models/MainMenu.model';
import {routeNamesHome} from "@app/home/home.routes.names";
import {User} from "@shared/models/User";
import {listOfThemes, Theme} from "@shared/theme/models/themes";
import {ThemeService} from "@shared/theme/services/theme.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
    selectedProject: any = null;
    sidenav;
    public version: string = '';
    @ViewChild('sidenav') set content(content: MatSidenav) {
        this.sidenavService.setSidenav(content);
        this.sidenav = content;
    }
    @ViewChild('searchInputDesktop') searchInputDesktop: ElementRef;
    links = appRoutesNames;
    routeNamesHome = routeNamesHome;

    user: User = User.jsonToUser({});

    observablesToUnsubscribe = [];
    applicationIsOnline = true;
    buildTimestamp;
    refreshPromise = null;
    kimMessages = {
        refresh: null,
        refreshPromise: null,
        deleteEntry: null,
        entries: [],
        count: 0
    };
    minimizeMainToolbar: boolean = false;
    hideSelectedClient: boolean = false;
    currentTemplate: Theme = null;

    constructor(
        public translate: TranslateService,
        private router: Router,
        private dialog: MatDialog,
        private gatewayService: GatewayService,
        private masterData: MasterDataProvider,
        private masterDataStore: MasterDataStore,
        private sidenavService: SidenavService,
        public acs: AccessControllService,
        private toast: ToastService,
        public mainMenuModel: MainMenuModel,
        public themeService: ThemeService,
        public dataStore: MasterDataStore
    ) {
        this.selectedProject = dataStore.selectedProject;
        dataStore.project_changed.subscribe(pr=>{
            if(pr){
                this.selectedProject = dataStore.selectedProject;
            }
        });

        this.user = User.jsonToUser({});
        this.user = masterDataStore.userData;
        this.observablesToUnsubscribe.push(masterDataStore.user_changed.subscribe(user=>{
            this.user = user;
        }));

        this.themeService.setActiveTheme(listOfThemes[1]);
        this.currentTemplate = this.themeService.getActiveTheme();
        this.observablesToUnsubscribe.push(themeService.themeChanged.subscribe(theme=>{
            if(theme){
                this.currentTemplate = theme;
            }
        }));

        this.buildTimestamp = masterData.getDeploymentTime();
        this.version = masterData.getVersion();
        this.observablesToUnsubscribe.push(this.masterData.onlineStatus$.subscribe(function(isOnline) {
            this.applicationIsOnline = isOnline;
        }.bind(this)));

        router.events.subscribe((val) => {
            if(val instanceof NavigationEnd){
                this.hideSelectedClient = val.url && val.url.indexOf("/fp/global-administration") > -1;
            }
        });


        this.gatewayService.get({
            url:environment.urlBaseService.simpleTrucks
        }).then(res=>{
            this.masterDataStore.allTrucks = res;
        }, err=>{

        });

        this.gatewayService.get({
            url:environment.urlBaseService.simpleTrailers
        }).then(res=>{
            this.masterDataStore.allTrailers = res;
        }, err=>{

        });


    }

    ngOnDestroy() {
        for(var x=0; x<this.observablesToUnsubscribe.length; x++) {
            this.observablesToUnsubscribe[x].unsubscribe();
        }
    }

    performLogout() {
        if(environment.usesLogin !== true) return;
        this.masterData.performLogout();
        this.sidenav.close();
        this.router.navigate(['login']);
    }

    showAbout() {
        this.dialog.open(DialogAbout, {
            width: '250px',
            panelClass: 'paddingLessPopup'
        });
    }

    searchInputFocus(): void {
        if (window.innerWidth >= 1024) this.searchInputDesktop.nativeElement.focus();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (window.innerWidth >= 1024) {
            this.sidenav.close();
        }
    }
    onEvent(event) {
        event.stopPropagation();
    }
}
