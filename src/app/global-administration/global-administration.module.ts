import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '@shared/shared.module';
import {MaterialModule} from '@app/material.module';
import {RouterModule} from '@angular/router';
import {
    routeNamesGlobalAdministration
} from "@app/global-administration/global-administration.routes.names";
import {SubMenuGlobalManagementComponent} from "@app/global-administration/sub-menu/sub-menu.component";
import {
    GlobalUserManagementComponent
} from "@app/global-administration/global-user-management/global-user-management.component";
import { TemplateManagementComponent } from './template-management/template-management.component';
import { TruckDataManagementComponent } from './truck-data-management/truck-data-management.component';
import { ComponentDataManagementComponent } from './component-data-management/component-data-management.component';
import {
    GlobalUserManagementService
} from "@app/global-administration/global-user-management/global-user-management.service";
import {
    ComponentDataManagementService
} from "@app/global-administration/component-data-management/component-data-management.service";
import {
    TruckDataManagementService
} from "@app/global-administration/truck-data-management/truck-data-management.service";
import {TemplateManagementService} from "@app/global-administration/template-management/template-management.service";
import {
    AddUserToGroupDialogComponent
} from "@app/global-administration/global-user-management/dialogs/add-user-to-group.dialog/add-user-to-group.dialog.component";
import {TreeModule} from "@circlon/angular-tree-component";
import {EditorModule} from "@tinymce/tinymce-angular";
import {
    AddRowDialogComponent
} from "@app/global-administration/template-management/dialogs/add-row.dialog/add-row.dialog.component";


@NgModule({
    declarations: [
        GlobalUserManagementComponent,
        SubMenuGlobalManagementComponent,
        TemplateManagementComponent,
        TruckDataManagementComponent,
        ComponentDataManagementComponent,
        AddUserToGroupDialogComponent,
        AddRowDialogComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        CommonModule,
        SharedModule,
        MaterialModule,
        EditorModule,
        RouterModule.forChild([{
            path: '',
            component: SubMenuGlobalManagementComponent,
            outlet: 'mainSubmenu'
        }, {
            path: '',
            pathMatch: 'full',
            redirectTo: routeNamesGlobalAdministration.USERS
        }, {
            path: routeNamesGlobalAdministration.USERS,
            component: GlobalUserManagementComponent
        }, {
            path: routeNamesGlobalAdministration.TEMPLATES,
            component: TemplateManagementComponent
        }, {
            path: routeNamesGlobalAdministration.TRUCKDATA,
            component: TruckDataManagementComponent
        }, {
            path: routeNamesGlobalAdministration.COMPONENTS,
            component: ComponentDataManagementComponent
        }
        ]),
        TreeModule
    ],
    providers: [
        GlobalUserManagementService,
        ComponentDataManagementService,
        TruckDataManagementService,
        TemplateManagementService

    ]
})
export class GlobalAdministrationModule {
}
