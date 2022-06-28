import {Settings} from "@shared/models/UserSettings";
import {ApplicationTruck_DATA} from "@shared/models/ApplicationTruck";
import {FinanceInfo_DATA} from "@shared/models/FinanceInfo";
import {ExpertCritera_DATA} from "@shared/models/ExpertCritera";
import {EnergyConcept_DATA} from "@shared/models/EnergyConcept";

export interface ProjectTruck_DATA{
    "active": boolean,
    "creationDate": string,
    "energyConcept": EnergyConcept_DATA,
    "expertCriteria": ExpertCritera_DATA,
    "financeInfo": FinanceInfo_DATA,
    "id":number,
    "trailerId":number,
    "truckId": number
}


export class ProjectTruck implements ProjectTruck_DATA{
    id = 0;
    trailerId = 0;
    truckId = 0;
    active = false;
    creationDate = '';

    energyConcept = {
        "batteryCapacity":0,
        "batteryChargeType": null,
        "batteryType": null,
        "batteryVoltage": 0
    };

    expertCriteria = {
        "depositTimeSec":0,
        "efficiencyFactor":0,
        "loadTime":0,
        "maxSpeed":0,
        "modified": false,
        "modifiedDepTime": false,
        "modifiedEfficiency": false,
        "modifiedMaxSpeed": false,
        "modifiedPallets": false,
        "modifiedRecTime": false,
        "modifiedSpeedLimit": false,
        "palletsPerDrive":0,
        "recordingTimeSec":0,
        "speedLimit": 0
    };

    financeInfo = {
        "aggregateCostDay":0,
        "aggregateCostYear":0,
        "buyingRent": false,
        "comment": null,
        "financing":0,
        "financingMonth":0,
        "grossPay":0,
        "grossSalaryDriver":0,
        "id":0,
        "maintenanceCosts":0,
        "oneOffCosts":0,
        "overallCarCosts":0,
        "overallConsumptionsCosts":0,
        "overallMaintenanceCosts":0,
        "overallPersonalCosts":0,
        "rate":0,
        "rent":0,
        "residualValue":0,
        "salesPrice": 0,
        "financeSegmentInfos":[]
    };


    constructor(json?) {
        if(json){
            this.id = json.id;
            this.trailerId = json.trailerId;
            this.creationDate = json.creationDate;
            this.truckId = json.truckId;
            this.active = json.active;
            this.energyConcept = json.energyConcept;
            this.expertCriteria = json.expertCriteria;
            this.financeInfo = json.financeInfo;
        }
    }

    static getNewProjectTruck(prTruck: ProjectTruck_DATA): any{
        return {
            truckId: prTruck.truckId,
            errorMessage: [],
            financeInfo: {
                'financing': prTruck.financeInfo.financingMonth,
                'grossPay': prTruck.financeInfo.grossSalaryDriver,
                "maintenanceCosts": prTruck.financeInfo.maintenanceCosts,
                'rate': prTruck.financeInfo.rate,
                'rent': prTruck.financeInfo.rent,
                'residualValue': prTruck.financeInfo.residualValue,
                'salesPrice': prTruck.financeInfo.salesPrice
            },
            expertCriteria: {
                'modified': prTruck.expertCriteria.modified,
                'modifiedDepTime': prTruck.expertCriteria.modifiedDepTime,
                'modifiedRecTime': prTruck.expertCriteria.modifiedRecTime,
                'modifiedPallets': prTruck.expertCriteria.modifiedPallets,
                'modifiedEfficiency': prTruck.expertCriteria.modifiedEfficiency,
                'efficiencyFactor': prTruck.expertCriteria.efficiencyFactor,
                'palletsPerDrive': prTruck.expertCriteria.palletsPerDrive,
                'loadTime': prTruck.expertCriteria.loadTime,
                'depositTimeSec': prTruck.expertCriteria.depositTimeSec,
                'recordingTimeSec': prTruck.expertCriteria.depositTimeSec
            },
            energyConcept: {
                'batteryType': prTruck.energyConcept.batteryType,
                'batteryChargeType': prTruck.energyConcept.batteryChargeType,
                'batteryCapacity': prTruck.energyConcept.batteryCapacity
            }
        }
    }


}
