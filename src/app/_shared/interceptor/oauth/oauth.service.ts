import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, oAuthConfiguration } from '@environments/environment';
import { map } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class OAuthService {

    refreshToken: string;
    accessToken: string;
    constructor(private http: HttpClient) { }

    login(credentials): Observable<any> {
        return this.http.post(oAuthConfiguration.serviceEndPoint + 'signin', {
            username: credentials.username,
            password: credentials.password
        }, httpOptions).pipe(map(user => {
           // store user details and jwt token in local storage to keep user logged in between page refreshes
           localStorage.setItem('currentUser', JSON.stringify(user));
           return user;
       }));
    }

    logout(): Observable<any> {
        return this.http.post(oAuthConfiguration.serviceEndPoint + 'logout', {}, httpOptions);
    }

    getAccessToken(): string {
        return this.accessToken;
    }

    refreshAccessToken(): Observable<any> { // cordovaHTTP
        return this.http.post(oAuthConfiguration.serviceEndPoint + '/mga/sps/oauth/oauth20/token', {
            "refresh_token": this.refreshToken,
            "grant_type":"refresh_token",
            "client_secret": oAuthConfiguration.clientSecret,
            "client_id": oAuthConfiguration.clientId,
            "pin":"",
            "scope":"",
            "state":"",
            "redirect_uri":""
        }, {
            headers: new HttpHeaders({
                'Content-Type': 'application/x-www-form-urlencoded'
            })
        });
    }
}
