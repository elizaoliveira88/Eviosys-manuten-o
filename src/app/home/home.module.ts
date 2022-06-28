import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WelcomeService} from "@app/home/welcome/welcome.service";
import {WelcomeComponent} from "@app/home/welcome/welcome.component";
import {TranslateModule} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {SharedModule} from "@shared/shared.module";
import {MaterialModule} from "@app/material.module";
import {RouterModule} from "@angular/router";
import {routeNamesHome} from "@app/home/home.routes.names";
import {SettingsComponent} from './settings/settings.component';
import {SubMenuHomeComponent} from "@app/home/sub-menu/sub-menu.component";
import {MatBadgeModule} from "@angular/material/badge";
import {FoldersComponent} from './folders/folders.component';
import {AddProjectDialogComponent} from "@app/home/folders/dialogs/add-project.dialog/add-project.dialog.component";
import { ManutencaoDeFerramentasComponent } from './manutencao-de-ferramentas/manutencao-de-ferramentas.component';

@NgModule({
    declarations: [
        SubMenuHomeComponent,
        WelcomeComponent,
        SettingsComponent,
        FoldersComponent,
        AddProjectDialogComponent,
        ManutencaoDeFerramentasComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        CommonModule,
        SharedModule,
        MaterialModule,
        RouterModule.forChild([{
            path: '',
            component: SubMenuHomeComponent,
            outlet: 'mainSubmenu'
        }, {
            path: '',
            pathMatch: 'full',
            redirectTo: routeNamesHome.WELCOME
        }, {
            path: routeNamesHome.WELCOME,
            component: WelcomeComponent
        }, {
            path: routeNamesHome.SETTINGS,
            component: SettingsComponent
        }, {
            path: routeNamesHome.PROJECTS,
            component: FoldersComponent
        }, {
            path: routeNamesHome.PROJECTS + '/:id',
            component: FoldersComponent
        }
        ])
    ],
    providers: [
        WelcomeService
    ]
})
export class HomeModule {
}
