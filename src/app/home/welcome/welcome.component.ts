import {Component, OnDestroy, OnInit} from '@angular/core';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { ToastService } from '@services/toast.service';
import { MainMenuModel } from '@shared/models/MainMenu.model';
import { PersistenceService } from '@services/database/persistence.service';
import { Router } from '@angular/router';
import {WelcomeService} from '@app/home/welcome/welcome.service';
import {User} from "@shared/models/User";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {Project_DATA} from "@shared/models/Project";
import {Shortcut_DATA} from "@shared/models/Shortcut";
import {MatTableDataSource} from "@angular/material/table";
import {Sort} from "@angular/material/sort";
import {appRoutesNames} from "@app/app.routes.names";
import {routeNamesProject} from "@app/project/project.routes.names";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {routeNamesHome} from "@app/home/home.routes.names";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
    storage = {
        showCards: true,
        userData: null,
        recentProjects: <Project_DATA[]>[],
        sharedProjects: <Project_DATA[]>[],
        shortcuts: <Shortcut_DATA[]>[]
    }
    viewMode: string = 'table';
    private ngUnsubscribe = new Subject();

    dataSourceRecent = new MatTableDataSource([]);
    dataSourceShared = new MatTableDataSource([]);
    dataSourceShortcuts = new MatTableDataSource([]);
    displayedColumnsProjects: string[] = ['name', 'customerData', 'createdBy', 'creationDate', 'lastOpenedDate'];
    displayedColumnsShortcuts: string[] = ['type', 'name', 'projectName', 'menu', 'BTN_REMOVE'];


    constructor(
        private masterDataStore: MasterDataStore,
        public toast: ToastService,
        private mainMenuModel: MainMenuModel,
        public database: PersistenceService,
        private router: Router,
        private service: WelcomeService,
        private dialog: MatDialog
    ) {
        let temp = this.masterDataStore.getUserViewSettings('welcome');
        if(temp){
            this.viewMode = temp;
        }
    }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.masterDataStore.user_changed
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(user=>{
                this.refreshData();
            });


    }

    refreshData() {
        const filter = this.dataSourceRecent.filter;
        const filter2 = this.dataSourceShared.filter;
        const filter3 = this.dataSourceShortcuts.filter;
        this.storage.userData = User.jsonToUser(this.masterDataStore.userData);
        this.service.getOverview().then(res=>{
            if(res){
                this.storage.recentProjects = res.recentProjects;
                this.storage.sharedProjects = res.sharedProjects;
                this.storage.shortcuts = res.shortcuts;

                if(this.storage.shortcuts){
                    this.storage.shortcuts.forEach(el=>{
                        if(el.project) el.type = 'project';
                        else if(el.application) el.type = 'application';
                        else if(el.folder) el.type = 'folder';
                    })
                }
            }

            this.dataSourceRecent.data = this.storage.recentProjects;
            this.dataSourceRecent.filter = filter;

            this.dataSourceShared.data = this.storage.sharedProjects;
            this.dataSourceShared.filter = filter2;

            this.dataSourceShortcuts.data = this.storage.shortcuts;
            this.dataSourceShortcuts.filter = filter3;
        }, err=> {

        });
    }

    changePage(link) {
        this.router.navigate(['fp', link]);
    }

    openProject(row) {
        this.masterDataStore.selectedProject = {
            id: row.id,
            name: row.name
        };
        this.router.navigate(['fp',appRoutesNames.PROJECTS, row.id]);
    }

    sortDataRecent(sort: Sort) {
        const data = this.dataSourceRecent.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSourceRecent.data = data;
            return;
        }

        this.dataSourceRecent.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
        });
    }

    sortDataShared(sort: Sort) {
        const data = this.dataSourceShared.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSourceShared.data = data;
            return;
        }

        this.dataSourceShared.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
        });
    }

    sortDataShortcuts(sort: Sort) {
        const data = this.dataSourceShortcuts.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSourceShortcuts.data = data;
            return;
        }

        this.dataSourceShortcuts.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    deleteShortcut(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "HOME.WELCOME.DELETESHORTCUT_H1",
                content: "HOME.WELCOME.DELETESHORTCUT_D1",
                save: "GLOBAL.DELETE"
            }
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
        });
    }

    openShortCut(shortcut: Shortcut_DATA) {
        switch(shortcut.type){
            case 'project':{
                this.masterDataStore.selectedProject = {
                    id: shortcut.project.projectId,
                    name: shortcut.project.projectName
                };
                this.router.navigate(['fp',appRoutesNames.PROJECTS, shortcut.project.projectId, shortcut.project.sub]);
            }break;
            case 'application':{
                this.masterDataStore.selectedProject = {
                    id: shortcut.application.projectId,
                    name: shortcut.application.projectName
                };
                this.router.navigate(['fp',appRoutesNames.PROJECTS, shortcut.application.projectId, routeNamesProject.APPLICATIONS, shortcut.application.applicationId]);
            }break;
            case 'folder':{
                this.router.navigate(['fp',appRoutesNames.HOME, routeNamesHome.PROJECTS, shortcut.folder.folderId]);
            }break;
        }
    }

    setViewMode() {
        this.masterDataStore.setUserViewSettings('welcome', this.viewMode);
    }
}
