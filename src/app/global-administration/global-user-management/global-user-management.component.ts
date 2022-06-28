import {Component, OnInit} from '@angular/core';
import {
    GlobalUserManagementService
} from "@app/global-administration/global-user-management/global-user-management.service";
import {MatTableDataSource} from "@angular/material/table";
import {Sort} from "@angular/material/sort";
import {ToastService} from "@services/toast.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {
    AddUserToGroupDialogComponent
} from "@app/global-administration/global-user-management/dialogs/add-user-to-group.dialog/add-user-to-group.dialog.component";
import {PromptDialogComponent} from "@shared/components/dialogs/prompt-dialog/prompt-dialog.component";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";

@Component({
  selector: 'app-global-user-management',
  templateUrl: './global-user-management.component.html',
  styleUrls: ['./global-user-management.component.scss']
})
export class GlobalUserManagementComponent implements OnInit{
    subs = [];
    dataSource1 = new MatTableDataSource([]);
    tableDefinition1 = [
        {key: 'name', label: 'Name'},
        {key: 'shortTextDeleteButton', type:'deleteButton'}
    ];
    sort1: Sort = {
        active: 'name',
        direction: 'asc'
    };
    dataSource2 = new MatTableDataSource([]);
    tableDefinition2 = [
        {key: 'userName', label: 'Name'},
        {key: 'shortTextDeleteButton', type:'deleteButton'}
    ];
    sort2: Sort = {
        active: 'userName',
        direction: 'asc'
    };
    dataSource3 = new MatTableDataSource([]);
    tableDefinition3 = [
        {key: 'feature', label: 'Feature'}
    ];
    sort3: Sort = {
        active: 'userName',
        direction: 'asc'
    };
    displayedColumns: any[] = [];
    displayedColumnsStrings: string[] = [];
    featuresCopy: any[] = [];
    storage = {
        allUserGroups: [],
        allFeatures: [],
        selectedGroup: {
            info:null,
            displayedUsers:[]
        }
    }
    constructor(private service: GlobalUserManagementService,
                private toast: ToastService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        this.refreshData();
    }

    ngOnDestroy() {
        this.subs.forEach(sub => {
            sub.unsubscribe();
        })
    }

    refreshData() {
        this.displayedColumns = [];
        this.displayedColumnsStrings = [];
        const filter1 = this.dataSource1.filter;
        const filter3 = this.dataSource3.filter;
        this.service.getFeaturesAndGroups().then(res=>{
            this.storage.allFeatures = res.features;
            this.storage.allUserGroups = res.groups;

            //createMapping:
            for(var i=0; i<this.storage.allFeatures.length;i++){
                var feature = this.storage.allFeatures[i];
                feature.allowedGroups = [];
                for(var k=0; k<this.storage.allUserGroups.length; k++){
                    var gr = this.storage.allUserGroups[k];
                    var bool = false;
                    for(var p=0; p<gr.features.length;p++){
                        if(gr.features[p].id === feature.id){
                            bool = true; break;
                        }
                    }
                    if(bool) {
                        feature.allowedGroups.push(gr.id);
                    }
                }
            }

            this.dataSource1 = new MatTableDataSource(this.storage.allUserGroups);
            this.dataSource1.filter = filter1;

            this.displayedColumns.push({id:-1, name:'Feature'});
            this.storage.allUserGroups.forEach(el=>{
                this.displayedColumns.push(el);
            })

            this.featuresCopy = JSON.parse(JSON.stringify(this.storage.allFeatures));
            this.dataSource3 = new MatTableDataSource(this.featuresCopy);
            this.dataSource3.filter = filter3;
            this.displayedColumns.forEach(col=>{
                this.displayedColumnsStrings.push(col.name);
            })
        });
    }

    openUserGroup (gr){
        this.storage.selectedGroup.info = gr;
        this.service.getUserGroup(gr.id).then(function(val){
            const filter2 = this.dataSource2.filter;
            this.storage.selectedGroup.displayedUsers = val.reducedUsers;
            this.dataSource2 = new MatTableDataSource(this.storage.selectedGroup.displayedUsers);
            this.dataSource2.filter = filter2;
        }.bind(this),function(err){
        });
    };

    handleClick(action, row, i, table){
        switch (action) {
            case 'deleteButton':
                if(table==='groups'){
                    this.removeGroup(row);
                } else if(table==='users'){
                    this.removeUserFromGroup(row);
                }
                break;
            case 'ROW':
                if(table==='groups'){
                    this.openUserGroup(row);
                }
                break;
        }
    }

