import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Router} from '@angular/router';
import {MaterialModule} from '@app/material.module';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '@shared/shared.module';
import {LoginComponent} from './login.component';


@NgModule({
    declarations: [
        LoginComponent
    ],
    entryComponents: [
        LoginComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        MaterialModule,
        TranslateModule,
        SharedModule,
        RouterModule.forChild([{
            path: '',
            component: LoginComponent,
        }])
    ],
    providers: [
    ]
})
export class LoginModule {
    public constructor(
        private router: Router
    ) {
    }
}
