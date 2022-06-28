import {AdditionalData_DATA} from "@shared/models/AdditionalData";
import {CalculationResult_DATA} from "@shared/models/CalculationResult";
import {EnergyConcept_DATA} from "@shared/models/EnergyConcept";
import {ExpertCritera_DATA} from "@shared/models/ExpertCritera";
import {FinanceInfo_DATA} from "@shared/models/FinanceInfo";
import {FlowPlanCalculationResult_DATA} from "@shared/models/FlowPlanCalculationResult";
import {SimpleTruck_DATA} from "@shared/models/SimpleTruck";

export interface ApplicationTruck_DATA {
    "additionalData": AdditionalData_DATA,
    "calculationResult": CalculationResult_DATA,
    "calculationShiftResults": CalculationResult_DATA[],
    "comment": string,
    "creationDate": string,
    "energyConcept": EnergyConcept_DATA,
    "expertCriteria": ExpertCritera_DATA,
    "financeInfo": FinanceInfo_DATA,
    "financeShiftInfos": FinanceInfo_DATA[],
    "flowPlanCalculationResult": FlowPlanCalculationResult_DATA,
    "flowPlanSelected": boolean,
    "id": number,
    "modifiedName": string,
    "selectedConfigurationOptions": string[],
    "truckId": any
}

export interface ApplicationTruck_DATA_filledTruck {
    "additionalData": AdditionalData_DATA,
    "calculationResult": CalculationResult_DATA,
    "calculationShiftResults": CalculationResult_DATA[],
    "comment": string,
    "creationDate": string,
    "energyConcept": EnergyConcept_DATA,
    "expertCriteria": ExpertCritera_DATA,
    "financeInfo": FinanceInfo_DATA,
    "financeShiftInfos": FinanceInfo_DATA[],
    "flowPlanCalculationResult": FlowPlanCalculationResult_DATA,
    "flowPlanSelected": boolean,
    "id": number,
    "modifiedName": string,
    "selectedConfigurationOptions": string[],
    "truck": SimpleTruck_DATA
}

export interface  ApplicationTruck_DATA_prepared extends ApplicationTruck_DATA{
    "position": number
}
