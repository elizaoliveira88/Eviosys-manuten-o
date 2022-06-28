import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";

@Injectable({
  providedIn: 'root'
})
export class TemplateManagementService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getTemplates(): Promise<any>  {
        const url = 'offer/templates';
        return this.gatewayService.get({
            url: url
        });
    }

    getTemplateById(id): Promise<any> {
        const url = 'offer/templates/' + id + '/template';
        return this.gatewayService.get({
            url: url
        });
    }

    getTemplateTranslations(id): Promise<any> {
        const url = 'offer/templates/'+id+'/translations';
        return this.gatewayService.get({
            url: url
        });
    }

    getSysValues(): Promise<any> {
        const url = 'offer/variables/definition';
        return this.gatewayService.get({
            url: url
        });
    }

    postImage(data): Promise<any> {
        const url = 'offer/images';
        return this.gatewayService.post({
            url: url,
            formMultipart: true,
            data:  data
        });
    }
}
