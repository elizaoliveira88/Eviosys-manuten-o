import { Injectable, OnDestroy } from '@angular/core';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { UI_ATTRIBUTE_SET, UI_CONTENT_SET } from './app-permissions-blueprint';
import { ToastService } from '@shared/services/toast.service';
import { environment } from '@environments/environment';
import { MasterDataStore } from '@app/_shared/provider/MasterData.store';
import packageInfo from '../../../../../package.json';

@Injectable({
    providedIn: 'root'
})
export class MasterDataCachesProvider implements OnDestroy {
    public userCacheSet;
    public uiAttributeSetData;
    public uiContentSetData;
    public storage;
    public isLoggedIn = false; //localStorage.getItem('login') === 'true';
    public deploymentTime;
    public releaseNotes = {};
    public developmentNotes = {};
    public observablesToUnsubscribe = [];
    private materialTextLookup = {};

    constructor(
        public gatewayService: GatewayService,
        public translate: TranslateService,
        public toast: ToastService,
        public dialog: MatDialog,
        public dataStore: MasterDataStore
    ) {
        this.isLoggedIn = environment.usesLogin == true ? !!sessionStorage.getItem('userId') : true;
        this.userCacheSet = {};
        this.uiAttributeSetData = this._translateJSONObject(UI_ATTRIBUTE_SET);
        this.uiContentSetData = this._translateJSONObject(UI_CONTENT_SET);
        this.storage = {
            isDeveloper: (environment.production == false)
        };

        if(this.storage.isDeveloper == false) {
            try {
                if((window.location.href+'').indexOf('xtranet-dev') > -1 || (window.location.href+'').indexOf('xtranet-api-dev') > -1) {
                    this.storage.isDeveloper = true;
                }
            } catch(err) {}
        }

        this.materialTextLookup = {};

        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            // do something
            this._onLangChange(event.lang);
            this.materialTextLookup = {};
        });
    }

    public usesLogin() {
        return environment.usesLogin == true;
    }

    public getVersion() {
        return packageInfo.version;
    }

    set isDeveloper(value: boolean) {
        this.storage.isDeveloper = value;
    }
    get isDeveloper() {
        return this.storage.isDeveloper;
    }

    public _getCaches() {
        return {
            userCacheSet: this.userCacheSet,
            uiAttributeSetData: this.uiAttributeSetData,
            uiContentSetData: this.uiContentSetData
        };
    }

    ngOnDestroy() {
        for(var x=0; x<this.observablesToUnsubscribe.length; x++) {
            this.observablesToUnsubscribe[x].unsubscribe();
        }
    }

    public _onLangChange(lang: String) {
        if(lang == 'strings') { return; }
    }

    public _createStatusElement(description: String, promise?: Promise<any>) {
        var prm = {
            resolve: function(e) {},
            reject: function(er) {}
        };
        if(promise === undefined) {
            promise = new Promise((resolve, reject) => {
                prm.resolve = resolve;
                prm.reject = reject;
            });
        }
        var displayElementRoot = document.getElementById('loadingInfo');
        if(!displayElementRoot) { return prm; }

        var element = document.createElement('div');
            element.className = 'loadingDataInfo inprogress';
            element.innerText = '[...] ' + description;
        displayElementRoot.appendChild(element);

        promise.then(function(data) {
            element.innerText = '[OK!] ' + description;
            element.className = 'loadingDataInfo ok';
        }.bind(this), function() {
            element.innerText = '[ERR] ' + description;
            element.className = 'loadingDataInfo error';
        });
        return prm;
    }

    public _loadStartupData() {
        // build time
        var promiseDeploymentTime = new Promise(function(res,rej) {
            this.gatewayService.getDeploymentTime().then(function(data) {
                var nr = parseInt(data, 10);
                if(isNaN(nr)) { nr = 1577836800000; }
                if(nr <= 10000000000) {
                    nr = nr * 1000;
                }
                this.deploymentTime = new Date(nr);
                res();
            }.bind(this), function(err) {
                console.debug(err);
                res();
            });
        }.bind(this));

        // release notes
        var promiseReleaseNotes = new Promise(function(res,rej) {
            this.gatewayService.getReleaseNotes().then(function(data) {
                Object.keys(data).forEach(element => {
                    if(data[element].d == null) {
                        delete data[element];
                    }
                });
                this.releaseNotes = data;
                res();
            }.bind(this), function() { res(); });
        }.bind(this));

        // development notes
        var promiseDevelopmentNotes = new Promise(function(res,rej) {
            this.gatewayService.getDevelopmentNotes().then(function(data) {
                Object.keys(data).forEach(element => {
                    if(data[element].d == null) {
                        delete data[element];
                    }
                });
                this.developmentNotes = data;
                res();
            }.bind(this), function() { res(); });
        }.bind(this));

        return Promise.all([
            promiseDeploymentTime,
            promiseReleaseNotes,
            promiseDevelopmentNotes
        ]);
    }

    public _translateJSONObject(defaultTree): object {
        var fullTree = {};
    	var fnParseTree = function(tree, path) {
            ['visible','enabled','required'].forEach(function(type) {
    			if(tree.hasOwnProperty(type)) {
    				fullTree[path + '/' + type] = tree[type];
    			}
    		});
    		if(path == '/') {
    			path = '';
    		}
    		var keys = Object.keys(tree);
            keys.forEach(function(key) {
    			if((typeof tree[key]) == "object") {
    				fnParseTree(tree[key], path+'/'+key);
    			}
    		});
    	};
    	fnParseTree(defaultTree, '/');
        return fullTree;
    }

    public parseRuleSet(data, type): void {
        switch(type) {
            case 'UIAttributeSet':
                this.uiAttributeSetData = Object.assign({}, this._translateJSONObject(UI_ATTRIBUTE_SET), this.parseDeepUiSet(data) || {});
                break;
            case 'UIContentSet':
                this.uiContentSetData = Object.assign({}, this._translateJSONObject(UI_CONTENT_SET), this.parseDeepUiSet(data) || {});
                break;
            case 'CACHE':
                try {
                    this.userCacheSet = JSON.parse(data.Cache).CACHE;
                } catch(err) {
                    console.debug(err);
                    this.userCacheSet = {};
                }
                break;
            default:
                return;
        };
    }

    private parseDeepUiSet(jsonData): object {
        if(!jsonData) return;

        var oModelFields = {};
        var pathLookup = {};

        // helper to get full path
        var getPath = function(childId, path) {
            var fullEntry = pathLookup[childId];
            if(!fullEntry || fullEntry.Parent == '\\') {
                return '/' + fullEntry.Child + path;
            } else {
                return getPath(fullEntry.ParentInt, '/' + fullEntry.Child + path);
            }
        };

        var getValues = function(myString) {
            try {
                var jsonData = JSON.parse(myString);
                if(!jsonData || !jsonData.CONTENT) return [];

                var result = [];
                for(var x = 0; x < jsonData.CONTENT.length; x++) {
                    result.push({'key':jsonData.CONTENT[x].KEY, 'value':jsonData.CONTENT[x].VALUE});
                }
                return result;
            } catch(err) {
                console.error(err);
                return [];
            }
        };

        // store path for easy lookup
        jsonData.forEach(function(entry){
            pathLookup[entry.ChildInt] = entry;
        });

        // store data in src model
        jsonData.forEach(function(entry){
            var path = entry.hasOwnProperty('ExtPathId') ? entry.ExtPathId : getPath(entry.ChildInt,'');

            // fields
            if(entry.hasOwnProperty('Visible') && entry.Visible != '') {
                oModelFields[path + '/visible'] = entry.Visible.toLowerCase();
            }
            if(entry.hasOwnProperty('Enable') && entry.Enable != '') {
                oModelFields[path + '/enabled'] = entry.Enable.toLowerCase();
            }
            if(entry.hasOwnProperty('Obligatory') && entry.Obligatory != '') {
                oModelFields[path + '/required'] = entry.Obligatory.toLowerCase(); // Obligatory == required
            }
            // values
            if(entry.hasOwnProperty('KeyValue') && entry.KeyValue != '') {
                oModelFields[path] = getValues(entry.KeyValue);
            }
            // checks (es gibt für die checks KEINE Folie!
            if(entry.hasOwnProperty('Valmax') && entry.Valmax != '') {
                oModelFields[path + '/max'] = entry.Valmax;
            }
            if(entry.hasOwnProperty('Valmin') && entry.Valmin != '') {
                oModelFields[path + '/min'] = entry.Valmin;
            }
        });
        return oModelFields;
    }

}
