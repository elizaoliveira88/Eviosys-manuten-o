import {FormControl, FormGroup, Validators} from "@angular/forms";
import {UserGroup} from "@shared/models/UserGroup";
import {Settings} from "@shared/models/UserSettings";

export interface User_DATA{
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    createdOn: any;
    settings: Settings;
    companyName: string;
    address: string;
    tel: string;
    fax: string;
    mobile: string;
    userGuidance: boolean;
    acceptedNewPrices: boolean;
    groups: UserGroup[];
    logo: string;
}

export class User implements User_DATA{
    id = '';
    userName = '';
    firstName = '';
    lastName = '';
    email = '';
    createdOn = '';
    settings = new Settings();
    companyName = '';
    address = '';
    tel = '';
    fax = '';
    mobile = '';
    userGuidance = false;
    acceptedNewPrices = false;
    groups = [];
    logo = '';

    constructor(json) {
        this.id = json.id;
        this.userName = json.userName;
        this.firstName = json.firstName;
        this.lastName = json.lastName;
        this.companyName = json.companyName;
        this.address = json.address;
        this.email = json.email;
        this.tel = json.tel;
        this.fax = json.fax;
        this.mobile = json.mobile;
        this.userGuidance = json.userGuidance;
        this.acceptedNewPrices = json.acceptedNewPrices;
        this.logo = json.logo;

        if(json.settings){
            this.settings = new Settings(json.settings);
        }

        let groups = [];
        if(json.groups){
            json.groups.forEach(el=>{
                groups.push(UserGroup.jsonToUserGroup(el));
            });
            this.groups = groups;
        }
    }

    static jsonToUser (json): User {
        let user = {
            id : json.id,
            userName : json.userName,
            firstName : json.firstName,
            lastName : json.lastName,
            email : json.email,
            createdOn : json.createdOn,
            companyName : json.companyName,
            address : json.address,
            tel : json.tel,
            fax : json.fax,
            mobile : json.mobile,
            userGuidance : json.userGuidance,
            acceptedNewPrices : json.acceptedNewPrices,
            groups : json.groups,
            logo : json.logo,
            settings: json.settings ? Settings.jsonToSettings(json.settings) : null
        }

        return user;
    }

    static createLoginForm (data) {
        return new FormGroup({
            userName: new FormControl(data.userName, [Validators.required, Validators.minLength(4)]),
            password: new FormControl(data.password, [Validators.required, Validators.minLength(4)]),
            showPassword: new FormControl(false)
        });
    }

    static userToJson (user:User) : any {
        let json = {};
        if(user.settings){
            json['settings'] = Settings.settingsToJson(user.settings);
        }
        json['firstName'] = user.firstName;
        json['lastName'] = user.lastName;
        json['companyName'] = user.companyName;
        json['address'] = user.address;
        json['email'] = user.email;
        json['tel'] = user.tel;
        json['fax'] = user.fax;
        json['mobile'] = user.mobile;
        json['logo'] = user.logo;
        json['userGuidance'] = user.userGuidance;

        return json;
    }

}
