import { Injectable } from '@angular/core';
import { GatewayService } from '@services/gateway-service/gateway.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

    constructor(
        private gatewayService: GatewayService
    ) {
    }

    // TODO: is this needed?
//    getProjects(options?): Promise<any> {
//        return this.gatewayService.get({
//            service: 'DEVICES',
//            url: "/devices"
//        });
//    }

}
