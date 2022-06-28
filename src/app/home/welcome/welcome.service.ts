import { Injectable } from '@angular/core';
import {GatewayService} from '@services/gateway-service/gateway.service';
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {Overview_DATA} from "@shared/models/Overview";

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {

    constructor(private gatewayService: GatewayService,
                public dataStore: MasterDataStore) {
    }

    getOverview(): Promise<Overview_DATA>  {
        const url = 'users/'+this.dataStore.userData.id+'/overview';
        return this.gatewayService.get({
            url: url
        });
    }

}
