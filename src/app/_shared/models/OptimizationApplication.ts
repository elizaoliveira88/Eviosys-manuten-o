import {Application_DATA} from "@shared/models/Application";
import {OptimizationTruck_DATA} from "@shared/models/OptimizationTruck";

export interface OptimizationApplication_DATA{
    "id": number,
    "application": Application_DATA,
    "selected":  boolean,
    "group": any
    "optimizationTrucks": OptimizationTruck_DATA[]
}
