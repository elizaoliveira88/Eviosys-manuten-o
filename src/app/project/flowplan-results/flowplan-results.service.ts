import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {FlowPlanResultSet, FlowPlanTruckSet} from "@shared/models/FlowPlanTruckSet";
import {Project_DATA} from "@shared/models/Project";

@Injectable({
  providedIn: 'root'
})
export class FlowplanResultsService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getFlowPlanResults(projectId: string): Promise<FlowPlanResultSet>  {
        const url = 'projects/'+projectId+'/flowPlanResults';
        return this.gatewayService.get({
            url: url
        });
    }
}
