import { Injectable } from '@angular/core';
import { CanLoad,
         CanActivate,
         Route,
         Router,
         UrlTree,
         ActivatedRouteSnapshot,
         RouterStateSnapshot } from '@angular/router';
import { Observable } from "rxjs";
import { environment } from '@environments/environment';
import { appRoutesNames } from '@app/app.routes.names';
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {User} from "@shared/models/User";

@Injectable()
export class LoginGuard implements CanLoad, CanActivate {
    userData: User = User.jsonToUser({});
    constructor(
        private router: Router,
        public dataStore: MasterDataStore
    ) {
        const sessionUser = sessionStorage.getItem('fp.userName');
        const sessionUserId = sessionStorage.getItem('fp.userId');
        if(sessionUser && sessionUser!='' && sessionUserId && sessionUserId!=''){
            this.userData.id = sessionUserId;
            this.userData.userName = sessionUser;
        }

        this.userData = dataStore.userData;
        dataStore.user_changed.subscribe(user=>{
            this.userData = user;
        });
    }

    canLoad(route: Route): Observable<boolean> | boolean {
        if(environment.usesLogin == true && (!this.userData
            || this.userData.id===null
            || this.userData.id===undefined
            || this.userData.id==='')) {
            this.router.navigate([appRoutesNames.LOGIN]);
            return false;
        }
        return true;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | Observable<boolean> | boolean {
        if(environment.usesLogin == true && (!this.userData
            || this.userData.id===null
            || this.userData.id===undefined
            || this.userData.id==='')) {
            return this.router.parseUrl('/' + appRoutesNames.LOGIN);
        }
        return true;
    }
}
