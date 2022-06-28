import { Injectable } from '@angular/core';
import { CanLoad,
         CanActivate,
         Route,
         Router,
         UrlTree,
         ActivatedRouteSnapshot,
         RouterStateSnapshot } from '@angular/router';
import { Observable } from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {routeNamesHome} from "@app/home/home.routes.names";

@Injectable()
export class ProjectGuard implements CanLoad, CanActivate {
    selectedProjectId: string = null;
    constructor(
        private router: Router,
        private masterData: MasterDataStore
    ) {
        this.selectedProjectId = this.masterData.selectedProjectId;
    }

    canLoad(route: Route): Observable<boolean> | boolean {
        this.selectedProjectId = this.masterData.selectedProjectId;
        if(this.selectedProjectId === null || this.selectedProjectId === undefined || this.selectedProjectId==='') {
            this.router.navigate([routeNamesHome.WELCOME]);
            return false;
        }
        return true;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree | Observable<boolean> | boolean {
        this.selectedProjectId = this.masterData.selectedProjectId;
        if(this.selectedProjectId === null || this.selectedProjectId === undefined || this.selectedProjectId==='') {
            this.router.navigate([routeNamesHome.WELCOME]);
            return false;
        }
        return true;
    }
}
