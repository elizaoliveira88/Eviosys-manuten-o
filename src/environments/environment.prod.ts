import { HttpMockRequestInterceptor } from '@interceptor/mock/mock.interceptor';
import { DelayInterceptor } from '@interceptor/mock/delay.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {IvUserInterceptor} from "@interceptor/iv-user/iv-user.interceptor";

export const environment = {
    production: window["env"]["PRODUCTION"],
    isDevelop: false,
    includeSpecials: true,
    usesLogin: true,
    appEndpoint: window["env"]["APP_ENDPOINT"],
    apiEndpoint: window["env"]["API_ENDPOINT"],
    user: '',
    password: '',
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
    serviceEndPoint:"",
    clientSecret:"",
    clientId:""
};

export const ENVIRONMENT_SPECIFIC_PROVIDERS = [/*{
    provide: HTTP_INTERCEPTORS,
    useClass: DelayInterceptor,
    multi: true
},{
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
