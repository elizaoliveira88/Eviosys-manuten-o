import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {environment} from "@environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ComponentDataManagementService {

  constructor(private gatewayService: GatewayService) {

  }

}
