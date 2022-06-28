import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {MasterDataStore} from "@shared/provider/MasterData.store";

@Injectable()
export class IvUserInterceptor implements HttpInterceptor {
    constructor(private masterDataStore: MasterDataStore) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if account is logged in and request is to the api url
        const userName = this.masterDataStore.userName;
        if (userName) {
            request = request.clone({
                setHeaders: { 'iv-user': userName }
            });
        }

        return next.handle(request);
    }
}
