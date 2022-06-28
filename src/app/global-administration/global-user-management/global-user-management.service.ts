import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GatewayService} from '@services/gateway-service/gateway.service';
import {environment} from "@environments/environment";
import {MasterDataStore} from "@shared/provider/MasterData.store";

@Injectable({
  providedIn: 'root'
})
export class GlobalUserManagementService {

    constructor(public gatewayService: GatewayService,
                public dataStore: MasterDataStore) { }

              // ----- Client Super Admin Services -----

    getUsers(options?): Promise<any>  {
        const url = '/Users'+ (options && options.clientId ? '?clientId=' + options.clientId : '');
        return this.gatewayService.get({
            url: url
        });
    }

    getFeaturesAndGroups(): Promise<any> {
        return this.gatewayService.get({
            url:environment.urlGlobalAdministrationService.featuresAndGroups
        });
    }

    getUserGroup(id: string): Promise<any> {
        return this.gatewayService.get({
            url:environment.urlGlobalAdministrationService.userGroup.replace('{id}', id)
        });
    }

    addFeatureToGroup(groupId, feature): Promise<any> {
        return this.gatewayService.post({
            url: environment.urlGlobalAdministrationService.addFeatureToGroup.replace('{userGroupId}', groupId),
            data: feature
        });
    }

    removeFeatureFromGroup(groupId, featureId): Promise<any> {
        return this.gatewayService.delete({
            url: environment.urlGlobalAdministrationService.removeFeatureFromGroup.replace('{userGroupId}', groupId).replace('{featureId}',featureId)
        });
    }

    getUsersCompact(): Promise<any> {
        return this.gatewayService.get({
            url:environment.urlGlobalAdministrationService.usersCompact
        });
    }

    addUsersToGroup(userGroupId: string, data): Promise<any> {
        return this.gatewayService.post({
            url:environment.urlGlobalAdministrationService.addUsersToGroup.replace('{userGroupId}',userGroupId),
            data: data
        });
    }

    removeUserFromGroup(userGroupId: string, userId: string): Promise<any> {
        return this.gatewayService.delete({
            url:environment.urlGlobalAdministrationService.removeUserFromGroup.replace('{userGroupId}',userGroupId).replace('{userId}', userId)
        });
    }

    addUserGroup(data): Promise<any> {
        return this.gatewayService.post({
            url:environment.urlGlobalAdministrationService.userGroups,
            data: data
        });
    }

    removeUserGroup(userGroupId: string): Promise<any> {
        return this.gatewayService.delete({
            url:environment.urlGlobalAdministrationService.userGroup.replace('{id}',userGroupId)
        });
    }

}
