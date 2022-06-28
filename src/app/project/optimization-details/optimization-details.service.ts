import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {Application_DATA} from "@shared/models/Application";
import {Optimization_DATA} from "@shared/models/Optimization";

@Injectable({
  providedIn: 'root'
})
export class OptimizationDetailsService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getOptimizationById(id: string): Promise<Optimization_DATA>  {
        const url = 'optimizations/'+id;
        return this.gatewayService.get({
            url: url
        });
    }

    getProjectSettings(id){
        const url = 'projects/' + id + "?exclude=vendorData";
        return this.gatewayService.get({
            url: url
        });
    }
}
