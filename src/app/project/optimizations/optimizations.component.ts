import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {OptimizationsService} from "@app/project/optimizations/optimizations.service";
import {Application_DATA} from "@shared/models/Application";
import {Optimization_DATA} from "@shared/models/Optimization";
import {MatSort, MatSortable, Sort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {appRoutesNames} from "@app/app.routes.names";
import {routeNamesProject} from "@app/project/project.routes.names";
import {Router} from "@angular/router";
import {PromptDialogComponent} from "@shared/components/dialogs/prompt-dialog/prompt-dialog.component";

@Component({
    selector: 'app-optimizations',
    templateUrl: './optimizations.component.html',
    styleUrls: ['./optimizations.component.css']
})
export class OptimizationsComponent implements OnInit, OnDestroy {
    storage = {
        selectedProject: null,
        allOptimizations: <Optimization_DATA[]>[]
    }
    dataSource = new MatTableDataSource([]);

    displayedColumns: string[] = ['name', 'createdBy', 'creationDate', 'lastModified', 'BTN_REMOVE'];

    private ngUnsubscribe = new Subject();

    constructor(private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private service: OptimizationsService,
                private dialog: MatDialog,
                private router: Router) {
        this.storage.selectedProject = masterDataStore.selectedProject;
        this.refreshData();
    }

    ngAfterViewInit() {

    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        const filter = this.dataSource.filter;
        this.service.getOptimizations(this.storage.selectedProject.id).then(res=>{
            if(res){
                this.storage.allOptimizations = res;
                this.dataSource.data = this.storage.allOptimizations;
                this.dataSource.filter = filter;

            }
        },err=>{

        });
    }

    deleteOptimization(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.OPTIMIZATIONS.DELETE_DIALOG.TITLE",
                content: "PROJECTS.OPTIMIZATIONS.DELETE_DIALOG.CONTENT",
                save: "GLOBAL.DELETE"
            }
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
        });
    }

    openOptimization(row) {
        this.router.navigate(['fp',appRoutesNames.PROJECTS, this.storage.selectedProject.id, routeNamesProject.OPTIMIZATIONS, row.id]);
    }

    addOptimization(){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.OPTIMIZATIONS.ADDOPT_TITLE",
                content: "PROJECTS.OPTIMIZATIONS.ADDOPT_CONTENT",
                name: "PROJECTS.OPTIMIZATIONS.ADDOPT_PLACEHOLDER",
                save: "GLOBAL.CREATE"
            }
        };

        const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
        });
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

     compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
}
