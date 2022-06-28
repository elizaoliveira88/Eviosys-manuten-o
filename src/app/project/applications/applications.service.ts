import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {User} from "@shared/models/User";
import {Application_DATA} from "@shared/models/Application";

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {

    constructor(public gatewayService: GatewayService,
                public dataStore: MasterDataStore) { }

    getAllApplications(projectId: string): Promise<Application_DATA[]>  {
        const url = 'projects/'+projectId+'/applications';
        return this.gatewayService.get({
            url: url
        });
    }

    getApplications(projectId: string): Promise<Application_DATA[]>  {
        const url = 'projects/'+projectId+'/applications?archive=false';
        return this.gatewayService.get({
            url: url
        });
    }

    getArchivedApplications(projectId: string): Promise<Application_DATA[]>  {
        const url = 'projects/'+projectId+'/applications?archive=true';
        return this.gatewayService.get({
            url: url
        });
    }

    addApplication(projectId: string, data): Promise<Application_DATA>  {
        const url = 'projects/'+projectId+'/applications';
        return this.gatewayService.post({
            url: url,
            data: {
                applicationType: data.applicationType,
                name: data.name,
                flowPlan: data.flowPlan
            }
        });
    }

    deleteApplication(appId: string): Promise<Application_DATA[]>  {
        const url = 'applications/' + appId;
        return this.gatewayService.delete({
            url: url
        });
    }

    archiveApplication(appId: string): Promise<Application_DATA>  {
        const url = 'applications/' + appId;
        return this.gatewayService.patch({
            url: url,
            data: {
                archive: true
            }
        });
    }

    unarchiveApplication(appId: string): Promise<Application_DATA>  {
        const url = 'applications/' + appId;
        return this.gatewayService.patch({
            url: url,
            data: {
                archive: false
            }
        });
    }

}
