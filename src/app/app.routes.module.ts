import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { appRoutesNames } from './app.routes.names';
import { AppComponent } from './app.component';
import { MissingPermissionComponent } from './app.missing-auth.component';
import { LoginGuard } from '@shared/guards/Login.guard';
import {
    ComponentsExampleViewComponent
} from "@shared/components/components-example-view/components-example-view.component";

const routes: Routes = [{
    path: appRoutesNames.LOGIN,
    loadChildren: () => import('./login/login.module').then(mod => mod.LoginModule)
},{
    path: 'fp',
    component: AppComponent,
    canLoad: [LoginGuard],
    canActivate: [LoginGuard],
    children: [{
        path: appRoutesNames.HOME,
        loadChildren: () => import('./home/home.module').then(mod => mod.HomeModule)
    },{
        path: appRoutesNames.PROJECTS + '/:id',
        loadChildren: () => import('./project/project.module').then(mod => mod.ProjectModule)
    },{
        path: appRoutesNames.GLOBAL_ADMINISTRATION,
        loadChildren: () => import('./global-administration/global-administration.module').then(mod => mod.GlobalAdministrationModule)
    },{
        path: appRoutesNames.NO_AUTH,
        component: MissingPermissionComponent
    },{
        path: appRoutesNames.COMPONENTS_EXAMPLES,
        component: ComponentsExampleViewComponent
    },{
        path: '',
        pathMatch: 'full',
        redirectTo: appRoutesNames.HOME // STARTING PAGE
    },{
        path: '**',
        redirectTo: appRoutesNames.HOME // STARTING PAGE
    }]
},{  // THESE LAST 2 ALWAYS HAVE TO BE THE STARTING PAGE
    path: '',
    redirectTo: 'fp', // STARTING PAGE
    pathMatch: 'full'
},{
    path: '**',
    redirectTo: 'fp' // STARTING PAGE
}];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'corrected' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
