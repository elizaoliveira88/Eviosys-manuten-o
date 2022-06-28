import {Application_DATA} from "@shared/models/Application";
import {ApplicationTruck_DATA} from "@shared/models/ApplicationTruck";
import {SimpleTruck_DATA} from "@shared/models/SimpleTruck";
import {Project_DATA} from "@shared/models/Project";

export interface FlowPlanTruckSet {
    "application": Application_DATA,
    "applicationTruck": ApplicationTruck_DATA,
    "truckName": string,
    "truckClassification": string
}

export interface  FlowPlanResultSet {
    project: Partial<Project_DATA>,
    applications: FlowPlanApplication_DATA[]
}

export interface FlowPlanApplication_DATA extends Application_DATA{
    applicationTrucks: FlowPlanApplicationTruck_DATA[]
}

export interface FlowPlanApplicationTruck_DATA extends ApplicationTruck_DATA{
    truckClassification: string,
    truckName: string,
    application: FlowPlanApplication_DATA
}
