import {OptimizationApplication_DATA} from "@shared/models/OptimizationApplication";

export interface Optimization_DATA{
    "id": number,
    "name": string,
    "creationDate":  string,
    "createdBy": string,
    "lastModified": string,
    "optimizationApplications": OptimizationApplication_DATA[],
    "optData": any
}
