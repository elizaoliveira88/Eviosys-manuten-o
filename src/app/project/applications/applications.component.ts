import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {ApplicationsService} from "@app/project/applications/applications.service";
import {Application_DATA} from "@shared/models/Application";
import {appRoutesNames} from "@app/app.routes.names";
import {Router} from "@angular/router";
import {routeNamesProject} from "@app/project/project.routes.names";
import {MatTableDataSource} from "@angular/material/table";
import {Sort} from "@angular/material/sort";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {
    AddApplicationDialogComponent
} from "@app/project/applications/dialogs/add-application.dialog/add-application.dialog.component";

@Component({
    selector: 'app-applications',
    templateUrl: './applications.component.html',
    styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit, OnDestroy {
    viewMode: string = 'table';
    storage = {
        selectedProject: null,
        allApplications: <Application_DATA[]>[],
        allArchived: <Application_DATA[]>[],
        collapsableArchive: true
    }
    dataSource = new MatTableDataSource([]);
    dataSource2 = new MatTableDataSource([]);
    displayedColumns: string[] = ['IMG', 'name', 'applicationType', 'flowPlan', 'lastModified', 'BTN_ARCHIVE', 'BTN_REMOVE'];

    private ngUnsubscribe = new Subject();

    constructor(private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private dialog: MatDialog,
                private service: ApplicationsService,
                private router: Router) {
        this.storage.selectedProject = masterDataStore.selectedProject;
        this.refreshData();

        let temp = this.masterDataStore.getUserViewSettings('applications');
        if(temp){
            this.viewMode = temp;
        }
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        const filter = this.dataSource.filter;
        this.service.getApplications(this.storage.selectedProject.id).then(res=>{
            if(res){
                this.storage.allApplications = res;
                this.dataSource.data = this.storage.allApplications;
                this.dataSource.filter = filter;
            }
        },err=>{

        });
    }

    loadArchived(){
        const filter = this.dataSource2.filter;
        this.service.getArchivedApplications(this.storage.selectedProject.id).then(res=>{
            if(res){
                this.storage.allArchived = res;
                this.dataSource2.data = this.storage.allArchived;
                this.dataSource2.filter = filter;
            }
        },err=>{

        });
    }

    loadAll(){
        const filter = this.dataSource.filter;
        const filter2 = this.dataSource2.filter;
        this.service.getAllApplications(this.storage.selectedProject.id).then(res=>{
            if(res){
                this.storage.allArchived = [];
                this.storage.allApplications = [];
                res.forEach(app=>{
                    if(app.archive){
                        this.storage.allArchived.push(app);
                    } else {
                        this.storage.allApplications.push(app);
                    }
                })
                this.dataSource.data = this.storage.allApplications;
                this.dataSource.filter = filter;
                this.dataSource2.data = this.storage.allArchived;
                this.dataSource2.filter = filter2;
            }
        },err=>{

        });
    }

    openApplication(app: Application_DATA) {
        this.router.navigate(['fp',appRoutesNames.PROJECTS, this.storage.selectedProject.id, routeNamesProject.APPLICATIONS, app.id]);
    }

    sortData(sort: Sort) {
        const data = this.dataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSource.data = data;
            return;
        }

        this.dataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
            /*switch (sort.active) {
                case 'name': case 'createdBy':
                    return this.compare(a.name, b.name, isAsc);
                case 'calories':
                    return this.compare(a.calories, b.calories, isAsc);
                case 'fat':
                    return this.compare(a.fat, b.fat, isAsc);
                case 'carbs':
                    return this.compare(a.carbs, b.carbs, isAsc);
                case 'protein':
                    return this.compare(a.protein, b.protein, isAsc);
                default:
                    return 0;
            }*/
        });
    }

    sortData2(sort: Sort) {
        const data = this.dataSource2.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSource2.data = data;
            return;
        }

        this.dataSource2.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
        });
    }

    addApplication() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['noHeightDialog'];
        const dialogRef = this.dialog.open(AddApplicationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.addApplication(this.storage.selectedProject.id, {
                    applicationType: result.selectedType,
                    name: result.name,
                    flowPlan: result.flowPlan
                }).then(res=>{
                    this.refreshData();
                });
            }
        });
    }

    deleteApplication(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.APPLICATIONS.DELETE_DIALOG.TITLE",
                content: "PROJECTS.APPLICATIONS.DELETE_DIALOG.CONTENT",
                save: "GLOBAL.DELETE"
            }
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.deleteApplication(element.id).then(res=>{
                    this.refreshData();
                });
            }
        });
    }

    archiveApplication(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.APPLICATIONS.ARCHIVE_DIALOG.TITLE",
                content: "PROJECTS.APPLICATIONS.ARCHIVE_DIALOG.CONTENT",
                save: "PROJECTS.APPLICATIONS.ARCHIVE_DIALOG.ARCHIVE"
            }
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.archiveApplication(element.id).then(res=>{
                    this.loadAll();
                });
            }
        });
    }

    unarchiveApplication(element) {
        this.service.unarchiveApplication(element.id).then(res=>{
            this.loadAll();
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }


    toggleCollapsableArchived() {
        this.storage.collapsableArchive = !this.storage.collapsableArchive;
        if(!this.storage.collapsableArchive && this.storage.allArchived.length===0) {
            this.loadArchived();
        }
    }

    setViewMode() {
        this.masterDataStore.setUserViewSettings('applications', this.viewMode);
    }

    /* ----------------- helpers */

    normalizeApplicationType(val: string): string{
        if(val){
            if(val.charAt(0)==='A'){
                return val;
            } else {
                return 'A'+val;
            }
        }
    }
}
