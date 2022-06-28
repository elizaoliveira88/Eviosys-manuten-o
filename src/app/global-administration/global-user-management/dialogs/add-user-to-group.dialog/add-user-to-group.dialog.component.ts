import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastService} from "@services/toast.service";
import {
    GlobalUserManagementService
} from "@app/global-administration/global-user-management/global-user-management.service";
import {User} from "@shared/models/User";

@Component({
    selector: 'app-add-user-to-group.dialog',
    templateUrl: './add-user-to-group.dialog.component.html',
    styleUrls: ['./add-user-to-group.dialog.component.scss']
})
export class AddUserToGroupDialogComponent implements OnInit {
    storage = {
        searchTerm: '',
        selectedUsers: [],
        allUsers: [],
        usersOfGroup: []
    };

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<AddUserToGroupDialogComponent>,
                private service: GlobalUserManagementService,
                private toast: ToastService) {

        if (data.usersOfGroup) {
            this.storage.usersOfGroup = JSON.parse(JSON.stringify(data.usersOfGroup));
        }

        service.getUsersCompact().then(res => {
            this.storage.allUsers = res;
        }, err => {
            if (err.status === 403) {
                this.toast.error('GLOBAL_ADMINISTRATION.USERS.ADDUSERTOGROUP_FORBIDDEN');
            } else {
                this.toast.error('GLOBAL_ADMINISTRATION.USERS.ADDUSERTOGROUP_RETRIEVE_ERROR');
            }
        });
    }

    ngOnInit(): void {

    }

    checkUserInGroup(userId): boolean {
        for (var k = 0; k < this.storage.usersOfGroup.length; k++) {
            var usr = this.storage.usersOfGroup[k];
            if (usr.id === userId) return true;
        }
        return false;
    };

    cancel() {
        this.dialogRef.close(null);
    }

    save() {
        const idArray = [];
        this.storage.selectedUsers.forEach(user=>{
            idArray.push(user.id);
        })

        this.service.addUsersToGroup(this.data.selectedGroup.info.id, idArray).then(res=>{
            this.toast.success('GLOBAL_ADMINISTRATION.USERS.ADDUSERTOGROUP_SUCCESS');
            this.dialogRef.close(res);
        }, err=> {
            if(err.status === 403){
                this.toast.error('GLOBAL_ADMINISTRATION.USERS.ADDUSERTOGROUP_FORBIDDEN');
            }else{
                this.toast.error('GLOBAL_ADMINISTRATION.USERS.ADDUSERTOGROUP_ERROR');
            }
        });
    }

}
