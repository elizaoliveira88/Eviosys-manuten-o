import {ApplicationTruck_DATA_filledTruck} from "@shared/models/ApplicationTruck";

export interface OptimizationTruck_DATA{
    "id": number,
    "applicationTruck": ApplicationTruck_DATA_filledTruck,
    "selected":  boolean
}
