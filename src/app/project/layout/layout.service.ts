import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {Project_DATA} from "@shared/models/Project";

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor(public gatewayService: GatewayService) { }

    loadWarehouseDesign(projectId: number): Promise<Project_DATA>  {
      //TODO: only load warehouse
        const url = 'projects/'+projectId+'?exclude=customerData,vendorData,flowPlanResults,settings'
        return this.gatewayService.get({
            url: url
        });
    }

    patchFlowPlanImages(data, projectId: number): Promise<Project_DATA>  {
        const url = 'projects/' + projectId + '/flowPlanImages';
        return this.gatewayService.patch({
            url: url,
            data: data
        });
    }

    patchWarehouseDesign(data, projectId: number): Promise<Project_DATA>  {
        const url = 'projects/' + projectId + '/warehouseDesign';
        return this.gatewayService.patch({
            url: url,
            data: data
        });
    }

    getProjectShiftInputs(projectId: number): Promise<any>  {
        const url = 'projects/' + projectId + '/shiftInputs';
        return this.gatewayService.get({
            url: url
        });
    }
}
