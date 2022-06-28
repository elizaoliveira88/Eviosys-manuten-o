import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { environment } from '@environments/environment';


@Injectable()
export class HttpBearerInterceptor implements HttpInterceptor {
    private readonly apiEndpoint: string;
    constructor(
        public dataStore: MasterDataStore,
    ) {
        this.apiEndpoint = environment.apiEndpoint ? environment.apiEndpoint : '';
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const token: string = this.dataStore.userToken;

        if (this.apiEndpoint == null || request.url.indexOf(this.apiEndpoint) == -1) {
            return next.handle(request);
        }

        if (token) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return next.handle(request);
    }
}
