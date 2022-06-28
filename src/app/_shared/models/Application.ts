import {Settings, Settings_DATA} from "@shared/models/UserSettings";
import {InputValues, InputValues_DATA} from "@shared/models/InputValues";
import {FlowPlanValues, FlowPlanValues_DATA} from "@shared/models/FlowPlanValues";
import {ApplicationTruck_DATA, ApplicationTruck_DATA_prepared} from "@shared/models/ApplicationTruck";

export interface Application_DATA{
    id: string;
    applicationChart: string;
    applicationType: string;
    archive: boolean;
    creationDate: string;
    flowPlan: boolean;
    flowPlanValues: FlowPlanValues_DATA;
    inputValues: InputValues_DATA;
    lastModified: string;
    name: string;
    nonPrintedComment: string;
    printedComment: string;
    roiChart: string;
    settings: Settings_DATA;
}


export class Application implements Application_DATA {
    id = "";
    applicationChart = "";
    applicationType = "";
    archive = false;
    creationDate = "";
    flowPlan = false;
    flowPlanValues = new FlowPlanValues();
    inputValues = new InputValues();
    lastModified = "";
    name = "";
    nonPrintedComment = "";
    printedComment = "";
    roiChart = "";
    settings = new Settings();

    constructor() {}

    static toUpdateApplicationBeforeCalc(app: Application_DATA): any{
        return {
            flowPlanValues: app.flowPlanValues,
            inputValues: app.inputValues,
            applicationChart: app.applicationChart
        }
    }
}
