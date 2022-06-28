import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MasterDataProvider } from '@shared/provider/MasterData.provider';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { PersistenceService } from '@services/database/persistence.service';
import { environment } from '@environments/environment';
import { MatDialog } from "@angular/material/dialog";
import {FormGroup} from "@angular/forms";
import {User} from "@shared/models/User";
import {ThemeService} from "@shared/theme/services/theme.service";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;

    constructor(
        public translate: TranslateService,
        private router: Router,
        private gatewayService: GatewayService,
        private masterData: MasterDataProvider,
        public database: PersistenceService,
        public dialog: MatDialog,
        public themeService: ThemeService
    ) {
        this.loginForm = User.createLoginForm({
            userName: environment.user,
            password: environment.password,
            showPassword: false
        });
    }

    makeLogin() {
        this.masterData.performLogin(this.loginForm.getRawValue()).then(function() {
            this.router.navigate(['fp','home']);
        }.bind(this), function() {
            // handle case where preloads are failing! .... eg a toast that the login is not available
            this.masterData.performLogout();
        }.bind(this));
    }
}
