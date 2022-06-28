import {HttpMockRequestInterceptor} from '@interceptor/mock/mock.interceptor';
import {DelayInterceptor} from '@interceptor/mock/delay.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    isDevelop: false,
    includeSpecials: true,
    usesLogin: true,
    appEndpoint: '/',
    apiEndpoint: 'https://dev-fleetplan.it-objects.de/fleetplan/api',
    user: 'Ivo',
    password: 'test12',
    urlBaseService: {
        login: 'users/simpleLogin/',
        me: 'users/{id}',
        simpleTrucks: 'trucks/basic',
        simpleTrailers: 'trailers/basic',
    },
    urlHomeService: {
        projects: 'users/{id}/projects'
    },
    urlGlobalAdministrationService: {
        featuresAndGroups: 'userGroups/featuresAndGroups',
        userGroup: 'userGroups/{id}',
        userGroups: 'userGroups/',
        addFeatureToGroup: 'userGroups/{userGroupId}/features',
        removeFeatureFromGroup: 'userGroups/{userGroupId}/features/{featureId}',
        usersCompact: 'users/compact',
        addUsersToGroup: 'userGroups/{userGroupId}/users/multiple',
        removeUserFromGroup: 'userGroups/{userGroupId}/users/{userId}',
        getOfferTemplates: 'offer/templates'
    }
};

export const oAuthConfiguration = {
    serviceEndPoint: "",
    clientSecret: "",
    clientId: ""
};

export const ENVIRONMENT_SPECIFIC_PROVIDERS = [/*{
    provide: HTTP_INTERCEPTORS,
    useClass: DelayInterceptor,
    multi: true
}, {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpMockRequestInterceptor,
    multi: true
}, */{
    provide: HTTP_INTERCEPTORS,
    useClass: IvUserInterceptor,
    multi: true
}/*,{
    provide: HTTP_INTERCEPTORS,
    useClass: HttpBearerInterceptor,
    multi: true
}*/];


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error';
import {IvUserInterceptor} from "@interceptor/iv-user/iv-user.interceptor";

