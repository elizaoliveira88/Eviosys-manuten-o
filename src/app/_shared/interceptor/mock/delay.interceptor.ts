import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

import { mockRoutingGet } from '@interceptor/mock/mock.interceptor.routes.get';

@Injectable()
export class DelayInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        for (const elem of mockRoutingGet) {
            const element = Object.assign(
                {
                    type: 'partial',
                    headers: {},
                    url: null,
                    json: {},
                },
                elem,
            );
            if (
                element.url != null &&
                ((element.type == 'partial' && request.url.indexOf(element.url) > -1) ||
                    (element.type == 'match' && request.url === element.url))
            ) {
                return next.handle(request).pipe(delay(666));
            }
        }
        return next.handle(request);
    }
}
