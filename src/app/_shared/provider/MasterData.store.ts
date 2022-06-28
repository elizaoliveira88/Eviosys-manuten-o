import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { PersistenceService } from '@services/database/persistence.service';
import {User, User_DATA} from "@shared/models/User";
import {SimpleTruck_DATA} from "@shared/models/SimpleTruck";
import {Project_DATA} from "@shared/models/Project";
import {SimpleTrailer_DATA} from "@shared/models/SimpleTrailer";

@Injectable({
    providedIn: 'root'
})
export class MasterDataStore {
    public user_changed = new BehaviorSubject<User>(null);
    public project_changed = new BehaviorSubject<any>(null);
    public trucks_changed = new BehaviorSubject<SimpleTruck_DATA[]>(null);
    public trailers_changed = new BehaviorSubject<SimpleTrailer_DATA[]>(null);
    private storage = {
        instanceGuid: null,
        sendErrorlog: false,
        appShortName: 'MSDCUS',
        userData: User.jsonToUser({}),
        selectedProject: {
            id: null,
            name: null
        },
        userViewSettings: {
            welcome: 'table',
            projects: 'table',
            applications: 'table'
        },
        userClients: [],
        userImage: null,
        userName: '',
        timeFormat: {
            Datfm: 'dd.MM.yyyy'
        },
        userRights: [],
        allTrucks: <SimpleTruck_DATA[]>[],
        allTrailers: <SimpleTrailer_DATA[]>[]
    };

    public profileImageChange = new BehaviorSubject(this.storage.userImage);
    private _selectedClient = new BehaviorSubject(null);

    constructor(
        public database: PersistenceService
    ) {
        this.storage.instanceGuid = this.createGuid();
        this.storage.userData.userName = this.database.loadLocalSetting('user');
        this._selectedClient.next(this.database.loadLocalSetting('selectedClientId'));

        const temp = sessionStorage.getItem('fp.selectedProject');
        if(temp && temp!==''){
            this.selectedProject = JSON.parse(temp);
        }

        const tempUserViewSettings = sessionStorage.getItem('fp.userViewSettings');
        if(tempUserViewSettings && tempUserViewSettings!==''){
            this.storage.userViewSettings = JSON.parse(tempUserViewSettings);
        }

    }

    public getInstanceGuid() {
        if(this.storage.instanceGuid == null) {
            this.storage.instanceGuid = this.createGuid();
        }
        return this.storage.instanceGuid;
    }

    public getAppShortName() {
        return this.storage.appShortName;
    }

    public createGuid = function() { // this is not a true guid, cause we cannot check if it is unique ...
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    private _toNumber(options) {
        options = Object.assign({
            value: null,
            defaultValue: 0,
            min: null,
            max: null
        }, options || {});

        options.value = Number(options.value);
        if(isNaN(options.value)) {
            options.value = options.defaultValue;
        }
        if(options.min != null && options.value < options.min) {
            options.value = options.defaultValue;
        }
        if(options.max != null && options.value > options.max) {
            options.value = options.defaultValue;
        }
        return options.value;
    }

    get sendErrorlog(): boolean {
        return this.storage.sendErrorlog;
    }
    set sendErrorlog(val: boolean) {
        this.storage.sendErrorlog = val;
    }

    get userImage() {
        return this.storage.userImage;
    }
    set userImage(data) {
        this.storage.userImage = data;
        this.profileImageChange.next(data);
    }

    get userData(): User_DATA {
        return this.storage.userData;
    }

    get userRights(): string[] {
        return this.storage.userRights;
    }

    set userRights(data){
        sessionStorage.setItem('fp.userRights', JSON.stringify(data));
        this.storage.userRights = data;
    }

    set userData(data) {
        this.storage.userData = data;
        sessionStorage.setItem('fp.userName', this.storage.userData.userName);
        sessionStorage.setItem('fp.userId', this.storage.userData.id);
        this.user_changed.next(this.storage.userData);
    }

    setUserBaseData({name, id}) {
        this.storage.userData.userName = name;
        sessionStorage.setItem('fp.userName', this.storage.userData.userName);
        this.storage.userData.id = id;
        sessionStorage.setItem('fp.userId', this.storage.userData.id);
        this.user_changed.next(this.storage.userData);
    }

    get timeFormat() {
        return this.storage.timeFormat;
    }

    get selectedProjectId(): string {
        return this.storage.selectedProject.id;
    }
    set selectedProject({id,name}) {
        sessionStorage.setItem('fp.selectedProject', JSON.stringify({id,name}));
        this.storage.selectedProject = {id, name};
        this.project_changed.next(this.storage.selectedProject);
    }
    get selectedProject(): any {
        return this.storage.selectedProject;
    }

    get userName(): string {
        return this.storage.userData.userName;
    }

    set allTrucks(data: SimpleTruck_DATA[]){
        this.storage.allTrucks = data;
        this.trucks_changed.next(this.storage.allTrucks);
    }

    get allTrucks(): SimpleTruck_DATA[]{
        return this.storage.allTrucks;
    }

    set allTrailers(data: SimpleTrailer_DATA[]){
        this.storage.allTrailers = data;
        this.trailers_changed.next(this.storage.allTrailers);
    }

    get allTrailers(): SimpleTrailer_DATA[]{
        return this.storage.allTrailers;
    }

    setUserViewSettings(type: string, setting: string) {
        this.storage.userViewSettings[type] = setting;
        sessionStorage.setItem('fp.userViewSettings', JSON.stringify(this.storage.userViewSettings));
    }

    getUserViewSettings(type): any {
        return this.storage.userViewSettings[type];
    }
}
