import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { LoaderService } from './loader.service';

@Injectable({
    providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

    constructor(private loaderService: LoaderService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loaderService.show();
        return next.handle(req).pipe(
            catchError(err => {
                this.loaderService.hide();
                return throwError(err);
            }),
            finalize(() => {
                this.loaderService.hide();
            })
        );
    }
}
