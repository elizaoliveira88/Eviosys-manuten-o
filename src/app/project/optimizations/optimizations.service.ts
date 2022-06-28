import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {Application_DATA} from "@shared/models/Application";
import {Optimization_DATA} from "@shared/models/Optimization";

@Injectable({
  providedIn: 'root'
})
export class OptimizationsService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getOptimizations(projectId: string): Promise<Optimization_DATA[]>  {
        const url = 'projects/'+projectId+'/optimizations';
        return this.gatewayService.get({
            url: url
        });
    }
}
