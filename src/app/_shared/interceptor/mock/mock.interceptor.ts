import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { mockRoutingGet } from '@interceptor/mock/mock.interceptor.routes.get';
import { mockRoutingPost } from '@interceptor/mock/mock.interceptor.routes.post';
import { mockRoutingDelete } from '@interceptor/mock/mock.interceptor.routes.delete';

@Injectable({
    providedIn: 'root'
})

export class HttpMockRequestInterceptor implements HttpInterceptor {

    mocks = {
        'GET': mockRoutingGet,
        'POST': mockRoutingPost,
        'DELETE': mockRoutingDelete
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const method = request.method ? request.method : '';
        const currentMock = this.mocks[method] ? this.mocks[method] : '';

        if (currentMock) {
            for (let x = 0; x < currentMock.length; x++) {
                const element = Object.assign({
                    headers: {'Content-Type': 'application/json; charset=utf-8'},
                    status: 200,
                    url: null,
                    enabled: true,
                    json: {},
                    type: 'partial'
                }, currentMock[x]);

                let match = false;
                if (!element.enabled) {
                    continue;
                }
                else if (element.type === 'partial' && request.url.indexOf(element.url) > -1) {
                    window.console.info('%c [1] Loaded from json: ' + request.url, "color: #FFaa00");
                    match = true;
                }
                else if (element.type === 'match' && request.url === element.url) {
                    window.console.info('%c [2] Loaded from json : ' + request.url, "color: #FFaa00");
                    match = true;
                }

                if (match) {
                    return of(new HttpResponse({
                        status: element.status,
                        headers: new HttpHeaders(element.headers || {}),
                        body: (((element.json) as any).default || {})
                    }));
                }

            }
        }

        return next.handle(request);
    }
}
