import { Injectable } from '@angular/core';
import {Application_DATA} from "@shared/models/Application";
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {ApplicationTruck_DATA, ApplicationTruck_DATA_prepared} from "@shared/models/ApplicationTruck";
import {ProjectTruck, ProjectTruck_DATA} from "@shared/models/ProjectTruck";

@Injectable({
  providedIn: 'root'
})
export class ApplicationDetailsService {

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getApplicationById(applicationId: string): Promise<Application_DATA>  {
        const url = 'applications/'+applicationId+'?exclude=applicationChart,roiChart';
        return this.gatewayService.get({
            url: url
        });
    }

    getApplications(projectId: string): Promise<Application_DATA[]>  {
        const url = 'projects/'+projectId+'/applications';
        return this.gatewayService.get({
            url: url
        });
    }

    getProjectShiftInputs(projectId: string): Promise<any>  {
        const url = 'projects/' + projectId + '/shiftInputs';
        return this.gatewayService.get({
            url: url
        });
    }

    getApplicationShiftInputs(applicationId: string): Promise<any>  {
        const url = 'applications/' + applicationId + '/shiftInputs';
        return this.gatewayService.get({
            url: url
        });
    }

    getApplicationTrucks(applicationId: string): Promise<ApplicationTruck_DATA_prepared[]>  {
        const url = 'applications/'+applicationId+'/applicationTrucks';
        return this.gatewayService.get({
            url: url
        });
    }

    postApplicationTruck(applicationId: string, truck: Partial<ApplicationTruck_DATA>): Promise<ApplicationTruck_DATA[]>  {
        const url = 'applications/'+applicationId+'/applicationTrucks';
        return this.gatewayService.post({
            url: url,
            data: truck
        });
    }

    postApplicationTruckTrailer(applicationTruckId: any, trailerId: any): Promise<any[]>  {
        const url = 'applicationTrucks/'+applicationTruckId+'/applicationTruckTrailers';
        return this.gatewayService.post({
            url: url,
            data: {
                trailerId: trailerId
            }
        });
    }

    getProjectTrucks(): Promise<ProjectTruck_DATA[]>  {
        const url = 'projects/'+this.dataStore.selectedProject.id+'/projectTrucks';
        return this.gatewayService.get({
            url: url
        });
    }

    getBasicTrailers(): Promise<any[]>  {
        const url = 'trailers/basic';
        return this.gatewayService.get({
            url: url
        });
    }

    postProjectTruck(data): Promise<ProjectTruck_DATA[]>  {
        const url = 'projects/'+this.dataStore.selectedProject.id+'/projectTrucks';
        return this.gatewayService.post({
            url: url,
            data: data
        });
    }

    removeApplicationTruck(applicationTruckId: number): Promise<ApplicationTruck_DATA[]>  {
        const url = 'applicationTrucks/'+applicationTruckId;
        return this.gatewayService.delete({
            url: url
        });
    }

    updateApplication(data: any, applicationId: string): Promise<Application_DATA> {
      const url = 'applications/' + applicationId;
      return this.gatewayService.patch({
          url: url,
          data: data
      })
    }

    updateApplicationTruck(data: any, applicationTruckId): Promise<any> {
        const url = 'applicationTrucks/' + applicationTruckId;
        return this.gatewayService.patch({
            url: url,
            data: data
        })
    }

    copyApplication(applicationId: string, projectId: string, name: string): Promise<Application_DATA> {
        const url = 'projects/' + projectId + '/applications/copy';
        return this.gatewayService.post({
            url: url,
            data: {
                id: applicationId,
                name: name
            }
        })
    }

    deleteApplication(applicationId: string): Promise<Application_DATA> {
        const url = 'applications/' + applicationId;
        return this.gatewayService.delete({
            url: url
        })
    }

    calculateApplication(applicationId: string): Promise<any>{
        const url = 'applications/' + applicationId + '/calculate';
        return this.gatewayService.post({
            url: url
        })
    }

    batchUpdateApplication(data: any) : Promise<any>{
        const url = 'batch/updateapplication';
        return this.gatewayService.put({
            url: url,
            data: data
        })
    }

    getApplicationTruckTrailers(appTruckId: any): Promise<any[]>  {
        const url = 'applicationTrucks/'+appTruckId+'/applicationTruckTrailers';
        return this.gatewayService.get({
            url: url
        });
    }
}
