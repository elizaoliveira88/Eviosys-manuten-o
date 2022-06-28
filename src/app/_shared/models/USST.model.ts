import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class USSTModel {
    country: string; // : "de"
    email: string; // : "mail@it-objects.de"
    firstName: string;
    lastName: string;

    kionCountry: string; // : "de"
    language: string; //: "en_GB"
    userCompany: string; //: "Linde Material Handling AB"
    userCountry: string; //: "DE"
    username: string; //: "kx....."

    constructor() {
    }

    setData(data) {
        if(data) {
            if(data.hasOwnProperty('country')) {
                this.country = data.country.toUpperCase();
            }
            if(data.hasOwnProperty('email')) {
                this.email = data.email;
            }
            if(data.hasOwnProperty('firstName')) {
                this.firstName = data.firstName;
            }
            if(data.hasOwnProperty('lastName')) {
                this.lastName = data.lastName;
            }

            if(data.hasOwnProperty('kionCountry')) {
                this.kionCountry = data.kionCountry;
            }
            if(data.hasOwnProperty('language')) {
                this.language = data.language.substr(0,2).toUpperCase();
            }
            if(data.hasOwnProperty('userCompany')) {
                this.userCompany = data.userCompany;
            }
            if(data.hasOwnProperty('userCountry')) {
                this.userCountry = data.userCountry;
            }
            if(data.hasOwnProperty('username')) {
                this.username = data.username;
            }
        }
    }
}
