import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {Application_DATA} from "@shared/models/Application";

@Injectable({
  providedIn: 'root'
})
export class TrucksService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getProjectTrucks(projectId: string): Promise<any[]>  {
        const url = 'projects/'+projectId+'/projectTrucks';
        return this.gatewayService.get({
            url: url
        });
    }

    patchProjectTruck(data: any, projectTruckId: any): Promise<any>{
        const url = 'projectTrucks/'+projectTruckId;
        return this.gatewayService.patch({
            url: url,
            data: data
        });
    }

    postProjectTruck(data: any): Promise<any>{
        const url = 'projects/'+this.dataStore.selectedProjectId+'/projectTrucks';
        return this.gatewayService.post({
            url: url,
            data: data
        });
    }

    removeProjectTruck(projectTruckId: any): Promise<any>{
        const url = 'projectTrucks/' + projectTruckId;
        return this.gatewayService.delete({
            url: url
        });
    }
}
