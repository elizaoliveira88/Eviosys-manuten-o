export interface Settings_DATA {
    currency: string;
    pricePowerKwh: number;
    priceDiesel: number;
    priceGas: number;
    overallCostFactor: number;
    workingDays: number;
    maxSpeed: number;
    maxLoad: number;
    language: string;
}

export class Settings implements Settings_DATA{
    currency = '€';
    pricePowerKwh = 1;
    priceDiesel = 0.9;
    priceGas = 0.8;
    overallCostFactor = 1;
    workingDays = 220;
    maxSpeed = 25;
    maxLoad = null;
    language = 'en';

    constructor(json?) {
        if(json){
            this.currency = json.currency;
            this.pricePowerKwh = json.pricePowerKwh;
            this.priceDiesel = json.priceDiesel;
            this.priceGas = json.priceGas;
            this.overallCostFactor = json.overallCostFactor;
            this.workingDays = json.workingDays;
            this.maxSpeed = json.maxSpeed;
            this.maxLoad = json.maxLoad;
            this.language = json.language;
        }
    }

    static jsonToSettings(json): Settings {
        let settings = {
            currency: json.currency,
            pricePowerKwh: json.pricePowerKwh,
            priceDiesel: json.priceDiesel,
            priceGas: json.priceGas,
            overallCostFactor: json.overallCostFactor,
            workingDays: json.workingDays,
            maxSpeed: json.maxSpeed,
            maxLoad: json.maxLoad,
            language: json.language
        }
        return settings;
    }

    static settingsToJson(settings:Settings): any {
        return {
            currency: settings.currency,
            pricePowerKwh: settings.pricePowerKwh,
            priceDiesel: settings.priceDiesel,
            priceGas: settings.priceGas,
            overallCostFactor: settings.overallCostFactor,
            workingDays: settings.workingDays,
            maxSpeed: settings.maxSpeed,
            maxLoad: settings.maxLoad,
            language: settings.language
        }
    }
}
