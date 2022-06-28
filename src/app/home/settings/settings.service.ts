import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {User} from "@shared/models/User";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

    constructor(public gatewayService: GatewayService,
                public dataStore: MasterDataStore) { }

    getUser(username: string): Promise<any>  {
        const url = 'users/find?username='+username;
        return this.gatewayService.get({
            url: url
        });
    }

    patchUser(user:Partial<User>, id: string): Promise<any>{
        const url = 'users/'+id;
        return this.gatewayService.patch({
            data: user,
            url: url
        });
    }
}
