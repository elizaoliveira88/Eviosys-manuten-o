import { Injectable } from '@angular/core';
import { GatewayService } from '@services/gateway-service/gateway.service';


@Injectable({
    providedIn: 'root',
})
export class InfoService {
    constructor(public gatewayService: GatewayService) {}

    getInfo(id: string): Promise<any> {
        const url = '/projects/' + id + '?exclude=FLOW_PLAN_RESULTS&exclude=WAREHOUSE_DESIGN';
        return this.gatewayService.get({
            url: url,
        });
    }

    patchProject(project, id: string): Promise<any> {
        const url = 'projects/' + id;
        return this.gatewayService.patch({
            data: project,
            url: url,
        });
    }
}
