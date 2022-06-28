import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { TranslateService } from '@ngx-translate/core';
import { MasterDataThisAndThatProvider } from './master-data/MasterData.thisAndThat.provider';
import { ToastService } from '@shared/services/toast.service';
import { PersistenceService } from '@shared/services/database/persistence.service';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import {environment} from "@environments/environment";
import {Subject} from "rxjs";
import {User} from "@shared/models/User";

@Injectable({
    providedIn: 'root'
})
export class MasterDataProvider extends MasterDataThisAndThatProvider {
    userData: User = User.jsonToUser({});
    constructor(
        public gatewayService: GatewayService,
        public translate: TranslateService,
        public toast: ToastService,
        public dialog: MatDialog,
        public dataStore: MasterDataStore
    ) {
        super(gatewayService, translate, toast, dialog, dataStore);
        this.userData = dataStore.userData;
        dataStore.user_changed.subscribe(user=>{
            if(user){
                this.userData = user;
            }
        });
    }

    performLogin(credentials) {
        /*if(environment.isDevelop && credentials.userName!==environment.user) {
            return new Promise((resolve, reject) => {
                this.toast.error('use valid test user');
                reject();
            });
        }*/
        return this.login(credentials).then(function () {
            return this.load();
        }.bind(this), err => new Promise((resolve, reject) => {
            reject();
        }))
    }

    login(credentials) {
        this.userData.userName = credentials.userName;

        return new Promise((resolve, reject) => {
            this.gatewayService.get({
                url: environment.urlBaseService.login
            }).then((data) => {
                this.isLoggedIn = true;
                this.dataStore.userData = data.user;
                this.dataStore.userRights = data.userRights;
                resolve('');
            }, (err) => {
                console.log(err)
                reject();
            });
        });
    }

    public load() {
        const sessionUser = sessionStorage.getItem('fp.userName');
        const sessionUserId = sessionStorage.getItem('fp.userId');
        if(sessionUser && sessionUser!='' && sessionUserId && sessionUserId!=''){
            this.dataStore.setUserBaseData({name:sessionUser, id:sessionUserId});
        }

        if(!this.userData ||this.userData.id===null || this.userData.id===undefined || this.userData.id==="undefined" || this.userData.id===""){
            return;
        }

        return new Promise((resolve, reject) => {
            let calls = [];
            var promiseUser = this.gatewayService.get({
                url: environment.urlBaseService.me.replace('{id}', this.userData.id)
            });

            this._createStatusElement('loading User Master Data', promiseUser);
            calls.push(promiseUser);

            resolve(true)
            Promise.all(calls).then( (responses) =>{
                this.dataStore.userData = responses[0];
                resolve(true);
            }, (error) => {
                this.performLogout();
                reject();
            });
        });
    }

    performLogout() {
        this.isLoggedIn = false;
        sessionStorage.clear();
    }

    public getCurrentLanguage(): string {
        return this.translate.currentLang;
    }

    /* /EvCache/CACHE */
    public getUserCache(path?) {
        if(!path) {
            return JSON.parse(JSON.stringify(this.userCacheSet));
        }
        var pathPieces = path.split('/');
        var row = this.userCacheSet;
        for(var x=0; x<pathPieces.length; x++) {
            if(pathPieces[x] == '') continue;
            if(row.hasOwnProperty(pathPieces[x])) {
                row = row[pathPieces[x]];
            } else {
                row = null;
                x = pathPieces.length;
            }
        }
        return JSON.parse(JSON.stringify(row));
    }

    public getUIAttributeSet() {
        return this.uiAttributeSetData;
    }

    public modifyUIAttributeSet(path, value) {
        return this.uiAttributeSetData[path] = value;
    }

    /* CONTROL:VALUES */
    public getUIContentSet(path?) {
        if(!path) {
            return this.uiContentSetData;
        }
        if(this.uiContentSetData.hasOwnProperty(path)) {
            return this.uiContentSetData[path];
        }
        return null;
    }

    public getDeploymentTime() {
        return this.deploymentTime;
    }

    public getDevelopmentNotes() {
        return this.developmentNotes;
    }
    public getReleaseNotes() {
        return this.releaseNotes;
    }

    public getTranslation(lang) {
        return this.gatewayService.getTranslation(lang);
    }
}
