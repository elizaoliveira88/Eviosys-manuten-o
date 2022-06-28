import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {Project_DATA} from "@shared/models/Project";
import {Folder_DATA, Folders_DATA} from "@shared/models/Folder";

@Injectable({
  providedIn: 'root'
})
export class FoldersService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getFolders(): Promise<Folders_DATA>  {
        const url = 'users/'+this.dataStore.userData.id+'/folders';
        return this.gatewayService.get({
            url: url
        });
    }

    getFolderById(folderId): Promise<Folder_DATA>  {
        const url = 'users/'+this.dataStore.userData.id+'/folders/'+ folderId;
        return this.gatewayService.get({
            url: url
        });
    }

    getProjects(): Promise<Project_DATA[]>  {
        const url = 'users/'+this.dataStore.userData.id+'/projects?archive=false';
        return this.gatewayService.get({
            url: url
        });
    }

    getArchivedProjects(): Promise<Project_DATA[]>  {
        const url =  'users/'+this.dataStore.userData.id+'/projects?archive=true';
        return this.gatewayService.get({
            url: url
        });
    }

    getCustomers(): Promise<any[]>  {
        const url =  'users/'+this.dataStore.userData.id+'/customers';
        return this.gatewayService.get({
            url: url
        });
    }

    addProject(data): Promise<Project_DATA>  {
        const url =  'users/'+this.dataStore.userData.id+'/projects';
        return this.gatewayService.post({
            url: url,
            data: data
        });
    }

    deleteProject(projectId: string): Promise<Project_DATA[]>  {
        const url = 'projects/' + projectId;
        return this.gatewayService.delete({
            url: url
        });
    }

    archiveProject(projectId: string): Promise<Project_DATA>  {
        const url = 'projects/' + projectId;
        return this.gatewayService.patch({
            url: url,
            data: {
                archive: true
            }
        });
    }

    unarchiveProject(projectId: string): Promise<Project_DATA>  {
        const url = 'projects/' + projectId;
        return this.gatewayService.patch({
            url: url,
            data: {
                archive: false
            }
        });
    }

    updateCustomer(id, data): Promise<any>  {
        const url =  'customers/'+id;
        return this.gatewayService.patch({
            url: url,
            data: data
        });
    }

    createCustomer(data): Promise<any>  {
        const url =  'users/'+this.dataStore.userData.id+'/customers';
        return this.gatewayService.post({
            url: url,
            data: data
        });
    }
}
