import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {appRoutesNames} from "@app/app.routes.names";
import {Project_DATA, Project_Simple_DATA} from "@shared/models/Project";
import {Sort} from "@angular/material/sort";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {FoldersService} from "@app/home/folders/folders.service";
import {PromptDialogComponent} from "@shared/components/dialogs/prompt-dialog/prompt-dialog.component";
import {AddProjectDialogComponent} from "@app/home/folders/dialogs/add-project.dialog/add-project.dialog.component";
import {Folder_Simple_DATA} from "@shared/models/Folder";
import {routeNamesHome} from "@app/home/home.routes.names";
import {routeNamesProject} from "@app/project/project.routes.names";

@Component({
  selector: 'app-projects',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss']
})
export class FoldersComponent implements OnInit {
    viewMode: string = 'table';
    storage = {
        selectedFolderId: <number>null,
        selectedFolder: null,
        nav: <Folder_Simple_DATA[]>[],
        allFolders: <Folder_Simple_DATA[]>[],
        allProjects: <Project_Simple_DATA[]>[],
        allArchived: <Project_DATA[]>[],
        collapsableArchive: true,
        userData: null
    }
    dataSource = new MatTableDataSource([]);
    dataSource2 = new MatTableDataSource([]);
    displayedColumns: string[] = ['type', 'name', 'customerData', 'externalId', 'createdBy', 'lastOpenedDate', 'BTN_ARCHIVE', 'BTN_REMOVE'];
    private ngUnsubscribe = new Subject();

  constructor(private translateService: TranslateService,
              private dialog: MatDialog,
              private service: FoldersService,
              private router: Router,
              private masterData: MasterDataStore,
              private route: ActivatedRoute) {

      this.route.params.subscribe(params => {
          if(params['id']){
              this.storage.selectedFolderId = params['id'];
          } else {
              let tempId = sessionStorage.getItem('fp.selectedFolderId');
              if(tempId){
                  this.router.navigate(['fp',appRoutesNames.HOME, routeNamesHome.PROJECTS, tempId])
              }
          }
      });

      this.refreshData();

      let temp = this.masterData.getUserViewSettings('projects');
      if(temp){
          this.viewMode = temp;
      }
  }

  ngOnInit(): void {
      this.masterData.user_changed.subscribe(user=>{
          if(user){
              this.storage.userData = user;
          }
      });
  }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        const filter = this.dataSource.filter;
        this.storage.selectedFolder = null;
        this.storage.nav = [];

        if(!this.storage.selectedFolderId){
            this.service.getFolders().then(res=>{
                if(res){
                    this.storage.allFolders = res.folders;
                    this.storage.allProjects = res.projects;
                    let all = [];
                    this.storage.allFolders.forEach(el=>{
                        let temp = JSON.parse((JSON.stringify(el)));
                        temp.type = 'folder';
                        all.push(temp);
                    })
                    this.storage.allProjects.forEach(el=>{
                        let temp = JSON.parse((JSON.stringify(el)));
                        temp.type = 'project';
                        all.push(temp);
                    })
                    this.dataSource.data = all;
                    this.dataSource.filter = filter;
                }
            },err=>{

            });
        } else {
            this.service.getFolderById(this.storage.selectedFolderId).then(res=>{
                if(res){
                    this.storage.selectedFolder = {
                        creationDate: res.creationDate,
                        id: res.id,
                        name: res.name,
                        parentFolderId: res.parentFolderId
                    };
                    this.storage.nav = res.nav;
                    this.storage.allFolders = res.folders;
                    this.storage.allProjects = res.projects;
                    let all = [];
                    this.storage.allFolders.forEach(el=>{
                        let temp = JSON.parse((JSON.stringify(el)));
                        temp.type = 'folder';
                        all.push(temp);
                    })
                    this.storage.allProjects.forEach(el=>{
                        let temp = JSON.parse((JSON.stringify(el)));
                        temp.type = 'project';
                        all.push(temp);
                    })
                    this.dataSource.data = all;
                    this.dataSource.filter = filter;
                }
            },err=>{

            });
        }

    }

    loadArchived(){
        const filter = this.dataSource2.filter;
        this.service.getArchivedProjects().then(res=>{
            if(res){
                this.storage.allArchived = res;
                this.dataSource2.data = this.storage.allArchived;
                this.dataSource2.filter = filter;
            }
        },err=>{

        });
    }

    loadAll(){
      this.refreshData();
      this.loadArchived();
    }


    openElement(el) {
      if(el.type === 'project'){
          this.masterData.selectedProject = {
              id: el.id,
              name: el.name
          };
          this.router.navigate(['fp',appRoutesNames.PROJECTS, el.id]);
      } else if(el.type === 'folder'){
          sessionStorage.setItem('fp.selectedFolderId', el.id);
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
              this.router.navigate(['fp',appRoutesNames.HOME, routeNamesHome.PROJECTS, el.id])
          );
      }

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

    addProject() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['stepperDialog'];
        const dialogRef = this.dialog.open(AddProjectDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let useShifts = result.useShifts;
                let info = result.info;
                let customer = result.customer;
                let shifts = result.shifts;
                let customerId = result.customerId
                let observationTime = 0;
                if(shifts.observationTime){
                    let splits = shifts.observationTime.split(":");
                    let hours = parseInt(splits[0]);
                    let minutes = parseInt(splits[1]);
                    observationTime = hours * 60 + minutes;
                }

                let projectToPost = {
                    name: info.name,
                    externalId: info.externalId,
                    processDurationAfterBreak : observationTime
                };

                if(!customerId){
                    projectToPost['customerData'] = {
                        customerName: customer.customerName,
                        site: customer.site,
                        address: customer.address,
                        tel: customer.tel,
                        fax: customer.fax,
                        // logo: customer.customerLogo,
                        distanceToCustomer: customer.distanceToCustomer
                    };
                } else {
                    projectToPost['customerId'] = customerId;
                }

                if(!useShifts){

                }
                this.service.addProject(projectToPost).then(res=>{
                    this.refreshData();
                })

            }
        });
    }

    deleteProject(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "HOME.PROJECTS.DELETE_DIALOG.TITLE",
                content: "HOME.PROJECTS.DELETE_DIALOG.CONTENT",
                save: "GLOBAL.DELETE"
            }
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.deleteProject(element.id).then(res=>{
                    this.refreshData();
                });
            }
        });
    }

    archiveProject(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "HOME.PROJECTS.ARCHIVE_DIALOG.TITLE",
                content: "HOME.PROJECTS.ARCHIVE_DIALOG.CONTENT",
                save: "HOME.PROJECTS.ARCHIVE_DIALOG.ARCHIVE"
            }
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.archiveProject(element.id).then(res=>{
                    this.loadAll();
                });
            }
        });
    }

    unarchiveProject(element) {
        this.service.unarchiveProject(element.id).then(res=>{
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

    addFolder() {

    }

    setViewMode() {
        this.masterData.setUserViewSettings('projects', this.viewMode);
    }

    goTo(id) {
      if(id===-1){
          sessionStorage.removeItem('fp.selectedFolderId');
          this.router.navigate(['fp',appRoutesNames.HOME, routeNamesHome.PROJECTS]);
      } else {
          sessionStorage.setItem('fp.selectedFolderId', id);
          this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
              this.router.navigate(['fp',appRoutesNames.HOME, routeNamesHome.PROJECTS, id])
          );
      }

    }
}
