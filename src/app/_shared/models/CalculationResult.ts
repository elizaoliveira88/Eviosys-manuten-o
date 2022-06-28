import {CalculationSegmentResult_DATA} from "@shared/models/CalculationSegmentResult";

export interface CalculationResult_DATA{
    "actualConsumption": number,
    "actualConsumptionUnit": string,
    "calculationSegmentResults": CalculationSegmentResult_DATA[],
    "carCount": number,
    "carNumber": number,
    "consumption": number,
    "consumptionUnit": string,
    "errorMessages": string[],
    "executed": string,
    "flow": number,
    "hourCounter": number,
    "id": number,
    "numberLoadingDock": number,
    "purchaser": number,
    "ratioPick": number,
    "successful": boolean,
    "timeCycle": number,
    "totalCost": number,
    "utilization": number
}
