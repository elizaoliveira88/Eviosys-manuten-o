import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TamInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(map((event: HttpResponse<any>) => {
            if(event instanceof HttpResponse) {
                if((event.headers.get('Content-Type') + '').toLowerCase().indexOf('html') > -1 && event.body.indexOf('pkms') > -1) {
                    location.reload();
                }
            }
            return event;
        }),catchError(err => {
            try {
                if (err.status === 401) {
                    // auto logout if 401 response returned from api
                    location.href = environment.appEndpoint ? environment.appEndpoint : "/";
                } else if(err && err.headers && (err.headers.get('Content-Type') + '').toLowerCase().indexOf('html') > -1 && err.hasOwnProperty('error') && err.error != null && err.error.hasOwnProperty('text') && err.error.text.indexOf('pkms') > -1) {
                    location.href = environment.appEndpoint ? environment.appEndpoint : "/";
//                    alert('tam detected');
                }
            } catch(err) { console.debug(err); }
            return throwError(err);
        }))
    }
}