    addGroup() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "GLOBAL_ADMINISTRATION.USERS.ADDGROUP_TITLE",
                content: "GLOBAL_ADMINISTRATION.USERS.ADDGROUP_CONTENT",
                name: "GLOBAL_ADMINISTRATION.USERS.ADDGROUP_PLACEHOLDER",
                save: "GLOBAL.CREATE"
            }
        };

        const dialogRef = this.dialog.open(PromptDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.addUserGroup({
                    name: result.value
                }).then(res=>{
                    this.toast.success('GLOBAL_ADMINISTRATION.USERS.ADDUSERGROUP_SUCCESS');
                    this.refreshData();
                }, err=>{
                    if(err.status === 403){
                        this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.FORBIDDEN');
                    }else{
                        this.toast.error('GLOBAL_ADMINISTRATION.USERS.ADDUSERGROUP_ERROR');
                    }
                });
            }
        });
    }

    removeGroup(group) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "GLOBAL_ADMINISTRATION.USERS.REMOVEGROUP_TITLE",
                content: "GLOBAL_ADMINISTRATION.USERS.REMOVEGROUP_CONTENT",
                save: "GLOBAL.REMOVE"
            }
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.removeUserGroup(group.id).then(res=>{
                    this.toast.success('GLOBAL_ADMINISTRATION.USERS.REMOVEGROUP_SUCCESS');
                    this.refreshData();
                }, err=>{
                    if(err.status === 403){
                        this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.FORBIDDEN');
                    }else{
                        this.toast.error('GLOBAL_ADMINISTRATION.USERS.REMOVEGROUP_ERROR');
                    }
                });
            }
        });
    }

    addUserToGroup() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            usersOfGroup: this.storage.selectedGroup.displayedUsers,
            group: this.storage.selectedGroup.info,
            selectedGroup: this.storage.selectedGroup
        };

        const dialogRef = this.dialog.open(AddUserToGroupDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const filter2 = this.dataSource2.filter;
                this.storage.selectedGroup.displayedUsers = result;
                this.dataSource2.data = this.storage.selectedGroup.displayedUsers;
                this.dataSource2.filter = filter2;
            }
        });
    }

    removeUserFromGroup(user) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "GLOBAL_ADMINISTRATION.USERS.REMOVEUSER_TITLE",
                content: "GLOBAL_ADMINISTRATION.USERS.REMOVEUSER_CONTENT",
                save: "GLOBAL.REMOVE"
            }
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.service.removeUserFromGroup(this.storage.selectedGroup.info.id,user.id).then(res=>{
                    this.toast.success('GLOBAL_ADMINISTRATION.USERS.REMOVEUSER_SUCCESS');
                    const filter2 = this.dataSource2.filter;
                    this.storage.selectedGroup.displayedUsers = res;
                    this.dataSource2.data =this.storage.selectedGroup.displayedUsers;
                    this.dataSource2.filter = filter2;
                }, err=>{
                    if(err.status === 403){
                        this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.FORBIDDEN');
                    }else{
                        this.toast.error('GLOBAL_ADMINISTRATION.USERS.REMOVEUSER_ERROR');
                    }
                });
            }
        });
    }

    hasFeatureRight(arr,id): boolean {
        return (arr.indexOf(id)>-1);
    };

    toggleRight(feature, group){
        if(feature.allowedGroups.indexOf(group.id)>-1){
            //remove group-feature
            this.service.removeFeatureFromGroup(group.id, feature.id).then(function(val){
                this.refreshData();
                this.toast.success('GLOBAL_ADMINISTRATION.USERS.ROLES.REMOVED_SUCCESS');
            }.bind(this),function(err){
                this.refreshData();
                if(err.status === 403){
                    this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.FORBIDDEN');
                }else{
                    this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.REMOVED_ERROR');
                }
                this.refreshData();

            }.bind(this));
        }else {
            //add group-feature
            this.service.addFeatureToGroup(group.id,{id:feature.id}).then(function(val){
                this.refreshData();
                this.toast.success('GLOBAL_ADMINISTRATION.USERS.ROLES.ADDED_SUCCESS');
            }.bind(this),function(err){
                this.refreshData();
                if(err.status === 403){
                    this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.FORBIDDEN');
                }else{
                    this.toast.error('GLOBAL_ADMINISTRATION.USERS.ROLES.ADDED_ERROR');
                }
            }.bind(this));
        }
    }
}
