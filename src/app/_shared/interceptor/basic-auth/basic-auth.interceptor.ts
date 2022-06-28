import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthData {
  username: string;
  password: string;
  phrase?: string;
  apiEndpoint: string
}

export class HttpBasicAuthInterceptor implements HttpInterceptor {
    auth: AuthData;
    constructor(
        auth: AuthData
    ) {
        if(auth && auth.username != null &&  auth.password != null) {
            this.auth = Object.assign({}, auth, {
                phrase: window.btoa(auth.username + ':' + auth.password)
            });
        } else {
            this.auth = {
                username: null,
                password: null,
                phrase: null,
                apiEndpoint: null
            };
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.auth.apiEndpoint == null || request.url.indexOf(this.auth.apiEndpoint) == -1) {
            return next.handle(request);
        }

        if(this.auth.phrase != null) {
            // add authorization header with basic auth credentials if available
            request = request.clone({
                setHeaders: {
                    Authorization: `Basic ${this.auth.phrase}`
                }
            });
        }
        return next.handle(request);
    }
}
