import { Injectable } from '@angular/core';
import { CanLoad,
         CanActivate,
         Route,
         Router,
         UrlTree,
         ActivatedRouteSnapshot,
         RouterStateSnapshot } from '@angular/router';
import { AccessControllService } from '@services/access-controll/access-controll.service';
import { Observable } from "rxjs";
import { MasterDataProvider } from '@app/_shared/provider/MasterData.provider';
import { environment } from '@environments/environment';
import { appRoutesNames } from '@app/app.routes.names';

@Injectable()
export class AuthGuard implements CanLoad, CanActivate {
    constructor(
        private router: Router,
        private access: AccessControllService,
        private masterData: MasterDataProvider
    ) {}

    canLoad(route: Route): Observable<boolean> | boolean {
        if(!route.data.hasOwnProperty('canLoadPermission')) return true;
        const permission = route.data["canLoadPermission"] as string;
        if(environment.usesLogin == true && !this.masterData.isLoggedIn) {
            this.router.navigate([appRoutesNames.LOGIN]);
            return false;
        } else if(this.access.isVisible(permission) && this.access.isEnabled(permission)) {
            return true;
        } else {
            this.router.navigate([appRoutesNames.NO_AUTH]);
            return false;
        }
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | Observable<boolean> | boolean {
        if(!route.data.hasOwnProperty('canActivatePermission')) return true;
        const permission = route.data["canActivatePermission"] as string;
        if(environment.usesLogin == true && !this.masterData.isLoggedIn) {
            return this.router.parseUrl('/' + appRoutesNames.LOGIN);
        } else if(this.access.isVisible(permission) && this.access.isEnabled(permission)) {
            return true;
        } else {
            return this.router.parseUrl('/' + appRoutesNames.NO_AUTH);
        }
    }
}
