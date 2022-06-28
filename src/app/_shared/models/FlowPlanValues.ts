export interface FlowPlanValues_DATA {
    assessedBlockingTime: number;
    maxTruckUtilization: number;
    missionMapping: any;
    missionTable: any;
    missionTableVNA: any;
    processDurationAfterBreak: number;
}


export class FlowPlanValues implements FlowPlanValues_DATA {
    assessedBlockingTime = 0;
    maxTruckUtilization = 0;
    missionMapping: {};
    missionTable: {};
    missionTableVNA: {};
    processDurationAfterBreak = 0;

    constructor() {}
}
