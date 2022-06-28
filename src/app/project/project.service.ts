import { Injectable } from '@angular/core';
import { GatewayService } from '@services/gateway-service/gateway.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

    constructor(
        private gatewayService: GatewayService
    ) {
    }

}
