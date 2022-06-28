import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivationEnd } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable()
export class CancelGetRequestsOnRouterChangeInterceptor implements HttpInterceptor {
    private pendingHTTPRequests$ = new Subject<void>();

    constructor(router: Router) {
        router.events.subscribe(event => {
            // An event triggered at the end of the activation part of the Resolve phase of routing.
            if (event instanceof ActivationEnd) {
                // Cancel pending calls
                this.cancelPendingRequests();
            }
        });
    }

    // Cancel Pending HTTP calls
    public cancelPendingRequests() {
        this.pendingHTTPRequests$.next();
    }

    public onCancelPendingRequests() {
        return this.pendingHTTPRequests$.asObservable();
    }

    intercept<T>(request: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
        if(request.method !== 'GET') { // do not kill posts as we will loose this data ...
            return next.handle(request);
        }
        if (request.url.indexOf(environment.apiEndpoint) == -1) { // do not kill a resource get, only our api calls
            return next.handle(request);
        }
        return next.handle(request).pipe(takeUntil(this.onCancelPendingRequests()))
    }
}
