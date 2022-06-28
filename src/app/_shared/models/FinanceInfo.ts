import {FinanceSegmentInfos_DATA} from "@shared/models/FinanceSegmentInfos";

export interface FinanceInfo_DATA{
    "aggregateCostDay": number,
    "aggregateCostYear": number,
    "buyingRent": boolean,
    "comment": string,
    "financeSegmentInfos": FinanceSegmentInfos_DATA[],
    "financing": number,
    "financingMonth": number,
    "grossPay": number,
    "grossSalaryDriver": number,
    "id": number,
    "maintenanceCosts": number,
    "oneOffCosts": number,
    "overallCarCosts": number,
    "overallConsumptionsCosts": number,
    "overallMaintenanceCosts": number,
    "overallPersonalCosts": number,
    "rate": number,
    "rent": number,
    "residualValue": number,
    "salesPrice": number
}
